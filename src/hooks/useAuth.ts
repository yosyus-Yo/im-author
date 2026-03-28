import { useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

const DEMO_USER_STORAGE_KEY = 'ai-book-agent.demo-user'

function createDemoUser() {
  return {
    id: 'demo-user',
    app_metadata: {},
    user_metadata: {
      name: '데모 사용자',
      avatar_url: '',
    },
    aud: 'authenticated',
    created_at: new Date('2026-03-28').toISOString(),
    email: 'demo@ai-book-agent.local',
  } as User
}

function getStoredDemoUser() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(DEMO_USER_STORAGE_KEY)

  if (!raw) {
    return null
  }

  return JSON.parse(raw) as User
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() =>
    hasSupabaseConfig ? null : getStoredDemoUser(),
  )
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig)

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      return
    }

    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return
      }

      setUser(data.session?.user || null)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async () => {
    if (hasSupabaseConfig && supabase) {
      const redirectTo = `${window.location.origin}/app`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })

      if (error) {
        throw error
      }

      return
    }

    const demoUser = createDemoUser()
    window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
    setIsLoading(false)
  }

  const signInAsGuest = async () => {
    // Supabase가 설정되어 있더라도 Guest 모드는 데모 유저를 생성하여 LocalStorage로 관리하도록 우회
    const demoUser = createDemoUser()
    window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
    setIsLoading(false)
  }

  const signOut = async () => {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      return
    }

    window.localStorage.removeItem(DEMO_USER_STORAGE_KEY)
    setUser(null)
  }

  const authModeLabel = useMemo(
    () => (hasSupabaseConfig ? 'Supabase' : 'Demo'),
    [],
  )

  return {
    user,
    isLoading,
    signIn,
    signInAsGuest,
    signOut,
    authModeLabel,
  }
}
