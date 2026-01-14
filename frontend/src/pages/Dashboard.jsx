import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table } from 'antd'
import { AppstoreOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import api from '../utils/api'

function Dashboard() {
  const [stats, setStats] = useState({
    totalCabinets: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [cabinetsRes, ordersRes] = await Promise.all([
        api.get('/cabinets'),
        api.get('/orders/phone/13800138002')
      ])
      
      const cabinets = cabinetsRes.data.data || []
      const orders = ordersRes.data.data || []
      
      setStats({
        totalCabinets: cabinets.length,
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === 1).length,
        pendingOrders: orders.filter(o => o.status === 0).length
      })
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>仪表盘</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="快递柜总数"
              value={stats.totalCabinets}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.totalOrders}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成订单"
              value={stats.completedOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待取件订单"
              value={stats.pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard

