export type UserRole = 'renter' | 'lister'

export type UnitType = 'studio' | '1br' | '2br' | '3br'

export type GenderPreference = 'any' | 'female' | 'male' | 'nonbinary'

export type GenderEnvironment = 'coed' | 'single' | 'no_preference'

export type SchoolYear = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate' | 'Other'

export type ReportCategory =
  | 'inaccurate_info'
  | 'scam'
  | 'inappropriate_content'
  | 'wrong_price'
  | 'no_longer_available'
  | 'other'

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'

export type Amenity = 'laundry' | 'parking' | 'gym' | 'pet_friendly' | 'furnished'

export interface HouseRules {
  pets: boolean
  smoking: boolean
  guests: boolean
  quiet_hours: string | null
}

export interface Profile {
  id: string
  role: UserRole[]
  full_name: string
  avatar_url: string | null
  school_email: string
  school_year: SchoolYear | null
  major: string | null
  verified: boolean
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  rent: number
  deposit: number | null
  utilities_included: boolean
  unit_type: UnitType
  furnished: boolean
  bedrooms: number
  bathrooms: number
  start_date: string
  end_date: string
  address: string
  lat: number
  lng: number
  gender_preference: GenderPreference
  existing_roommates: number
  roommate_genders: string[]
  house_rules: HouseRules
  image_urls: string[]
  active: boolean
  created_at: string
}

export interface ListingWithProfile extends Listing {
  profiles: Profile
}

export interface RenterPreferences {
  id: string
  user_id: string
  rent_min: number
  rent_max: number
  move_in_earliest: string
  move_in_latest: string
  move_out_earliest: string
  move_out_latest: string
  unit_type_pref: UnitType[]
  gender_env: GenderEnvironment
  roommates_max: number
  amenities: Amenity[]
  campus_radius_km: number
  bio: string
}

export interface Thread {
  id: string
  lister_id: string
  renter_id: string
  listing_id: string | null
  created_at: string
  updated_at: string
}

export interface ThreadWithDetails extends Thread {
  lister: Profile
  renter: Profile
  listing: Listing | null
  last_message: Message | null
  unread_count: number
}

export interface Message {
  id: string
  thread_id: string
  sender_id: string
  body: string | null
  image_url: string | null
  seen_at: string | null
  created_at: string
}

export interface Save {
  user_id: string
  saved_profile_id: string | null
  saved_listing_id: string | null
  created_at: string
}

export interface Report {
  id: string
  listing_id: string
  reporter_id: string
  category: ReportCategory
  details: string | null
  status: ReportStatus
  created_at: string
}

export interface ListingMatchWeights {
  listing_id: string
  w_budget: number
  w_dates: number
  w_gender: number
  w_unit_type: number
  w_amenities: number
  updated_at: string
}

export interface FeedListing extends Listing {
  match_score: number
  profiles: Profile
}

export interface FeedRenter extends RenterPreferences {
  match_score: number
  profiles: Profile
}
