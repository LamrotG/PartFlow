'use client'

import { createContext, useContext } from 'react'
import type { Profile } from '@/lib/types/database'

interface SessionContextType {
  profile: Profile | null
}

const SessionContext = createContext<SessionContextType>({ profile: null })

export function SessionProvider({
  profile,
  children,
}: {
  profile: Profile | null
  children: React.ReactNode
}) {
  return (
    <SessionContext.Provider value={{ profile }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}
