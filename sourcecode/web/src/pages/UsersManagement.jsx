import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd'
import { TeamOutlined, PlusOutlined } from '@ant-design/icons'
import api from '../utils/api'

const USER_TYPE_OPTIONS = [
  { label: '普通用户', value: 0 },
  { label: '快递员', value: 1 }
]

const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

function UsersManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({ userType: undefined, status: undefined, keyword: '' })
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const fetchUsers = async (nextFilters) => {
    const f = nextFilters || filters
    setLoading(true)
    try {
      const res = await api.get('/users/admin/list', {
        params: {
          userType: f.userType,
          status: f.status,
          keyword: f.keyword?.trim() ? f.keyword.trim() : undefined
        }
      })
      setUsers(res.data.data || [])
    } catch (error) {
      message.error(error.response?.data?.message || error.message || '获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const openEdit = (record) => {
    setEditingUser(record)
    editForm.setFieldsValue({
      phone: record.phone || undefined,
      realName: record.realName || undefined,
      password: undefined,
      userType: record.userType,
      status: record.status
    })
    setEditOpen(true)
  }

  const handleCreate = async (values) => {
    try {
      const payload = {
        username: String(values.username || '').trim(),
        password: String(values.password || '').trim(),
        phone: String(values.phone || '').trim(),
        realName: values.realName ? String(values.realName).trim() : undefined,
        userType: values.userType,
        status: values.status
      }
      await api.post('/users/admin', payload)
      message.success('创建成功')
      setCreateOpen(false)
      createForm.resetFields()
      fetchUsers()
    } catch (error) {
      message.error(error.response?.data?.message || error.message || '创建失败')
    }
  }

  const handleUpdate = async (values) => {
    if (!editingUser?.userId) return
    try {
      const payload = {
        phone: values.phone ? String(values.phone).trim() : undefined,
        realName: values.realName != null ? String(values.realName).trim() : undefined,
        password: values.password ? String(values.password).trim() : undefined,
        userType: values.userType,
        status: values.status
      }
      await api.put(`/users/admin/${editingUser.userId}`, payload)
      message.success('更新成功')
      setEditOpen(false)
      setEditingUser(null)
      editForm.resetFields()
      fetchUsers()
    } catch (error) {
      message.error(error.response?.data?.message || error.message || '更新失败')
    }
  }

  const handleToggleStatus = async (record) => {
    if (!record?.userId) return
    try {
      await api.put(`/users/admin/${record.userId}`, { status: record.status === 1 ? 0 : 1 })
      message.success('状态更新成功')
      fetchUsers()
    } catch (error) {
      message.error(error.response?.data?.message || error.message || '状态更新失败')
    }
  }

  const columns = useMemo(() => {
    return [
      {
        title: '用户ID',
        dataIndex: 'userId',
        key: 'userId',
        width: 90
      },
      {
        title: '用户名',
        dataIndex: 'username',
        key: 'username',
        render: (v) => (v === 'admin' ? <Tag color="gold">admin</Tag> : v)
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        key: 'phone'
      },
      {
        title: '姓名',
        dataIndex: 'realName',
        key: 'realName',
        render: (v) => v || '-'
      },
      {
        title: '类型',
        dataIndex: 'userType',
        key: 'userType',
        render: (t) => (
          <Tag color={t === 1 ? 'blue' : 'default'}>{t === 1 ? '快递员' : '普通用户'}</Tag>
        )
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (s, record) => (
          <Tag color={s === 1 ? 'green' : 'red'}>{record.username === 'admin' ? '管理员' : (s === 1 ? '启用' : '禁用')}</Tag>
        )
      },
      {
        title: '操作',
        key: 'action',
        width: 220,
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title={record.status === 1 ? '确认禁用该账户？' : '确认启用该账户？'}
              onConfirm={() => handleToggleStatus(record)}
              okText="确认"
              cancelText="取消"
              disabled={record.username === 'admin'}
            >
              <Button type="link" danger={record.status === 1} disabled={record.username === 'admin'}>
                {record.status === 1 ? '禁用' : '启用'}
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ]
  }, [])

  return (
    <div>
      <div className="page-header-title">
        <TeamOutlined /> 用户与快递员管理
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Space wrap>
          <Select
            placeholder="用户类型"
            allowClear
            value={filters.userType}
            options={USER_TYPE_OPTIONS}
            style={{ width: 140 }}
            onChange={(v) => setFilters((p) => ({ ...p, userType: v }))}
          />
          <Select
            placeholder="状态"
            allowClear
            value={filters.status}
            options={STATUS_OPTIONS}
            style={{ width: 120 }}
            onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
          />
          <Input
            placeholder="用户名/手机号/姓名"
            value={filters.keyword}
            style={{ width: 240 }}
            onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))}
            onPressEnter={() => fetchUsers()}
            allowClear
          />
          <Button type="primary" onClick={() => fetchUsers()}>
            查询
          </Button>
        </Space>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          新增账户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="userId"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title="新增账户"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false)
          createForm.resetFields()
        }}
        onOk={() => createForm.submit()}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} initialValues={{ userType: 0, status: 1 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="例如：user2" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="例如：123456" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input placeholder="例如：13800138003" />
          </Form.Item>
          <Form.Item name="realName" label="姓名">
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item name="userType" label="用户类型" rules={[{ required: true, message: '请选择用户类型' }]}>
            <Select options={USER_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑账户"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false)
          setEditingUser(null)
          editForm.resetFields()
        }}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="不修改可留空" />
          </Form.Item>
          <Form.Item name="realName" label="姓名">
            <Input placeholder="不修改可留空" />
          </Form.Item>
          <Form.Item name="password" label="密码">
            <Input.Password placeholder="不修改可留空" />
          </Form.Item>
          <Form.Item name="userType" label="用户类型">
            <Select options={USER_TYPE_OPTIONS} disabled={editingUser?.username === 'admin'} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={STATUS_OPTIONS} disabled={editingUser?.username === 'admin'} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UsersManagement
