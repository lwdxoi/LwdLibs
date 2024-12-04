class SupabaseApi {
  constructor(baseApiUrl, apiKey) {
    this.baseApiUrl = baseApiUrl
    this.apiKey = apiKey

    this.headers = {
      apikey: this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
    }
  }

  fetch({ table, method, select = [], filter = {}, body = false }) {
    let selectParam = select.length == 0 ? "" : `select=${select.join(",")}&`;
    let queryParams = SupabaseApi.queryToString(filter);

    let params = { method, headers: this.headers };
    if (body) params.body = JSON.stringify(body);

    return fetch(`${this.baseApiUrl}/${table}?${selectParam}${queryParams}`, params);
  }

  // CRUD
  async create(table, body, select = ["*"]) {
    const response = await this.fetch({ table, method: "POST", body, select });
    return await response.json();
  }

  async read(table, filter = {}, select = ["*"]) {
    const response = await this.fetch({ table, method: "GET", filter, select });
    return await response.json();
  }

  async update(table, filter, body, select = ["*"]) {
    const response = await this.fetch({ table, method: "PATCH", filter, body, select });
    return await response.json();
  }

  async delete(table, filter, select = ["*"]) {
    const response = await this.fetch({ table, method: "DELETE", filter, select });
    return await response.json();
  }

  static queryToString(query) {
    return Object.entries(query).reduce(
      (acc, [key, value]) => acc + `${key}=${value}&`,
      ""
    );
  }

  static queryToObject(query) {
    return query.split("&").reduce((acc, condition) => {
      [column, operatorValue] = condition.split("=");
      return { ...acc, [column]: operatorValue };
    }, {});
  }
};