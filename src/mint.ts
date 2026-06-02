import { 
  MeshTxBuilder, 
  applyParamsToScript, 
  resolvePlutusScriptAddress,
  stringToHex,
  deserializeDatum
} from '@meshsdk/core';
import type { PlutusScript } from '@meshsdk/core';
import blueprint from '../plutus.json' assert { type: 'json' };

export async function mintNFT(
  txBuilder: MeshTxBuilder,
  organiserPkh: string,
  attendeeAddress: string,
  attendeeNumber: number,
  metadata: any
) {
  // 1. Get scripts from blueprint
  const mintingBlueprint = blueprint.validators.find(v => v.title.includes('attendance'));
  const referenceBlueprint = blueprint.validators.find(v => v.title.includes('reference_token'));

  if (!mintingBlueprint || !referenceBlueprint) {
    throw new Error('Validators not found in blueprint');
  }

  // 2. Apply parameters
  // Organiser PKH is a string (hex), max_supply = 200
  const mintingScriptCode = applyParamsToScript(
    mintingBlueprint.compiledCode,
    [organiserPkh, 200]
  );

  const referenceScriptCode = applyParamsToScript(
    referenceBlueprint.compiledCode,
    [organiserPkh]
  );

  const mintingScript: PlutusScript = {
    code: mintingScriptCode,
    version: 'V3'
  };

  const referenceScript: PlutusScript = {
    code: referenceScriptCode,
    version: 'V3'
  };

  const referenceAddress = resolvePlutusScriptAddress(referenceScript, 0);

  // 3. Define asset names with CIP-68 prefixes
  // (100) = 000643b0
  // (222) = 000de140
  const baseName = `BCN_Meetup_${attendeeNumber.toString().padStart(3, '0')}`;
  const referenceAssetName = `000643b0${stringToHex(baseName)}`;
  const userAssetName = `000de140${stringToHex(baseName)}`;

  // 4. Prepare Datum (AttendeeMetadata)
  // Matching the record order in Aiken: 
  // name, image, event_name, event_date, venue, location, attendee_number, 
  // tier, attended_count, perks, graffiti_image, edition, shareable, poster_embedded, version
  const datum = {
    alternative_format: 'cip68',
    fields: [
      stringToHex(metadata.name),
      stringToHex(metadata.image),
      stringToHex(metadata.event_name),
      stringToHex(metadata.event_date),
      stringToHex(metadata.venue),
      stringToHex(metadata.location),
      metadata.attendee_number,
      stringToHex(metadata.tier),
      metadata.attended_count,
      metadata.perks.map((p: string) => stringToHex(p)),
      stringToHex(metadata.graffiti_image),
      stringToHex(metadata.edition),
      metadata.shareable,
      metadata.poster_embedded,
      metadata.version
    ]
  };

  // 5. Build transaction
  await txBuilder
    .mint('1', mintingScript.code, userAssetName)
    .mintingScript(mintingScript.code, 'V3')
    .mintRedeemer({
      alternative_format: 'cip68',
      fields: [metadata.attendee_number]
    })
    .mint('1', mintingScript.code, referenceAssetName)
    .mintingScript(mintingScript.code, 'V3')
    .mintRedeemer({
      alternative_format: 'cip68',
      fields: [metadata.attendee_number]
    })
    // Send user token to attendee
    .txOut(attendeeAddress, [{ unit: `${mintingScript.code}${userAssetName}`, quantity: '1' }])
    // Send reference token to script with inline datum
    .txOut(referenceAddress, [{ unit: `${mintingScript.code}${referenceAssetName}`, quantity: '1' }])
    .txOutInlineDatumValue(datum)
    .requiredSignerHash(organiserPkh)
    .complete();

  return txBuilder.txHex;
}
