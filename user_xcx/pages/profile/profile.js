const app = getApp()

Page({
  data: {
    userInfo: null,
    isLoggedIn: false
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const userInfo = app.globalData.userInfo
    const token = app.globalData.token
    
    this.setData({
      userInfo: userInfo,
      isLoggedIn: !!token
    })
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  },

  goToOrders() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    wx.navigateTo({
      url: '/pages/orders/orders'
    })
  },

  goToPickUp() {
    wx.switchTab({
      url: '/pages/pick-up/pick-up'
    })
  },

  goToCabinets() {
    wx.switchTab({
      url: '/pages/cabinets/cabinets'
    })
  },

  goToEditProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  },

  goToSendExpress() {
    wx.navigateTo({
      url: '/pages/send-express/send-express'
    })
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearUserInfo()
          this.setData({
            userInfo: null,
            isLoggedIn: false
          })
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  showLoginTip() {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      this.goToLogin()
    }, 1500)
  },

  handleAbout() {
    wx.showModal({
      title: '关于我们',
      content: '智能快递柜系统 v1.0.0\n为用户提供便捷的快递存取服务',
      showCancel: false
    })
  },

  handleContact() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：9:00-18:00',
      showCancel: false
    })
  },

  goToAddress() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  goToHelp() {
    // 帮助中心页面正在开发中
    wx.showModal({
      title: '提示',
      content: '帮助中心功能正在开发中，敬请期待！',
      showCancel: false
    })
  },

  goToSettings() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip()
      return
    }
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  }
})
