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
        // 映射字段名，适配前端显示
        const mappedCabinet = {
          id: cabinetRes.data.id,
          name: cabinetRes.data.cabinetCode || cabinetRes.data.name,
          code: cabinetRes.data.cabinetCode || cabinetRes.data.code,
          address: cabinetRes.data.location || cabinetRes.data.address,
          status: cabinetRes.data.status
        }
        this.setData({
          cabinet: mappedCabinet,
          loading: false
        })
      }

      if (compartmentsRes.code === 200) {
        this.setData({
          compartments: compartmentsRes.data
        })
      }

      if (availableRes.code === 200) {
        // 映射字段名，确保compartmentNo字段存在
        const mappedAvailable = availableRes.data.map(item => ({
          id: item.id,
          compartmentNo: item.compartmentNo || item.number || item.id,
          status: item.status,
          hasItem: item.hasItem || 0
        }))
        this.setData({
          availableCompartments: mappedAvailable
        })
      }
    } catch (error) {
      this.setData({ loading: false })
    }
  },

  onCompartmentTap(e) {
    const { id, status, hasItem } = e.currentTarget.dataset
    
    if (hasItem === 1) {
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
