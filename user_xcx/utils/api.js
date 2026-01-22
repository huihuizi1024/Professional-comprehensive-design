const BASE_URL = 'http://localhost:8080/api'

// 过滤掉值为null或undefined的参数
function filterParams(params) {
  const filtered = {}
  for (const key in params) {
    if (params.hasOwnProperty(key) && params[key] != null) {
      filtered[key] = params[key]
    }
  }
  return filtered
}

function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || ''
    
    // 过滤掉null或undefined的参数
    const filteredData = filterParams(data)
    
    wx.request({
      url: BASE_URL + url,
      method: method,
      data: filteredData,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data)
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          }
        } else {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

module.exports = {
  get(url, data) {
    return request(url, 'GET', data)
  },
  
  post(url, data) {
    return request(url, 'POST', data)
  },
  
  put(url, data) {
    return request(url, 'PUT', data)
  },
  
  delete(url, data) {
    return request(url, 'DELETE', data)
  }
}
