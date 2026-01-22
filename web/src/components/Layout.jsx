import React from 'react'
import { Layout as AntLayout, Menu, Avatar, Dropdown, message, theme } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined,
  RocketOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const { Header, Content, Sider } = AntLayout

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const {
    token: { colorBgContainer, colorPrimary },
  } = theme.useToken()

  const isAdmin = user?.username === 'admin'
  const isCourier = user?.userType === 1
  const isUser = !isAdmin && !isCourier

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '态势感知', // Renamed from "Dashboard" for tech feel
    },
    ...(!isUser ? [{
      key: '/cabinets',
      icon: <AppstoreOutlined />,
      label: '智能柜组', // Renamed from "Cabinet Management"
    }] : []),
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: '物流追踪', // Renamed from "Order Management"
    },
    ...(isAdmin
      ? [
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: '用户/骑手'
          }
        ]
      : [])
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
    message.success('系统断开连接')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出系统'
    }
  ]

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider 
        width={220} 
        style={{ 
          background: 'rgba(17, 34, 64, 0.5)', 
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: colorPrimary,
          fontSize: '18px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          textShadow: `0 0 10px ${colorPrimary}`
        }}>
          <RocketOutlined style={{ marginRight: 8, fontSize: '24px' }} />
          智能快递柜
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>
      <AntLayout style={{ background: 'transparent' }}>
        <Header style={{ 
          background: 'rgba(10, 25, 47, 0.8)', 
          backdropFilter: 'blur(10px)',
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ color: '#fff', fontSize: '16px', opacity: 0.8 }}>
            <span style={{ color: colorPrimary }}>●</span> 系统运行正常
          </div>
          <Dropdown 
            menu={{ 
              items: userMenuItems,
              onClick: ({ key }) => {
                if (key === 'logout') {
                  handleLogout()
                }
              }
            }} 
            placement="bottomRight"
          >
            <div style={{ 
              color: '#ccd6f6', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '4px 12px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.05)'
            }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: colorPrimary }} />
              <span style={{ fontFamily: 'JetBrains Mono' }}>{user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
          <Outlet />
        </Content>
        <div style={{ 
          textAlign: 'center', 
          padding: '24px', 
          color: 'rgba(255,255,255,0.3)', 
          fontFamily: 'JetBrains Mono', 
          fontSize: '12px' 
        }}>
          智能快递柜综合应用系统 ©2026 技术支持：REACT
        </div>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
