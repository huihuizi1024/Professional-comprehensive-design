const service = require('../../utils/service.js')
const app = getApp()

Page({
  data: {
    pickCode: '',
    loading: false,
    userOrders: [],
    showOrdersList: false,
    cabinetId: null
  },

  onPickCodeInput(e) {
    this.setData({ pickCode: e.detail.value })
  },

  validatePickCode() {
    const { pickCode } = this.data
    
    if (!pickCode) {
      wx.showToast({ title: '请输入取件码', icon: 'none' })
      return false
    }
    
    if (pickCode.length !== 6) {
      wx.showToast({ title: '取件码格式不正确', icon: 'none' })
      return false
    }
    
    return true
  },

  async handlePickUp() {
    if (!this.validatePickCode()) {
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '取件中...' })

    try {
      const res = await service.order.pickUp(this.data.pickCode)

      wx.hideLoading()
      this.setData({ loading: false })
      
      if (res.code === 200) {
        wx.showModal({
          title: '取件成功',
          content: `格口 ${res.data.compartmentNo} 已打开，请取出快递`,
          showCancel: false,
          success: () => {
            this.setData({ pickCode: '' })
          }
        })
      }
    } catch (error) {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  },

  async handleQuery() {
    if (!this.validatePickCode()) {
      return
    }

    wx.showLoading({ title: '查询中...' })

    try {
      const res = await service.order.getByPickCode(this.data.pickCode)

      wx.hideLoading()
      
      if (res.code === 200) {
        const order = res.data
        wx.showModal({
          title: '快递信息',
          content: `快递公司：${order.expressCompany || ''}\n快递单号：${order.orderNo}\n收件人：${order.receiverName}\n存入时间：${order.putInTime || order.createdAt}`,
          showCancel: false
        })
      }
    } catch (error) {
      wx.hideLoading()
    }
  },

  // 扫码功能
  handleScan() {
    wx.scanCode({
      onlyFromCamera: false,
      success: (res) => {
        // 解析扫码结果，假设格式为 "cabinet_123" 或包含 cabinetId 的 JSON
        let cabinetId = null
        
        try {
          // 尝试解析 JSON
          const scanData = JSON.parse(res.result)
          cabinetId = scanData.cabinetId
        } catch (e) {
          // 不是JSON，尝试直接解析字符串
          if (res.result.includes('cabinet_')) {
            cabinetId = res.result.split('cabinet_')[1]
          }
        }

        if (cabinetId) {
          this.setData({ cabinetId })
          wx.navigateTo({
            url: `/pages/cabinet-detail/cabinet-detail?id=${cabinetId}`
          })
        } else {
          // 如果扫码结果是取件码
          if (/^\d{6}$/.test(res.result)) {
            this.setData({ pickCode: res.result })
          } else {
            wx.showToast({ title: '无法识别的二维码', icon: 'none' })
          }
        }
      }
    })
  },

  handleCall() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    })
  },

  // 加载用户在该快递柜的所有待取件订单
  async loadUserOrdersInCabinet(cabinetId) {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const userId = app.globalData.userId
      if (!userId) {
        wx.hideLoading()
        wx.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      
      // 获取用户所有待取件订单
      const ordersRes = await service.order.getMyOrders(0) // 0: 待取件
      
      if (ordersRes.code === 200) {
        // 筛选出该快递柜的订单
        const cabinetOrders = ordersRes.data.filter(order => 
          order.cabinetId === parseInt(cabinetId)
        )
        
        wx.hideLoading()
        
        if (cabinetOrders.length > 0) {
          this.setData({
            userOrders: cabinetOrders,
            showOrdersList: true
          })
        } else {
          wx.showToast({ title: '该快递柜暂无您的待取件快递', icon: 'none' })
        }
      }
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '加载订单失败', icon: 'none' })
    }
  },

  // 打开单个格口
  async openCompartment(e) {
    const { compartmentId, pickCode } = e.currentTarget.dataset
    
    wx.showLoading({ title: '开仓中...' })
    
    try {
      // 使用取件码开仓
      const res = await service.order.pickUp(pickCode)
      
      wx.hideLoading()
      
      if (res.code === 200) {
        wx.showToast({ title: '格口已打开', icon: 'success' })
        
        // 更新订单状态
        const updatedOrders = this.data.userOrders.filter(order => order.pickCode !== pickCode)
        this.setData({ userOrders: updatedOrders })
      }
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '开仓失败', icon: 'none' })
    }
  },

  // 批量开仓
  async openAllCompartments() {
    const { userOrders } = this.data
    
    if (userOrders.length === 0) {
      wx.showToast({ title: '没有待开仓的订单', icon: 'none' })
      return
    }
    
    wx.showLoading({ title: '批量开仓中...' })
    
    let successCount = 0
    let failedCount = 0
    
    try {
      for (const order of userOrders) {
        try {
          await service.order.pickUp(order.pickCode)
          successCount++
        } catch (error) {
          failedCount++
        }
      }
      
      wx.hideLoading()
      
      wx.showModal({
        title: '批量开仓完成',
        content: `成功打开 ${successCount} 个格口，失败 ${failedCount} 个`,
        showCancel: false,
        success: () => {
          this.setData({ userOrders: [], showOrdersList: false })
        }
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: '批量开仓失败', icon: 'none' })
    }
  },

  // 关闭订单列表
  closeOrdersList() {
    this.setData({ showOrdersList: false, userOrders: [] })
  }
})
