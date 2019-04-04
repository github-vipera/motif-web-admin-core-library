const pkg = require('./package.json');
const { resolve, relative } = require('path');
const { writeFileSync, ensureFileSync } = require('fs-extra');

const version = pkg.version;
const buildDate = Date.now()
const libInfo = {
    version: version,
    timestamp: buildDate
}

console.log(">>>>>> Library Version Stamper <<<<<<");

console.log(">> Current version:", pkg.version);
console.log(">> Timestamp:", buildDate);

const file = resolve(__dirname, 'src', 'lib', 'pkginfo.ts');

ensureFileSync(file);

writeFileSync(file,
    `// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
    /* tslint:disable */
    export const PKGINFO = ${JSON.stringify(libInfo, null, 4)};
    /* tslint:enable */
    `, { encoding: 'utf-8' });


console.log(`Wrote version info ${JSON.stringify(libInfo)} to ${file}`);

/*


const { pkg } = require('../package.json');
const { resolve, relative } = require('path');
const { writeFileSync } = require('fs-extra');

const file = resolve(__dirname, '..', 'src', 'lib', 'pkg.ts');

*/