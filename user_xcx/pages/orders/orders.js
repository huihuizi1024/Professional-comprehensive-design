const service = require('../../utils/service.js')
const app = getApp()

Page({
  data: {
    orders: [],
    loading: false,
    currentTab: 0
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  async loadOrders() {
    this.setData({ loading: true })

    try {
      const userId = app.globalData.userId
      if (!userId) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }, 1500)
        return
      }

      const res = await service.order.getByUserId(userId)
      
      if (res.code === 200) {
        this.setData({
          orders: res.data,
          loading: false
        })
      }
    } catch (error) {
      this.setData({ loading: false })
    }
  },

  onTabChange(e) {
    this.setData({
      currentTab: e.detail.index
    })
  },

  onOrderTap(e) {
    const { pickCode } = e.currentTarget.dataset
    wx.showModal({
      title: '取件码',
      content: pickCode,
      showCancel: false
    })
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  goToPickUp() {
    wx.navigateTo({
      url: '/pages/pick-up/pick-up'
    })
  },

  getStatusText(status) {
    const statusMap = {
      0: '待取件',
      1: '已取件',
      2: '已过期'
    }
    return statusMap[status] || '未知'
  },

  getStatusClass(status) {
    const classMap = {
      0: 'status-pending',
      1: 'status-completed',
      2: 'status-expired'
    }
    return classMap[status] || ''
  }
})
