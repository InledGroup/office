const { app, BrowserWindow, screen, session } = require("electron");
const path = require("path");
const url = require("url");

// Force disable web security via command line switches
app.commandLine.appendSwitch("disable-web-security");
app.commandLine.appendSwitch("disable-site-isolation-trials");
app.commandLine.appendSwitch("disable-features", "BlockInsecurePrivateNetworkRequests");

let mainWindow;
let filePathToOpen = null;

function createWindow() {
  // Aggressively bypass CORS and CSP
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["Origin"] = "null";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    
    // Remove Content Security Policy to allow inline scripts
    delete responseHeaders["content-security-policy"];
    delete responseHeaders["content-security-policy-report-only"];
    
    // Force Allow-Origin
    responseHeaders["access-control-allow-origin"] = ["*"];
    responseHeaders["access-control-allow-methods"] = ["GET, POST, OPTIONS, PUT, DELETE, PATCH"];
    responseHeaders["access-control-allow-headers"] = ["*"];
    responseHeaders["access-control-expose-headers"] = ["*"];
    responseHeaders["access-control-allow-credentials"] = ["true"];

    callback({ responseHeaders });
  });

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1280, width),
    height: Math.min(800, height),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Required to fetch file:// URIs in the renderer
    },
    title: "InSuite Office",
  });

  const isDev = !app.isPackaged;
  const baseUrl = isDev
    ? "http://localhost:3000"
    : url.format({
        pathname: path.join(__dirname, "../out/index.html"),
        protocol: "file:",
        slashes: true,
      });

  const getFullUrl = (filePath) => {
    let finalUrl = isDev 
      ? "http://localhost:3000/editor" 
      : url.format({
          pathname: path.join(__dirname, "../out/editor.html"),
          protocol: "file:",
          slashes: true,
        });
    
    if (filePath) {
      // Normalize path to use forward slashes for the URL
      const normalizedPath = path.resolve(filePath).replace(/\\/g, "/");
      const fileUrl = `file://${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + `url=${encodeURIComponent(fileUrl)}&editing=1`;
    }
    return finalUrl;
  };

  if (filePathToOpen) {
    mainWindow.loadURL(getFullUrl(filePathToOpen));
    filePathToOpen = null;
  } else {
    mainWindow.loadURL(baseUrl);
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

// Handle macOS open-file event
app.on("open-file", (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    const normalizedPath = filePath.replace(/\\/g, "/");
    const fileUrl = `file://${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
    const isDev = !app.isPackaged;
    const editorPath = isDev ? "/editor" : "/editor.html";
    const baseUrl = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../out")}`;
    
    mainWindow.loadURL(`${baseUrl}${editorPath}?url=${encodeURIComponent(fileUrl)}&editing=1`);
  } else {
    filePathToOpen = filePath;
  }
});

app.on("ready", () => {
  // Handle Windows/Linux file path from argv
  if (process.platform !== "darwin" && process.argv.length >= 2) {
    const possiblePath = process.argv[process.argv.length - 1];
    if (path.isAbsolute(possiblePath)) {
      filePathToOpen = possiblePath;
    }
  }
  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
