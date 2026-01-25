const app = getApp()

Page({
  data: {
    addresses: [],
    loading: false,
    showModal: false,
    editingAddress: null,
    formData: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    },
    rules: {
      name: [{ required: true, message: '请输入收货人姓名' }],
      phone: [
        { required: true, message: '请输入手机号码' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
      ],
      detail: [{ required: true, message: '请输入详细地址' }]
    }
  },

  onLoad() {
    this.loadAddresses()
  },

  onShow() {
    this.loadAddresses()
  },

  // 加载地址列表
  loadAddresses() {
    this.setData({ loading: true })
    
    // 模拟从后端获取地址数据
    setTimeout(() => {
      // 实际开发中应该从数据库或API获取
      const addresses = wx.getStorageSync('addresses') || []
      
      this.setData({
        addresses,
        loading: false
      })
    }, 500)
  },

  // 打开新增地址模态框
  openAddModal() {
    this.setData({
      showModal: true,
      editingAddress: null,
      formData: {
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        isDefault: false
      }
    })
  },

  // 打开编辑地址模态框
  openEditModal(e) {
    const { id } = e.currentTarget.dataset
    const address = this.data.addresses.find(item => item.id === id)
    
    if (address) {
      this.setData({
        showModal: true,
        editingAddress: address,
        formData: {
          name: address.name,
          phone: address.phone,
          province: address.province || '',
          city: address.city || '',
          district: address.district || '',
          detail: address.detail,
          isDefault: address.isDefault
        }
      })
    }
  },

  // 关闭模态框
  closeModal() {
    this.setData({ showModal: false })
  },

  // 输入框变化处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 切换默认地址
  toggleDefault() {
    this.setData({
      'formData.isDefault': !this.data.formData.isDefault
    })
  },

  // 保存地址
  saveAddress() {
    const { formData, editingAddress, addresses } = this.data
    
    // 表单验证
    if (!formData.name) {
      wx.showToast({ title: '请输入收货人姓名', icon: 'none' })
      return
    }
    
    if (!formData.phone) {
      wx.showToast({ title: '请输入手机号码', icon: 'none' })
      return
    }
    
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      wx.showToast({ title: '请输入正确的手机号码', icon: 'none' })
      return
    }
    
    if (!formData.detail) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' })
      return
    }
    
    let updatedAddresses = [...addresses]
    
    if (formData.isDefault) {
      // 如果设置为默认地址，先取消其他地址的默认状态
      updatedAddresses = updatedAddresses.map(item => ({
        ...item,
        isDefault: false
      }))
    }
    
    if (editingAddress) {
      // 编辑现有地址
      updatedAddresses = updatedAddresses.map(item => {
        if (item.id === editingAddress.id) {
          return {
            ...item,
            ...formData
          }
        }
        return item
      })
    } else {
      // 新增地址
      const newAddress = {
        id: Date.now(), // 临时使用时间戳作为ID，实际应该由后端生成
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      updatedAddresses.push(newAddress)
    }
    
    // 保存到本地存储（实际开发中应该保存到后端）
    wx.setStorageSync('addresses', updatedAddresses)
    
    this.setData({
      addresses: updatedAddresses,
      showModal: false
    })
    
    wx.showToast({ 
      title: editingAddress ? '地址更新成功' : '地址添加成功',
      icon: 'success'
    })
  },

  // 删除地址
  deleteAddress(e) {
    const { id } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (res.confirm) {
          let updatedAddresses = this.data.addresses.filter(item => item.id !== id)
          
          // 保存到本地存储（实际开发中应该保存到后端）
          wx.setStorageSync('addresses', updatedAddresses)
          
          this.setData({
            addresses: updatedAddresses
          })
          
          wx.showToast({ 
            title: '地址删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 设置默认地址
  setDefaultAddress(e) {
    const { id } = e.currentTarget.dataset
    
    let updatedAddresses = this.data.addresses.map(item => ({
      ...item,
      isDefault: item.id === id
    }))
    
    // 保存到本地存储（实际开发中应该保存到后端）
    wx.setStorageSync('addresses', updatedAddresses)
    
    this.setData({
      addresses: updatedAddresses
    })
    
    wx.showToast({ 
      title: '默认地址设置成功',
      icon: 'success'
    })
  },

  // 编辑地址
  editAddress(e) {
    this.openEditModal(e)
  }
})
