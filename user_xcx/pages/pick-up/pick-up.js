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
  },

  // 加载用户所有待取件订单
  async loadUserOrders() {
    try {
      const userId = app.globalData.userId
      if (!userId) {
        wx.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      
      // 获取用户所有待取件订单
      const ordersRes = await service.order.getMyOrders(0) // 0: 待取件
      
      if (ordersRes.code === 200) {
        this.setData({
          userOrders: ordersRes.data
        })
      }
    } catch (error) {
      console.error('加载订单失败:', error)
    }
  },

  // 人脸识别取件
  async handleFaceRecognition() {
    wx.showLoading({ title: '人脸识别中...' })
    
    // 1. 模拟人脸识别过程 (2秒)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 2. 识别成功后，获取用户待取件订单
    try {
      const userId = app.globalData.userId
      if (!userId) {
        wx.hideLoading()
        wx.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/login/login' })
        }, 1500)
        return
      }

      // 获取用户所有待取件订单
      const res = await service.order.getMyOrders(0) // 0: 待取件
      
      wx.hideLoading()

      if (res.code === 200 && res.data && res.data.length > 0) {
        const firstOrder = res.data[0]
        
        // 3. 弹窗提示成功，并确认开门
        wx.showModal({
          title: '人脸识别成功',
          content: `识别到您有 ${res.data.length} 个待取件包裹，即将打开最近的一个\n(单号：${firstOrder.orderNo})`,
          showCancel: false,
          success: () => {
            this.setData({ pickCode: firstOrder.pickCode })
            this.handlePickUp()
          }
        })
      } else {
        wx.showModal({
          title: '人脸识别成功',
          content: '身份验证通过，但您当前没有待取件的包裹',
          showCancel: false
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('人脸识别后获取订单失败:', error)
      wx.showToast({ title: '获取订单信息失败', icon: 'none' })
    }
  }
})
