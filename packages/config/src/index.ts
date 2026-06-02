/**
 * Allowed email domains for signup.
 * Empty array = allow all emails (dev/testing mode).
 * Add .edu domains to restrict (e.g. ['upenn.edu', 'harvard.edu']).
 */
export const ALLOWED_EMAIL_DOMAINS: string[] = []

export function isEmailAllowed(email: string): boolean {
  if (ALLOWED_EMAIL_DOMAINS.length === 0) return true
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return ALLOWED_EMAIL_DOMAINS.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`))
}

export const SCHOOL_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Other'] as const

export const UNIT_TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: '1br', label: '1 Bedroom' },
  { value: '2br', label: '2 Bedrooms' },
  { value: '3br', label: '3+ Bedrooms' },
] as const

export const GENDER_PREFERENCES = [
  { value: 'any', label: 'Any' },
  { value: 'female', label: 'Female only' },
  { value: 'male', label: 'Male only' },
  { value: 'nonbinary', label: 'Non-binary preferred' },
] as const

export const GENDER_ENVIRONMENTS = [
  { value: 'coed', label: 'Co-ed' },
  { value: 'single', label: 'Single gender' },
  { value: 'no_preference', label: 'No preference' },
] as const

export const AMENITIES = [
  { value: 'laundry', label: 'In-unit laundry' },
  { value: 'parking', label: 'Parking' },
  { value: 'gym', label: 'Gym' },
  { value: 'pet_friendly', label: 'Pet friendly' },
  { value: 'furnished', label: 'Furnished' },
] as const

export const REPORT_CATEGORIES = [
  { value: 'inaccurate_info', label: 'Inaccurate / misleading listing info' },
  { value: 'scam', label: 'Scam or fraudulent listing' },
  { value: 'inappropriate_content', label: 'Inappropriate or offensive content' },
  { value: 'wrong_price', label: 'Wrong price or hidden fees' },
  { value: 'no_longer_available', label: 'Already rented / listing no longer available' },
  { value: 'other', label: 'Other' },
] as const

export const FEED_PAGE_SIZE = 20

export const DEFAULT_MATCH_WEIGHTS = {
  w_budget: 0.3,
  w_dates: 0.25,
  w_gender: 0.2,
  w_unit_type: 0.15,
  w_amenities: 0.1,
} as const
