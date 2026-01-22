// 如果在真机调试，请将 localhost 替换为电脑的局域网 IP 地址 (例如 http://192.168.1.5:8080/api)
const BASE_URL = 'http://localhost:8080/api';

const request = (url, method = 'GET', data = {}) => {
  const token = wx.getStorageSync('token');
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data);
          } else if (res.data.code === 401) {
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            wx.redirectTo({
              url: '/pages/login/login'
            });
            reject(res.data.message);
          } else {
            wx.showToast({
              title: res.data.message || 'Error',
              icon: 'none'
            });
            reject(res.data.message);
          }
        } else {
          reject(res.errMsg);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: 'Network Error',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

const get = (url, data) => request(url, 'GET', data);
const post = (url, data) => request(url, 'POST', data);
const put = (url, data) => request(url, 'PUT', data);
const del = (url, data) => request(url, 'DELETE', data);

module.exports = {
  get,
  post,
  put,
  del
};
