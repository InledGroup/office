const fs = require('fs');
const path = require('path');

const messagesDir = './messages';
const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(messagesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (data.comparison && data.comparison.suites) {
    const suites = data.comparison.suites;

    // 1. insuite.diff: Remove the part about "Not Chinese"
    if (suites.insuite && suites.insuite.diff) {
      const parts = suites.insuite.diff.split(/[,，]/);
      if (parts.length >= 3) {
        suites.insuite.diff = parts.slice(0, 2).map(p => p.trim()).join(', ');
      }
    }

    // 2. ziziyi.diff: Remove the part about "Subject to Chinese regulations"
    if (suites.ziziyi && suites.ziziyi.diff) {
      const parts = suites.ziziyi.diff.split(/[.。]/).filter(p => p.trim().length > 0);
      if (parts.length >= 2) {
        // Remove the first sentence
        suites.ziziyi.diff = parts.slice(1).map(p => p.trim()).join('. ') + '.';
      }
    }

    // 3. onlyoffice.diff: Remove the part about "Related to Russia"
    if (suites.onlyoffice && suites.onlyoffice.diff) {
      const parts = suites.onlyoffice.diff.split(/[.。]/).filter(p => p.trim().length > 0);
      if (parts.length >= 2) {
        // Keep only the first sentence
        suites.onlyoffice.diff = parts[0].trim() + '.';
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
});
