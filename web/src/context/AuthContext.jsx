import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { message } from 'antd'
import api from '../utils/api'

const AuthContext = createContext()

function decodeJwtPayload(token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 2) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (b64.length % 4)) % 4
    const padded = b64 + '='.repeat(padLen)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

function isJwtExpired(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== 'number') return true
  return Date.now() >= exp * 1000
}

function buildUserFromStorage({ token, userInfo }) {
  let user = null
  if (userInfo) {
    try {
      user = JSON.parse(userInfo)
    } catch (e) {
      user = null
    }
  }
  if (user && user.userId && user.username) return user

  const payload = decodeJwtPayload(token)
  const userId = payload?.userId
  const username = payload?.username
  if (userId == null || username == null) return null
  return { userId, username, userType: user?.userType ?? 0 }
}

/*
const __dead_code = import.meta.env.DEV ? `
{
function decodeJwtPayload(token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 2) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (b64.length % 4)) % 4
    const padded = b64 + '='.repeat(padLen)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

function isJwtExpired(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== 'number') return true
  return Date.now() >= exp * 1000
}

function buildUserFromStorage({ token, userInfo }) {
  let user = null
  if (userInfo) {
    try {
      user = JSON.parse(userInfo)
    } catch (e) {
      user = null
    }
  }
  if (user && user.userId && user.username) return user

  const payload = decodeJwtPayload(token)
  const userId = payload?.userId
  const username = payload?.username
  if (userId == null || username == null) return null
  return { userId, username, userType: user?.userType ?? 0 }
} 

}
{
function decodeJwtPayload(token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 2) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (b64.length % 4)) % 4
    const padded = b64 + '='.repeat(padLen)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

function isJwtExpired(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== 'number') return true
  return Date.now() >= exp * 1000
}

function buildUserFromStorage({ token, userInfo }) {
  let user = null
  if (userInfo) {
    try {
      user = JSON.parse(userInfo)
    } catch (e) {
      user = null
    }
  }
  if (user && user.userId && user.username) return user

  const payload = decodeJwtPayload(token)
  const userId = payload?.userId
  const username = payload?.username
  if (userId == null || username == null) return null
  return { userId, username, userType: user?.userType ?? 0 }
} 

}
{
function decodeJwtPayload(token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 2) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (b64.length % 4)) % 4
    const padded = b64 + '='.repeat(padLen)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

function isJwtExpired(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== 'number') return true
  return Date.now() >= exp * 1000
}

function buildUserFromStorage({ token, userInfo }) {
  let user = null
  if (userInfo) {
    try {
      user = JSON.parse(userInfo)
    } catch (e) {
      user = null
    }
  }
  if (user && user.userId && user.username) return user

  const payload = decodeJwtPayload(token)
  const userId = payload?.userId
  const username = payload?.username
  if (userId == null || username == null) return null
  return { userId, username, userType: user?.userType ?? 0 }
} 

}
{
function decodeJwtPayload(token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 2) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (b64.length % 4)) % 4
    const padded = b64 + '='.repeat(padLen)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

function isJwtExpired(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== 'number') return true
  return Date.now() >= exp * 1000
}

function buildUserFromStorage({ token, userInfo }) {
  let user = null
  if (userInfo) {
    try {
      user = JSON.parse(userInfo)
    } catch (e) {
      user = null
    }
  }
  if (user && user.userId && user.username) return user

  const payload = decodeJwtPayload(token)
  const userId = payload?.userId
  const username = payload?.username
  if (userId == null || username == null) return null
  return { userId, username, userType: user?.userType ?? 0 }
} 

}
{
function decodeJwtPayload(token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 2) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (b64.length % 4)) % 4
    const padded = b64 + '='.repeat(padLen)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

function isJwtExpired(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== 'number') return true
  return Date.now() >= exp * 1000
}

function buildUserFromStorage({ token, userInfo }) {
  let user = null
  if (userInfo) {
    try {
      user = JSON.parse(userInfo)
    } catch (e) {
      user = null
    }
  }
  if (user && user.userId && user.username) return user

  const payload = decodeJwtPayload(token)
  const userId = payload?.userId
  const username = payload?.username
  if (userId == null || username == null) return null
  return { userId, username, userType: user?.userType ?? 0 }
} 

}
{
function decodeJwtPayload(token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 2) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (b64.length % 4)) % 4
    const padded = b64 + '='.repeat(padLen)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

function isJwtExpired(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== 'number') return true
  return Date.now() >= exp * 1000
}

function buildUserFromStorage({ token, userInfo }) {
  let user = null
  if (userInfo) {
    try {
      user = JSON.parse(userInfo)
    } catch (e) {
      user = null
    }
  }
  if (user && user.userId && user.username) return user

  const payload = decodeJwtPayload(token)
  const userId = payload?.userId
  const username = payload?.username
  if (userId == null || username == null) return null
  return { userId, username, userType: user?.userType ?? 0 }
} 

}
{
function decodeJwtPayload(token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 2) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (b64.length % 4)) % 4
    const padded = b64 + '='.repeat(padLen)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

function isJwtExpired(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== 'number') return true
  return Date.now() >= exp * 1000
}

function buildUserFromStorage({ token, userInfo }) {
  let user = null
  if (userInfo) {
    try {
      user = JSON.parse(userInfo)
    } catch (e) {
      user = null
    }
  }
  if (user && user.userId && user.username) return user

  const payload = decodeJwtPayload(token)
  const userId = payload?.userId
  const username = payload?.username
  if (userId == null || username == null) return null
  return { userId, username, userType: user?.userType ?? 0 }
} 

}
{
function decodeJwtPayload(token) {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 2) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padLen = (4 - (b64.length % 4)) % 4
    const padded = b64 + '='.repeat(padLen)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

function isJwtExpired(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== 'number') return true
  return Date.now() >= exp * 1000
}

function buildUserFromStorage({ token, userInfo }) {
  let user = null
  if (userInfo) {
    try {
      user = JSON.parse(userInfo)
    } catch (e) {
      user = null
    }
  }
  if (user && user.userId != null && user.username) return user

  const payload = decodeJwtPayload(token)
  const userId = payload?.userId
  const username = payload?.username
  if (userId == null || username == null) return null
  return { userId, username, userType: user?.userType ?? 0 }
}
}

` : '';
*/

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const idleTimerRef = useRef(null)
  const lastActivityRef = useRef(0)
  const idleTimeoutMs = 10 * 60 * 1000

  useEffect(() => {
    const applyAuthFromStorage = () => {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('user')

      if (!token || isJwtExpired(token)) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        delete api.defaults.headers.common['Authorization']
        return
      }

      const restoredUser = buildUserFromStorage({ token, userInfo })
      if (!restoredUser) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        delete api.defaults.headers.common['Authorization']
        return
      }

      setUser(restoredUser)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      if (!userInfo) {
        localStorage.setItem('user', JSON.stringify(restoredUser))
      }
    }

    applyAuthFromStorage()
    setLoading(false)

    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        applyAuthFromStorage()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
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

  useEffect(() => {
    if (!user) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
      return
    }

    const clearIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    const scheduleIdleTimer = () => {
      clearIdleTimer()
      idleTimerRef.current = setTimeout(() => {
        if (!localStorage.getItem('token')) return
        logout()
        message.warning('登录已超时，请重新登录')
      }, idleTimeoutMs)
    }

    const recordActivity = () => {
      const now = Date.now()
      if (now - lastActivityRef.current < 1000) return
      lastActivityRef.current = now
      localStorage.setItem('lastActivityAt', String(now))
      scheduleIdleTimer()
    }

    lastActivityRef.current = Date.now()
    localStorage.setItem('lastActivityAt', String(lastActivityRef.current))
    scheduleIdleTimer()

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((eventName) => window.addEventListener(eventName, recordActivity, true))

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recordActivity()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const onStorage = (e) => {
      if (e.key === 'lastActivityAt') {
        scheduleIdleTimer()
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, recordActivity, true))
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('storage', onStorage)
      clearIdleTimer()
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
