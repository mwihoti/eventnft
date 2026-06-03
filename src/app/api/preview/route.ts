import { NextResponse } from 'next/server';
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

  const svg = generateSVG(parsed, 1, attendeeName);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': attendeeName ? 'no-store' : 'public, max-age=3600',
    },
  });
}
