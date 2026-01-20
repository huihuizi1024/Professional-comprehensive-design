// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      // 如果没有token，且当前页面不是登录页（这里在onLaunch无法直接跳转，交由首页处理）
      // 实际上通常在 index.js onShow 里做拦截
    }
  },
  globalData: {
    userInfo: null
  }
})
