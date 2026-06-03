'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MeshBadge, MeshProvider, useWallet, useWalletList } from '@meshsdk/react';
import { LucideCheckCircle, LucideAlertTriangle, LucideLoader2 } from 'lucide-react';
import {
  Transaction,
  applyParamsToScript,
  deserializeAddress,
  resolvePlutusScriptAddress,
  resolveScriptHash,
} from '@meshsdk/core';
import blueprint from '../../plutus.json';
import { buildAttendeeDatum } from '../lib/attendee-datum';
import {
  buildCip25V2Metadata,
  cip68UserAssetNameHex,
  normalizeMeshMetadata,
} from '../lib/mesh-metadata';

const PREVIEW_VERSION = 'blockchain-centre-logo-v1';

export default function ClaimPageClient() {
  return (
    <MeshProvider>
      <ClaimPageContent />
    </MeshProvider>
  );
}

function ClaimPageContent() {
  const searchParams = useSearchParams();
  const attendeeNumber = searchParams.get('n');
  const token = searchParams.get('token');
  const claimAttendeeNumber = attendeeNumber ?? '200';
  const attendeeId = claimAttendeeNumber.padStart(3, '0');

  const { connected, connecting, connect, disconnect, wallet, address, name } = useWallet();
  const wallets = useWalletList();
  const [status, setStatus] = useState<'idle' | 'validating' | 'ready' | 'minting' | 'prepared' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [preparedMsg, setPreparedMsg] = useState('');
  const [mintNotice, setMintNotice] = useState('');
  const [preparedMetadata, setPreparedMetadata] = useState<any>(null);
  const [txHash, setTxHash] = useState('');
  const [attendeeName, setAttendeeName] = useState('');
  const trimmedAttendeeName = attendeeName.trim();
  const previewSrc = `/api/preview?n=${claimAttendeeNumber}${
    trimmedAttendeeName ? `&name=${encodeURIComponent(trimmedAttendeeName)}` : ''
  }&v=${PREVIEW_VERSION}`;

  useEffect(() => {
    const parsedAttendeeNumber = Number(claimAttendeeNumber);

    if (
      claimAttendeeNumber &&
      Number.isInteger(parsedAttendeeNumber) &&
      parsedAttendeeNumber > 0
    ) {
      // In a real app, call an API to validate the token when one is provided.
      setStatus('ready');
      setErrorMsg('');
    } else {
      setStatus('error');
      setErrorMsg('Invalid claim details. Please check the claim URL and try again.');
    }
  }, [claimAttendeeNumber, token]);

  const getActiveAddress = async () => {
    if (address) {
      return address;
    }

    if (!wallet) {
      return '';
    }

    return await wallet.getChangeAddress();
  };

  const handleMint = async () => {
    if (!connected || !wallet) return;
    if (!trimmedAttendeeName) {
      setErrorMsg('Please enter the name to print on the NFT.');
      return;
    }

    setStatus('minting');
    try {
      const activeAddress = await getActiveAddress();

      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendeeNumber: claimAttendeeNumber,
          attendeeName: trimmedAttendeeName,
          address: activeAddress,
        }),
      });
      const contentType = response.headers.get('content-type') ?? '';
      const payload = contentType.includes('application/json')
        ? await response.json()
        : { error: await response.text() };

      if (!response.ok) {
        throw new Error(payload.error || 'Minting failed. Please try again.');
      }

      if (payload.status === 'prepared') {
        setPreparedMsg(payload.message || 'Your NFT preview has been personalized.');
        setPreparedMetadata(payload.metadata);
        setMintNotice('');
        setStatus('prepared');
        return;
      }

      const { tx } = payload;
      if (!tx) {
        throw new Error('Minting backend did not return a transaction.');
      }

      const signedTx = await wallet.signTx(tx);

      const hash = await wallet.submitTx(signedTx);
      setTxHash(hash);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Minting failed. Please try again.');
      setStatus('error');
    }
  };

  const handlePreparedMint = async () => {
    if (!connected || !wallet) {
      setMintNotice('Connect your Cardano wallet before minting.');
      return;
    }

    if (!preparedMetadata) {
      setMintNotice('Prepare the NFT preview before minting.');
      return;
    }

    setStatus('minting');
    setMintNotice('');

    try {
      const activeAddress = await getActiveAddress();
      if (!activeAddress) {
        throw new Error('Could not read the connected wallet address.');
      }

      const { pubKeyHash } = deserializeAddress(activeAddress);
      if (!pubKeyHash) {
        throw new Error('Could not read the payment key hash from the connected wallet address.');
      }

      const mintingBlueprint = blueprint.validators.find((validator) =>
        validator.title === 'minting_policy.minting_policy.mint'
      );
      const referenceBlueprint = blueprint.validators.find((validator) =>
        validator.title === 'cip68_reference.cip68_reference.spend'
      );

      if (!mintingBlueprint || !referenceBlueprint) {
        throw new Error('Could not find the required validators in plutus.json.');
      }

      const mintingScript = {
        code: applyParamsToScript(mintingBlueprint.compiledCode, [pubKeyHash, 200]),
        version: 'V3' as const,
      };
      const policyId = resolveScriptHash(mintingScript.code, 'V3');
      const referenceScript = {
        code: applyParamsToScript(referenceBlueprint.compiledCode, [pubKeyHash]),
        version: 'V3' as const,
      };
      const referenceAddress = resolvePlutusScriptAddress(referenceScript, 0);
      const networkId = await wallet.getNetworkId();

      const tx = new Transaction({ initiator: wallet as any });
      tx.setNetwork(networkId === 1 ? 'mainnet' : 'preprod');
      tx.setChangeAddress(activeAddress);
      // The Aiken minting validator does `expect list.has(self.extra_signatories,
      // organiser_pkh)`. Add the wallet's payment key as a required signer so
      // it ends up in extra_signatories, otherwise the script returns False
      // and the node rejects the tx in phase-2 validation.
      tx.setRequiredSigners([activeAddress]);
      // Mesh's addCollateralIfNeeded fallback has a bug: if the wallet has no
      // designated collateral but does have a pure-ADA utxo ≥5 ADA, it does
      // `return [utxo]` instead of `setCollateral([utxo])`, so the tx builds
      // with no collateral and the node rejects on submit. Pick collateral
      // ourselves so we never depend on that broken path.
      let collateral = await wallet.getCollateral();
      if (collateral.length === 0) {
        const utxos = await wallet.getUtxos();
        const pureLovelace = (utxos ?? [])
          .filter((utxo: any) => utxo.output.amount.length === 1)
          .filter((utxo: any) => Number(utxo.output.amount[0]?.quantity) >= 5_000_000);
        if (pureLovelace.length === 0) {
          throw new Error(
            'No collateral available. Designate a collateral UTxO (≥5 ADA, pure lovelace) in your wallet settings, or send yourself a small pure-ADA UTxO.',
          );
        }
        collateral = [pureLovelace[0]];
      }
      tx.setCollateral(collateral);
      const mintMetadata = normalizeMeshMetadata(preparedMetadata);
      tx.mintAsset(
        mintingScript,
        {
          assetName: `BCN_Meetup_${attendeeId}`,
          assetQuantity: '1',
          recipient: { address: activeAddress },
          metadata: mintMetadata,
          cip68ScriptAddress: referenceAddress,
        },
        {
          data: { alternative: 0, fields: [Number(claimAttendeeNumber)] },
          budget: { mem: 14000000, steps: 10000000000 },
        },
      );

      // mintAsset places a CIP-68 metadata Map onto the reference output's inline
      // datum, but Mesh's getOutputMinLovelace clones outputs via JSON which loses
      // Maps — that's what raises "Cannot convert undefined to a BigInt" during
      // build. Overwrite with the positional AttendeeMetadata constr the Aiken
      // validator actually expects. After mintAsset, the pending txOutput is the
      // reference output, so txOutInlineDatumValue targets the right one.
      (tx as any).txBuilder.txOutInlineDatumValue(
        buildAttendeeDatum({
          name: String(preparedMetadata.name ?? `BCN Meetup - ${trimmedAttendeeName}`),
          image: String(preparedMetadata.image ?? ''),
          event_name: String(preparedMetadata.event_name ?? ''),
          event_date: String(preparedMetadata.event_date ?? ''),
          venue: String(preparedMetadata.venue ?? ''),
          location: String(preparedMetadata.location ?? ''),
          attendee_number: Number(preparedMetadata.attendee_number ?? Number(claimAttendeeNumber)),
          tier: String(preparedMetadata.tier ?? ''),
          attended_count: Number(preparedMetadata.attended_count ?? 1),
          perks: Array.isArray(preparedMetadata.perks)
            ? preparedMetadata.perks.map((perk: unknown) => String(perk))
            : [],
          graffiti_image: String(preparedMetadata.graffiti_image ?? ''),
          edition: String(preparedMetadata.edition ?? `#${attendeeId} of 200`),
          shareable: Boolean(preparedMetadata.shareable),
          poster_embedded: Boolean(preparedMetadata.poster_embedded),
          version: Number(preparedMetadata.version ?? 1),
        }),
      );
      tx.setMetadata(721, buildCip25V2Metadata({
        policyId,
        assetNameHex: cip68UserAssetNameHex(`BCN_Meetup_${attendeeId}`),
        metadata: normalizeMeshMetadata({
          ...mintMetadata,
          name: preparedMetadata.name,
          image: preparedMetadata.image,
          mediaType: preparedMetadata.mediaType ?? 'image/svg+xml',
          description: `BCN Meetup attendee NFT claimed by ${trimmedAttendeeName}`,
          files: [
            {
              name: preparedMetadata.name,
              mediaType: preparedMetadata.mediaType ?? 'image/svg+xml',
              src: preparedMetadata.image,
            },
          ],
          claimed_by: trimmedAttendeeName,
          attendee_number: Number(claimAttendeeNumber),
          preview: `/api/preview?n=${claimAttendeeNumber}&name=${encodeURIComponent(trimmedAttendeeName)}`,
        }),
      }));

      // Replace Mesh's bundled cost-model defaults with the live ones from the
      // node — otherwise the script-integrity hash we compute won't match what
      // the node recomputes and the submit rejects with a hash mismatch.
      const paramsResp = await fetch('/api/protocol-params', { cache: 'no-store' });
      if (!paramsResp.ok) {
        throw new Error(`Could not load live protocol parameters (${paramsResp.status}).`);
      }
      const { costModels } = await paramsResp.json();
      (tx as any).txBuilder.meshTxBuilderBody.network = costModels;

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const hash = await wallet.submitTx(signedTx);

      setTxHash(hash);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('prepared');
      setMintNotice(err?.message || 'Minting failed. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F0F0F',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#00FFCC', fontSize: '2.5rem', margin: '0' }}>BCN MEETUP</h1>
        <p style={{ color: '#888', letterSpacing: '2px' }}>NFT CLAIM PORTAL</p>
      </header>

      <main style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: '#1A1A1A',
        borderRadius: '20px',
        padding: '30px',
        border: '1px solid #333',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        {status === 'error' ? (
          <div style={{ textAlign: 'center', color: '#FF4444' }}>
            <LucideAlertTriangle size={48} style={{ marginBottom: '20px' }} />
            <h3>Oops! Something went wrong</h3>
            <p>{errorMsg}</p>
          </div>
        ) : status === 'success' ? (
          <div style={{ textAlign: 'center', color: '#00FFCC' }}>
            <LucideCheckCircle size={48} style={{ marginBottom: '20px' }} />
            <h2>Minting Successful!</h2>
            <p>Your attendee NFT has been sent to your wallet.</p>
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#222', 
              borderRadius: '10px',
              fontSize: '0.8rem',
              wordBreak: 'break-all'
            }}>
              Tx Hash: {txHash}
            </div>
            <button 
              onClick={() => window.open(`https://preprod.cardanoscan.io/transaction/${txHash}`, '_blank')}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                borderRadius: '10px',
                backgroundColor: '#00FFCC',
                color: 'black',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              View on Explorer
            </button>
          </div>
        ) : status === 'prepared' ? (
          <div style={{ textAlign: 'center', color: '#00FFCC' }}>
            <LucideCheckCircle size={48} style={{ marginBottom: '20px' }} />
            <h2>NFT Preview Prepared</h2>
            <p style={{ color: '#DDD', lineHeight: 1.6 }}>
              {preparedMsg}
            </p>
            <div style={{
              width: '100%',
              aspectRatio: '800/1120',
              backgroundColor: '#000',
              borderRadius: '10px',
              marginTop: '20px',
              overflow: 'hidden',
              border: '2px dashed #333',
            }}>
              <img
                src={previewSrc}
                alt="Personalized NFT Preview"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            {mintNotice ? (
              <p style={{ color: '#FFCC66', lineHeight: 1.5, marginTop: '18px' }}>
                {mintNotice}
              </p>
            ) : null}
            <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={handlePreparedMint}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  backgroundColor: '#00FFCC',
                  color: 'black',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                }}
              >
                MINT NFT
              </button>
              <button
                onClick={() => {
                  setMintNotice('');
                  setStatus('ready');
                }}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  backgroundColor: '#222',
                  color: '#FFF',
                  border: '1px solid #444',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Edit Name
              </button>
            </div>
          </div>
        ) : status === 'idle' ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ color: '#00FFCC', marginTop: 0 }}>Claim your attendee NFT</h2>
              <p style={{ color: '#AAA', lineHeight: 1.6 }}>
                Connect your Cardano wallet to continue.
              </p>
            </div>
            {!connected ? (
              <WalletConnectPanel
                connecting={connecting}
                wallets={wallets}
                onConnect={async (walletId) => {
                  try {
                    await connect(walletId);
                  } catch (err: any) {
                    setStatus('error');
                    setErrorMsg(err?.message || 'Could not connect wallet. Please try again.');
                  }
                }}
              />
            ) : (
              <div style={{ color: '#00FFCC', fontWeight: 'bold' }}>
                Wallet connected{name ? `: ${name}` : ''}
                <button
                  onClick={disconnect}
                  style={{
                    marginLeft: '12px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    backgroundColor: '#222',
                    color: '#FFF',
                    cursor: 'pointer',
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="attendee-name"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#DDD',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                }}
              >
                Name to print on NFT
              </label>
              <input
                id="attendee-name"
                value={attendeeName}
                onChange={(event) => {
                  setAttendeeName(event.target.value);
                  setErrorMsg('');
                }}
                maxLength={32}
                placeholder="Enter your name"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #333',
                  backgroundColor: '#0F0F0F',
                  color: '#FFF',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
              {errorMsg ? (
                <p style={{ color: '#FF7777', fontSize: '0.85rem', marginBottom: 0 }}>
                  {errorMsg}
                </p>
              ) : null}
            </div>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ 
                width: '100%', 
                aspectRatio: '800/1120', 
                backgroundColor: '#000', 
                borderRadius: '10px',
                marginBottom: '20px',
                overflow: 'hidden',
                position: 'relative',
                border: '2px dashed #333'
              }}>
                {/* Preview Image */}
                <img 
                  src={previewSrc} 
                  alt="Graffiti Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <h3>Attendee NFT #{attendeeId}</h3>
              <p style={{ color: '#888' }}>
                {trimmedAttendeeName
                  ? `${trimmedAttendeeName} will appear on the NFT`
                  : 'Enter your name to personalize the NFT'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!connected ? (
                <>
                  <p style={{ fontSize: '0.9rem', color: '#AAA', textAlign: 'center' }}>
                    Connect your preferred browser wallet (Nami, Eternl, Lace, Flint) to claim your NFT
                  </p>
                  <WalletConnectPanel
                    connecting={connecting}
                    wallets={wallets}
                    onConnect={async (walletId) => {
                      try {
                        await connect(walletId);
                      } catch (err: any) {
                        setStatus('error');
                        setErrorMsg(err?.message || 'Could not connect wallet. Please try again.');
                      }
                    }}
                  />
                </>
              ) : (
                <button 
                  onClick={handleMint}
                  disabled={status === 'minting' || !trimmedAttendeeName}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '10px',
                    backgroundColor: status === 'minting' || !trimmedAttendeeName ? '#333' : '#00FFCC',
                    color: 'black',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    cursor: status === 'minting' || !trimmedAttendeeName ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {status === 'minting' ? (
                    <>
                      <LucideLoader2 className="animate-spin" />
                      PREPARING...
                    </>
                  ) : 'PREPARE NFT CLAIM'}
                </button>
              )}
            </div>
          </>
        )}
      </main>

      <footer style={{ marginTop: 'auto', padding: '40px', textAlign: 'center', opacity: '0.5' }}>
        <MeshBadge isDark />
        <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>
          Powered by Mesh SDK & Aiken
        </p>
      </footer>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

function WalletConnectPanel({
  connecting,
  wallets,
  onConnect,
}: {
  connecting: boolean;
  wallets: Array<{ id: string; name: string; icon: string }>;
  onConnect: (walletId: string) => Promise<void>;
}) {
  if (wallets.length === 0) {
    return (
      <div style={{ color: '#AAA', fontSize: '0.9rem', lineHeight: 1.6 }}>
        No Cardano browser wallet was detected. Install or enable Lace, Eternl, Nami, or Flint, then refresh this page.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {wallets.map((browserWallet) => (
        <button
          key={browserWallet.id}
          onClick={() => onConnect(browserWallet.id)}
          disabled={connecting}
          style={{
            width: '100%',
            minHeight: '48px',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #333',
            backgroundColor: connecting ? '#333' : '#00FFCC',
            color: '#000',
            cursor: connecting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontWeight: 'bold',
          }}
        >
          {browserWallet.icon ? (
            <img
              src={browserWallet.icon}
              alt=""
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
            />
          ) : null}
          {connecting ? 'Connecting...' : `Connect ${browserWallet.name}`}
        </button>
      ))}
    </div>
  );
}
