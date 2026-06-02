import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function IndexPage() {
  const [destination, setDestination] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setDestination('/(auth)/sign-in'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (!profile?.full_name) setDestination('/(auth)/onboarding')
      else setDestination('/(tabs)/feed')
    })
  }, [])

  if (!destination) return null
  return <Redirect href={destination as any} />
}
