const request = require('../../utils/request');

Page({
  data: {
    cabinetId: null,
    cabinetCode: '',
    compartments: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        cabinetId: options.id,
        cabinetCode: options.code || '未知编号'
      });
      this.fetchCompartments(options.id);
    }
  },

  fetchCompartments(id) {
    wx.showLoading({ title: '加载仓门...' });
    request.get(`/cabinets/${id}/compartments`)
      .then(res => {
        this.setData({ compartments: res || [] });
        wx.hideLoading();
      })
      .catch(err => {
        console.error(err);
        wx.hideLoading();
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  selectCompartment(e) {
    const item = e.currentTarget.dataset.item;
    
    // 校验状态
    if (item.status === 0) {
      wx.showToast({ title: '仓门故障不可用', icon: 'none' });
      return;
    }
    if (item.hasItem === 1) {
      wx.showToast({ title: '仓门已被占用', icon: 'none' });
      return;
    }

    // 跳转到投递表单
    wx.navigateTo({
      url: `/pages/deliver/form?cabinetId=${this.data.cabinetId}&compartmentId=${item.id}&cabinetCode=${this.data.cabinetCode}`
    });
  }
});
