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
        expressCompany: this.data.expressCompany,
        receiverName: this.data.receiverName,
        receiverPhone: this.data.receiverPhone,
        receiverUserId: app.globalData.userId,
        cabinetId: this.data.cabinetId,
        compartmentId: this.data.compartmentId,
        orderType: 1, // 用户寄存
        status: 0 // 待取件
      })

      wx.hideLoading()
      this.setData({ loading: false })
      
      if (res.code === 200) {
        // 确保取件码存在
        const pickCode = res.data.pickCode || '未知取件码'
        
        // 先显示取件码
        wx.showToast({
          title: `存件成功，取件码：${pickCode}`,
          icon: 'success',
          duration: 3000, // 显示3秒
          success: () => {
            // 3秒后自动返回
            setTimeout(() => {
              wx.navigateBack()
            }, 3000)
          }
        })
        
        // 如果用户选择分享，则显示分享选项
        setTimeout(() => {
          wx.showModal({
            title: '是否分享取件码？',
            content: `取件码：${pickCode}`,
            showCancel: true,
            cancelText: '取消',
            confirmText: '分享',
            success: (result) => {
              if (result.confirm) {
                this.sharePickCode(pickCode)
              }
            }
          })
        }, 1000) // 1秒后显示分享选项
      }
    } catch (error) {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  },

  // 分享取件码
  sharePickCode(pickCode) {
    // 复制取件码到剪贴板
    wx.setClipboardData({
      data: pickCode,
      success: () => {
        wx.showToast({ title: '取件码已复制到剪贴板，可分享给他人', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '复制失败', icon: 'none' })
      }
    })
  }
})
