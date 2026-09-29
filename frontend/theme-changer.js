const fs = require('fs');
const path = require('path');

const directory = 'h:/Freelancing/Pharma-medical/frontend/src';

const mappings = [
    { from: /\bbg-slate-950\b/g, to: 'bg-slate-50' },
    { from: /\bbg-slate-900\b/g, to: 'bg-white' },
    { from: /\bbg-slate-800\b/g, to: 'bg-slate-50' },
    { from: /\btext-white\b/g, to: 'text-slate-800' },
    { from: /\btext-gray-400\b/g, to: 'text-slate-500' },
    { from: /\btext-gray-300\b/g, to: 'text-slate-600' },
    { from: /\bbg-white\/5\b/g, to: 'bg-slate-50' },
    { from: /\bbg-white\/10\b/g, to: 'bg-slate-100' },
    { from: /\bborder-white\/10\b/g, to: 'border-slate-200' },
    { from: /\bborder-white\/20\b/g, to: 'border-slate-300' },
    { from: /\bborder-white\/5\b/g, to: 'border-slate-100' },
    { from: /\btext-blue-300\/70\b/g, to: 'text-slate-500' },
    { from: /\bshadow-white\/5\b/g, to: 'shadow-slate-200/50' }
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directory);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    mappings.forEach(map => {
        content = content.replace(map.from, map.to);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Modified: ${file}`);
    }
});

console.log("Theme migration complete.");
