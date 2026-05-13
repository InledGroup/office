const fs = require('fs');
const path = require('path');

function getAllHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllHtmlFiles(filePath, fileList);
        } else if (filePath.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const targetDir = path.join(process.cwd(), 'public/v9.3.1-1');
const htmlFiles = getAllHtmlFiles(targetDir);

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace v9.3.0.24-1 with v9.3.1-1
    const oldVersion = 'v9.3.0.24-1';
    const newVersion = 'v9.3.1-1';
    content = content.split(oldVersion).join(newVersion);
    
    // Calculate new base href
    // File: /Users/dev/Documents/office/public/v9.3.1-1/web-apps/apps/api/documents/preload.html
    // Desired: /v9.3.1-1/web-apps/apps/api/documents/
    
    const relativePath = path.relative(path.join(process.cwd(), 'public'), path.dirname(file));
    let baseHref = '/' + relativePath.replace(/\\/g, '/') + '/';
    
    // Update or insert <base href="...">
    const baseHrefRegex = /<base\s+href="[^"]*"/i;
    if (baseHrefRegex.test(content)) {
        content = content.replace(baseHrefRegex, `<base href="${baseHref}"`);
    } else {
        // Insert after <head>
        content = content.replace(/<head>/i, `<head>\n    <base href="${baseHref}">`);
    }

    // Insert CSP meta tag
    const cspMeta = '<meta http-equiv="Content-Security-Policy" content="default-src * \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob:; script-src * \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob:; connect-src * \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob:; img-src * \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob:; style-src * \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob:; frame-src * \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob:;">';
    if (!content.includes('Content-Security-Policy')) {
        content = content.replace(/<head>/i, `<head>\n    ${cspMeta}`);
    }
    
    fs.writeFileSync(file, content);
    console.log(`Updated: ${file} -> base href="${baseHref}"`);
});
