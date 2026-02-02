import React, { useEffect, useState } from 'react'
import { Table, Button, Tag, Modal, Form, Input, InputNumber, message, Space, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

function CabinetManagement() {
  const { user } = useAuth()
  const isAdmin = user?.username === 'admin'
  const isCourier = user?.userType === 1

  const [cabinets, setCabinets] = useState([])
  const [compartments, setCompartments] = useState([])
  const [currentCabinet, setCurrentCabinet] = useState(null)
  const [compartmentModalVisible, setCompartmentModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCabinets()
    const interval = setInterval(() => {
      fetchCabinets()
      if (currentCabinet && compartmentModalVisible) {
        fetchCompartments(currentCabinet.id)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [currentCabinet, compartmentModalVisible])

  const fetchCabinets = async () => {
    setLoading(true)
    try {
      const response = await api.get('/cabinets')
      setCabinets(response.data.data || [])
    } catch (error) {
      message.error('获取快递柜列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompartments = async (cabinetId) => {
    try {
      const response = await api.get(`/cabinets/${cabinetId}/compartments`)
      setCompartments(response.data.data || [])
    } catch (error) {
      message.error('获取仓门列表失败')
    }
  }

  const handleViewCompartments = (record) => {
    setCurrentCabinet(record)
    setCompartments([])
    setCompartmentModalVisible(true)
    fetchCompartments(record.id)
  }

  const handleCreateCabinet = async (values) => {
    try {
      const payload = {
        ...values,
        cabinetCode: String(values?.cabinetCode || '').trim(),
        status: 1,
        powerConsumption: 0
      }
      await api.post('/cabinets', payload)
      message.success('创建成功')
      setModalVisible(false)
      form.resetFields()
      fetchCabinets()
    } catch (error) {
      message.error(error.response?.data?.message || error.message || '创建失败')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/cabinets/${id}/status`, { status: status === 1 ? 0 : 1 })
      message.success('状态更新成功')
      fetchCabinets()
    } catch (error) {
      message.error('状态更新失败')
    }
  }

  const handleOpenCompartment = async (compartmentId, cabinetId) => {
    try {
      await api.post(`/cabinets/compartments/${compartmentId}/open`)
      message.success('开仓成功')
      // Refresh compartments for this cabinet
      fetchCompartments(cabinetId)
    } catch (error) {
      message.error(error.response?.data?.message || '开仓失败')
    }
  }

  const columns = [
    {
      title: '快递柜编号',
      dataIndex: 'cabinetCode',
      key: 'cabinetCode'
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: '总仓数',
      dataIndex: 'totalCompartments',
      key: 'totalCompartments'
    },
    {
      title: '空闲仓数',
      dataIndex: 'availableCompartments',
      key: 'availableCompartments',
      render: (count) => {
        const displayCount = count !== undefined && count !== null ? count : 0
        return (
          <Tag color={displayCount > 0 ? 'green' : 'red'}>
            {displayCount}
          </Tag>
        )
      }
    },
    {
      title: '日用电量(度)',
      dataIndex: 'powerConsumption',
      key: 'powerConsumption'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => handleViewCompartments(record)}
          >
            查看仓门
          </Button>
          {isAdmin && (
            <Button
              type="link"
              onClick={() => handleStatusChange(record.id, record.status)}
            >
              {record.status === 1 ? '禁用' : '启用'}
            </Button>
          )}
        </Space>
      )
    }
  ]

  const compartmentColumns = [
    {
      title: '仓门编号',
      dataIndex: 'compartmentNo',
      key: 'compartmentNo'
    },
    {
      title: '尺寸类型',
      dataIndex: 'sizeType',
      key: 'sizeType',
      render: (sizeType) => {
        const sizeMap = {
          0: { label: '小号', color: 'orange', tip: '适合存放信件、钥匙、小饰品等' },
          1: { label: '中号', color: 'blue', tip: '适合存放鞋盒、背包、书籍等' },
          2: { label: '大号', color: 'purple', tip: '适合存放行李箱、大包裹等' }
        }
        const info = sizeMap[sizeType] || { label: '未知', color: 'default', tip: '' }
        return (
          <div title={info.tip}>
            <Tag color={info.color}>{info.label}</Tag>
            <span style={{ fontSize: '12px', color: '#999' }}>{info.tip}</span>
          </div>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '故障'}
        </Tag>
      )
    },
    {
      title: '是否有物品',
      dataIndex: 'hasItem',
      key: 'hasItem',
      render: (hasItem) => (
        <Tag color={hasItem === 1 ? 'blue' : 'default'}>
          {hasItem === 1 ? '有' : '无'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        (isAdmin || isCourier) && (
          <Button
            type="primary"
            size="small"
            onClick={() => handleOpenCompartment(record.id, record.cabinetId)}
            disabled={record.status === 0}
          >
            开仓
          </Button>
        )
      )
    }
  ]

  return (
    <div>
      <div className="page-header-title">
        <AppstoreOutlined /> 智能柜组管理
      </div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            新增快递柜
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={cabinets}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={`仓门列表 - ${currentCabinet?.cabinetCode || ''}`}
        open={compartmentModalVisible}
        onCancel={() => setCompartmentModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={compartmentColumns}
          dataSource={compartments}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>

      <Modal
        title="新增快递柜"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCabinet}
        >
          <Form.Item
            name="cabinetCode"
            label="快递柜编号"
            rules={[{ required: true, message: '请输入快递柜编号' }]}
          >
            <Input placeholder="例如：CAB001" />
          </Form.Item>
          <Form.Item
            name="location"
            label="位置"
            rules={[{ required: true, message: '请输入位置' }]}
          >
            <Input placeholder="例如：北京市朝阳区XX街道XX号" />
          </Form.Item>
          <Form.Item
            name="totalCompartments"
            label="总仓数"
            rules={[{ required: true, message: '请输入总仓数' }]}
          >
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CabinetManagement

