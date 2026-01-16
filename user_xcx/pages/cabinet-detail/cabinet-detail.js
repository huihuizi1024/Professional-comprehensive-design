const service = require('../../utils/service.js')

Page({
  data: {
    cabinetId: null,
    cabinet: null,
    compartments: [],
    availableCompartments: [],
    loading: true
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({ cabinetId: id })
      this.loadCabinetDetail()
    }
  },

  async loadCabinetDetail() {
    this.setData({ loading: true })

    try {
      const [cabinetRes, compartmentsRes, availableRes] = await Promise.all([
        service.cabinet.getById(this.data.cabinetId),
        service.cabinet.getCompartments(this.data.cabinetId),
        service.cabinet.getAvailableCompartments(this.data.cabinetId)
      ])

      if (cabinetRes.code === 200) {
        this.setData({
          cabinet: cabinetRes.data,
          loading: false
        })
      }

      if (compartmentsRes.code === 200) {
        this.setData({
          compartments: compartmentsRes.data
        })
      }

      if (availableRes.code === 200) {
        this.setData({
          availableCompartments: availableRes.data
        })
      }
    } catch (error) {
      this.setData({ loading: false })
    }
  },

  onCompartmentTap(e) {
    const { id, status } = e.currentTarget.dataset
    
    if (status === 1) {
      wx.showToast({
        title: '该格口已被占用',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/store/store?cabinetId=${this.data.cabinetId}&compartmentId=${id}`
    })
  },

  onPullDownRefresh() {
    this.loadCabinetDetail().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
