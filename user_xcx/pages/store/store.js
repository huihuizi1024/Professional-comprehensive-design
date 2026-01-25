const service = require('../../utils/service.js')
const app = getApp()

Page({
  data: {
    cabinetId: null,
    compartmentId: null,
    receiverName: '',
    receiverPhone: '',
    expressCompany: '',
    expressNumber: '',
    loading: false
  },

  onLoad(options) {
    const { cabinetId, compartmentId } = options
    if (cabinetId && compartmentId) {
      this.setData({
        cabinetId: parseInt(cabinetId),
        compartmentId: parseInt(compartmentId)
      })
    }
  },

  onReceiverNameInput(e) {
    this.setData({ receiverName: e.detail.value })
  },

  onReceiverPhoneInput(e) {
    this.setData({ receiverPhone: e.detail.value })
  },

  onExpressCompanyInput(e) {
    this.setData({ expressCompany: e.detail.value })
  },

  onExpressNumberInput(e) {
    this.setData({ expressNumber: e.detail.value })
  },

  validateForm() {
    const { receiverName, receiverPhone, expressCompany, expressNumber } = this.data
    
    if (!receiverName) {
      wx.showToast({ title: '请输入收件人姓名', icon: 'none' })
      return false
    }
    
    if (!receiverPhone) {
      wx.showToast({ title: '请输入收件人手机号', icon: 'none' })
      return false
    }
    
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(receiverPhone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return false
    }
    
    if (!expressCompany) {
      wx.showToast({ title: '请输入快递公司', icon: 'none' })
      return false
    }
    
    if (!expressNumber) {
      wx.showToast({ title: '请输入快递单号', icon: 'none' })
      return false
    }
    
    return true
  },

  async handleSubmit() {
    if (!this.validateForm()) {
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '存件中...' })

    try {
      const res = await service.order.create({
        orderNo: this.data.expressNumber, // 快递单号对应orderNo
        expressCompany: this.data.expressCompany,
        receiverName: this.data.receiverName,
        receiverPhone: this.data.receiverPhone,
        receiverUserId: app.globalData.userId,
        cabinetId: this.data.cabinetId,
        compartmentId: this.data.compartmentId,
        orderType: 1, // 用户寄存
        status: 0 // 待取件
      })

      wx.hideLoading()
      this.setData({ loading: false })
      
      if (res.code === 200) {
        // 确保取件码存在
        const pickCode = res.data.pickCode || '未知取件码'
        
        // 显示存件成功提示
        wx.showToast({
          title: '存件成功',
          icon: 'success',
          duration: 1500 // 显示1.5秒
        })
        
        // 显示分享取件码模态框
        setTimeout(() => {
          wx.showModal({
            title: '取件码',
            content: `您的取件码：${pickCode}\n\n是否分享给收件人？`,
            showCancel: true,
            cancelText: '取消',
            confirmText: '分享',
            success: (result) => {
              if (result.confirm) {
                // 如果用户选择分享，先分享再返回
                this.sharePickCode(pickCode)
                setTimeout(() => {
                  // 通知上一页更新数据
                  this.notifyPreviousPage()
                  // 分享完成后返回上一页
                  wx.navigateBack()
                }, 1500)
              } else {
                // 如果用户选择取消，直接返回上一页
                // 通知上一页更新数据
                this.notifyPreviousPage()
                wx.navigateBack()
              }
            }
          })
        }, 1500) // 1.5秒后显示分享选项
      }
    } catch (error) {
      wx.hideLoading()
      this.setData({ loading: false })
      console.error('存件失败:', error)
      wx.showToast({ title: '存件失败，请重试', icon: 'none' })
    }
  },

  // 分享取件码
  sharePickCode(pickCode) {
    // 复制取件码到剪贴板
    wx.setClipboardData({
      data: pickCode,
      success: () => {
        wx.showToast({ title: '取件码已复制到剪贴板，可分享给他人', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '复制失败', icon: 'none' })
      }
    })
  },

  // 通知上一页更新数据
  notifyPreviousPage() {
    // 获取当前页面栈
    const pages = getCurrentPages()
    if (pages.length > 1) {
      // 获取上一页
      const prevPage = pages[pages.length - 2]
      if (prevPage) {
        // 调用上一页的刷新数据方法
        if (typeof prevPage.loadCabinetDetail === 'function') {
          prevPage.loadCabinetDetail()
        }
      }
    }
  }
})
