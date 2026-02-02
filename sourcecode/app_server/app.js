App({
  globalData: {
    userInfo: null,
    token: null
  },

  onLaunch() {
    const token = wx.getStorageSync('token')
    const user = wx.getStorageSync('user')
    
    if (token) {
      this.globalData.token = token
    }
    if (user) {
      this.globalData.userInfo = user
    }
  }
})
