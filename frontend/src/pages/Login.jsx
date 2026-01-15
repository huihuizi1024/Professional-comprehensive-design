import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, RocketOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success('身份验证通过 / ACCESS GRANTED')
      navigate('/')
    } catch (error) {
      message.error(error.response?.data?.message || '身份验证失败 / ACCESS DENIED')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #112240 0%, #0a192f 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="tech-card" style={{ 
        width: 400, 
        padding: '40px', 
        borderRadius: '8px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <RocketOutlined style={{ fontSize: '48px', color: 'var(--primary-neon)', marginBottom: '16px' }} />
          <h2 style={{ color: '#fff', margin: 0, letterSpacing: '2px' }}>智能快递柜系统</h2>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: 'var(--primary-neon)' }} />} 
              placeholder="用户名" 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--primary-neon)' }} />}
              placeholder="密码"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              style={{ 
                height: '48px', 
                background: 'var(--primary-neon)', 
                borderColor: 'var(--primary-neon)',
                color: '#0a192f',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'JetBrains Mono' }}>
          <p>默认账号: admin / 123456</p>
        </div>
      </div>
    </div>
  )
}

export default Login