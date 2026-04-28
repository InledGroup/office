/// <reference lib="webworker" />

import { AvsFileType, X2tConvertParams, X2tConvertResult } from "./types";

/**
 * X2T Converter Web Worker
 *
 * This worker handles CPU-intensive document conversion operations
 * off the main thread to prevent UI blocking.
 */

/* eslint-disable no-restricted-globals */

// Base URL for x2t files - hardcoded since blob URL workers can't determine origin
const BASE_URL = self.location.origin + "/x2t-1/";
// const BASE_URL = self.location.origin + "/wasm/x2t/";

let x2t: any = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize x2t module in Worker context
 */
async function initX2t(): Promise<void> {
  if (x2t) return;
  // self.wasmBinaryFile = BASE_URL + "x2t.wasm";

  const scriptUrl = BASE_URL + "x2t.js";

  // fix .wasm loading
  Object.assign(self, {
    __filename: BASE_URL,
  });

  // Load x2t script in Worker context
  importScripts(scriptUrl);

  x2t = (self as any).Module;

  // Wait for WASM runtime initialization
  await new Promise<void>((resolve) => {
    x2t.onRuntimeInitialized = () => resolve();
  });

  // Create working directories
  try {
    const createDir = (path: string) => {
      const parts = path.split("/").filter(Boolean);
      let current = "";
      for (const part of parts) {
        current += "/" + part;
        try { x2t.FS.mkdir(current); } catch (e) {}
      }
    };

    createDir("/working/media");
    createDir("/working/fonts");
    createDir("/working/themes");
    createDir("/usr/share/fonts/truetype/msttcorefonts");
    createDir("/var/www/onlyoffice/documentserver/core-fonts");
  } catch (err) {
    console.error("[x2t.worker] mkdir error:", err);
  }

  console.log("[x2t.worker] Initialized successfully");
}

/**
 * Ensure x2t is initialized before conversion
 */
async function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = initX2t();
  }
  return initPromise;
}

// Auto-initialize on worker creation
ensureInit().catch((err) => {
  console.error("[x2t.worker] Auto-init failed:", err);
});

/**
 * Clean up temporary files after conversion
 */
function cleanupFiles(files: string[]): void {
  for (const file of files) {
    try {
      x2t.FS.unlink(file);
    } catch (err) {
      console.error(err);
    }
  }
  cleanMedia();
}

function cleanMedia() {
  try {
    const mediaFiles = x2t.FS.readdir("/working/media/");
    for (const file of mediaFiles) {
      if (file !== "." && file !== "..") {
        x2t.FS.unlink("/working/media/" + file);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Read media files from the working directory
 */
function readMedia(): { [key: string]: Uint8Array<ArrayBuffer> } {
  const media: { [key: string]: Uint8Array<ArrayBuffer> } = {};
  try {
    const files = x2t.FS.readdir("/working/media/");
    for (const file of files) {
      if (file !== "." && file !== "..") {
        const fileData = x2t.FS.readFile("/working/media/" + file, {
          encoding: "binary",
        });
        media[file] = fileData;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return media;
}

const xmlPath = "/working/params.xml";

function writeInputs({
  fileFrom,
  fileTo,
  formatFrom,
  formatTo,
  data,
  media,
  fonts,
  themes,
}: X2tConvertParams) {
  const params = {
    m_sFileFrom: fileFrom,
    m_sThemeDir: "/working/themes",
    m_sFileTo: fileTo,
    m_nFormatFrom: formatFrom,
    m_nFormatTo: formatTo,
    m_bIsPDFA: formatTo === AvsFileType.AVS_FILE_CROSSPLATFORM_PDFA,
    m_bIsNoBase64: false,
    m_sFontDir: "/working/fonts/",
  };

  const content = Object.entries(params)
    .filter(([k, v]) => v)
    .reduce((a, [k, v]) => a + `<${k}>${v}</${k}>\n`, "");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<TaskQueueDataConvert
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
>
${content}
</TaskQueueDataConvert>`;

  console.log("[x2t.worker] Task XML:", xml);
  x2t.FS.writeFile(xmlPath, xml);
  if (data) {
    x2t.FS.writeFile(fileFrom, new Uint8Array(data));
  }

  if (media) {
    cleanMedia();
    for (const [key, value] of Object.entries(media)) {
      try {
        x2t.FS.writeFile("/working/" + key, value);
      } catch (err) {
        console.error(key, err);
      }
    }
  }

  if (themes) {
    for (const [key, value] of Object.entries(themes)) {
      try {
        // Asegurar que el directorio existe
        const pathParts = key.split("/");
        if (pathParts.length > 1) {
          let currentPath = "/working/themes";
          for (let i = 0; i < pathParts.length - 1; i++) {
            currentPath += "/" + pathParts[i];
            try { x2t.FS.mkdir(currentPath); } catch (e) {}
          }
        }
        x2t.FS.writeFile("/working/themes/" + key, value);
      } catch (err) {
        console.error("[x2t.worker] Error writing theme file:", key, err);
      }
    }
  }

  if (fonts) {
    console.log(`[x2t.worker] Processing ${Object.keys(fonts).length} fonts for conversion`);
    const systemFontDir = "/usr/share/fonts/truetype/msttcorefonts/";
    const systemFontDir2 = "/var/www/onlyoffice/documentserver/core-fonts/";
    
    for (const [key, value] of Object.entries(fonts)) {
      if (!value || value.length === 0) {
        console.warn(`[x2t.worker] Skipping empty font file: ${key}`);
        continue;
      }
      try {
        if (key === "font_selection.bin") {
          x2t.FS.writeFile("/working/font_selection.bin", value);
          x2t.FS.writeFile("/working/fonts/font_selection.bin", value);
        } else {
          x2t.FS.writeFile("/working/fonts/" + key, value);
          x2t.FS.writeFile(systemFontDir + key, value);
          x2t.FS.writeFile(systemFontDir2 + key, value);
          
          const klow = key.toLowerCase();
          // Mapeo exhaustivo de Arial usando Liberation
          if (klow.includes("arial") || klow === "liberationsans-regular.ttf") {
            x2t.FS.writeFile(systemFontDir + "Arial.ttf", value);
            x2t.FS.writeFile(systemFontDir2 + "Arial.ttf", value);
          }
          if (klow.includes("arial_bold") || klow === "liberationsans-bold.ttf") {
            x2t.FS.writeFile(systemFontDir + "Arial_Bold.ttf", value);
            x2t.FS.writeFile(systemFontDir2 + "Arial_Bold.ttf", value);
          }
          if (klow.includes("arial_italic") || klow === "liberationsans-italic.ttf") {
            x2t.FS.writeFile(systemFontDir + "Arial_Italic.ttf", value);
            x2t.FS.writeFile(systemFontDir2 + "Arial_Italic.ttf", value);
          }
          if (klow.includes("arial_bolditalic") || klow === "liberationsans-bolditalic.ttf") {
            x2t.FS.writeFile(systemFontDir + "Arial_BoldItalic.ttf", value);
            x2t.FS.writeFile(systemFontDir2 + "Arial_BoldItalic.ttf", value);
          }
        }
      } catch (err) {
        console.error("[x2t.worker] Error writing font to FS:", key, err);
      }
    }

    // Asegurar que Arial.ttf existe de alguna manera si no se escribió arriba
    try {
      if (!x2t.FS.analyzePath(systemFontDir + "Arial.ttf").exists) {
        // Buscar Liberation o Inter como último recurso
        const fallbackKey = Object.keys(fonts).find(k => k.includes("LiberationSans-Regular")) || 
                            Object.keys(fonts).find(k => k.toLowerCase().includes("inter"));
        if (fallbackKey) {
          console.log(`[x2t.worker] Emergency final fallback: using ${fallbackKey} as Arial.ttf`);
          x2t.FS.writeFile(systemFontDir + "Arial.ttf", fonts[fallbackKey]);
        }
      }
    } catch (e) {}
  }
}

/**
 * Convert document from one format to another
 */
async function convert({
  data,
  fileFrom,
  fileTo,
  formatFrom,
  formatTo,
  media,
  fonts,
  themes,
}: X2tConvertParams): Promise<X2tConvertResult> {
  const fromPath = "/working/" + fileFrom;
  const toPath = "/working/" + fileTo;
  const files = [fromPath, toPath, xmlPath];

  writeInputs({
    fileFrom: fromPath,
    fileTo: toPath,
    formatFrom,
    formatTo,
    data,
    media,
    fonts,
  });

  if (
    fileFrom.endsWith(".doc") ||
    formatFrom == AvsFileType.AVS_FILE_DOCUMENT_DOC
  ) {
    const viaPath = fromPath + ".docx";
    writeInputs({
      fileFrom: fromPath,
      fileTo: viaPath,
      data: null as never,
    });
    x2t.ccall("main1", ["number"], ["string"], [xmlPath]);
    writeInputs({
      fileFrom: viaPath,
      fileTo: toPath,
      data: null as never,
    });
    files.push(viaPath);
  }

  try {
    const pathInfo = x2t.FS.analyzePath(toPath);
    if (pathInfo.exists) {
      x2t.FS.unlink(toPath);
    }
  } catch (err) {}

  try {
    x2t.ccall("main1", ["number"], ["string"], [xmlPath]);
  } catch (e) {
    console.error("ccall", e);
  }

  // Read output file
  let output: Uint8Array<ArrayBuffer> | null = null;
  try {
    output = x2t.FS.readFile(toPath);
  } catch (e) {
    console.error(e);
  }

  // Read media files
  const outputMedia = readMedia();

  // Cleanup temporary files
  setTimeout(() => {
    cleanupFiles(files);
  });

  return { output, media: outputMedia };
}

// Message types
interface WorkerMessage {
  id?: number;
  type: "convert";
  payload?: any;
}

/**
 * Handle incoming messages from main thread
 */
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;

  try {
    switch (type) {
      case "convert": {
        // Ensure x2t is initialized before conversion
        await ensureInit();
        const result = await convert(payload);

        // Use Transferable objects for zero-copy transfer
        const transferables: Transferable[] = [];
        if (result.output) {
          transferables.push(result.output.buffer);
        }
        Object.values(result.media).forEach((m) =>
          transferables.push(m.buffer),
        );

        self.postMessage(
          { id, type: "convert:done", payload: result },
          { transfer: transferables },
        );
        break;
      }

      default:
        self.postMessage({
          id,
          type: "error",
          error: `Unknown message type: ${type}`,
        });
    }
  } catch (error) {
    self.postMessage({
      id,
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Signal that worker is ready
self.postMessage({ type: "ready" });
