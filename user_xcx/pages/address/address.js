const app = getApp()

Page({
  data: {
    addresses: [],
    loading: false,
    saving: false,
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
      // 优先从本地存储获取，实际开发中应该从数据库或API获取
      const addresses = wx.getStorageSync('addresses') || []
      
      this.setData({
        addresses,
        loading: false
      })
    }, 300)
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

  // Switch开关变化处理
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`formData.${field}`]: value
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
    
    this.setData({ saving: true })

    // 模拟网络请求延迟
    setTimeout(() => {
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
              ...formData,
              updatedAt: new Date().toISOString()
            }
          }
          return item
        })
      } else {
        // 新增地址
        // 如果是第一个地址，默认设为默认地址
        const isFirst = updatedAddresses.length === 0
        
        const newAddress = {
          id: Date.now(), // 临时使用时间戳作为ID
          ...formData,
          isDefault: isFirst || formData.isDefault,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        updatedAddresses.push(newAddress)
      }
      
      // 保存到本地存储
      wx.setStorageSync('addresses', updatedAddresses)
      
      this.setData({
        addresses: updatedAddresses,
        showModal: false,
        saving: false
      })
      
      wx.showToast({ 
        title: editingAddress ? '地址更新成功' : '地址添加成功',
        icon: 'success'
      })
    }, 500)
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
          
          // 如果删除的是默认地址，且还有其他地址，将第一个设为默认（可选逻辑，这里暂时不自动设置）
          
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
    
    wx.setStorageSync('addresses', updatedAddresses)
    
    this.setData({
      addresses: updatedAddresses
    })
    
    wx.showToast({ 
      title: '默认地址设置成功',
      icon: 'success'
    })
  },

  // 编辑地址入口
  editAddress(e) {
    this.openEditModal(e)
  }
})
