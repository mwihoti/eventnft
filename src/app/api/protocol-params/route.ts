import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function blockfrostHost(projectId: string): string {
  if (projectId.startsWith('mainnet')) return 'https://cardano-mainnet.blockfrost.io/api/v0';
  if (projectId.startsWith('preview')) return 'https://cardano-preview.blockfrost.io/api/v0';
  if (projectId.startsWith('preprod')) return 'https://cardano-preprod.blockfrost.io/api/v0';
  throw new Error(`Unrecognised BLOCKFROST_PROJECT_ID prefix: ${projectId.slice(0, 8)}`);
}

export async function GET() {
  try {
    const projectId = process.env.BLOCKFROST_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ error: 'BLOCKFROST_PROJECT_ID is not set.' }, { status: 500 });
    }

    const response = await fetch(`${blockfrostHost(projectId)}/epochs/latest/parameters`, {
      headers: { project_id: projectId },
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Blockfrost returned ${response.status}: ${text}` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const raw = data.cost_models_raw ?? {};
    const costModels = [raw.PlutusV1 ?? [], raw.PlutusV2 ?? [], raw.PlutusV3 ?? []];

    return NextResponse.json({ costModels, epoch: data.epoch });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch protocol params.' },
      { status: 500 },
    );
  }
}
