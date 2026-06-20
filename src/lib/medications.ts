export interface Medication {
  id: string;        // stored in Dose.name
  brand: string;     // display label
  generic: string;   // subtitle text
  dosesMg: number[]; // available dosage strengths
}

export const GLP1_MEDICATIONS: Medication[] = [
  { id: 'Mounjaro',  brand: 'Mounjaro',  generic: 'tirzepatide', dosesMg: [2.5, 5, 7.5, 10, 12.5, 15] },
  { id: 'Zepbound',  brand: 'Zepbound',  generic: 'tirzepatide', dosesMg: [2.5, 5, 7.5, 10, 12.5, 15] },
  { id: 'Ozempic',   brand: 'Ozempic',   generic: 'semaglutide', dosesMg: [0.25, 0.5, 1, 2] },
  { id: 'Wegovy',    brand: 'Wegovy',    generic: 'semaglutide', dosesMg: [0.25, 0.5, 1, 1.7, 2.4, 7.2] },
  { id: 'Trulicity', brand: 'Trulicity', generic: 'dulaglutide', dosesMg: [0.75, 1.5, 3, 4.5] },
];

export interface InjectionSiteOption {
  area: string;   // group header: 'Abdomen' | 'Thigh' | 'Upper Arm'
  label: string;  // display text in the pill: 'Upper L', 'Lower M', etc.
  value: string;  // stored in Dose.injectionSite: 'abdomen-upper-left', etc.
}

export const INJECTION_SITES: InjectionSiteOption[] = [
  // Abdomen — 6 zones, ordered upper row then lower row to mirror the body
  { area: 'Abdomen', label: 'Upper L', value: 'abdomen-upper-left' },
  { area: 'Abdomen', label: 'Upper M', value: 'abdomen-upper-mid' },
  { area: 'Abdomen', label: 'Upper R', value: 'abdomen-upper-right' },
  { area: 'Abdomen', label: 'Lower L', value: 'abdomen-lower-left' },
  { area: 'Abdomen', label: 'Lower M', value: 'abdomen-lower-mid' },
  { area: 'Abdomen', label: 'Lower R', value: 'abdomen-lower-right' },
  // Thigh — 2 zones
  { area: 'Thigh', label: 'Left',  value: 'thigh-left' },
  { area: 'Thigh', label: 'Right', value: 'thigh-right' },
  // Upper Arm — 2 zones
  { area: 'Upper Arm', label: 'Left',  value: 'arm-left' },
  { area: 'Upper Arm', label: 'Right', value: 'arm-right' },
];

/** Map a stored injection-site token to a human-readable label for display. */
export function formatInjectionSite(value: string): string {
  if (!value || value === 'None') return '';
  const opt = INJECTION_SITES.find((s) => s.value === value);
  if (opt) return `${opt.area} · ${opt.label}`;
  // Legacy fallback: capitalize raw value (handles old 'Abdomen', 'Thigh', 'Arm')
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Resolve a Dose.name to a known Medication, or undefined for 'Other'/legacy. */
export function findMedication(name: string): Medication | undefined {
  return GLP1_MEDICATIONS.find((m) => m.id === name);
}
