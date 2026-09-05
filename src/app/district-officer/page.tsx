'use client';

import NERCommandApp from '@/components/NERCommandApp';

/**
 * District Officer Dedicated Portal (/district-officer)
 * District Emergency Operations Center (DEOC) Access
 */
export default function DistrictOfficerPage() {
  return (
    <NERCommandApp
      portalRole="DISTRICT_OFFICER"
      portalTitle="District Emergency Operations Center (DEOC)"
    />
  );
}
