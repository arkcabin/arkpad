/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (err) {
    console.error(`Failed to run git command: ${cmd}`, err.message);
    return '';
  }
}

// 1. Determine the base SHA for comparison
let baseSha = '';
const lastReleaseCommit = runGit('git log --grep="release: version packages" -n 1 --format="%H"');
if (lastReleaseCommit) {
  console.log(`Found last release commit: ${lastReleaseCommit}`);
  baseSha = lastReleaseCommit;
} else {
  // Try to use the workflow's BEFORE SHA passed from env
  const githubEventBefore = process.env.GITHUB_EVENT_BEFORE;
  if (githubEventBefore && githubEventBefore !== '0000000000000000000000000000000000000000') {
    console.log(`Using GITHUB_EVENT_BEFORE: ${githubEventBefore}`);
    baseSha = githubEventBefore;
  } else {
    console.log('Falling back to HEAD^');
    baseSha = 'HEAD^';
  }
}

console.log(`Comparing changes from BASE_SHA: ${baseSha} to HEAD`);

// Ensure changeset folder exists
if (!fs.existsSync('.changeset')) {
  fs.mkdirSync('.changeset');
}

// 2. Scan packages
const packagesDir = path.join(process.cwd(), 'packages');
const packages = fs.readdirSync(packagesDir);
let anyChanged = false;

for (const pkg of packages) {
  const pkgDir = path.join(packagesDir, pkg);
  if (!fs.statSync(pkgDir).isDirectory()) continue;
  
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) continue;
  
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const pkgName = pkgJson.name;
  if (pkgJson.private) continue; // Skip private packages

  // Check if there are changes in this package (excluding docs/tests/markdown)
  const diffCommand = `git diff --name-only ${baseSha} HEAD -- "${path.relative(process.cwd(), pkgDir)}"`;
  const changes = runGit(diffCommand)
    .split('\n')
    .filter(Boolean)
    .filter(file => !/\.(md|txt|test\.ts|test\.js|test\.tsx|spec\.ts|spec\.js)$/i.test(file));

  if (changes.length > 0) {
    console.log(`Package ${pkgName} has changes:`, changes);
    anyChanged = true;

    // Retrieve commit messages since baseSha that touched this package folder
    const logCommand = `git log ${baseSha}..HEAD --format="%s (%h) by %an" -- "${path.relative(process.cwd(), pkgDir)}"`;
    const commits = runGit(logCommand).split('\n').filter(Boolean);

    // Group commits by conventional commit types
    const groups = {
      Features: [],
      'Bug Fixes': [],
      'Performance Improvements': [],
      Documentation: [],
      Refactoring: [],
      'Styles & UI': [],
      Others: []
    };

    for (const commit of commits) {
      // Exclude release/ci/chore/skip-ci commits from changelog unless they are important
      if (/release: version packages/i.test(commit) || /\[skip ci\]/i.test(commit) || /^ci:/i.test(commit)) {
        continue;
      }

      if (/^(feat|Feat)(\([^)]+\))?:/i.test(commit)) {
        groups.Features.push(commit.replace(/^(feat|Feat)(\([^)]+\))?:\s*/i, ''));
      } else if (/^(fix|Fix)(\([^)]+\))?:/i.test(commit)) {
        groups['Bug Fixes'].push(commit.replace(/^(fix|Fix)(\([^)]+\))?:\s*/i, ''));
      } else if (/^(perf|Perf)(\([^)]+\))?:/i.test(commit)) {
        groups['Performance Improvements'].push(commit.replace(/^(perf|Perf)(\([^)]+\))?:\s*/i, ''));
      } else if (/^(docs|Docs)(\([^)]+\))?:/i.test(commit)) {
        groups.Documentation.push(commit.replace(/^(docs|Docs)(\([^)]+\))?:\s*/i, ''));
      } else if (/^(refactor|Refactor)(\([^)]+\))?:/i.test(commit)) {
        groups.Refactoring.push(commit.replace(/^(refactor|Refactor)(\([^)]+\))?:\s*/i, ''));
      } else if (/^(style|Style|ui|UI)(\([^)]+\))?:/i.test(commit)) {
        groups['Styles & UI'].push(commit.replace(/^(style|Style|ui|UI)(\([^)]+\))?:\s*/i, ''));
      } else {
        // Only include other commits if they are not standard chores
        if (!/^(chore|build|test|ci)(\([^)]+\))?:/i.test(commit)) {
          groups.Others.push(commit);
        }
      }
    }

    // Build the changeset markdown description
    const emojiMap = {
      Features: '✨ Features',
      'Bug Fixes': '🐛 Bug Fixes',
      'Performance Improvements': '⚡ Performance Improvements',
      Documentation: '📝 Documentation',
      Refactoring: '♻️ Refactoring',
      'Styles & UI': '🎨 Styles & UI',
      Others: '📦 Others'
    };

    let description = '';
    for (const [groupName, msgs] of Object.entries(groups)) {
      if (msgs.length > 0) {
        const heading = emojiMap[groupName] || groupName;
        description += `### ${heading}\n\n`;
        msgs.forEach(msg => {
          description += `- ${msg}\n`;
        });
        description += '\n';
      }
    }

    // If description is empty (e.g. only chores/tests were committed), add a default message
    if (!description.trim()) {
      description = '### 📦 Others\n\n- Internal maintenance and dependency updates\n\n';
    }

    // Write to a separate changeset file for this package
    const safePkgName = pkg.replace(/[^a-zA-Z0-9]/g, '_');
    const changesetFilePath = path.join('.changeset', `auto-${safePkgName}.md`);
    const fileContent = `---\n"${pkgName}": patch\n---\n\n${description.trim()}\n`;

    fs.writeFileSync(changesetFilePath, fileContent, 'utf8');
    console.log(`Created changeset: ${changesetFilePath}`);
  }
}

if (!anyChanged) {
  console.log('No package changes detected. No changesets generated.');
}
