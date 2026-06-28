const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let updatedFiles = 0;
walkDir('C:\\AI\\Git\\training\\HomeHealth\\Policies_and_Procedures_V2\\src\\v6\\screens', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    // Replace bg-white with bg-surface, avoiding bg-white/50, bg-white/[0.5] or text-bg-white (though unlikely)
    content = content.replace(/\bbg-white\b(?!\/|\]|-)/g, 'bg-surface');
    // Replace shadow-sm with shadow-rest to bring back 3D depth
    content = content.replace(/\bshadow-sm\b/g, 'shadow-rest');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + filePath);
      updatedFiles++;
    }
  }
});
console.log(`Total files updated: ${updatedFiles}`);
