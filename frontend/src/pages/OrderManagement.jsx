import React, { useEffect, useState } from 'react'
import { Table, Tag, Input, Button, Space, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import api from '../utils/api'

function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async (phone = '') => {
    setLoading(true)
    try {
      const url = phone ? `/orders/phone/${phone}` : '/orders/phone/13800138002'
      const response = await api.get(url)
      setOrders(response.data.data || [])
    } catch (error) {
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchPhone) {
      fetchOrders(searchPhone)
    } else {
      fetchOrders()
    }
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo'
    },
    {
      title: '快递柜编号',
      dataIndex: 'cabinetId',
      key: 'cabinetId'
    },
    {
      title: '仓门ID',
      dataIndex: 'compartmentId',
      key: 'compartmentId'
    },
    {
      title: '收件人',
      dataIndex: 'receiverName',
      key: 'receiverName'
    },
    {
      title: '收件人手机',
      dataIndex: 'receiverPhone',
      key: 'receiverPhone'
    },
    {
      title: '取件码',
      dataIndex: 'pickCode',
      key: 'pickCode',
      render: (code) => <Tag color="blue">{code}</Tag>
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
      render: (type) => {
        const types = ['快递入柜', '用户寄存', '用户发快递']
        return <Tag>{types[type] || '未知'}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          0: { text: '待取件', color: 'orange' },
          1: { text: '已取件', color: 'green' },
          2: { text: '已超时', color: 'red' }
        }
        const s = statusMap[status] || { text: '未知', color: 'default' }
        return <Tag color={s.color}>{s.text}</Tag>
      }
    },
    {
      title: '放入时间',
      dataIndex: 'putInTime',
      key: 'putInTime',
      render: (time) => time ? new Date(time).toLocaleString('zh-CN') : '-'
    },
    {
      title: '取件时间',
      dataIndex: 'pickUpTime',
      key: 'pickUpTime',
      render: (time) => time ? new Date(time).toLocaleString('zh-CN') : '-'
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <h2>订单管理</h2>
        <Space>
          <Input
            placeholder="输入手机号搜索"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            style={{ width: 200 }}
            onPressEnter={handleSearch}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            搜索
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />
    </div>
  )
}

export default OrderManagement

