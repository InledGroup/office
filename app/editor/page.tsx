"use client";

import { use, useLayoutEffect, useRef, useEffect, useState } from "react";
import { useAppStore, useResolvedLanguage, useHasHydrated } from "@/store";
import {
  API_JS,
  APP_ROOT,
  getDocumentType,
  PRELOAD_HTML,
} from "@/utils/editor/utils";
import io, { MockSocket } from "@/utils/editor/socket";
import { createFetchProxy } from "@/utils/editor/fetch";
import { createXHRProxy } from "@/utils/editor/xhr";
import { DocEditor } from "@/utils/editor/types";

export default function Page({ params }: { params: Promise<{}> }) {
  const server = useAppStore((state) => state.server);
  const language = useResolvedLanguage();
  const theme = useAppStore((state) => state.theme);
  const hasHydrated = useHasHydrated();
  
  const [isDirty, setIsDirty] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-save logic
  useEffect(() => {
    if (!isDirty) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      const editor = (window as any).editor;
      if (editor && isDirty) {
        console.log("[editor] Auto-saving changes...");
        server.setAutoSave(true);
        editor.downloadAs();
      }
    }, 3000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [isDirty, server]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useLayoutEffect(() => {
    if (!hasHydrated) return;

    const apiUrl = APP_ROOT + API_JS;
    const searchParams = new URLSearchParams(window.location.search);

    const fileId = searchParams.get("fileId");
    const newDoc = searchParams.get("new");

    if (!fileId && newDoc) {
      server.openNew(newDoc);
    }

    const doc = server.getDocument();
    const user = server.getUser();
    const documentType = getDocumentType(doc.fileType);
    console.log("editor: ", doc, user, documentType);

    let editor: DocEditor | null = null;

    MockSocket.on("connect", server.handleConnect);
    MockSocket.on("disconnect", server.handleDisconnect);

    const onAppReady = () => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[name="frameEditor"]',
      );
      const win = iframe?.contentWindow as typeof window;
      const doc = iframe?.contentDocument;
      if (!doc || !win) {
        throw new Error("Iframe not loaded");
      }

      const XHR = createXHRProxy(win.XMLHttpRequest);
      const fetchProxy = createFetchProxy(win);
      const _Worker = win.Worker;

      XHR.use((request: Request) => {
        return server.handleRequest(request);
      });
      fetchProxy.use((request: Request) => {
        return server.handleRequest(request);
      });
      Object.assign(win, {
        io: io,
        XMLHttpRequest: XHR,
        fetch: fetchProxy,
        Worker: function (url: string, options?: WorkerOptions) {
          const u = new URL(url, location.origin);
          return new _Worker(
            u.href.replace(u.origin, location.origin),
            options,
          );
        },
      });

      const script = doc.createElement("script");
      script.src = apiUrl;
      doc.body.appendChild(script);
    };

    const createEditor = () => {
      server.setClient({
        buildVersion: window.DocsAPI!.DocEditor.version(),
      });
      editor = new window.DocsAPI!.DocEditor("placeholder", {
        document: {
          fileType: doc.fileType,
          key: doc.key,
          title: doc.title,
          url: doc.url,

          permissions: {
            // TODO: fix PDF edit
            edit: doc.fileType != "pdf",
            chat: false,
            rename: true,
            protect: true,
            review: false,
            // TODO: fix export to PDF
            print: false,
          },
        },
        documentType: documentType,
        editorConfig: {
          lang: language,
          // canCoAuthoring: true,
          // type: "desktop",
          coEditing: {
            mode: "fast",
            change: false, // disable user switching to real-time mode
          },
          user: {
            ...user,
          },

          // callbackUrl: "https://example.com/url-to-callback.ashx",
          customization: {
            // help: false,
            // about: false,
            // hideRightMenu: true,
            uiTheme: theme,
            features: {
              spellcheck: {
                change: false,
              },
            },
            feedback: { visible: false },
            forcesave: true,
            // anonymous: {
            //   request: false,
            //   label: "Guest",
            // },
            logo: {
              image: "https://hosted.inled.es/insuite.svg",
              imageDark: "https://hosted.inled.es/insuite.svg",
              url: location.origin,
              // visible: false,
            },
          },
        },
        events: {
          onAppReady: async (e: unknown) => {
            console.log("App ready", e, editor);
            onAppReady();
          },
          onDocumentReady: (e: unknown) => {
            console.log("Document ready", e);
          },
          onDocumentStateChange: (e: { data: boolean; target: unknown }) => {
            console.log("Document state change", e);
            if (e.data) {
              setIsDirty(true);
            }
          },
          onRequestOpen: (e: unknown) => {
            console.log("onRequestOpen", e);
          },
          onError: (e: unknown) => {
            console.log("Error", e);
          },
          onInfo: (e: unknown) => {
            console.log("Info", e);
          },
          onWarning: (e: unknown) => {
            console.log("onWarning", e);
          },
          onRequestSaveAs: (e: unknown) => {
            console.log("onRequestSaveAs", e);
          },
          onSaveDocument: (e: unknown) => {
            console.log("onSaveDocument", e);
            setIsDirty(false);
            server.setAutoSave(false);
          },
          onDownloadAs: (e: unknown) => {
            console.log("onDownloadAs", e);
          },
          onSave: (e: unknown) => {
            console.log("onSave", e);
            setIsDirty(false);
            server.setAutoSave(false);
          },
          writeFile: async (e: unknown) => {
            console.log("writeFile", e);
            setIsDirty(false);
            server.setAutoSave(false);
          },
        },
        type: "desktop",
        width: "100%",
        height: "100%",
      });
      Object.assign(window, {
        editor,
      });
      return editor;
    };

    const loadEditor = async () => {
      if (window.DocsAPI && window.DocsAPI.DocEditor) {
        createEditor();
      }
      let script = document.querySelector<HTMLScriptElement>(
        `script[src="${apiUrl}"]`,
      );
      if (!script) {
        script = document.createElement("script");
        script.src = apiUrl;
        document.head.appendChild(script);
      }
      script.onload = () => {
        createEditor();
      };
      script.onerror = (e) => {
        console.error("Failed to load DocsAPI script", e);
      };
    };

    loadEditor();

    return () => {
      MockSocket.off("connect", server.handleConnect);
      MockSocket.off("disconnect", server.handleDisconnect);
      editor?.destroyEditor?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  return (
    <div>
      <div className="w-screen h-screen">
        <div id="placeholder">
          <iframe
            className="w-0 h-0 hidden"
            src={APP_ROOT + PRELOAD_HTML}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
