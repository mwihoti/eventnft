'use client';

import dynamic from 'next/dynamic';

const ClaimPageClient = dynamic(() => import('./claim-page-client'), {
  ssr: false,
  loading: () => null,
});

export default function ClaimPageShell() {
  return <ClaimPageClient />;
}
