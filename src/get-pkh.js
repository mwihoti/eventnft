import { resolvePaymentKeyHash } from '@meshsdk/core';
import dotenv from 'dotenv';
dotenv.config();

const addr = process.argv[2] || process.env.ORGANISER_ADDRESS;

if (!addr || addr === 'addr1...') {
  console.error("Please provide an address: node src/get-pkh.js <address>");
  process.exit(1);
}

try {
  const pkh = resolvePaymentKeyHash(addr);
  console.log("\n✅ Address Verified");
  console.log("Address:", addr);
  console.log("PKH (Hex):", pkh);
  console.log("\nCopy the PKH (Hex) into your .env file as ORGANISER_PKH");
} catch (e) {
  console.error("Invalid Cardano Address");
}
