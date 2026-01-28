const service = require('../../utils/service.js')
const app = getApp()

Page({
  data: {
    orders: [],
    loading: false,
    currentTab: 0,
    currentStatus: null,
    currentScope: 'received',
    searchKeyword: '',
    statusOptions: [
      { value: null, text: '全部订单' },
      { value: 0, text: '待取件' },
      { value: 1, text: '已取件' },
      { value: 2, text: '已过期' }
    ],
    scopeOptions: [
      { value: 'received', text: '我收到的' },
      { value: 'sent', text: '我发出的' }
    ],
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  async loadOrders(status = this.data.currentStatus) {
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
        this.setData({ loading: false })
        return
      }

      const res = this.data.currentScope === 'sent'
        ? await service.order.getMySentOrders(status)
        : await service.order.getMyOrders(status)
      
      if (res.code === 200) {
        let filteredOrders = res.data
        
        // 搜索功能
        if (this.data.searchKeyword) {
          const keyword = this.data.searchKeyword.toLowerCase()
          filteredOrders = filteredOrders.filter(order => 
            order.orderNo.toLowerCase().includes(keyword) ||
            order.receiverName.toLowerCase().includes(keyword) ||
            order.pickCode.includes(keyword)
          )
        }
        
        this.setData({
          orders: filteredOrders,
          loading: false,
          currentStatus: status
        })
      }
    } catch (error) {
      this.setData({ loading: false })
      wx.showToast({ title: error?.message || error?.data?.message || '获取订单失败', icon: 'none' })
    }
  },

  onScopeChange(e) {
    const scope = e.currentTarget.dataset.scope
    this.setData({ currentScope: scope })
    this.loadOrders()
  },

  onStatusChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ currentStatus: status })
    this.loadOrders(status)
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  onSearch() {
    this.loadOrders()
  },

  onClearSearch() {
    this.setData({ searchKeyword: '' })
    this.loadOrders()
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
    wx.switchTab({
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
