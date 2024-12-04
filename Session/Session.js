class Session {
  constructor(attributesKeys, prefix = '') {
    this.attributesKeys = attributesKeys
    this.prefix = prefix
  }

  isValid(attributesKeys = this.attributesKeys) {
    return attributesKeys.every((attributesKey) => !getData(attributesKey))
  }

  login(attributes) {
    Object.entries(attributes).map(setData)
    return isValid()
  }

  logout() {
    this.attributesKeys.map(deleteData)
  }

  getData(key) {
    return JSON.parse(localStorage.getItem(this.prefix + key))
  }

  setData(key, value) {
    return localStorage.setItem(this.prefix + key, JSON.stringify(value))
  }

  deleteData(key) {
    return localStorage.removeItem(this.prefix + key)
  }
}