import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateSVG } from './generate-svg.js';

const ARGS = process.argv.slice(2);

const attendeeArg = ARGS.find(a => a.startsWith('--attendee='))?.split('=')[1];
const countArg = ARGS.find(a => a.startsWith('--count='))?.split('=')[1];
const noPng = ARGS.includes('--no-png');

const MAX_SUPPLY = 200;

async function generate(n) {
  const attendeeNumber = parseInt(n);
  const attendedCount = 1; // Default for initial mint
  
  const tier = attendedCount >= 10 ? 'Legend' : 
               attendedCount >= 7 ? 'OG' : 
               attendedCount >= 3 ? 'Regular' : 'Newcomer';

  const svg = generateSVG(attendeeNumber, attendedCount);
  const name = `BCN_Meetup_${attendeeNumber.toString().padStart(3, '0')}`;

  // Paths
  const svgPath = path.join('output', 'svg', `${name}.svg`);
  const pngPath = path.join('output', 'png', `${name}.png`);
  const metaPath = path.join('output', 'metadata', `${name}.json`);

  // Save SVG
  fs.writeFileSync(svgPath, svg);
  console.log(`Generated SVG: ${svgPath}`);

  // Save PNG
  if (!noPng) {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(pngPath);
    console.log(`Generated PNG: ${pngPath}`);
  }

  // Save Metadata (CIP-68 datum shape)
  const metadata = {
    "name": `BCN Meetup — Attendee #${attendeeNumber.toString().padStart(3, '0')}`,
    "image": "ipfs://REPLACE_WITH_ACTUAL_PNG_CID",
    "event_name": "Community Meetup",
    "event_date": "June 15 · 2025",
    "venue": "Blockchain Centre NBO",
    "location": "Argwings Kodhek Rd, Nairobi",
    "attendee_number": attendeeNumber,
    "tier": tier,
    "attended_count": attendedCount,
    "perks": [],
    "graffiti_image": "ipfs://REPLACE_WITH_ACTUAL_SVG_CID",
    "edition": `#${attendeeNumber.toString().padStart(3, '0')} of ${MAX_SUPPLY}`,
    "shareable": true,
    "poster_embedded": true,
    "version": 1
  };

  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  console.log(`Generated Metadata: ${metaPath}`);
}

async function main() {
  if (attendeeArg) {
    await generate(attendeeArg);
  } else if (countArg) {
    const count = Math.min(parseInt(countArg), MAX_SUPPLY);
    for (let i = 1; i <= count; i++) {
      await generate(i);
    }
  } else {
    // Generate all 200
    for (let i = 1; i <= MAX_SUPPLY; i++) {
      await generate(i);
    }
  }
}

main().catch(console.error);
