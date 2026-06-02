import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { formatCents } from '@/lib/format'

export default function SavedScreen() {
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('saves')
        .select('*, listing:listings(*)')
        .eq('user_id', user.id)
        .not('saved_listing_id', 'is', null)
        .order('created_at', { ascending: false })

      setListings(data?.map((s) => s.listing).filter(Boolean) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2b3ef5" /></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>{listings.length} saved listing{listings.length !== 1 ? 's' : ''}</Text>
      </View>
      <FlatList
        data={listings}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No saved listings</Text>
            <Text style={styles.emptySubtext}>Bookmark listings from the feed.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.user_id, listing: item.id } } as any)}
          >
            <View style={styles.photo}>
              <Text style={styles.unit}>{item.unit_type?.toUpperCase()}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.rent}>{formatCents(item.rent)}/mo</Text>
              <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  list: { padding: 12 },
  row: { gap: 12 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  photo: { height: 100, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' },
  unit: { fontSize: 14, fontWeight: '700', color: '#2b3ef5' },
  cardBody: { padding: 10 },
  rent: { fontSize: 15, fontWeight: '700', color: '#111827' },
  address: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
  emptySubtext: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
})
