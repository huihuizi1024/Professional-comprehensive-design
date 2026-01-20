const request = require('../../utils/request');

Page({
  data: {
    username: '',
    password: ''
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  handleLogin() {
    const { username, password } = this.data;
    
    if (!username || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      });
      return;
    }

    request.post('/auth/login', { username, password })
      .then(res => {
        if (res.userType !== 1) {
          wx.showToast({
            title: '非快递员账号',
            icon: 'error'
          });
          return;
        }

        wx.setStorageSync('token', res.token);
        wx.setStorageSync('userInfo', res);
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }, 1000);
      })
      .catch(err => {
        console.error('Login failed', err);
      });
  }
});
