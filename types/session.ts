import { DefaultSession } from 'next-auth'

// Extend the default session type to include our custom user properties
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      email?: string | null
      name?: string | null
      image?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    username: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
  }
}

// Type for authenticated session (when we know user exists)
export interface AuthenticatedSession {
  user: {
    id: string
    username: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

// Type guard to check if session is authenticated
export function isAuthenticatedSession(session: any): session is AuthenticatedSession {
  return session?.user && 'id' in session.user && 'username' in session.user
}

// Helper to safely get user ID from session
export function getUserId(session: any): string | null {
  if (isAuthenticatedSession(session)) {
    return session.user.id
  }
  return null
}
