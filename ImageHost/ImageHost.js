console.log("imageHost.js gh");

class imageHost {
  static apiKey = localStorage.getItem("imageHostApiKey");
  static authToken = localStorage.getItem("imageHostAuthToken");

  static async ready() {
    return !!imageHost.apiKey;
  }

  static async auth(apiKey) {
    localStorage.setItem("imageHostApiKey", apiKey);
    imageHost.apiKey = apiKey;
    return !!apiKey;
  }

  static async upload(source) {
    let uploadUrl = "https://api.imgbb.com/1/upload";
    let method = "POST";
    return fetch(`${uploadUrl}?key=${imageHost.apiKey}&image=${source}`, {
      method,
    })
      .then((response) => response.json())
      .then((response) => response.data);
  }

  static async delete(hostedId) {
    let generalUrl = "https://when-lwd.imgbb.com/json";
    let method = "POST";

    let formData = new formData();
    formData.append("auth_token", imageHost.authToken);
    formData.append("pathname", "/");
    formData.append("action", "delete");
    formData.append("single", "true");
    formData.append("delete", "image");
    formData.append("deleting[id]", hostedId);

    return fetch(generalUrl, { method })
      .then((response) => response.json())
      .then((response) => response.data);
  }
}
