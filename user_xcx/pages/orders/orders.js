const service = require('../../utils/service.js')
const app = getApp()

Page({
  data: {
    orders: [],
    loading: false,
    currentTab: 0,
    currentStatus: null,
    searchKeyword: '',
    statusOptions: [
      { value: null, text: '全部订单' },
      { value: 0, text: '待取件' },
      { value: 1, text: '已取件' },
      { value: 2, text: '已过期' }
    ]
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
        return
      }

      // 使用getByUserId API获取所有订单，然后在前端进行筛选
      const res = await service.order.getByUserId(userId)
      
      if (res.code === 200) {
        let filteredOrders = res.data
        
        // 按状态筛选
        if (status !== null && status !== undefined) {
          filteredOrders = filteredOrders.filter(order => order.status === status)
        }
        
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
      wx.showToast({ title: '获取订单失败', icon: 'none' })
    }
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
