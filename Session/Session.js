class Session {
  constructor(attributesKeys, settings = { prefix: '', validations: {}, beforeLoginFunctions: [], }) {
    this.attributesKeys = attributesKeys
    this.prefix = settings.prefix || ''
    this.validations = settings.validations || {}
    this.beforeLoginFunctions = settings.beforeLoginFunctions || []
  }

  isValid(attributes = this.getAllData()) {
    return Object.entries(this.validations).every(([key, validate]) =>
      validate(attributes[key], attributes)
    )
  }

  login(attributes) {
    const beforeLoginReturn = this.beforeLoginFunctions.map((beforeLogin) => beforeLogin(attributes))
    if (!this.isValid(attributes) || !beforeLoginReturn.every((x) => x)) return false;
    Object.entries(attributes).filter(([k]) => this.#checkKey(k)).map(([k, v]) => this.setData(k, v))
    return true
  }

  logout() {
    this.attributesKeys.map(this.deleteData)
  }

  getData(key) {
    if (!this.#checkKey({ key })) return false
    return JSON.parse(localStorage.getItem(this.prefix + key))
  }

  setData(key, value) {
    if (!this.#checkKey({ key })) return false
    return localStorage.setItem(this.prefix + key, JSON.stringify(value))
  }

  deleteData(key) {
    if (!this.#checkKey({ key })) return false
    return localStorage.removeItem(this.prefix + key)
  }

  getAllData() {
    return this.attributesKeys.reduce((acc, key) => {
      acc[key] = this.getData(key);
      return acc;
    }, {});
  }

  #checkKey(key) {
    if (!this.attributesKeys.includes(key)) {
      console.warn("Session", this.prefix, "got a, unexpected key", key)
      return false
    }
    return true
  }
}
