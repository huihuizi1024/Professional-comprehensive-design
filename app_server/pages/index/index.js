const app = getApp()

Page({
  onLoad() {
    setTimeout(() => {
      const token = wx.getStorageSync('token')
      if (token) {
        wx.redirectTo({
          url: '/pages/home/home'
        })
      } else {
        wx.redirectTo({
          url: '/pages/login/login'
        })
      }
    }, 1500)
  }
})
