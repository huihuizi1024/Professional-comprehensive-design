App({
  globalData: {
    userInfo: null,
    token: null,
    userId: null
  },

  onLaunch() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    const userId = wx.getStorageSync('userId')
    
    if (token) {
      this.globalData.token = token
    }
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
    if (userId) {
      this.globalData.userId = userId
    }
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  setToken(token) {
    this.globalData.token = token
    wx.setStorageSync('token', token)
  },

  setUserId(userId) {
    this.globalData.userId = userId
    wx.setStorageSync('userId', userId)
  },

  clearUserInfo() {
    this.globalData.userInfo = null
    this.globalData.token = null
    this.globalData.userId = null
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('token')
    wx.removeStorageSync('userId')
  }
})
