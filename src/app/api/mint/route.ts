import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { generateSVG } from '../../../generate-svg.js';
import { buildAttendeeMetadata } from '../../../lib/attendee-metadata';
import { normalizeMeshMetadata } from '../../../lib/mesh-metadata';

export const runtime = 'nodejs';

async function pinFileToPinata(file: Blob, name: string): Promise<string> {
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error('PINATA_API_KEY / PINATA_SECRET_KEY not configured.');
  }

  const form = new FormData();
  form.append('file', file, name);
  form.append('pinataMetadata', JSON.stringify({ name }));
  // CIDv0 (Qm... 46 chars) keeps `ipfs://<cid>` under the 64-byte CIP-25
  // metadatum cap so it isn't chunked into a string array — wallets that
  // don't implement CIP-25 v2's array-concatenation rule then render the
  // image correctly. CIDv1 (bafy... 59 chars) is over the limit and gets
  // split.
  form.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretKey,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed (${response.status}): ${await response.text()}`);
  }

  const { IpfsHash } = await response.json();
  if (!IpfsHash) {
    throw new Error('Pinata response missing IpfsHash.');
  }
  return IpfsHash;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const attendeeNumber = Number(body.attendeeNumber);
    const attendeeName = String(body.attendeeName ?? '').trim();
    const address = String(body.address ?? '').trim();

    if (!Number.isInteger(attendeeNumber) || attendeeNumber < 1) {
      return NextResponse.json({ error: 'Invalid attendee number.' }, { status: 400 });
    }

    if (!attendeeName) {
      return NextResponse.json({ error: 'Please enter the name to print on the NFT.' }, { status: 400 });
    }

    if (!address) {
      return NextResponse.json({ error: 'Please connect your wallet before claiming.' }, { status: 400 });
    }

    const attendeeId = String(attendeeNumber).padStart(3, '0');
    const metadata = buildAttendeeMetadata(attendeeNumber);

    const svg = generateSVG(attendeeNumber, Number(metadata.attended_count ?? 1), attendeeName);
    // Cardano wallets (Eternl, Lace, Begin, …) don't render SVG NFT images —
    // they show a broken-image placeholder. Rasterize to PNG so the poster
    // displays like any normal image. density 144 (2× the 72-dpi default)
    // renders the 800×1120 SVG at 1600×2240 for crisp text.
    const png = await sharp(Buffer.from(svg), { density: 144 }).png().toBuffer();
    const cid = await pinFileToPinata(
      new Blob([new Uint8Array(png)], { type: 'image/png' }),
      `BCN_Meetup_${attendeeId}_${attendeeName}.png`,
    );
    const ipfsUri = `ipfs://${cid}`;

    return NextResponse.json({
      status: 'prepared',
      message:
        'Your personalized NFT artwork has been pinned to IPFS. Confirm in your wallet to mint it on-chain.',
      metadata: normalizeMeshMetadata({
        ...metadata,
        name: `BCN Meetup - ${attendeeName}`,
        claimed_by: attendeeName,
        receiver: address,
        image: ipfsUri,
        mediaType: 'image/png',
        graffiti_image: ipfsUri,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to prepare mint transaction.',
      },
      { status: 500 },
    );
  }
}
