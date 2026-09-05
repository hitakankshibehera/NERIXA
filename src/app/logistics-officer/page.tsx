'use client';

import NERCommandApp from '@/components/NERCommandApp';

/**
 * Logistics Officer Dedicated Portal (/logistics-officer)
 * Alias route as requested in prompt
 */
export default function LogisticsOfficerPage() {
  return (
    <NERCommandApp
      portalRole="LOGISTICS_OPERATOR"
      portalTitle="Strategic Convoy & Logistics Command"
    />
  );
}
