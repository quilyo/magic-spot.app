#!/usr/bin/env node
/**
 * bump-version.js
 * Updates version in package.json, Android build.gradle, and iOS project.pbxproj
 *
 * Usage:
 *   node scripts/bump-version.js 1.1.0
 *
 * What it changes:
 *   package.json            → "version": "1.1.0"
 *   android/app/build.gradle → versionName "1.1.0" and versionCode +1
 *   ios/.../project.pbxproj  → MARKETING_VERSION = 1.1.0 and CURRENT_PROJECT_VERSION +1
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Usage: node scripts/bump-version.js <version>');
  console.error('Example: node scripts/bump-version.js 1.1.0');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Version must be in format X.Y.Z (e.g. 1.1.0)');
  process.exit(1);
}

const root = resolve(__dirname, '..');

// ── 1. package.json ──────────────────────────────────────────────────────────
const pkgPath = resolve(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const oldPkgVersion = pkg.version;
pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`package.json       ${oldPkgVersion} → ${newVersion}`);

// ── 2. Android build.gradle ──────────────────────────────────────────────────
const gradlePath = resolve(root, 'android', 'app', 'build.gradle');
let gradle = readFileSync(gradlePath, 'utf8');

const codeMatch = gradle.match(/versionCode\s+(\d+)/);
if (!codeMatch) { console.error('Could not find versionCode in build.gradle'); process.exit(1); }
const oldCode = parseInt(codeMatch[1], 10);
const newCode = oldCode + 1;

const nameMatch = gradle.match(/versionName\s+"([^"]+)"/);
if (!nameMatch) { console.error('Could not find versionName in build.gradle'); process.exit(1); }
const oldName = nameMatch[1];

gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${newCode}`);
gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${newVersion}"`);
writeFileSync(gradlePath, gradle);
console.log(`build.gradle       versionCode ${oldCode} → ${newCode}, versionName "${oldName}" → "${newVersion}"`);

// ── 3. iOS project.pbxproj ───────────────────────────────────────────────────
const pbxPath = resolve(root, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
let pbx = readFileSync(pbxPath, 'utf8');

const buildMatch = pbx.match(/CURRENT_PROJECT_VERSION = (\d+);/);
if (!buildMatch) { console.error('Could not find CURRENT_PROJECT_VERSION in project.pbxproj'); process.exit(1); }
const oldBuild = parseInt(buildMatch[1], 10);
const newBuild = oldBuild + 1;

pbx = pbx.replace(/CURRENT_PROJECT_VERSION = \d+;/g, `CURRENT_PROJECT_VERSION = ${newBuild};`);
pbx = pbx.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${newVersion};`);
writeFileSync(pbxPath, pbx);
console.log(`project.pbxproj    CURRENT_PROJECT_VERSION ${oldBuild} → ${newBuild}, MARKETING_VERSION → ${newVersion}`);

console.log(`\nDone. All targets set to version ${newVersion}.`);
