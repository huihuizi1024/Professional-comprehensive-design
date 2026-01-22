import React, { useEffect, useState } from 'react'
import { Row, Col, Statistic, Spin, Progress } from 'antd'
import { 
  AppstoreOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  WarningOutlined,
  StopOutlined
} from '@ant-design/icons'
import api from '../utils/api'

function Dashboard() {
  const [stats, setStats] = useState({
    totalCabinets: 0,
    enabledCabinets: 0,
    disabledCabinets: 0,
    totalCompartments: 0,
    faultCompartments: 0,
    occupiedCompartments: 0,
    totalPowerConsumption: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    timeoutOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    // Poll every 5 seconds
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const statsRes = await api.get('/stats')
      const data = statsRes.data.data || {}
      setStats({
        totalCabinets: data.totalCabinets ?? 0,
        enabledCabinets: data.enabledCabinets ?? 0,
        disabledCabinets: data.disabledCabinets ?? 0,
        totalCompartments: data.totalCompartments ?? 0,
        faultCompartments: data.faultCompartments ?? 0,
        occupiedCompartments: data.occupiedCompartments ?? 0,
        totalPowerConsumption: Number(data.totalPowerConsumption ?? 0),
        totalOrders: data.totalOrders ?? 0,
        completedOrders: data.completedOrders ?? 0,
        pendingOrders: data.pendingOrders ?? 0,
        timeoutOrders: data.timeoutOrders ?? 0
      })
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, prefix, color, suffix }) => (
    <div className="tech-card" style={{ padding: '24px', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1, transform: 'rotate(15deg)' }}>
        {React.cloneElement(prefix, { style: { fontSize: '100px', color } })}
      </div>
      <Statistic
        title={<span style={{ color: 'var(--text-secondary)' }}>{title}</span>}
        value={value}
        prefix={React.cloneElement(prefix, { style: { color } })}
        valueStyle={{ color: '#fff', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}
        suffix={suffix}
      />
      <div style={{ marginTop: '16px' }}>
        <Progress 
          percent={70} 
          showInfo={false} 
          strokeColor={color} 
          trailColor="rgba(255,255,255,0.1)" 
          size="small"
        />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header-title">
        <ThunderboltOutlined /> 态势感知 / DASHBOARD
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="在线柜组"
            value={stats.enabledCabinets}
            prefix={<AppstoreOutlined />}
            color="#00f3ff"
            suffix="组"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总订单流"
            value={stats.totalOrders}
            prefix={<FileTextOutlined />}
            color="#7000ff"
            suffix="单"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="已交付"
            value={stats.completedOrders}
            prefix={<CheckCircleOutlined />}
            color="#00ff9d"
            suffix="单"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="待处理"
            value={stats.pendingOrders}
            prefix={<ClockCircleOutlined />}
            color="#ff0055"
            suffix="单"
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="禁用柜组"
            value={stats.disabledCabinets}
            prefix={<StopOutlined />}
            color="#ff9900"
            suffix="组"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="仓门故障"
            value={stats.faultCompartments}
            prefix={<WarningOutlined />}
            color="#ff0055"
            suffix="个"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="在库仓门"
            value={stats.occupiedCompartments}
            prefix={<DatabaseOutlined />}
            color="#00ff9d"
            suffix="个"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="日用电量"
            value={stats.totalPowerConsumption}
            prefix={<ThunderboltOutlined />}
            color="#00f3ff"
            suffix="度"
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <div className="tech-card" style={{ padding: '24px', minHeight: '300px' }}>
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '8px' }}>
                <DatabaseOutlined style={{ color: 'var(--primary-neon)' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>系统运行日志</h3>
             </div>
             <div style={{ 
               background: 'rgba(0,0,0,0.3)', 
               padding: '16px', 
               borderRadius: '4px',
               fontFamily: 'JetBrains Mono',
               color: 'var(--text-secondary)',
               height: '200px',
               overflowY: 'auto'
             }}>
               <p>[系统] 正在初始化核心模块...</p>
               <p>[网络] 已连接至服务器 localhost:8080</p>
               <p>[认证] 用户 {api.defaults.headers?.common?.Authorization ? '已验证' : '需要检查'}</p>
               <p>[数据] 已获取 {stats.totalCabinets} 条柜组记录</p>
               <p>[数据] 已获取 {stats.totalOrders} 条订单记录</p>
               <p style={{ color: 'var(--primary-neon)' }}>[就绪] 系统运行正常。</p>
             </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
