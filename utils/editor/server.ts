import { converter } from "./x2t";
import { MockSocket } from "./socket";
import { User, Participant, AscSaveTypes, ServerOptions } from "./types";
import { emptyDocx, emptyPdf, emptyPptx, emptyXlsx } from "./empty";
import { APP_ROOT, getDocumentType, getFileExt } from "./utils";
import { allPlugins, featuredPlugins, getPluginsData } from "./plugins";
import { saveCloudFile } from "../cloud-storage";

function mergeBuffers(buffers: Uint8Array[]) {
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
  const mergedBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    mergedBuffer.set(buffer, offset);
    offset += buffer.length;
  }
  return mergedBuffer;
}

function randomId() {
  return Math.random().toString(36).substring(2, 9);
}

function getUrl(data: Uint8Array, type?: string) {
  const blob = new Blob([data as Uint8Array<ArrayBuffer>], {
    type: type || "application/octet-stream",
  });
  return URL.createObjectURL(blob);
}

export class EditorServer {
  private id = "";
  private socket: MockSocket | null = null;
  private sessionId: string = "session-id";
  private user: User = {
    id: "uid",
    name: "Me",
  };
  private client = {
    buildVersion: "9.3.0",
    buildNumber: 8,
  };
  private participants: Participant[] = [];
  private syncChangesIndex = 0;
  private loadPromise: Promise<void> | null = null;

  private file: File | null = null;
  private cloudId: string | null = null;
  private fileType: string = "docx";
  private title: string = "";
  private fsMap: Map<string, Uint8Array> = new Map();
  private urlsMap: Map<string, string> = new Map();

  private downloadId: string = "";
  private downloadParts: Uint8Array[] = [];
  private isAutoSave: boolean = false;

  public setAutoSave(value: boolean) {
    this.isAutoSave = value;
  }

  private loadedFonts: Record<string, Uint8Array> | null = null;

  private async loadFonts() {
    if (this.loadedFonts) return this.loadedFonts;
    const fonts: Record<string, Uint8Array> = {};
    const fontPromises: Promise<void>[] = [];
    console.log("[server] Loading dynamic font index and all TTF assets...");

    // 1. Cargar el mapeo crítico
    const fontBinUrl = `${APP_ROOT}/fonts/font_selection.bin`.startsWith("/") 
      ? `${APP_ROOT}/fonts/font_selection.bin` 
      : `/${APP_ROOT}/fonts/font_selection.bin`;

    fontPromises.push(
      fetch(fontBinUrl)
        .then((r) => {
          if (!r.ok) {
            console.warn(`[server] No se pudo cargar ${fontBinUrl}, se continuará sin él.`);
            return null;
          }
          return r.arrayBuffer();
        })
        .then((buf) => {
          if (buf) {
            fonts["font_selection.bin"] = new Uint8Array(buf);
            console.log("[server] font_selection.bin cargado correctamente");
          }
        })
        .catch((e) => console.error(`Error en fetch de ${fontBinUrl}`, e))
    );

    // 2. Cargar el índice de fuentes y luego cada archivo
    try {
      const indexResponse = await fetch("/fonts-ttf/fonts-index.json");
      if (indexResponse.ok) {
        const fontList: string[] = await indexResponse.json();
        console.log(`[server] Índice de fuentes cargado: ${fontList.length} archivos.`);
        
        for (const fontName of fontList) {
          fontPromises.push(
            fetch(`/fonts-ttf/${fontName}`)
              .then((r) => {
                if (!r.ok) console.warn(`[server] No se pudo cargar la fuente: ${fontName}`);
                return r.ok ? r.arrayBuffer() : null;
              })
              .then((buf) => {
                if (buf) fonts[fontName] = new Uint8Array(buf);
              })
              .catch((err) => console.error(`[server] Error en fetch de fuente ${fontName}:`, err))
          );
        }
      } else {
        console.error("[server] Error al cargar fonts-index.json:", indexResponse.status);
      }
    } catch (e) {
      console.error("[server] Excepción al cargar el índice de fuentes:", e);
    }

    await Promise.all(fontPromises);
    console.log(`[server] Entorno x2t listo con ${Object.keys(fonts).length} archivos.`);
    this.loadedFonts = fonts;
    return fonts;
  }

  private options: ServerOptions = {};

  constructor(options: ServerOptions = {}) {
    this.options = options;
    this.send = this.send.bind(this);
    this.handleConnect = this.handleConnect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  async open(
    file: File,
    { fileType, fileName, cloudId }: { fileType?: string; fileName?: string; cloudId?: string } = {},
  ) {
    const title = fileName || file.name;
    this.fileType = fileType || getFileExt(file.name) || "docx";
    const documentType = getDocumentType(this.fileType);
    this.id = cloudId || randomId();
    this.cloudId = cloudId || null;
    this.file = file;
    this.title = title;
    const buffer = await file.arrayBuffer();
    this.loadPromise = this.loadDocument(buffer, this.fileType);

    return {
      id: this.id,
      documentType,
    };
  }

  openNew(fileType?: string) {
    this.fileType = fileType || "docx";
    // TODO: should generate new id?
    this.id = randomId();
    this.cloudId = null;
    this.title = "New Document";
    const documentType = getDocumentType(this.fileType);

    let binData: Uint8Array | null = null;

    switch (documentType) {
      case "word":
        binData = Uint8Array.from(emptyDocx, (v) => v.charCodeAt(0));
        break;
      case "cell":
        binData = Uint8Array.from(emptyXlsx, (v) => v.charCodeAt(0));
        break;
      case "slide":
        binData = Uint8Array.from(emptyPptx, (v) => v.charCodeAt(0));
        break;
      case "pdf":
        binData = Uint8Array.from(emptyPdf, (v) => v.charCodeAt(0));
        break;
    }

    if (!binData) {
      throw new Error("Failed to create new document");
    }

    this.fsMap.set("Editor.bin", binData);
    this.urlsMap.set("Editor.bin", getUrl(binData));

    return {
      id: this.id,
      documentType: documentType,
    };
  }

  async openUrl(
    url: string,
    { fileType, fileName }: { fileType?: string; fileName?: string } = {},
  ) {
    const title = fileName || url.split("/").pop() || "Document";
    this.fileType = fileType || getFileExt(title) || "docx";
    const documentType = getDocumentType(this.fileType);
    this.id = randomId();
    this.cloudId = null;
    this.title = title;
    const buffer = () => fetch(url).then((res) => res.arrayBuffer());
    this.loadPromise = this.loadDocument(buffer, this.fileType);

    return {
      id: this.id,
      documentType,
    };
  }

  getDocument() {
    if (!this.id) {
      this.openNew();
    }

    return {
      fileType: this.fileType,
      key: this.id,
      title: this.title,
      url: (typeof window !== "undefined" ? window.location.origin : "") + "/" + this.id,
    };
  }

  getUser() {
    return this.user;
  }

  private async loadDocument(
    buffer: ArrayBuffer | (() => Promise<ArrayBuffer>),
    fileType: string,
  ) {
    if (typeof buffer == "function") {
      buffer = await buffer();
    }

    let output: Uint8Array | null = null;
    let media: { [key: string]: Uint8Array } = {};

    if (fileType == "pdf") {
      output = new Uint8Array(buffer);
    } else {
      const result = await converter.convert({
        data: buffer,
        fileFrom: "doc." + fileType,
        fileTo: "Editor.bin",
      });
      output = result.output;
      media = result.media;
      
      // Store media to ensure images are preserved
      if (media) {
        for (const [name, data] of Object.entries(media)) {
          this.fsMap.set(name, data);
        }
      }

      // Store themes and styles to preserve document fidelity
      if (result.themes) {
        for (const [name, data] of Object.entries(result.themes)) {
          this.fsMap.set(name, data);
        }
      }
    }

    if (!output) {
      throw new Error("Failed to convert file");
    }

    if (this.urlsMap.size > 0) {
      this.urlsMap.forEach((url) => URL.revokeObjectURL(url));
    }
    this.fsMap.set("Editor.bin", output);
    this.urlsMap.set("Editor.bin", getUrl(output));
    for (const name in media) {
      this.addMedia(name, media[name]);
    }
  }

  private addMedia(name: string, data: Uint8Array) {
    // OnlyOffice expects media to be in the 'media/' folder
    const pathname = name.startsWith("media/") ? name : "media/" + name;
    const url = getUrl(data);
    this.fsMap.set(pathname, data);
    this.urlsMap.set(pathname, url);
    return url;
  }

  setClient(info: Partial<typeof this.client>) {
    this.client = {
      ...this.client,
      ...info,
    };
  }

  handleConnect({ socket }: { socket: MockSocket }) {
    console.log("connect: ", socket);

    this.socket = socket;
    const { send, sessionId, client } = this;

    this.participants = [
      {
        connectionId: this.sessionId,
        encrypted: false,
        id: this.user.id,
        idOriginal: this.user.id,
        indexUser: 1,
        isCloseCoAuthoring: false,
        isLiveViewer: false,
        username: this.user.name,
        view: false,
      },
    ];

    socket.server.on("message", this.handleMessage);

    send({
      maxPayload: 100000000,
      pingInterval: 25000,
      pingTimeout: 20000,
      sid: sessionId,
      upgrades: [],
    });

    send({
      type: "license",
      license: {
        type: 3,
        buildNumber: client.buildNumber,
        buildVersion: client.buildVersion,
        light: false,
        mode: 0,
        rights: 1,
        protectionSupport: true,
        isAnonymousSupport: true,
        liveViewerSupport: true,
        branding: false,
        customization: true,
        advancedApi: false,
      },
    });
  }

  handleDisconnect({ socket }: { socket: MockSocket }) {
    console.log("disconnect: ", socket);
    this.socket = null;
  }

  send(...msg: any[]) {
    if (!this.socket) {
      console.error("Socket is not connected");
      return;
    }
    console.log("[ws] >> ", ...msg);
    this.socket.server.emit("message", ...msg);
  }

  async handleMessage(msg: any, ...args: unknown[]) {
    console.log("[ws] << ", msg, args);

    const { send, sessionId, participants, user, client } = this;
    switch (msg.type) {
      case "auth":
        const changes: unknown[] = [];
        send({
          type: "authChanges",
          changes: changes,
        });
        send({
          type: "auth",
          result: 1,
          sessionId: sessionId,
          participants: participants,
          locks: [],
          //   changes: changes,
          //   changesIndex: 0,
          indexUser: 1,
          buildVersion: client.buildVersion || "9.3.0",
          buildNumber: client.buildNumber || 9,
          licenseType: 3,
          editorType: 2,
          mode: "edit",
          permissions: {
            comment: true,
            chat: true,
            download: true,
            edit: true,
            fillForms: false,
            modifyFilter: true,
            protect: true,
            print: true,
            review: false,
            copy: true,
          },
        });

        try {
          if (this.loadPromise) {
            await this.loadPromise;
          }
          send({
            type: "documentOpen",
            data: {
              type: "open",
              status: "ok",
              data: {
                ...Object.fromEntries(this.urlsMap),
              },
            },
          });
        } catch (err) {
          console.error(err);
          // TODO: send error message
          send({
            type: "documentOpen",
            data: {
              type: "open",
              status: "ok",
              data: {
                "Editor.bin": "",
              },
            },
          });
        }
        break;
      case "isSaveLock":
        send({
          type: "saveLock",
          saveLock: false,
        });
        break;
      case "saveChanges":
        send({
          type: "unSaveLock",
          index: -1,
          syncChangesIndex: ++this.syncChangesIndex,
          time: +new Date(),
        });
        break;
      case "getLock":
        send({
          type: "getLock",
          locks: {
            [msg.block]: {
              time: +new Date(),
              user: user?.id,
              block: msg.block,
            },
          },
        });
        send({
          type: "releaseLock",
          locks: {
            [msg.block]: {
              time: +new Date(),
              user: user?.id,
              block: msg.block,
            },
          },
        });
        break;
    }
  }

  async handleRequest(req: Request) {
    const u = new URL(req.url);
    const { id: key, send } = this;

    // 1. Handle image uploads first, before document download logic
    if (u.pathname.includes("/upload/")) {
      console.log(`[server] Detected upload attempt to ${u.pathname}`);
      let data: Uint8Array;
      let filename: string;

      try {
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("multipart/form-data")) {
          const formData = await req.formData();
          // OnlyOffice sometimes uses "file", sometimes "image"
          const file = (formData.get("file") || formData.get("image") || formData.get("data")) as File;
          
          if (file && typeof file.arrayBuffer === 'function') {
            data = new Uint8Array(await file.arrayBuffer());
            filename = file.name || `${Date.now()}.png`;
          } else {
            console.warn("[server] Multipart upload without file field, raw fallback.");
            const buffer = await req.arrayBuffer();
            data = new Uint8Array(buffer);
            filename = `${Date.now()}.png`;
          }
        } else {
          const buffer = await req.arrayBuffer();
          data = new Uint8Array(buffer);
          filename = `${Date.now()}.png`;
        }
      } catch (e) {
        console.error("[server] Error parsing upload request:", e);
        try {
          const buffer = await req.arrayBuffer();
          data = new Uint8Array(buffer);
          filename = `fallback-${Date.now()}.png`;
        } catch (innerE) {
          return Response.json({ error: "failed to read body" }, { status: 400 });
        }
      }

      const pathname = "media/" + filename;
      const url = this.addMedia(filename, data);
      console.log(`[server] Image uploaded successfully: ${filename} (${data.length} bytes) -> ${url}`);
      
      // Some versions of OO expect exactly this format
      return Response.json({ 
        [pathname]: url
      });
    }

    // Broad matching for ANY request containing the key
    const isKeyPath = u.pathname.includes(key) && key.length > 0;
    
    if (isKeyPath) {
      console.log(`[server] Intercepting ${req.method} request to ${u.pathname}`);

      // If it's a request to fetch the document data (GET or POST)
      // OnlyOffice sometimes uses POST for fetching if it's a partial download
      const isDownloadReq = u.pathname.includes("/downloadfile/") || 
                           u.pathname.includes("/downloadas/") ||
                           u.pathname === "/" + key ||
                           u.pathname.endsWith(key);

      if (isDownloadReq && (!u.searchParams.has("cmd") || req.method === "GET")) {
        const data = this.fsMap.get("Editor.bin");
        if (data) {
          return new Response(new Blob([data as any]), {
            headers: { 
              "Content-Type": "application/octet-stream",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "*"
            }
          });
        }
      }

      if (u.pathname.includes("/downloadas/") || u.pathname.includes("/downloadfile/")) {
        // Capture isAutoSave state at the START of the request to prevent race conditions with concurrent saves
        const requestIsAutoSave = this.isAutoSave;
        const cmd = JSON.parse(u.searchParams.get("cmd") || "{}");
        const title = cmd.title || this.title || "document.docx";
        const buffer = await req.arrayBuffer();

        console.log(`[server] downloadAs (${requestIsAutoSave ? "Auto" : "Manual"}):`, cmd);

        const fileTo = "doc." + title.split(".").pop();
        let formatTo = cmd.outputformat;
        if (!formatTo && fileTo.endsWith(".pdf")) {
          formatTo = 513;
        }

        const download = async () => {
          const input = mergeBuffers(this.downloadParts);
          let fileFrom = "from.bin";
          if (cmd.format == "pdf") {
            fileFrom = "from.pdf";
          }

          let fonts = undefined;
          if (cmd.format == "pdf" || formatTo === 513 || fileTo.endsWith(".pdf")) {
            fonts = await this.loadFonts();
          }

          const allFiles = Object.fromEntries(this.fsMap);
          const media: Record<string, Uint8Array> = {};
          const themes: Record<string, Uint8Array> = {};

          console.log("[server] fsMap keys:", Object.keys(allFiles));

          for (const [path, data] of Object.entries(allFiles)) {
            const isMedia = path.startsWith("media/") || path.includes("/media/");
            const isTheme = !isMedia && (
                            path.includes("theme") || 
                            path.endsWith(".xml") || 
                            path.endsWith(".rels") ||
                            path.includes("styles") || 
                            path.includes("settings") ||
                            path.endsWith(".json") ||
                            path.endsWith(".bin")
            );

            if (isTheme) {
              themes[path] = data;
            } else {
              // Only put in media if it's not the main document itself
              if (path !== "Editor.bin") {
                media[path] = data;
              }
            }
          }

          console.log(`[server] Conversion data: ${Object.keys(media).length} media files, ${Object.keys(themes).length} theme/style files.`);

          let { output } = await converter.convert({
            data: input.buffer,
            fileFrom: fileFrom,
            fileTo: fileTo,
            formatTo: formatTo,
            media: media,
            themes: themes,
            fonts: fonts,
          });
          
          if (!output && cmd.format == "pdf") {
            output = input;
          }
          if (!output) {
            console.error("Conversion failed");
            // TODO: error message
            return { status: "error" };
          }

          // Save to Cloud Storage
          const fileExt = title.split(".").pop() || this.fileType;
          const cloudFile = await saveCloudFile({
            id: this.cloudId || this.id || randomId(),
            name: title,
            type: fileExt,
            data: new Uint8Array(output),
            folderId: null, // Always root on auto-save from editor for now
          });
          this.cloudId = cloudFile.id;
          this.id = cloudFile.id;

          const blob = new Blob([new Uint8Array(output)]);
          const url = URL.createObjectURL(blob);
          
          if (!requestIsAutoSave) {
            console.log(`[server] Manual export finished: ${title}. Triggering browser download...`);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = title;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              if (document.body.contains(a)) document.body.removeChild(a);
              // We don't revoke here because the editor might still need the URL for its internal state
            }, 100);
          } else {
            console.log("[server] Auto-save complete, ensuring editor is unblocked.");
          }
          
          return { status: "ok", url: requestIsAutoSave ? "" : url };
        };

        let result: { status: string; url?: string } = {
          status: "ok",
        };

        switch (cmd.savetype) {
          case AscSaveTypes.PartStart:
            this.downloadId = "_" + Math.round(Math.random() * 1000);
            this.downloadParts = [new Uint8Array(buffer)];
            break;
          case AscSaveTypes.Part:
            this.downloadParts.push(new Uint8Array(buffer));
            break;
          case AscSaveTypes.Complete:
            this.downloadParts.push(new Uint8Array(buffer));
            result = await download();
            this.downloadParts = [];
            break;
          case AscSaveTypes.CompleteAll:
            this.downloadId = "_" + Math.round(Math.random() * 1000);
            this.downloadParts = [new Uint8Array(buffer)];
            result = await download();
            this.downloadParts = [];
            break;
        }

        setTimeout(() => {
          send({
            type: "documentOpen",
            data: {
              type: "save",
              status: result.status,
              data: result.url || "", // Send URL (or empty for autosave)
              filetype: title.split(".").pop() || "docx",
            },
          });
          this.isAutoSave = false; // Reset global flag
        }, 100);

        return Response.json({
          status: result.status,
          type: "save",
          data: this.downloadId,
        });
      }
    }

    // Redirect OnlyOffice internal resources that are requested from root
    const ooResources = [
      "/common/main/resources/",
      "/resources/numbering/",
      "/themes.json"
    ];

    if (ooResources.some(path => u.pathname.startsWith(path) || u.pathname === path)) {
      let targetPath = u.pathname;
      if (u.pathname === "/themes.json") {
        targetPath = "/common/main/resources/themes/themes.json";
      } else if (u.pathname.startsWith("/resources/numbering/")) {
        targetPath = "/documenteditor/main" + u.pathname;
      }
      
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const newUrl = `${origin}${APP_ROOT}/web-apps/apps${targetPath}`;
      console.log(`[server] Redirecting internal resource: ${u.pathname} -> ${newUrl}`);
      
      try {
        // Use global fetch but avoid the proxy loop if possible
        // Actually, since this is in handleRequest which is called BY the proxy,
        // calling fetch() here WILL trigger the proxy again.
        // We should detect this to avoid infinite loops, but the ooResources paths 
        // are different from the newUrl path (/v9.3.1-1/...), so it shouldn't loop.
        const response = await fetch(newUrl);
        if (response.ok) {
          return response;
        } else {
          console.warn(`[server] Redirection failed with status ${response.status} for ${newUrl}`);
          // Fallback for numbering if documenteditor fails
          if (u.pathname.startsWith("/resources/numbering/")) {
             const fallbackUrl = `${origin}${APP_ROOT}/web-apps/apps/common/main${u.pathname}`;
             const fallbackRes = await fetch(fallbackUrl);
             if (fallbackRes.ok) return fallbackRes;
          }
        }
      } catch (e) {
        console.error(`[server] Failed to proxy internal resource ${newUrl}:`, e);
      }
    }

    // Handle Service Worker specifically to avoid 404
    if (u.pathname.endsWith("document_editor_service_worker.js")) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const swUrl = `${origin}${APP_ROOT}/document_editor_service_worker.js`;
      try {
        const response = await fetch(swUrl);
        if (response.ok) return response;
      } catch (e) {}
    }

    if (u.pathname == "/plugins.json") {
      const state = this.options.getState?.();
      if (state?.plugins == "none") {
        return Response.json({ url: "", pluginsData: [], autostart: [] });
      }
      if (state?.plugins == "all") {
        return Response.json(getPluginsData(allPlugins));
      }
      return Response.json(getPluginsData(featuredPlugins));
    }

    return null;
  }
}
