/// <reference lib="webworker" />

import { AvsFileType, X2tConvertParams, X2tConvertResult } from "./types";

/**
 * X2T Converter Web Worker - Stabilized
 */

/* eslint-disable no-restricted-globals */

const BASE_URL = self.location.origin + "/x2t-1/";

let x2t: any = null;
let initPromise: Promise<void> | null = null;

async function initX2t(): Promise<void> {
  if (x2t) return;
  const scriptUrl = BASE_URL + "x2t.js";
  
  (self as any).Module = {
    print: (text: string) => console.log("[x2t.stdout]", text),
    printErr: (text: string) => console.error("[x2t.stderr]", text),
    onRuntimeInitialized: () => {
       console.log("[x2t.worker] WASM Runtime Initialized");
    }
  };

  Object.assign(self, { __filename: BASE_URL });
  importScripts(scriptUrl);
  x2t = (self as any).Module;

  await new Promise<void>((resolve) => {
    if (x2t.calledRun) resolve();
    else {
      const oldInit = x2t.onRuntimeInitialized;
      x2t.onRuntimeInitialized = () => {
        if (oldInit) oldInit();
        resolve();
      };
    }
  });

  const createDir = (path: string) => {
    const parts = path.split("/").filter(Boolean);
    let current = "";
    for (const part of parts) {
      current += "/" + part;
      try {
        if (!x2t.FS.analyzePath(current).exists) x2t.FS.mkdir(current);
      } catch (e) {}
    }
  };

  createDir("/working/media");
  createDir("/working/fonts");
  createDir("/working/themes");
  createDir("/usr/share/fonts/truetype/msttcorefonts");

  console.log("[x2t.worker] Environment Ready");
}

async function ensureInit(): Promise<void> {
  if (!initPromise) initPromise = initX2t();
  return initPromise;
}

ensureInit().catch(err => console.error("[x2t.worker] Init failed:", err));

function cleanMedia() {
  try {
    const files = x2t.FS.readdir("/working/media/");
    for (const file of files) {
      if (file !== "." && file !== "..") x2t.FS.unlink("/working/media/" + file);
    }
  } catch (err) {}
}

function cleanupFiles(files: string[]): void {
  for (const file of files) {
    try { x2t.FS.unlink(file); } catch (err) {}
  }
}

function readDirRecursive(dir: string, base: string = ""): { [key: string]: Uint8Array<ArrayBuffer> } {
  const result: { [key: string]: Uint8Array<ArrayBuffer> } = {};
  try {
    const files = x2t.FS.readdir(dir);
    for (const file of files) {
      if (file === "." || file === "..") continue;
      const fullPath = dir + (dir.endsWith("/") ? "" : "/") + file;
      const relPath = base ? base + "/" + file : file;
      try {
        const stat = x2t.FS.stat(fullPath);
        if (x2t.FS.isDir(stat.mode)) {
          Object.assign(result, readDirRecursive(fullPath, relPath));
        } else {
          result[relPath] = x2t.FS.readFile(fullPath, { encoding: "binary" });
        }
      } catch (e) {}
    }
  } catch (e) {}
  return result;
}

const xmlPath = "/working/params.xml";

function generateXml(params: Record<string, any>) {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<TaskQueueDataConvert xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n';
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      xml += `  <${k}>${v}</${k}>\n`;
    }
  }
  xml += '</TaskQueueDataConvert>';
  return xml;
}

function writeInputs(payload: X2tConvertParams) {
  const { fileFrom, fileTo, formatFrom, formatTo, data, media, fonts, themes } = payload;
  
  if (data) {
    x2t.FS.writeFile(fileFrom, new Uint8Array(data));
    console.log(`[x2t.worker] Input: ${fileFrom} (${data.byteLength} bytes)`);
  }

  const writeFileWithDirs = (base: string, key: string, value: Uint8Array) => {
    try {
      const parts = key.split("/");
      let current = base;
      for (let i = 0; i < parts.length - 1; i++) {
        current += "/" + parts[i];
        try { if (!x2t.FS.analyzePath(current).exists) x2t.FS.mkdir(current); } catch (e) {}
      }
      x2t.FS.writeFile(base + "/" + key, value);
    } catch (err) {}
  };

  if (media) {
    cleanMedia();
    const mediaDirFallback = fileFrom + "_media";
    try { if (!x2t.FS.analyzePath(mediaDirFallback).exists) x2t.FS.mkdir(mediaDirFallback); } catch (e) {}
    for (const [key, value] of Object.entries(media)) {
      writeFileWithDirs("/working", key, value);
      const fileNameOnly = key.split("/").pop();
      if (fileNameOnly) {
        try { x2t.FS.writeFile("/working/media/" + fileNameOnly, value); } catch (e) {}
        try { x2t.FS.writeFile(mediaDirFallback + "/" + fileNameOnly, value); } catch (e) {}
      }
    }
  }

  if (themes) {
    for (const [key, value] of Object.entries(themes)) {
      writeFileWithDirs("/working", key, value);
    }
  }

  if (fonts) {
    const sysFonts = "/usr/share/fonts/truetype/msttcorefonts/";
    for (const [key, value] of Object.entries(fonts)) {
      if (!value || value.length === 0) continue;
      try {
        x2t.FS.writeFile("/working/fonts/" + key, value);
        if (key === "font_selection.bin") {
          x2t.FS.writeFile("/working/font_selection.bin", value);
        }
        const klow = key.toLowerCase();
        if (klow.includes("arial") || klow.includes("liberation") || klow.includes("inter")) {
          x2t.FS.writeFile(sysFonts + key, value);
        }
      } catch (err) {}
    }
  }
}

async function runX2t(params: Record<string, any>) {
  const xml = generateXml(params);
  console.log("[x2t.worker] XML:\n", xml);
  x2t.FS.writeFile(xmlPath, xml);
  try {
    x2t.FS.chdir('/working');
    const result = x2t.ccall("main1", "number", ["string"], [xmlPath]);
    console.log("[x2t.worker] x2t result:", result);
    return result === 0;
  } catch (e) {
    console.error("[x2t.worker] x2t crash:", e);
    return false;
  }
}

async function convert(payload: X2tConvertParams): Promise<X2tConvertResult> {
  const fromPath = "/working/" + payload.fileFrom;
  const toPath = "/working/" + payload.fileTo;
  
  writeInputs({ ...payload, fileFrom: fromPath, fileTo: toPath });

  const success = await runX2t({
    m_sFileFrom: fromPath,
    m_sFileTo: toPath,
    m_nFormatFrom: payload.formatFrom,
    m_nFormatTo: payload.formatTo,
    m_sThemeDir: "/working/themes",
    m_sFontDir: "/working/fonts/",
    m_bIsNoBase64: false
  });

  let output: Uint8Array<ArrayBuffer> | null = null;
  if (success) {
    try {
      output = x2t.FS.readFile(toPath);
    } catch (e) {}
  }

  const outputMedia = readDirRecursive("/working/media");
  const outputThemes = readDirRecursive("/working/themes");

  setTimeout(() => cleanupFiles([fromPath, toPath, xmlPath]), 100);

  return { output, media: outputMedia, themes: outputThemes };
}

self.onmessage = async (event: MessageEvent<any>) => {
  const { id, type, payload } = event.data;
  try {
    if (type === "convert") {
      await ensureInit();
      const result = await convert(payload);
      const transferables: Transferable[] = [];
      if (result.output) transferables.push(result.output.buffer);
      Object.values(result.media).forEach(m => transferables.push(m.buffer));
      self.postMessage({ id, type: "convert:done", payload: result }, { transfer: transferables });
    }
  } catch (error) {
    self.postMessage({ id, type: "error", error: String(error) });
  }
};

self.postMessage({ type: "ready" });
