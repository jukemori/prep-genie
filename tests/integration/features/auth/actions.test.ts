import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login, logout, register, resetPassword, updatePassword } from '@/features/auth/actions'

// Mock next/navigation
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}))

// Mock next/headers
const mockHeaders = vi.fn()
vi.mock('next/headers', () => ({
  headers: () => mockHeaders(),
}))

// Mock Supabase client
const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockResetPasswordForEmail = vi.fn()
const mockUpdateUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
    },
  })),
}))

describe('Auth Actions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHeaders.mockReturnValue({
      get: () => 'http://localhost:3000',
    })
  })

  describe('login', () => {
    it('successfully authenticates with valid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: '123' }, session: { access_token: 'token' } },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      await login(formData)

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })

    it('throws error with invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'wrongpassword')

      const result = await login(formData)

      expect(result).toEqual({ error: 'Invalid login credentials' })
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('returns validation error with missing email', async () => {
      const formData = new FormData()
      formData.append('email', '')
      formData.append('password', 'password123')

      const result = await login(formData)

      expect(result).toHaveProperty('error')
      expect(result.error).toContain('email')
      expect(mockSignInWithPassword).not.toHaveBeenCalled()
    })

    it('returns validation error with missing password', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', '')

      const result = await login(formData)

      expect(result).toHaveProperty('error')
      expect(mockSignInWithPassword).not.toHaveBeenCalled()
    })

    it('returns validation error with invalid email format', async () => {
      const formData = new FormData()
      formData.append('email', 'invalid-email')
      formData.append('password', 'password123')

      const result = await login(formData)

      expect(result).toEqual({ error: 'Invalid email address' })
      expect(mockSignInWithPassword).not.toHaveBeenCalled()
    })

    it('returns validation error with short password', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'short')

      const result = await login(formData)

      expect(result).toHaveProperty('error')
      expect(result.error).toContain('at least 8 characters')
      expect(mockSignInWithPassword).not.toHaveBeenCalled()
    })
  })

  describe('register', () => {
    it('creates new user with valid data', async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: '123', email: 'newuser@example.com' },
          session: { access_token: 'token' },
        },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')
      formData.append('confirmPassword', 'password123')

      await register(formData)

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      })
      expect(mockRedirect).toHaveBeenCalledWith('/onboarding')
    })

    it('returns error if email already exists', async () => {
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      })

      const formData = new FormData()
      formData.append('email', 'existing@example.com')
      formData.append('password', 'password123')
      formData.append('confirmPassword', 'password123')

      const result = await register(formData)

      expect(result).toEqual({ error: 'User already registered' })
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('sends confirmation email when email confirmation is enabled', async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: '123', email: 'newuser@example.com' },
          session: null, // No session means email confirmation required
        },
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')
      formData.append('confirmPassword', 'password123')

      const result = await register(formData)

      expect(result).toEqual({
        success: true,
        email: 'newuser@example.com',
        requiresConfirmation: true,
      })
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('validates email format', async () => {
      const formData = new FormData()
      formData.append('email', 'invalid-email')
      formData.append('password', 'password123')
      formData.append('confirmPassword', 'password123')

      const result = await register(formData)

      expect(result).toEqual({ error: 'Invalid email address' })
      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('validates password match', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('confirmPassword', 'different123')

      const result = await register(formData)

      expect(result).toEqual({ error: 'Passwords do not match' })
      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('validates password length', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'short')
      formData.append('confirmPassword', 'short')

      const result = await register(formData)

      expect(result).toHaveProperty('error')
      expect(result.error).toContain('at least 8 characters')
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('successfully signs out user', async () => {
      mockSignOut.mockResolvedValue({
        error: null,
      })

      await logout()

      expect(mockSignOut).toHaveBeenCalled()
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('handles sign out errors', async () => {
      mockSignOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      })

      const result = await logout()

      expect(result).toEqual({ error: 'Sign out failed' })
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('sends password reset email with valid email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      const formData = new FormData()
      formData.append('email', 'test@example.com')

      const result = await resetPassword(formData)

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'http://localhost:3000/auth/reset-password',
      })
      expect(result).toEqual({
        success: true,
        message: 'Password reset email sent',
      })
    })

    it('returns error if email is missing', async () => {
      const formData = new FormData()
      formData.append('email', '')

      const result = await resetPassword(formData)

      expect(result).toEqual({ error: 'Email is required' })
      expect(mockResetPasswordForEmail).not.toHaveBeenCalled()
    })

    it('handles API errors', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      })

      const formData = new FormData()
      formData.append('email', 'nonexistent@example.com')

      const result = await resetPassword(formData)

      expect(result).toEqual({ error: 'User not found' })
    })
  })

  describe('updatePassword', () => {
    it('updates password with valid data', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      })

      const formData = new FormData()
      formData.append('password', 'newpassword123')
      formData.append('confirmPassword', 'newpassword123')

      await updatePassword(formData)

      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      })
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })

    it('returns error if passwords do not match', async () => {
      const formData = new FormData()
      formData.append('password', 'newpassword123')
      formData.append('confirmPassword', 'different123')

      const result = await updatePassword(formData)

      expect(result).toEqual({ error: 'Passwords do not match' })
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })

    it('returns error if password is too short', async () => {
      const formData = new FormData()
      formData.append('password', 'short')
      formData.append('confirmPassword', 'short')

      const result = await updatePassword(formData)

      expect(result).toEqual({ error: 'Password must be at least 8 characters' })
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })

    it('returns error if password field is missing', async () => {
      const formData = new FormData()
      formData.append('password', '')
      formData.append('confirmPassword', 'password123')

      const result = await updatePassword(formData)

      expect(result).toEqual({ error: 'Both password fields are required' })
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })

    it('handles API errors', async () => {
      mockUpdateUser.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      })

      const formData = new FormData()
      formData.append('password', 'newpassword123')
      formData.append('confirmPassword', 'newpassword123')

      const result = await updatePassword(formData)

      expect(result).toEqual({ error: 'Update failed' })
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })
})
