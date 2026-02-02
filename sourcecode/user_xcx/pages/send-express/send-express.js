const service = require('../../utils/service.js')

Page({
  data: {
    cabinetId: null,
    compartmentId: null,
    senderName: '',
    senderPhone: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    expressCompany: '',
    loading: false,
    cabinets: [],
    selectedCabinet: null,
    availableCompartments: [],
    showCabinetList: false,
    showCompartmentList: false
  },

  onLoad() {
    // 加载快递柜列表
    this.loadCabinets()
  },

  // 加载快递柜列表
  async loadCabinets() {
    try {
      const res = await service.cabinet.getAll()
      if (res.code === 200) {
        const mappedCabinets = res.data.map(cabinet => ({
          id: cabinet.id,
          name: cabinet.cabinetCode,
          address: cabinet.location
        }))
        this.setData({ cabinets: mappedCabinets })
      }
    } catch (error) {
      wx.showToast({ title: '获取快递柜列表失败', icon: 'none' })
    }
  },

  // 选择快递柜
  selectCabinet(e) {
    const { cabinetId } = e.currentTarget.dataset
    const selected = this.data.cabinets.find(c => c.id === cabinetId)
    
    this.setData({
      selectedCabinet: selected,
      cabinetId: cabinetId,
      showCabinetList: false
    })
    
    // 加载该快递柜的可用格口
    this.loadAvailableCompartments(cabinetId)
  },

  // 加载可用格口
  async loadAvailableCompartments(cabinetId) {
    wx.showLoading({ title: '加载格口...' })
    
    try {
      const res = await service.cabinet.getAvailableCompartments(cabinetId)
      
      wx.hideLoading()
      
      if (res.code === 200) {
        this.setData({
          availableCompartments: res.data,
          showCompartmentList: true
        })
      }
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '加载格口失败', icon: 'none' })
    }
  },

  // 选择格口
  selectCompartment(e) {
    const { compartmentId } = e.currentTarget.dataset
    this.setData({
      compartmentId: compartmentId,
      showCompartmentList: false
    })
  },

  // 输入事件处理
  onSenderNameInput(e) {
    this.setData({ senderName: e.detail.value })
  },

  onSenderPhoneInput(e) {
    this.setData({ senderPhone: e.detail.value })
  },

  onReceiverNameInput(e) {
    this.setData({ receiverName: e.detail.value })
  },

  onReceiverPhoneInput(e) {
    this.setData({ receiverPhone: e.detail.value })
  },

  onReceiverAddressInput(e) {
    this.setData({ receiverAddress: e.detail.value })
  },

  onExpressCompanyInput(e) {
    this.setData({ expressCompany: e.detail.value })
  },

  // 表单验证
  validateForm() {
    const { 
      cabinetId, 
      compartmentId, 
      senderName, 
      senderPhone, 
      receiverName, 
      receiverPhone,
      receiverAddress,
      expressCompany
    } = this.data
    
    if (!cabinetId) {
      wx.showToast({ title: '请选择快递柜', icon: 'none' })
      return false
    }
    
    if (!compartmentId) {
      wx.showToast({ title: '请选择格口', icon: 'none' })
      return false
    }
    
    if (!senderName) {
      wx.showToast({ title: '请输入发件人姓名', icon: 'none' })
      return false
    }
    
    if (!senderPhone) {
      wx.showToast({ title: '请输入发件人手机号', icon: 'none' })
      return false
    }
    
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(senderPhone)) {
      wx.showToast({ title: '发件人手机号格式不正确', icon: 'none' })
      return false
    }
    
    if (!receiverName) {
      wx.showToast({ title: '请输入收件人姓名', icon: 'none' })
      return false
    }
    
    if (!receiverPhone) {
      wx.showToast({ title: '请输入收件人手机号', icon: 'none' })
      return false
    }
    
    if (!phoneReg.test(receiverPhone)) {
      wx.showToast({ title: '收件人手机号格式不正确', icon: 'none' })
      return false
    }
    
    if (!receiverAddress) {
      wx.showToast({ title: '请输入收件人地址', icon: 'none' })
      return false
    }
    
    if (!expressCompany) {
      wx.showToast({ title: '请输入快递公司', icon: 'none' })
      return false
    }
    
    return true
  },

  // 提交发快递订单
  async handleSubmit() {
    if (!this.validateForm()) {
      return
    }
    
    this.setData({ loading: true })
    wx.showLoading({ title: '处理中...' })
    
    try {
      const res = await service.order.create({
        orderNo: `send_${Date.now()}`, // 生成唯一订单号
        senderName: this.data.senderName,
        senderPhone: this.data.senderPhone,
        receiverName: this.data.receiverName,
        receiverPhone: this.data.receiverPhone,
        expressCompany: this.data.expressCompany,
        cabinetId: this.data.cabinetId,
        compartmentId: this.data.compartmentId,
        orderType: 2, // 发快递
        status: 0 // 待取件
      })
      
      wx.hideLoading()
      this.setData({ loading: false })
      
      if (res.code !== 200) {
        wx.showToast({ title: res.message || '发快递失败', icon: 'none' })
        return
      }

      wx.showModal({
        title: '发快递成功',
        content: `已成功下单，快递员将在2小时内取件\n订单号：${res.data.orderNo}\n取件码：${res.data.pickCode}`,
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    } catch (error) {
      wx.hideLoading()
      this.setData({ loading: false })
      wx.showToast({ title: '发快递失败', icon: 'none' })
    }
  },

  // 打开快递柜列表
  openCabinetList() {
    this.setData({ showCabinetList: true })
  },

  // 打开格口列表
  openCompartmentList() {
    if (!this.data.cabinetId) {
      wx.showToast({ title: '请先选择快递柜', icon: 'none' })
      return
    }
    this.setData({ showCompartmentList: true })
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showCabinetList: false,
      showCompartmentList: false
    })
  }
})
