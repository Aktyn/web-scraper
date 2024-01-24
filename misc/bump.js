const fs = require('fs')

if (process.argv.length < 4) {
  console.log('Usage: node bump.js <package.json path> <patch | minor | major>')
  process.exit(1)
}

const [, , packageJsonPath, bumpType] = process.argv

const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8')
const versionMatch = packageJsonContent.match(/"version":\s*"([^"]*)"/)

if (!versionMatch) {
  console.error(`No version in (${packageJsonPath})`)
  process.exit(1)
}

const currentVersion = versionMatch[1]
const bumpVersion = bump(currentVersion, bumpType)

fs.writeFileSync(
  packageJsonPath,
  packageJsonContent.replace(/"version":(\s*)"([^"]*)"/, `"version":$1"${bumpVersion}"`),
)

console.log(`${packageJsonPath} version changed from ${currentVersion} to ${bumpVersion}`)

/**
 * @param {string} version
 * @param {'patch' | 'minor' | 'major'} type
 */
function bump(version, type) {
  const [major, minor, patch] = version.split('.').map((v) => (v ? parseInt(v) : 0))

  switch (type) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'major':
      return `${major + 1}.0.0`
    default:
      throw new Error('Invalid bump type')
  }
}
