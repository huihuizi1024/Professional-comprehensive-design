import React from 'react'
import { Layout as AntLayout, Menu, Avatar, Dropdown, message } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const { Header, Content, Sider } = AntLayout

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘'
    },
    {
      key: '/cabinets',
      icon: <AppstoreOutlined />,
      label: '快递柜管理'
    },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: '订单管理'
    }
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
      label: '退出登录'
    }
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
          快递柜综合应用系统
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
          <div style={{ color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar icon={<UserOutlined />} />
            <span>{user?.username}</span>
          </div>
        </Dropdown>
      </Header>
      <AntLayout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <AntLayout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: '24px', minHeight: 280 }}>
            <Outlet />
          </Content>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout

