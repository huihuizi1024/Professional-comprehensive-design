const service = require('../../utils/service.js')

Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    phone: ''
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  validateForm() {
    const { username, password, confirmPassword, phone } = this.data
    
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
      return false
    }
    
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return false
    }
    
    if (password.length < 6) {
      wx.showToast({ title: '密码长度至少6位', icon: 'none' })
      return false
    }
    
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return false
    }
    
    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return false
    }
    
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return false
    }
    
    return true
  },

  async handleRegister() {
    if (!this.validateForm()) {
      return
    }

    wx.showLoading({ title: '注册中...' })

    try {
      const res = await service.auth.register({
        username: this.data.username,
        password: this.data.password,
        phone: this.data.phone
      })

      wx.hideLoading()
      
      if (res.code === 200) {
        wx.showToast({
          title: '注册成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      wx.hideLoading()
    }
  },

  goToLogin() {
    wx.navigateBack()
  }
})
