const service = require('../../utils/service.js')
const app = getApp()

Page({
  data: {
    username: '',
    password: ''
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  validateForm() {
    const { username, password } = this.data
    
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
      return false
    }
    
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return false
    }
    
    return true
  },

  async handleLogin() {
    if (!this.validateForm()) {
      return
    }

    wx.showLoading({ title: '登录中...' })

    try {
      const res = await service.auth.login({
        username: this.data.username,
        password: this.data.password
      })

      wx.hideLoading()
      
      if (res.code === 200) {
        const { token, userId, username, userType } = res.data
        
        app.setToken(token)
        app.setUserId(userId)
        
        const userInfo = {
          id: userId,
          username: username,
          userType: userType
        }
        app.setUserInfo(userInfo)

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/cabinets/cabinets'
          })
        }, 1500)
      }
    } catch (error) {
      wx.hideLoading()
    }
  },

  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  }
})
