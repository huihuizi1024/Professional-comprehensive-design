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
    const { id: compartmentId, pickcode: pickCode } = e.currentTarget.dataset

    wx.showModal({
      title: '确认取件',
      content: '是否打开仓门取件？',
      success: res => {
        if (res.confirm) {
          this.openAndPickup(compartmentId, pickCode)
        }
      }
    })
  },

  openAndPickup(compartmentId, pickCode) {
    // 1. 先开仓
    request({
      url: `/cabinets/compartments/${compartmentId}/open`,
      method: 'POST'
    }).then(() => {
      // 2. 开仓成功后，调用取件接口更新订单状态
      return request({
        url: '/orders/pick-up',
        method: 'POST',
        data: { pickCode }
      })
    }).then(() => {
      wx.showToast({ title: '取件成功' })
      // 3. 刷新列表
      this.loadOrders()
    }).catch((err) => {
      console.error('操作失败详情:', err);
      // 如果开仓成功但取件失败，或者开仓就失败了，这里统一捕获
      // 实际业务中可能需要区分错误类型
      let msg = '操作异常';
      if (err && err.message) {
        msg = err.message;
      }
      wx.showToast({ title: msg, icon: 'none' })
    })
  }
})
