import { applyParamsToScript, resolvePlutusScriptAddress } from '@meshsdk/core';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const blueprintPath = './plutus.json';
  
  if (!fs.existsSync(blueprintPath)) {
    console.error("❌ plutus.json not found. Run 'cd aiken && aiken build && cp plutus.json ..' first.");
    process.exit(1);
  }

  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
  const organiserPkh = process.env.ORGANISER_PKH;
  const maxSupply = 200;

  if (!organiserPkh || organiserPkh === '...') {
    console.error("❌ ORGANISER_PKH not set in .env");
    process.exit(1);
  }

  const mintingBlueprint = blueprint.validators.find(v => v.title.includes('attendance'));
  
  try {
    const mintingScriptCode = applyParamsToScript(
      mintingBlueprint.compiledCode,
      [organiserPkh, maxSupply]
    );

    // The Policy ID is the hash of the compiled script. 
    // In Mesh, resolvePlutusScriptAddress gives us the hash as part of the address, 
    // but we can get the policy ID (script hash) directly from the code.
    // However, the easiest way to get the Policy ID (hash) in Mesh is via the script code itself.
    // For V3 scripts, the hash is the Blake2b-224 hash of the script bytes.
    
    // Mesh doesn't have a direct 'resolvePolicyId' exported simply, 
    // but we can use resolvePlutusScriptAddress to see the hash.
    const addr = resolvePlutusScriptAddress({ code: mintingScriptCode, version: 'V3' }, 0);
    
    console.log("\n✅ Script Parameters Applied");
    console.log("Organiser PKH:", organiserPkh);
    console.log("Max Supply:", maxSupply);
    console.log("\n--------------------------------------------------");
    console.log("NEXT_PUBLIC_POLICY_ID:", addr); 
    console.log("--------------------------------------------------");
    console.log("\nNOTE: In Mesh, the policy ID is often the same as the script hash.");
    console.log("Copy the value above into your .env file.");
    
  } catch (e) {
    console.error("Error calculating Policy ID:", e);
  }
}

main();
