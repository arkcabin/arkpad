import fs from 'fs';
import path from 'path';

const version = process.argv[2];
if (!version) {
  console.error('Usage: node sync-versions.js <version>');
  process.exit(1);
}

const packages = [
  'package.json',
  'packages/core/package.json',
  'packages/react/package.json',
  'apps/arkpad/package.json'
];

packages.forEach(pkgPath => {
  const absolutePath = path.resolve(process.cwd(), pkgPath);
  if (fs.existsSync(absolutePath)) {
    const content = fs.readFileSync(absolutePath, 'utf8');
    const pkg = JSON.parse(content);
    
    pkg.version = version;
    
    if (pkg.dependencies) {
      if (pkg.dependencies['@arkpad/core']) pkg.dependencies['@arkpad/core'] = version;
      if (pkg.dependencies['@arkpad/react']) pkg.dependencies['@arkpad/react'] = version;
    }
    
    // Preserve formatting (2 spaces) and add trailing newline
    fs.writeFileSync(absolutePath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`Updated ${pkgPath} to ${version}`);
  }
});
