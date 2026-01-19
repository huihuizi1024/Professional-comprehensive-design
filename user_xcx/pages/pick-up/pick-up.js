const service = require('../../utils/service.js')

Page({
  data: {
    pickCode: '',
    loading: false
  },

  onPickCodeInput(e) {
    this.setData({ pickCode: e.detail.value })
  },

  validatePickCode() {
    const { pickCode } = this.data
    
    if (!pickCode) {
      wx.showToast({ title: '请输入取件码', icon: 'none' })
      return false
    }
    
    if (pickCode.length !== 6) {
      wx.showToast({ title: '取件码格式不正确', icon: 'none' })
      return false
    }
    
    return true
  },

  async handlePickUp() {
    if (!this.validatePickCode()) {
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '取件中...' })

    try {
      const res = await service.order.pickUp(this.data.pickCode)

      wx.hideLoading()
      this.setData({ loading: false })
      
      if (res.code === 200) {
        wx.showModal({
          title: '取件成功',
          content: `格口 ${res.data.compartmentNo} 已打开，请取出快递`,
          showCancel: false,
          success: () => {
            this.setData({ pickCode: '' })
          }
        })
      }
    } catch (error) {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  },

  async handleQuery() {
    if (!this.validatePickCode()) {
      return
    }

    wx.showLoading({ title: '查询中...' })

    try {
      const res = await service.order.getByPickCode(this.data.pickCode)

      wx.hideLoading()
      
      if (res.code === 200) {
        const order = res.data
        wx.showModal({
          title: '快递信息',
          content: `快递公司：${order.expressCompany || ''}\n快递单号：${order.orderNo}\n收件人：${order.receiverName}\n存入时间：${order.putInTime || order.createdAt}`,
          showCancel: false
        })
      }
    } catch (error) {
      wx.hideLoading()
    }
  }
})
