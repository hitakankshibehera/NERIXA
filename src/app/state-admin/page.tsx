'use client';

import NERCommandApp from '@/components/NERCommandApp';

/**
 * State Admin Dedicated Portal (/state-admin)
 * State Disaster Management Authority (SDMA) Command Access
 */
export default function StateAdminPage() {
  return (
    <NERCommandApp
      portalRole="STATE_ADMIN"
      portalTitle="State Disaster Management Authority (SDMA)"
    />
  );
}
