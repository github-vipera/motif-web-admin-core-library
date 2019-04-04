/**
 *   Pre-Build Library script
 *   Vipera Srl, 2019
 * 
 *   Author: Marco Bonati (marcp.bonati@vipera.com)
 * 
 */

const pkg = require('./package.json');
const { resolve } = require('path');
const { writeFileSync, ensureFileSync } = require('fs-extra');

const version = pkg.version;
const buildDate = Date.now()
const libInfo = {
    version: version,
    timestamp: buildDate,
    date: new Date(),
    description: pkg.description,
    contributors : pkg.contributors,
    license: pkg.license
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


console.log(`>> Wrote version info ${JSON.stringify(libInfo)} to ${file}`);
