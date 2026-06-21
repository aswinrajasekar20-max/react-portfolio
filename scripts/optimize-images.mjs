import sharp from "sharp";
import { statSync } from "node:fs";

const A = "src/assets";
// [source, output, maxWidth, quality]
const jobs = [
  [`${A}/image.png`, `${A}/image.webp`, 720, 80], // hero illustration (canvas-sampled at 500)
  [`${A}/aswin-profile.png`, `${A}/aswin-profile.webp`, 600, 78], // shown at 350×500
  [`${A}/e-commerce.png`, `${A}/e-commerce.webp`, 760, 78],
  [`${A}/Bus-ticket.png`, `${A}/Bus-ticket.webp`, 760, 78],
  [`${A}/voice-commander.png`, `${A}/voice-commander.webp`, 760, 78],
];

const kb = (p) => (statSync(p).size / 1024).toFixed(0);

for (const [src, out, width, quality] of jobs) {
  const before = kb(src);
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(out);
  console.log(`${src} (${before}KB) -> ${out} (${kb(out)}KB)`);
}
console.log("done");
