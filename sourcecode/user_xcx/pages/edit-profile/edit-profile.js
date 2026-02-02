const service = require('../../utils/service.js')
const app = getApp()

Page({
  data: {
    username: '',
    phone: '',
    realName: '',
    loading: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  async loadUserInfo() {
    try {
      const res = await service.user.getMe()
      if (res.code === 200) {
        const userInfo = res.data
        this.setData({
          username: userInfo.username || '',
          phone: userInfo.phone || '',
          realName: userInfo.realName || ''
        })
      }
    } catch (error) {
      wx.showToast({ title: '获取用户信息失败', icon: 'none' })
    }
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onRealNameInput(e) {
    this.setData({ realName: e.detail.value })
  },

  validateForm() {
    const { username, phone } = this.data
    
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
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

  async handleSubmit() {
    if (!this.validateForm()) {
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '更新中...' })

    try {
      const res = await service.user.updateMe({
        username: this.data.username,
        phone: this.data.phone,
        realName: this.data.realName
      })

      wx.hideLoading()
      this.setData({ loading: false })
      
      if (res.code === 200) {
        // 更新全局用户信息
        if (app.globalData.userInfo) {
          app.globalData.userInfo = {
            ...app.globalData.userInfo,
            username: this.data.username,
            phone: this.data.phone,
            realName: this.data.realName
          }
          app.setUserInfo(app.globalData.userInfo)
        }
        
        wx.showToast({ title: '更新成功', icon: 'success' })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    } catch (error) {
      wx.hideLoading()
      this.setData({ loading: false })
      wx.showToast({ title: error.message || '更新失败', icon: 'none' })
    }
  }
})