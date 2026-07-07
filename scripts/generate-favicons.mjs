import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src', 'images', 'CYFORCE 2-1.jpg');
const publicDir = path.join(root, 'public');
const brandBg = '#060B1A';

async function renderSquarePng(size) {
    const padding = Math.round(size * 0.12);
    const inner = size - padding * 2;

    const logo = await sharp(source)
        .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    return sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: brandBg,
        },
    })
        .composite([{ input: logo, gravity: 'centre' }])
        .png()
        .toBuffer();
}

async function main() {
    if (!fs.existsSync(source)) {
        throw new Error(`Logo not found: ${source}`);
    }

    const [png16, png32, png192, png512] = await Promise.all([
        renderSquarePng(16),
        renderSquarePng(32),
        renderSquarePng(192),
        renderSquarePng(512),
    ]);

    const favicon = await toIco([png16, png32]);

    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);
    fs.writeFileSync(path.join(publicDir, 'logo192.png'), png192);
    fs.writeFileSync(path.join(publicDir, 'logo512.png'), png512);

    console.log('Generated public/favicon.ico, logo192.png, logo512.png');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
