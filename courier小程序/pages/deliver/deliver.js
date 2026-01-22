const request = require('../../utils/request')

Page({
  data: {
    cabinetId: '',
    compartmentId: '',
    orderNo: '',
    receiverName: '',
    receiverPhone: ''
  },

  onLoad(options) {
    this.setData({
      cabinetId: options.cabinetId,
      compartmentId: options.compartmentId
    })
  },

  onOrderNo(e) {
    const orderNo = e.detail.value
    this.setData({ orderNo })

    // 模拟：根据单号自动填充收件人（课程项目常用）
    if (orderNo.length >= 6) {
      this.mockQueryReceiver(orderNo)
    }
  },

  mockQueryReceiver(orderNo) {
    // mock 数据
    this.setData({
      receiverName: '张三',
      receiverPhone: '13800000000'
    })
  },

  onName(e) {
    this.setData({ receiverName: e.detail.value })
  },

  onPhone(e) {
    this.setData({ receiverPhone: e.detail.value })
  },

  deliver() {
    const { orderNo, receiverName, receiverPhone } = this.data

    // 基础校验
    if (!orderNo || !receiverName || !receiverPhone) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    if (!/^1\d{10}$/.test(receiverPhone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return
    }

    // 调用后端接口
    request({
      url: '/orders/courier/deliver',
      method: 'POST',
      data: {
        orderNo,
        cabinetId: this.data.cabinetId,
        compartmentId: this.data.compartmentId,
        receiverName,
        receiverPhone,
        orderType: 0
      }
    }).then(order => {
      wx.showModal({
        title: '投递成功',
        content: `取件码：${order.pickCode}`,
        showCancel: false,
        success: () => {
          wx.redirectTo({
            url: '/pages/home/home'
          })
        }
      })
    })
  }
})
