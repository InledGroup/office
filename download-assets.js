const fs = require('fs');
const path = require('path');
const http = require('https');

const VERSION = "v9.3.1-1";
const BASE_URL = "https://office-editor.ziziyi.com/v9.3.0.24-1"; // Usaremos esto como fuente de los archivos individuales

const filesToDownload = [
    "/web-apps/apps/api/documents/api.js",
    "/web-apps/apps/api/documents/preload.html",
    "/web-apps/apps/api/documents/cache-scripts.html",
    "/web-apps/vendor/requirejs/require.js",
    "/web-apps/vendor/jquery/jquery.min.js",
    "/web-apps/vendor/socketio/socket.io.min.js",
    "/web-apps/vendor/xregexp/xregexp-all-min.js"
];

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        http.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function main() {
    console.log("🚀 Iniciando descarga de activos críticos de InSuite...");
    const baseDir = path.join(__dirname, 'public', VERSION);
    
    for (const file of filesToDownload) {
        const dest = path.join(baseDir, file);
        const url = BASE_URL + file;
        
        console.log(`📥 Descargando: ${file}`);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        try {
            await downloadFile(url, dest);
        } catch (e) {
            console.error(`❌ Error descargando ${file}: ${e.message}`);
        }
    }
    console.log("✅ Activos críticos descargados.");
}

main();
