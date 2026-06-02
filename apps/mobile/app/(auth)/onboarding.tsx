import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

const SCHOOL_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Other']

export default function OnboardingScreen() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [schoolYear, setSchoolYear] = useState('')
  const [major, setMajor] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!fullName.trim()) { Alert.alert('Required', 'Please enter your full name.'); return }
    if (!schoolYear) { Alert.alert('Required', 'Please select your school year.'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); router.replace('/(auth)/sign-in'); return }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), school_year: schoolYear, major: major.trim() || null })
      .eq('id', user.id)

    setLoading(false)
    if (error) { Alert.alert('Error', error.message); return }
    router.replace('/(tabs)/feed')
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.card}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>Welcome to Subly</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="Jane Smith"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>School year</Text>
          <View style={styles.pills}>
            {SCHOOL_YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                style={[styles.pill, schoolYear === year && styles.pillActive]}
                onPress={() => setSchoolYear(year)}
              >
                <Text style={[styles.pillText, schoolYear === year && styles.pillTextActive]}>{year}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Major (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Computer Science"
            value={major}
            onChangeText={setMajor}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Get started'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 32, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
  logo: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#2b3ef5', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { color: '#6b7280', fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 4, backgroundColor: '#fff' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  pillActive: { backgroundColor: '#2b3ef5', borderColor: '#2b3ef5' },
  pillText: { fontSize: 13, color: '#374151' },
  pillTextActive: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#2b3ef5', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
