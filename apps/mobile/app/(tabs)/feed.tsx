import { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { formatCents } from '@/lib/format'
import { FEED_PAGE_SIZE } from '@subletu/config'

export default function FeedScreen() {
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loadFeed = useCallback(async (reset = false) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const offset = reset ? 0 : page * FEED_PAGE_SIZE
    const { data } = await supabase.rpc('get_renter_feed', {
      p_user_id: user.id,
      p_limit: FEED_PAGE_SIZE,
      p_offset: offset,
    })

    const items = data ?? []
    setListings((prev) => reset ? items : [...prev, ...items])
    setHasMore(items.length === FEED_PAGE_SIZE)
    if (!reset) setPage((p) => p + 1)
    setLoading(false)
    setRefreshing(false)
  }, [page])

  useEffect(() => { loadFeed(true) }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setPage(0)
    loadFeed(true)
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2b3ef5" /></View>
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a sublet</Text>
      </View>

      <FlatList
        data={listings}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        onEndReached={() => { if (hasMore) loadFeed(false) }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No listings found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.user_id, listing: item.id } } as any)}
          >
            <View style={styles.photoPlaceholder}>
              <Text style={styles.unitBadge}>{item.unit_type?.toUpperCase()}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.rent}>{formatCents(item.rent)}/mo</Text>
              <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
              {item.match_score > 0 && (
                <Text style={styles.match}>{Math.round(item.match_score * 100)}% match</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  list: { padding: 12 },
  row: { gap: 12 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  photoPlaceholder: { height: 120, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' },
  unitBadge: { fontSize: 14, fontWeight: '700', color: '#2b3ef5' },
  cardBody: { padding: 10 },
  rent: { fontSize: 15, fontWeight: '700', color: '#111827' },
  address: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  match: { fontSize: 11, color: '#2b3ef5', fontWeight: '600', marginTop: 4 },
  emptyText: { color: '#6b7280', fontSize: 14 },
})
