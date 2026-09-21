const fs = require('node:fs')
const path = require('node:path')
const sharp = require('sharp')
const pngToIco = require('png-to-ico')

const REACT_DIR = path.resolve(__dirname, '..', '..', 'ReactJS_Holy')
const SVG_PATH = path.join(REACT_DIR, 'public', 'quran.svg')
const BUILD_DIR = path.resolve(__dirname, '..', 'build')
const ICONS_DIR = path.join(BUILD_DIR, 'icons')

const SIZES = [16, 24, 32, 48, 64, 128, 256]

async function main() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error(`Icon SVG topilmadi: ${SVG_PATH}`)
    process.exit(1)
  }

  fs.mkdirSync(ICONS_DIR, { recursive: true })

  const pngPaths = []
  for (const size of SIZES) {
    const density = Math.round((size / 64) * 96)
    const buffer = await sharp(SVG_PATH, { density }).resize(size, size).png().toBuffer()
    const outPath = path.join(ICONS_DIR, `icon-${size}.png`)
    fs.writeFileSync(outPath, buffer)
    pngPaths.push(outPath)
  }

  const icoBuffer = await pngToIco(pngPaths)
  fs.writeFileSync(path.join(BUILD_DIR, 'icon.ico'), icoBuffer)

  const density512 = Math.round((512 / 64) * 96)
  const png512 = await sharp(SVG_PATH, { density: density512 }).resize(512, 512).png().toBuffer()
  fs.writeFileSync(path.join(BUILD_DIR, 'icon.png'), png512)

  console.log(`Icon yaratildi: ${path.join(BUILD_DIR, 'icon.ico')}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
