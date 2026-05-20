/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (err) {
    console.error(`Failed to run command: ${cmd}`, err.message);
    return '';
  }
}

// 1. Get tags pointing at the current HEAD
const tags = runCmd('git tag --points-at HEAD').split('\n').filter(Boolean);
console.log(`Tags pointing at HEAD:`, tags);

if (tags.length === 0) {
  console.log('No tags found at current HEAD.');
  process.exit(0);
}

// Map package names to their directory path
const packagesDir = path.join(process.cwd(), 'packages');
const pkgMap = {};

if (fs.existsSync(packagesDir)) {
  const folders = fs.readdirSync(packagesDir);
  for (const folder of folders) {
    const folderPath = path.join(packagesDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    
    const pkgJsonPath = path.join(folderPath, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        pkgMap[pkgJson.name] = folderPath;
      } catch (err) {
        console.error(`Error parsing package.json in ${folderPath}`, err.message);
      }
    }
  }
}

// Also check apps/ just in case
const appsDir = path.join(process.cwd(), 'apps');
if (fs.existsSync(appsDir)) {
  const folders = fs.readdirSync(appsDir);
  for (const folder of folders) {
    const folderPath = path.join(appsDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    
    const pkgJsonPath = path.join(folderPath, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        pkgMap[pkgJson.name] = folderPath;
      } catch (err) {
        console.error(`Error parsing package.json in ${folderPath}`, err.message);
      }
    }
  }
}

console.log('Detected packages registry map:', Object.keys(pkgMap));

for (const tag of tags) {
  // Expected tag formats: @arkpad/core@1.6.14 or packages/extension-bold/v1.0.0, etc.
  // Changeset tag format is @scope/name@version or name@version
  const lastAtIndex = tag.lastIndexOf('@');
  if (lastAtIndex <= 0) {
    console.log(`Skipping tag "${tag}" as it doesn't match the package@version format.`);
    continue;
  }
  
  const pkgName = tag.substring(0, lastAtIndex);
  const version = tag.substring(lastAtIndex + 1);
  
  console.log(`Processing tag: ${tag} (Package: ${pkgName}, Version: ${version})`);
  
  const pkgPath = pkgMap[pkgName];
  if (!pkgPath) {
    console.log(`Warning: Could not find workspace directory for package: ${pkgName}. Creating generic release.`);
    runCmd(`gh release create "${tag}" --title "${tag}" --generate-notes`);
    continue;
  }
  
  const changelogPath = path.join(pkgPath, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    console.log(`Warning: CHANGELOG.md not found in ${pkgPath}. Creating generic release.`);
    runCmd(`gh release create "${tag}" --title "${tag}" --generate-notes`);
    continue;
  }
  
  // Extract version section from CHANGELOG.md
  const changelogContent = fs.readFileSync(changelogPath, 'utf8');
  const lines = changelogContent.split('\n');
  
  let started = false;
  const versionNotes = [];
  const versionHeaderRegex = new RegExp(`^##\\s+${version.replace(/\./g, '\\.')}\\b`);
  
  for (const line of lines) {
    if (versionHeaderRegex.test(line)) {
      started = true;
      continue;
    }
    
    if (started) {
      // If we encounter another H2 version header, we stop
      if (/^##\s+\d+\.\d+\.\d+/.test(line)) {
        break;
      }
      versionNotes.push(line);
    }
  }
  
  const notesText = versionNotes.join('\n').trim();
  
  if (!notesText) {
    console.log(`Warning: Could not extract changelog notes for version ${version}. Creating generic release.`);
    runCmd(`gh release create "${tag}" --title "${tag}" --generate-notes`);
    continue;
  }
  
  console.log(`Extracted release notes for ${tag}:\n${notesText}`);
  
  // Create a temporary file to hold the release notes to prevent shell escaping issues
  const tempNotesFile = path.join(process.cwd(), `temp-notes-${Date.now()}.md`);
  fs.writeFileSync(tempNotesFile, notesText, 'utf8');
  
  try {
    console.log(`Creating GitHub Release for ${tag}...`);
    // Run gh release create using the notes file
    const output = execSync(`gh release create "${tag}" --title "${tag}" --notes-file "${tempNotesFile}"`, { encoding: 'utf8' }).trim();
    console.log(`GitHub Release created successfully! Output:\n${output}`);
  } catch (err) {
    console.error(`Failed to create release for ${tag}:`, err.message);
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tempNotesFile)) {
      fs.unlinkSync(tempNotesFile);
    }
  }
}
