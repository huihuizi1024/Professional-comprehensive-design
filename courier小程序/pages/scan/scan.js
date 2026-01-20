const request = require('../../utils/request')

Page({
  data: {
    cabinetCode: ''
  },

  onInputCode(e) {
    this.setData({
      cabinetCode: e.detail.value.trim()
    })
  },

  // 扫码
  scanCabinet() {
    wx.scanCode({
      onlyFromCamera: true,
      success: res => {
        const code = res.result
        this.handleCabinetCode(code)
      },
      fail() {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        })
      }
    })
  },

  // 手动输入确认
  confirmInput() {
    if (!this.data.cabinetCode) {
      wx.showToast({
        title: '请输入快递柜编号',
        icon: 'none'
      })
      return
    }
    this.handleCabinetCode(this.data.cabinetCode)
  },

  // 统一处理逻辑（核心抽象）
  handleCabinetCode(cabinetCode) {
    request({
      url: `/cabinets/code/${cabinetCode}`
    }).then(cabinet => {
      if (cabinet.status !== 1) {
        wx.showToast({
          title: '该快递柜不可用',
          icon: 'none'
        })
        return
      }

      wx.navigateTo({
        url: `/pages/compartments/compartments?cabinetId=${cabinet.id}`
      })
    })
  }
})
