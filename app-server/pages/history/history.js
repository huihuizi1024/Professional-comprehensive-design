const request = require('../../utils/request');

Page({
  data: {
    orders: [],
    loading: true
  },

  onLoad() {
    this.fetchOrders();
  },

  onPullDownRefresh() {
    this.fetchOrders(() => {
      wx.stopPullDownRefresh();
    });
  },

  fetchOrders(cb) {
    wx.showLoading({ title: '加载中...' });
    request.get('/orders/courier/me')
      .then(res => {
        // 格式化时间 (简单的字符串处理，如果需要更复杂可引入moment)
        const orders = (res || []).map(item => {
          if (item.createdAt && item.createdAt.includes('T')) {
            item.createdAt = item.createdAt.replace('T', ' ').substring(0, 19);
          }
          return item;
        });
        
        this.setData({ orders, loading: false });
        wx.hideLoading();
        if (cb) cb();
      })
      .catch(err => {
        console.error(err);
        wx.hideLoading();
        if (cb) cb();
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  }
});
