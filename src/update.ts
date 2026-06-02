import { 
  MeshTxBuilder, 
  applyParamsToScript, 
  resolvePlutusScriptAddress,
  stringToHex
} from '@meshsdk/core';
import type { PlutusScript, UTxO } from '@meshsdk/core';
import blueprint from '../plutus.json' assert { type: 'json' };

export async function updateMetadata(
  txBuilder: MeshTxBuilder,
  organiserPkh: string,
  referenceUtxo: UTxO,
  newMetadata: any
) {
  // 1. Get reference script
  const referenceBlueprint = blueprint.validators.find(v => v.title.includes('reference_token'));
  if (!referenceBlueprint) throw new Error('Validator not found');

  const referenceScriptCode = applyParamsToScript(
    referenceBlueprint.compiledCode,
    [organiserPkh]
  );

  const referenceScript: PlutusScript = {
    code: referenceScriptCode,
    version: 'V3'
  };

  const referenceAddress = resolvePlutusScriptAddress(referenceScript, 0);

  // 2. Prepare New Datum
  const newDatum = {
    alternative_format: 'cip68',
    fields: [
      stringToHex(newMetadata.name),
      stringToHex(newMetadata.image),
      stringToHex(newMetadata.event_name),
      stringToHex(newMetadata.event_date),
      stringToHex(newMetadata.venue),
      stringToHex(newMetadata.location),
      newMetadata.attendee_number,
      stringToHex(newMetadata.tier),
      newMetadata.attended_count,
      newMetadata.perks.map((p: string) => stringToHex(p)),
      stringToHex(newMetadata.graffiti_image),
      stringToHex(newMetadata.edition),
      newMetadata.shareable,
      newMetadata.poster_embedded,
      newMetadata.version
    ]
  };

  // 3. Build Transaction
  await txBuilder
    .spendingTxInReference(
      referenceUtxo.input.txHash,
      referenceUtxo.input.outputIndex,
      referenceUtxo.output.amount,
      referenceUtxo.output.address
    )
    .spendingReferencePath(referenceScript.code, 'V3') // Use reference input if possible, or just regular spending
    // Note: If using spendingReferencePath, we need to have the script as a reference input.
    // Otherwise, use spendingScript(code).
    .spendingScript(referenceScript.code, 'V3')
    .spendingRedeemer({
      alternative_format: 'cip68',
      fields: [0, newDatum] // UpdateMetadata is the first constructor (0)
    })
    .txOut(referenceAddress, referenceUtxo.output.amount)
    .txOutInlineDatumValue(newDatum)
    .requiredSignerHash(organiserPkh)
    .complete();

  return txBuilder.txHex;
}
