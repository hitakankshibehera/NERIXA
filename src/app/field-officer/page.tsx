'use client';

import NERCommandApp from '@/components/NERCommandApp';

/**
 * Field Officer Dedicated Portal (/field-officer)
 * Ground First Responder & Quick Action Tactical Access
 */
export default function FieldOfficerPage() {
  return (
    <NERCommandApp
      portalRole="FIELD_OFFICER"
      portalTitle="Field First Responder Tactical Portal"
    />
  );
}
