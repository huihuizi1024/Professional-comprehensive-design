Page({
  scanCabinet() {
    wx.navigateTo({ url: '/pages/scan/scan' })
  },

  viewOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  logout() {
    wx.clearStorageSync()
    wx.redirectTo({ url: '/pages/login/login' })
  }
})
