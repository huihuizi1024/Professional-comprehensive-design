const request = require('../../utils/request')

Page({
  data: {
    compartments: []
  },

  onLoad(options) {
    this.cabinetId = options.cabinetId
    this.loadCompartments()
  },

  loadCompartments() {
    request({
      url: `/cabinets/${this.cabinetId}/compartments/available`
    }).then(list => {
      this.setData({
        compartments: list
      })
    })
  },

  selectCompartment(e) {
    const compartmentId = e.currentTarget.dataset.id

    wx.navigateTo({
      url: `/pages/deliver/deliver?cabinetId=${this.cabinetId}&compartmentId=${compartmentId}`
    })
  }
})
