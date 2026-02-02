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
      label: '仪表盘',
    },
    ...(!isUser ? [{
      key: '/cabinets',
      icon: <AppstoreOutlined />,
      label: '快递柜管理',
    }] : []),
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: '订单管理',
    },
    ...(isAdmin
      ? [
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: '用户管理'
          }
        ]
      : [])
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
    message.success('已退出登录')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出系统'
    }
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        width={240} 
        theme="light"
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          zIndex: 10
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: colorPrimary,
          fontSize: '20px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <RocketOutlined style={{ marginRight: 8, fontSize: '24px' }} />
          智能快递柜
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 16 }}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          background: colorBgContainer, 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 9
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <span style={{ color: colorPrimary, marginRight: 8 }}>●</span> 
            {new Date().toLocaleDateString()}
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
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '6px 16px',
              borderRadius: '20px',
              transition: 'all 0.3s',
            }}
            className="hover:bg-gray-100"
            >
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: colorPrimary }} />
              <span style={{ color: '#333', fontWeight: 500 }}>{user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', overflow: 'initial', minHeight: 280 }}>
          <Outlet />
        </Content>
        <div style={{ 
          textAlign: 'center', 
          padding: '24px', 
          color: '#999', 
          fontSize: '12px' 
        }}>
          智能快递柜综合应用系统 ©2026
        </div>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
