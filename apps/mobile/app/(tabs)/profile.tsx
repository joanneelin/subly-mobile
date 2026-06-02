import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { formatCents } from '@/lib/format'

export default function ProfileScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [prefs, setPrefs] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/(auth)/sign-in'); return }

      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('renter_preferences').select('*').eq('user_id', user.id).maybeSingle(),
      ])
      setProfile(p)
      setPrefs(r)
      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/(auth)/sign-in')
  }

  if (loading || !profile) return null

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{profile.full_name}</Text>
        <Text style={styles.meta}>{profile.school_year} · {profile.major}</Text>
      </View>

      {prefs && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My preferences</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Budget</Text>
            <Text style={styles.value}>{formatCents(prefs.rent_min)}–{formatCents(prefs.rent_max)}/mo</Text>
          </View>
          {prefs.bio ? (
            <View style={styles.row}>
              <Text style={styles.label}>Bio</Text>
              <Text style={styles.value}>{prefs.bio}</Text>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { alignItems: 'center', paddingTop: 64, paddingBottom: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#2b3ef5' },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  section: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 14, color: '#6b7280' },
  value: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },
  signOut: { padding: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  signOutText: { color: '#dc2626', fontWeight: '600' },
})
