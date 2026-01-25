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
        
        // 按订单状态排序：未取件(0) -> 已取件(1) -> 已过期(2)
        filteredOrders.sort((a, b) => {
          return a.status - b.status
        })
        
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
    const { pickCode, status } = e.currentTarget.dataset
    // 只有待取件状态的订单才显示取件码
    if (status === 0) {
      wx.showModal({
        title: '取件码',
        content: pickCode,
        showCancel: false
      })
    }
  },

  // 删除订单
  deleteOrder(e) {
    const { orderId } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true })
          
          try {
            // 实际开发中应该调用后端API删除订单
            // 这里模拟删除逻辑，过滤掉要删除的订单
            const updatedOrders = this.data.orders.filter(order => order.id !== orderId)
            
            this.setData({
              orders: updatedOrders,
              loading: false
            })
            
            wx.showToast({ 
              title: '订单删除成功',
              icon: 'success'
            })
          } catch (error) {
            this.setData({ loading: false })
            wx.showToast({ 
              title: '订单删除失败',
              icon: 'none'
            })
            console.error('删除订单失败:', error)
          }
        }
      }
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
  },

  // 打开单个仓门
  async onPickUp(e) {
    const { pickCode } = e.currentTarget.dataset
    
    wx.showLoading({ title: '开仓中...' })
    
    try {
      // 验证取件码格式
      if (!pickCode || pickCode.length !== 6) {
        wx.hideLoading()
        wx.showToast({ title: '取件码格式不正确', icon: 'none' })
        return
      }
      
      const res = await service.order.pickUp(pickCode)
      
      wx.hideLoading()
      
      if (res.code === 200) {
        wx.showToast({ title: '仓门已打开', icon: 'success' })
        // 重新加载订单
        this.loadOrders()
      } else {
        // 显示后端返回的错误信息，优先使用message字段
        wx.showToast({ 
          title: res.message || res.msg || '开仓失败，请检查取件码是否正确', 
          icon: 'none' 
        })
      }
    } catch (error) {
      wx.hideLoading()
      
      console.error('开仓失败:', error)
      
      // 检查error是否包含具体错误信息，处理不同的错误对象结构
      let errorMessage = '开仓失败，请检查网络或取件码'
      
      if (error) {
        if (error.message) {
          // 直接从error对象获取message
          errorMessage = error.message
        } else if (error.data && error.data.message) {
          // 从error.data获取message
          errorMessage = error.data.message
        } else if (error.data && error.data.msg) {
          // 从error.data获取msg
          errorMessage = error.data.msg
        } else if (typeof error === 'string') {
          // 如果error是字符串直接使用
          errorMessage = error
        }
      }
      
      wx.showToast({ 
        title: errorMessage, 
        icon: 'none' 
      })
    }
  },

  // 人脸识别开柜
  handleFaceRecognition(e) {
    const { pickCode } = e.currentTarget.dataset
    
    // 模拟人脸识别过程
    wx.showLoading({ title: '人脸识别中...' })
    
    setTimeout(() => {
      // 模拟人脸识别成功
      wx.hideLoading()
      
      wx.showModal({
        title: '人脸识别成功',
        content: '即将打开对应仓门',
        showCancel: false,
        success: () => {
          // 调用开仓API
          this.onPickUp(e)
        }
      })
    }, 2000)
  }
})
