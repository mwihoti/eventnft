# BCN Meetup NFT

BCN Meetup NFT is a Cardano NFT generator and claim app for event attendees. It builds the artwork and metadata for each attendee, lets the user connect a Cardano wallet in the browser, personalizes the preview with their name, and prepares the CIP-68 mint flow.

## What It Does
- Generates attendee-specific graffiti artwork and PNG previews.
- Builds Aiken validators for the minting policy and CIP-68 reference validator.
- Serves a claim page at `/` using Next.js App Router.
- Lets the attendee connect a browser wallet, enter their name, and preview the personalized NFT before minting.
- Pins the personalized image to IPFS through Pinata during the claim flow.

## Tech Stack
- Next.js 14
- React 18
- Mesh SDK
- Aiken
- Sharp
- Pinata

## Project Layout
- `aiken/`: Aiken contract source and build output.
- `src/app/`: Next.js app router pages and API routes.
- `src/generate-svg.js`: SVG artwork generator.
- `src/index.js`: batch artwork and metadata generator.
- `src/update.ts`: metadata update flow helper.
- `output/`: generated SVG, PNG, and metadata files.
- `plutus.json`: compiled blueprint used by the frontend transaction flow.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a local env file and set the required values:
   - `PINATA_API_KEY`
   - `PINATA_SECRET_KEY`
   - `BLOCKFROST_PROJECT_ID`
   - `ORGANISER_PKH`

3. Build the Aiken contracts:
   ```bash
   cd aiken
   aiken build
   ```

4. Keep the root `plutus.json` in sync with the compiled blueprint in `aiken/`.

## Scripts
- `npm run generate`: generate attendee artwork, PNGs, and metadata.
- `npm run dev`: start the Next.js app locally.
- `npm run build`: create a production build.
- `npm run start`: run the production build.
- `npm run lint`: run the Next.js lint command.

## Generate Artwork
Generate all 200 attendee files:
```bash
npm run generate
```

Generate one attendee:
```bash
node src/index.js --attendee=42
```

Generate a smaller batch:
```bash
node src/index.js --count=10
```

Skip PNG generation:
```bash
node src/index.js --count=10 --no-png
```

## Claim Flow
1. Open the app at `http://localhost:3000/`.
2. Enter the attendee name to print on the NFT.
3. Connect a supported browser wallet.
4. The app prepares a personalized preview and pins the image to IPFS.
5. Confirm the mint in the wallet when the prepared mint step is ready.

The preview image endpoint is `GET /api/preview?n=200&name=Daniel`.

## Contract Flow
- `minting_policy.ak` enforces the mint and the CIP-68 pair of tokens.
- `cip68_reference.ak` enforces reference-token metadata updates.
- `types.ak` defines the attendee datum shape used by the validator.

If you change the validators, rebuild Aiken and refresh the root `plutus.json` before testing the frontend again.

## Notes
- The claim page uses the Next.js App Router and lives at `/`, not `/claim`.
- Wallet interaction happens in the browser through Mesh SDK.
- `BLOCKFROST_PROJECT_ID` is used by the protocol-parameters route.
- `PINATA_API_KEY` and `PINATA_SECRET_KEY` are required for the claim preparation step that uploads the personalized image.

## License
ISC
