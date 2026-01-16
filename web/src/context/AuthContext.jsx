import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userInfo = localStorage.getItem('user')
    if (token && userInfo) {
      setUser(JSON.parse(userInfo))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    const { data } = response.data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      userId: data.userId,
      username: data.username,
      userType: data.userType
    }))
    setUser({
      userId: data.userId,
      username: data.username,
      userType: data.userType
    })
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

