const request = require('../../utils/request')

Page({
  data: {
    orders: []
  },

  onShow() {
    this.loadOrders()
  },

  loadOrders() {
    request({
      url: '/orders/courier/me',
      data: { status: 0 }
    }).then(list => {
      this.setData({ orders: list })
    })
  },

  pickup(e) {
    const compartmentId = e.currentTarget.dataset.id

    wx.showModal({
      title: '确认取件',
      content: '是否打开仓门取件？',
      success: res => {
        if (res.confirm) {
          this.openCompartment(compartmentId)
        }
      }
    })
  },

  openCompartment(compartmentId) {
    request({
      url: `/cabinets/compartments/${compartmentId}/open`,
      method: 'POST'
    }).then(() => {
      wx.showToast({ title: '开仓成功' })
      this.loadOrders()
    })
  }
})
