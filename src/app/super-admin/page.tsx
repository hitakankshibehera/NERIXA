'use client';

import NERCommandApp from '@/components/NERCommandApp';

/**
 * Super Admin Dedicated Portal (/super-admin)
 * National & Regional Command HQ Level 1 Classified Access
 */
export default function SuperAdminPage() {
  return (
    <NERCommandApp
      portalRole="SUPER_ADMIN"
      portalTitle="Super Admin National Command HQ"
    />
  );
}
