const request = require('../../utils/request');

Page({
  data: {
    cabinets: [],
    loading: true
  },

  onLoad() {
    this.fetchCabinets();
  },

  fetchCabinets() {
    // 模拟经纬度 (北京天安门附近)
    const latitude = 39.9042;
    const longitude = 116.4074;
    
    wx.showLoading({ title: '搜索附近柜机...' });

    request.get('/cabinets/nearby', { latitude, longitude, radius: 100 }) // 半径给大点，方便测试
      .then(res => {
        this.setData({
          cabinets: res || [],
          loading: false
        });
        wx.hideLoading();
      })
      .catch(err => {
        console.error(err);
        wx.hideLoading();
        // 如果nearby失败，尝试获取全部列表作为降级
        this.fetchAllCabinets();
      });
  },

  fetchAllCabinets() {
    request.get('/cabinets')
      .then(res => {
        this.setData({
          cabinets: res || [],
          loading: false
        });
      })
      .catch(err => {
        this.setData({ loading: false });
        wx.showToast({ title: '获取列表失败', icon: 'none' });
      });
  },

  selectCabinet(e) {
    const { id, code } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/cabinets/detail?id=${id}&code=${code}`
    });
  }
});
