/**
 * Fraud Typology Classification
 * Deterministic mapping from scheme_type to broader typology categories.
 * Public records based, explainable.
 */

export const TYPOLOGIES = [
  'healthcare',
  'relief',
  'tax',
  'employment',
  'kickbacks',
  'shell_entities',
  'benefits',
  'government_contracts',
  'insurance',
] as const

export type Typology = (typeof TYPOLOGIES)[number]

/** Maps scheme_type → typology. One scheme can map to one typology. */
export const SCHEME_TO_TYPOLOGY: Record<string, Typology> = {
  edd_unemployment: 'employment',
  ppp_fraud: 'relief',
  eidl_fraud: 'relief',
  medi_cal: 'healthcare',
  telemedicine: 'healthcare',
  pharmacy: 'healthcare',
  dme: 'healthcare',
  home_health: 'healthcare',
  hospice: 'healthcare',
  lab_testing: 'healthcare',
  substance_abuse: 'healthcare',
  homeless_program: 'relief',
  calfresh: 'benefits',
  workers_comp: 'employment',
  contract_fraud: 'government_contracts',
  tax_fraud: 'tax',
  insurance_fraud: 'insurance',
  education_fraud: 'government_contracts',
}

export function getTypology(schemeType: string): Typology {
  const t = SCHEME_TO_TYPOLOGY[schemeType?.toLowerCase()]
  return t || 'shell_entities' // fallback for unknown
}

export function formatTypology(t: Typology): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
