const service = require('../../utils/service.js')
const app = getApp()

Page({
  data: {
    cabinets: [],
    loading: false,
    currentLocation: null,
    showLocationTip: false
  },

  onLoad() {
    this.loadCabinets()
  },

  onShow() {
    this.loadCabinets()
  },

  // 获取用户当前位置
  getCurrentLocation() {
    wx.showLoading({ title: '获取位置中...' })
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        wx.hideLoading()
        this.setData({
          currentLocation: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          showLocationTip: true
        })
        
        // 自动按距离排序
        this.loadCabinetsByDistance(res.latitude, res.longitude)
      },
      fail: (error) => {
        wx.hideLoading()
        wx.showToast({ 
          title: '获取位置失败，请检查权限', 
          icon: 'none' 
        })
      }
    })
  },

  // 获取附近快递柜
  async loadNearbyCabinets(latitude, longitude) {
    this.setData({ loading: true })

    try {
      const res = await service.cabinet.getNearby(latitude, longitude, 5000) // 5公里范围内
      
      if (res.code === 200) {
        await this.processCabinets(res.data)
      }
    } catch (error) {
      this.setData({ loading: false })
      wx.showToast({ title: '获取附近快递柜失败', icon: 'none' })
    }
  },

  // 按距离排序快递柜
  async loadCabinetsByDistance(latitude, longitude) {
    this.setData({ loading: true })

    try {
      const res = await service.cabinet.sortByDistance(latitude, longitude)
      
      if (res.code === 200) {
        await this.processCabinets(res.data)
      }
    } catch (error) {
      this.setData({ loading: false })
      wx.showToast({ title: '按距离排序失败', icon: 'none' })
    }
  },

  // 加载所有快递柜
  async loadCabinets() {
    this.setData({ loading: true })

    try {
      const res = await service.cabinet.getAll()
      
      if (res.code === 200) {
        await this.processCabinets(res.data)
      }
    } catch (error) {
      this.setData({ loading: false })
    }
  },

  // 处理快递柜数据
  async processCabinets(cabinets) {
    // 映射字段名，适配前端显示
    const mappedCabinets = cabinets.map(cabinet => ({
      id: cabinet.id,
      name: cabinet.cabinetCode, // 使用编号作为名称
      code: cabinet.cabinetCode,
      address: cabinet.location,
      status: cabinet.status,
      // 直接使用后端返回的 availableCompartments，如果未返回则默认为 0
      availableCompartments: cabinet.availableCompartments !== undefined ? cabinet.availableCompartments : 0
    }))
    
    this.setData({
      cabinets: mappedCabinets,
      loading: false
    })
  },

  onCabinetTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/cabinet-detail/cabinet-detail?id=${id}`
    })
  },

  onPullDownRefresh() {
    this.loadCabinets().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  goToPickUp() {
    wx.navigateTo({
      url: '/pages/pick-up/pick-up'
    })
  },

  goToOrders() {
    wx.navigateTo({
      url: '/pages/orders/orders'
    })
  }
})
