class ExternalApi {
  static fetchRule34xxx(search) {
    return fetch(
      `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=600&tags=${search}`
    )
      .then((response) => response.json())
      .then((response) => {
        return response.map((image) => ({
          id: image.id,
          srcOriginal: image.file_url,
          srcThumb: image.sample_url,
          tags: image.tags.split(" "),
          domain: "https://rule34.xxx",
          href: `https://rule34.xxx/index.php?page=post&s=view&id=${image.id}`,
          source: image.source,
        }));
      })
      .catch((e) => console.log("cant fetch from fetchRule34xxx", e));
  }
  static autocompleteRule34xxx(search) {
    return fetch(
      `https://ac.rule34.xxx/autocomplete.php?q=${search}`
    )
      .then((response) => response.json())
      .then((response) => {
        return response.map((tag) => ({
          name: tag.value.replaceAll('_', ' '),
          category: tag.type,
          count: tag.label.split(' ')[1].replaceAll(/[\(\)]/g, '')
        }))
      })
      .catch((e) => console.log("cant fetch from fetchRule34xxx", e));
  }
  static autocompleteE621(search) {
    return fetch(
      `https://e621.net/tags/autocomplete.json?expiry=7&search[name_matches]=${search}`
    )
      .then((response) => response.json())
      .then((response) => {
        return response
      })
      .catch((e) => console.log("cant fetch from fetchRule34xxx", e));
  }
};
