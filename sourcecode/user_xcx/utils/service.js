const api = require('./api.js')

module.exports = {
  auth: {
    register(data) {
      return api.post('/auth/register', data)
    },
    
    login(data) {
      return api.post('/auth/login', data)
    },
    
    getMe() {
      return api.get('/auth/me')
    }
  },
  
  user: {
    getMe() {
      return api.get('/auth/me')
    },
    
    updateMe(data) {
      return api.put('/users/me', data)
    }
  },
  
  cabinet: {
    getAll() {
      return api.get('/cabinets')
    },
    
    getById(id) {
      return api.get(`/cabinets/${id}`)
    },
    
    getByCode(code) {
      return api.get(`/cabinets/code/${code}`)
    },
    
    getCompartments(cabinetId) {
      return api.get(`/cabinets/${cabinetId}/compartments`)
    },
    
    getAvailableCompartments(cabinetId) {
      return api.get(`/cabinets/${cabinetId}/compartments/available`)
    },
    
    getNearby(latitude, longitude, radius) {
      return api.get('/cabinets/nearby', { latitude, longitude, radius })
    },
    
    sortByDistance(latitude, longitude) {
      return api.get('/cabinets/sort-by-distance', { latitude, longitude })
    },
    
    openCompartment(compartmentId) {
      return api.post(`/cabinets/compartments/${compartmentId}/open`)
    }
  },
  
  order: {
    getByPhone(phone) {
      return api.get(`/orders/phone/${phone}`)
    },
    
    getByUserId(userId) {
      return api.get(`/orders/user/${userId}`)
    },
    
    getMyOrders(status) {
      return api.get('/orders/me', { status })
    },

    getMySentOrders(status) {
      return api.get('/orders/me/sent', { status })
    },
    
    getByPickCode(pickCode) {
      return api.get(`/orders/pick-code/${pickCode}`)
    },
    
    create(data) {
      return api.post('/orders', data)
    },
    
    pickUp(pickCode) {
      return api.post('/orders/pick-up', { pickCode })
    }
  }
}
