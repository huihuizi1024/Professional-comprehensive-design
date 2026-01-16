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
        this.setData({
          cabinets: res.data,
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
