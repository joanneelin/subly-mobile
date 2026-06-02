import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export default function MessagesScreen() {
  const router = useRouter()
  const [threads, setThreads] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const { data } = await supabase
        .from('threads')
        .select(`*, lister:profiles!threads_lister_id_fkey(*), renter:profiles!threads_renter_id_fkey(*)`)
        .or(`lister_id.eq.${user.id},renter_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      setThreads(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2b3ef5" /></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Message a lister or renter to get started.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const other = item.lister_id === currentUserId ? item.renter : item.lister
          return (
            <TouchableOpacity
              style={styles.thread}
              onPress={() => router.push({ pathname: '/messages/[id]', params: { id: item.id } } as any)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{other?.full_name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
              </View>
              <View style={styles.threadBody}>
                <View style={styles.threadTop}>
                  <Text style={styles.threadName}>{other?.full_name}</Text>
                  <Text style={styles.threadTime}>{timeAgo(item.updated_at)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
  emptySubtext: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  thread: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#2b3ef5' },
  threadBody: { flex: 1 },
  threadTop: { flexDirection: 'row', justifyContent: 'space-between' },
  threadName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  threadTime: { fontSize: 12, color: '#9ca3af' },
})
