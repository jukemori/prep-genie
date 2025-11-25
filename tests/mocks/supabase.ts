import { vi } from 'vitest'

export const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  storage: {
    from: vi.fn(),
  },
}

export const createMockSupabaseResponse = <T>(data: T, error = null) => ({
  data,
  error,
})

export const createMockSupabaseError = (message: string, code = 'PGRST116') => ({
  message,
  code,
  details: '',
  hint: '',
})
