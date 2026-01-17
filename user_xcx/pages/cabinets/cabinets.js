const service = require('../../utils/service.js')
const app = getApp()

Page({
  data: {
    cabinets: [],
    loading: false
  },

  onLoad() {
    this.loadCabinets()
  },

  onShow() {
    this.loadCabinets()
  },

  async loadCabinets() {
    this.setData({ loading: true })

    try {
      const res = await service.cabinet.getAll()
      
      if (res.code === 200) {
        // 映射字段名，适配前端显示
        const mappedCabinets = res.data.map(cabinet => ({
          id: cabinet.id,
          name: cabinet.cabinetCode, // 使用编号作为名称
          code: cabinet.cabinetCode,
          address: cabinet.location,
          status: cabinet.status,
          availableCompartments: 0 // 暂时设置为0，需要从后端获取
        }))
        
        // 为每个快递柜获取可用格口数量
        for (let i = 0; i < mappedCabinets.length; i++) {
          const cabinet = mappedCabinets[i]
          try {
            const availableRes = await service.cabinet.getAvailableCompartments(cabinet.id)
            if (availableRes.code === 200) {
              mappedCabinets[i].availableCompartments = availableRes.data.length
            }
          } catch (error) {
            console.error('获取可用格口失败:', error)
          }
        }
        
        this.setData({
          cabinets: mappedCabinets,
          loading: false
        })
      }
    } catch (error) {
      this.setData({ loading: false })
    }
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
