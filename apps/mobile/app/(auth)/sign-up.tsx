import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { Link, router } from 'expo-router'
import { supabase } from '@/lib/supabase'
export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSignUp = async () => {
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Passwords do not match.')
      return
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'subletu:///' },
    })
    setLoading(false)

    if (error) { Alert.alert('Error', error.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>We sent a verification link to {email}. Tap it to activate your account.</Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Back to sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.card}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Join Subly</Text>
          <Text style={styles.subtitle}>Find your perfect campus sublet</Text>

          <TextInput style={styles.input} placeholder="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Password (min. 8 chars)" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={styles.input} placeholder="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />

          <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create account'}</Text>
          </TouchableOpacity>

          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity style={styles.link}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 32, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { color: '#6b7280', fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 12, backgroundColor: '#fff' },
  button: { backgroundColor: '#2b3ef5', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#6b7280', fontSize: 14 },
  linkBold: { color: '#2b3ef5', fontWeight: '600' },
})
