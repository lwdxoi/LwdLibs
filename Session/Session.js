class Session {
  constructor(attributesKeys, { prefix = '', validations = {}, beforeLoginFunctions = [] } = {}) {
    this.attributesKeys = attributesKeys;
    this.prefix = prefix;
    this.validations = validations;
    this.beforeLoginFunctions = beforeLoginFunctions;
  }

  async isValid(attributes = this.getAllData()) {
    const validationResults = await Promise.all(
      Object.entries(this.validations).map(([key, validate]) => validate(attributes[key], attributes, key))
    );
    return validationResults.every(Boolean); // `Boolean` is a more concise way to check truthy values
  }

  async login(attributes = this.getAllData()) {
    const beforeLoginResults = await Promise.all(
      this.beforeLoginFunctions.map(beforeLogin => beforeLogin(attributes))
    );

    if (!(await this.isValid(attributes)) || beforeLoginResults.includes(false)) return false;

    Object.entries(attributes)
      .filter(([key]) => this.#checkKey(key))
      .forEach(([key, value]) => this.setData(key, value));

    return true;
  }

  logout() {
    this.attributesKeys.forEach(this.deleteData)
  }

  getData(key) {
    if (!this.#checkKey(key)) return false
    return JSON.parse(localStorage.getItem(this.prefix + key))
  }

  setData(key, value) {
    if (!this.#checkKey(key)) return false
    return localStorage.setItem(this.prefix + key, JSON.stringify(value))
  }

  deleteData(key) {
    if (!this.#checkKey(key)) return false
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

  static defaultRequiredValidation(value, _, key) {
    if (value === undefined || value === null) {
      console.warn(key, 'is undefined or null')
      return false
    }

    if (value === '') {
      console.warn(key, 'is an empty string')
      return false
    }
  }
}
