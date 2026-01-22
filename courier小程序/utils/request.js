const BASE_URL = 'http://localhost:8080/api'

function request(options) {
  const token = wx.getStorageSync('token')

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      },
      success(res) {
        const result = res.data
        if (result.code === 200) {
          resolve(result.data)
        } else if (result.code === 401) {
          wx.redirectTo({ url: '/pages/login/login' })
        } else {
          wx.showToast({ title: result.message, icon: 'none' })
          reject(result)
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

module.exports = request
