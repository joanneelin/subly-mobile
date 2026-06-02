import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { formatCents } from '@/lib/format'

export default function ListingProfileScreen() {
  const { id, listing: listingId } = useLocalSearchParams<{ id: string; listing: string }>()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [messaging, setMessaging] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [{ data: profileData }, { data: listingData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        listingId
          ? supabase.from('listings').select('*').eq('id', listingId).single()
          : supabase.from('listings').select('*').eq('user_id', id).eq('active', true).order('created_at', { ascending: false }).limit(1).single(),
      ])
      setProfile(profileData)
      setListing(listingData)
      setLoading(false)
    }
    load()
  }, [id, listingId])

  const handleMessage = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/(auth)/sign-in'); return }
    if (user.id === id) return

    setMessaging(true)
    const { data: existing } = await supabase
      .from('threads')
      .select('id')
      .eq('lister_id', id)
      .eq('renter_id', user.id)
      .maybeSingle()

    if (existing) {
      setMessaging(false)
      router.push({ pathname: '/messages/[id]', params: { id: existing.id } } as any)
      return
    }

    const { data: thread, error } = await supabase
      .from('threads')
      .insert({ lister_id: id, renter_id: user.id, listing_id: listing?.id ?? null })
      .select('id')
      .single()

    setMessaging(false)
    if (error) { Alert.alert('Error', error.message); return }
    if (thread) router.push({ pathname: '/messages/[id]', params: { id: thread.id } } as any)
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2b3ef5" /></View>
  if (!listing || !profile) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Listing not found.</Text>
    </View>
  )

  const rules = listing.house_rules ?? {}

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Photo placeholder */}
        <View style={styles.photo}>
          <Text style={styles.photoUnit}>{listing.unit_type?.toUpperCase()}</Text>
        </View>

        {/* Title & price */}
        <View style={styles.row}>
          <Text style={styles.title}>{listing.title || `${listing.unit_type?.toUpperCase()} Sublet`}</Text>
          <Text style={styles.rent}>{formatCents(listing.rent)}<Text style={styles.rentSub}>/mo</Text></Text>
        </View>
        <Text style={styles.address}>{listing.address}</Text>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lease period</Text>
          <Text style={styles.sectionValue}>
            {new Date(listing.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
            {new Date(listing.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.sectionValue}>{listing.bedrooms} bed · {listing.bathrooms} bath</Text>
          {listing.furnished && <Text style={styles.tag}>Furnished</Text>}
          {listing.utilities_included && <Text style={styles.tag}>Utilities included</Text>}
          {listing.deposit && <Text style={styles.sectionValue}>Deposit: {formatCents(listing.deposit)}</Text>}
        </View>

        {/* House rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>House rules</Text>
          <Text style={styles.rule}>{rules.pets ? '✓' : '✗'} Pets</Text>
          <Text style={styles.rule}>{rules.smoking ? '✓' : '✗'} Smoking</Text>
          <Text style={styles.rule}>{rules.guests ? '✓' : '✗'} Guests</Text>
          {rules.quiet_hours && <Text style={styles.sectionValue}>Quiet hours: {rules.quiet_hours}</Text>}
        </View>

        {/* Description */}
        {listing.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this place</Text>
            <Text style={styles.sectionValue}>{listing.description}</Text>
          </View>
        ) : null}

        {/* Lister */}
        <View style={styles.lister}>
          <View style={styles.listerAvatar}>
            <Text style={styles.listerInitial}>{profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
          </View>
          <View>
            <Text style={styles.listerName}>{profile.full_name}</Text>
            <Text style={styles.listerMeta}>{profile.school_year} · {profile.major}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Message button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleMessage} disabled={messaging}>
          <Text style={styles.buttonText}>{messaging ? 'Opening chat...' : 'Message lister'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#6b7280', fontSize: 14 },
  scroll: { paddingBottom: 100 },
  back: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 8 },
  backText: { color: '#6b7280', fontSize: 14 },
  photo: { height: 220, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' },
  photoUnit: { fontSize: 24, fontWeight: '700', color: '#2b3ef5' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  rent: { fontSize: 22, fontWeight: '700', color: '#111827' },
  rentSub: { fontSize: 14, fontWeight: '400', color: '#6b7280' },
  address: { fontSize: 13, color: '#6b7280', paddingHorizontal: 16, marginTop: 4 },
  section: { margin: 16, marginBottom: 0, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  sectionValue: { fontSize: 14, color: '#111827' },
  tag: { fontSize: 13, color: '#059669', backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start', marginTop: 6 },
  rule: { fontSize: 14, color: '#374151', marginBottom: 4 },
  lister: { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  listerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' },
  listerInitial: { fontSize: 18, fontWeight: '700', color: '#2b3ef5' },
  listerName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  listerMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  button: { backgroundColor: '#2b3ef5', borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
