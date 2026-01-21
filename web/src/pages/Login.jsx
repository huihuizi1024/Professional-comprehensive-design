import React, { useEffect, useState } from 'react'
import { Form, Input, Button, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, RocketOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

function Login() {
  const [loading, setLoading] = useState(false)
  const [smsLoading, setSmsLoading] = useState(false)
  const [smsCountdown, setSmsCountdown] = useState(0)
  const [mode, setMode] = useState('login')
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()

  useEffect(() => {
    if (smsCountdown <= 0) return
    const timer = setInterval(() => {
      setSmsCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [smsCountdown])

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      await login(values.loginName, values.password)
      message.success('身份验证通过 / ACCESS GRANTED')
      navigate('/')
    } catch (error) {
      message.error(error.response?.data?.message || '身份验证失败 / ACCESS DENIED')
    } finally {
      setLoading(false)
    }
  }

  const handleSendSms = async () => {
    const phone = registerForm.getFieldValue('phone')
    if (!phone) {
      message.warning('请输入手机号')
      return
    }
    setSmsLoading(true)
    try {
      const response = await api.post('/auth/sms/send', { phone: String(phone).trim() })
      const code = response.data?.data?.code
      message.success('验证码已发送')
      if (code) {
        message.info(`验证码：${code}`)
      }
      setSmsCountdown(60)
    } catch (error) {
      message.error(error.response?.data?.message || '验证码发送失败')
    } finally {
      setSmsLoading(false)
    }
  }

  const handleRegister = async (values) => {
    setLoading(true)
    try {
      await api.post('/auth/register', {
        phone: String(values.phone || '').trim(),
        smsCode: String(values.smsCode || '').trim(),
        password: String(values.password || '').trim(),
        realName: values.realName ? String(values.realName).trim() : undefined
      })
      await login(values.phone, values.password)
      message.success('注册成功')
      navigate('/')
    } catch (error) {
      message.error(error.response?.data?.message || '注册失败')
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

        <Tabs
          activeKey={mode}
          onChange={setMode}
          centered
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form
                  form={loginForm}
                  name="login"
                  onFinish={handleLogin}
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    name="loginName"
                    rules={[{ required: true, message: '请输入手机号或用户名' }]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: 'var(--primary-neon)' }} />}
                      placeholder="手机号或用户名"
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
              )
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form
                  form={registerForm}
                  name="register"
                  onFinish={handleRegister}
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: 'var(--primary-neon)' }} />}
                      placeholder="手机号"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="smsCode"
                    rules={[{ required: true, message: '请输入验证码' }]}
                  >
                    <Input
                      placeholder="验证码"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      addonAfter={
                        <Button
                          type="link"
                          onClick={handleSendSms}
                          loading={smsLoading}
                          disabled={smsCountdown > 0}
                        >
                          {smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码'}
                        </Button>
                      }
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

                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: '请确认密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('两次密码不一致'))
                        }
                      })
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: 'var(--primary-neon)' }} />}
                      placeholder="确认密码"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </Form.Item>

                  <Form.Item name="realName">
                    <Input
                      placeholder="姓名（可选）"
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
                      注册并登录
                    </Button>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
        
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'JetBrains Mono' }}>
          <p>默认账号: admin / 123456</p>
        </div>
      </div>
    </div>
  )
}

export default Login
