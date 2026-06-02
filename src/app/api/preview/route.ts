import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { generateSVG } from '../../../generate-svg.js';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const attendeeNumber = searchParams.get('n');
  const attendeeName = searchParams.get('name')?.trim() ?? '';
  const parsed = Number(attendeeNumber);

  if (!attendeeNumber || !Number.isInteger(parsed) || parsed < 1) {
    return NextResponse.json({ error: 'Invalid attendee number' }, { status: 400 });
  }

  if (attendeeName) {
    const svg = generateSVG(parsed, 1, attendeeName);
    const image = await sharp(Buffer.from(svg)).png().toBuffer();

    return new NextResponse(new Uint8Array(image), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  }

  const fileName = `BCN_Meetup_${String(parsed).padStart(3, '0')}.png`;
  const filePath = path.join(process.cwd(), 'output', 'png', fileName);

  try {
    const image = await readFile(filePath);

    return new NextResponse(new Uint8Array(image), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Preview not found' }, { status: 404 });
  }
}
