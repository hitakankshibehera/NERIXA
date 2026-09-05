'use client';

import NERCommandApp from '@/components/NERCommandApp';

/**
 * Public Root Route (/)
 * Default Customer & Traveler Public Safety Access
 * Normal visitors only see and register as 'VIEWER'
 * Official government portals are isolated at:
 *  - /super-admin
 *  - /state-admin
 *  - /district-officer
 *  - /field-officer
 *  - /logistics-operator
 */
export default function HomePage() {
  return <NERCommandApp portalRole="CUSTOMER" />;
}
