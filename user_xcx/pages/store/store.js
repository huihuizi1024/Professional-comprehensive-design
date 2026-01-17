const service = require('../../utils/service.js')
const app = getApp()

Page({
  data: {
    cabinetId: null,
    compartmentId: null,
    receiverName: '',
    receiverPhone: '',
    expressCompany: '',
    expressNumber: '',
    loading: false
  },

  onLoad(options) {
    const { cabinetId, compartmentId } = options
    if (cabinetId && compartmentId) {
      this.setData({
        cabinetId: parseInt(cabinetId),
        compartmentId: parseInt(compartmentId)
      })
    }
  },

  onReceiverNameInput(e) {
    this.setData({ receiverName: e.detail.value })
  },

  onReceiverPhoneInput(e) {
    this.setData({ receiverPhone: e.detail.value })
  },

  onExpressCompanyInput(e) {
    this.setData({ expressCompany: e.detail.value })
  },

  onExpressNumberInput(e) {
    this.setData({ expressNumber: e.detail.value })
  },

  validateForm() {
    const { receiverName, receiverPhone, expressCompany, expressNumber } = this.data
    
    if (!receiverName) {
      wx.showToast({ title: '请输入收件人姓名', icon: 'none' })
      return false
    }
    
    if (!receiverPhone) {
      wx.showToast({ title: '请输入收件人手机号', icon: 'none' })
      return false
    }
    
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(receiverPhone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return false
    }
    
    if (!expressCompany) {
      wx.showToast({ title: '请输入快递公司', icon: 'none' })
      return false
    }
    
    if (!expressNumber) {
      wx.showToast({ title: '请输入快递单号', icon: 'none' })
      return false
    }
    
    return true
  },

  async handleSubmit() {
    if (!this.validateForm()) {
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '存件中...' })

    try {
      const res = await service.order.create({
        orderNo: this.data.expressNumber, // 快递单号对应orderNo
        receiverName: this.data.receiverName,
        receiverPhone: this.data.receiverPhone,
        cabinetId: this.data.cabinetId,
        compartmentId: this.data.compartmentId,
        orderType: 1, // 用户寄存
        status: 0 // 待取件
      })

      wx.hideLoading()
      this.setData({ loading: false })
      
      if (res.code === 200) {
        wx.showModal({
          title: '存件成功',
          content: `取件码：${res.data.pickCode}`,
          showCancel: false,
          success: () => {
            wx.navigateBack()
          }
        })
      }
    } catch (error) {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  }
})
