const request = require('../../utils/request')

Page({
  data: {
    username: '',
    password: ''
  },

  onUsername(e) {
    this.setData({ username: e.detail.value })
  },

  onPassword(e) {
    this.setData({ password: e.detail.value })
  },

  login() {
    request({
      url: '/auth/login',
      method: 'POST',
      data: {
        username: this.data.username,
        password: this.data.password
      }
    }).then(data => {
      if (data.userType !== 1) {
        wx.showToast({ title: '非快递员账号', icon: 'none' })
        return
      }
      wx.setStorageSync('token', data.token)
      wx.setStorageSync('user', data)
      wx.redirectTo({ url: '/pages/home/home' })
    })
  }
})
