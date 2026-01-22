const app = getApp()

Page({
  onLoad() {
    setTimeout(() => {
      if (app.globalData.token) {
        wx.switchTab({
          url: '/pages/cabinets/cabinets'
        })
      } else {
        wx.redirectTo({
          url: '/pages/login/login'
        })
      }
    }, 1500)
  }
})
