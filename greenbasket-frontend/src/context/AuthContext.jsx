import { createContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '@/api/auth'

/**
 * Global authentication state shared across the application.
 * Provides user profile, role verification, and login/logout actions.
 */
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Initial state loaded from localStorage for persistent sessions
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

  const [loading, setLoading] = useState(true)

  // Verify token validity on application mount/refresh
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(({ data }) => {
        const userData = data.data
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      })
      .catch(() => {
        // Clear session if token is expired or invalid
        setUser(null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      })
      .finally(() => setLoading(false))
  }, [])

  /**
   * Performs standard email/password login and sets up local session.
   */
  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    const { accessToken, refreshToken, user: userData } = data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  /**
   * Handles authentication via Google OAuth 2.0 credential.
   */
  const googleLogin = useCallback(async (credential) => {
    const { data } = await authApi.googleLogin(credential)
    const { accessToken, refreshToken, user: userData } = data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  /**
   * Registers a new user (Customer/Farmer/Delivery) and automatically logs them in.
   */
  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData)
    const { accessToken, refreshToken, user: userData } = data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  /**
   * Clears the current user session locally and optionally notifies the server.
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // proceed even if server call fails to ensure client-side security
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
    }
  }, [])

  /**
   * Helper function to check if the current user has any of the required roles.
   * Usage: hasRole('ADMIN', 'FARMER')
   */
  const hasRole = useCallback(
    (...roles) => {
      if (!user) return false
      return roles.includes(user.role?.name || user.role)
    },
    [user],
  )

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        googleLogin,
        register,
        logout,
        hasRole,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
