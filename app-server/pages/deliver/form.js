const request = require('../../utils/request');

Page({
  data: {
    cabinetId: null,
    compartmentId: null,
    cabinetCode: '',
    orderNo: '',
    receiverPhone: '',
    receiverName: '',
    submitting: false
  },

  onLoad(options) {
    this.setData({
      cabinetId: options.cabinetId,
      compartmentId: options.compartmentId,
      cabinetCode: options.cabinetCode
    });
  },

  onInputOrderNo(e) {
    this.setData({ orderNo: e.detail.value });
  },

  onInputPhone(e) {
    this.setData({ receiverPhone: e.detail.value });
  },

  onInputName(e) {
    this.setData({ receiverName: e.detail.value });
  },

  scanOrderNo() {
    wx.scanCode({
      success: (res) => {
        this.setData({ orderNo: res.result });
      }
    });
  },

  submitOrder() {
    const { cabinetId, compartmentId, orderNo, receiverPhone, receiverName } = this.data;

    if (!orderNo || !receiverPhone) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    if (receiverPhone.length !== 11) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    request.post('/orders/courier/deliver', {
      cabinetId: parseInt(cabinetId),
      compartmentId: parseInt(compartmentId),
      orderNo,
      receiverPhone,
      receiverName: receiverName || '未填写',
      orderType: 0 // 0: 快递投递
    })
    .then(res => {
      this.setData({ submitting: false });
      wx.showToast({ title: '投递成功', icon: 'success' });
      
      // 模拟开门提示
      wx.showModal({
        title: '仓门已打开',
        content: `请将快递放入 ${compartmentId} 号仓门并关闭`,
        showCancel: false,
        success: () => {
          // 返回首页
          wx.reLaunch({ url: '/pages/index/index' });
        }
      });
    })
    .catch(err => {
      this.setData({ submitting: false });
      // request.js 会处理错误提示
    });
  }
});
