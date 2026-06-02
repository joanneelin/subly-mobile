import { useState, useEffect, useRef } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export default function MessageThreadScreen() {
  const { id: threadId } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([])
  const [thread, setThread] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/(auth)/sign-in'); return }
      setCurrentUserId(user.id)

      const { data: t } = await supabase
        .from('threads')
        .select(`*, lister:profiles!threads_lister_id_fkey(*), renter:profiles!threads_renter_id_fkey(*)`)
        .eq('id', threadId)
        .single()

      if (!t) { router.back(); return }
      setThread(t)
      setOtherUser(t.lister_id === user.id ? t.renter : t.lister)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      setMessages(msgs ?? [])
      setLoading(false)
    }
    load()
  }, [threadId])

  useEffect(() => {
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      }, (payload) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [threadId])

  const handleSend = async () => {
    if (!body.trim() || !currentUserId) return
    setSending(true)
    const text = body.trim()
    setBody('')

    const { data } = await supabase
      .from('messages')
      .insert({ thread_id: threadId, sender_id: currentUserId, body: text })
      .select()
      .single()

    if (data) setMessages((prev) => [...prev, data])
    setSending(false)
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2b3ef5" /></View>

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{otherUser?.full_name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.headerName}>{otherUser?.full_name ?? 'Chat'}</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>No messages yet. Say hi!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isOwn = item.sender_id === currentUserId
          return (
            <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
              <Text style={[styles.bubbleText, isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther]}>
                {item.body}
              </Text>
              <Text style={[styles.bubbleTime, isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeOther]}>
                {timeAgo(item.created_at)}
              </Text>
            </View>
          )
        }}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          value={body}
          onChangeText={setBody}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, !body.trim() && styles.sendBtnDisabled]} onPress={handleSend} disabled={!body.trim() || sending}>
          <Text style={styles.sendText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  backBtn: { marginRight: 8 },
  backText: { fontSize: 20, color: '#6b7280' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#2b3ef5' },
  headerName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  messageList: { padding: 16, paddingBottom: 8 },
  emptyChat: { alignItems: 'center', paddingTop: 40 },
  emptyChatText: { color: '#9ca3af', fontSize: 14 },
  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginBottom: 8 },
  bubbleOwn: { backgroundColor: '#2b3ef5', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#f3f4f6', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14 },
  bubbleTextOwn: { color: '#fff' },
  bubbleTextOther: { color: '#111827' },
  bubbleTime: { fontSize: 11, marginTop: 3 },
  bubbleTimeOwn: { color: '#a5b4fc' },
  bubbleTimeOther: { color: '#9ca3af' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100, marginRight: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2b3ef5', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#c7d2fe' },
  sendText: { color: '#fff', fontSize: 18, fontWeight: '700' },
})
