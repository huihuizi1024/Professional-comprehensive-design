import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme, Spin } from 'antd'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CabinetManagement from './pages/CabinetManagement'
import OrderManagement from './pages/OrderManagement'
import UsersManagement from './pages/UsersManagement'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }
  return user ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cabinets" element={<CabinetManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="users" element={<UsersManagement />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            colorBgContainer: '#ffffff',
            colorBgLayout: '#f0f2f5',
            colorText: '#1f1f1f',
            colorTextSecondary: '#595959',
            borderRadius: 8,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          },
          components: {
            Layout: {
              headerBg: '#ffffff',
              siderBg: '#ffffff',
            },
            Menu: {
              itemSelectedBg: 'rgba(24, 144, 255, 0.12)',
              itemSelectedColor: '#1890ff',
            }
          }
        }}
      >
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  )
}

export default App

