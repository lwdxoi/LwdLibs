console.log("Z LwdHTML");

class LwdHTML {
  constructor(HTMLTag, attrs = {}) {
    const HTMLElement = document.createElement(HTMLTag);
    HTMLElement.setAttribute("lwd", "");
    HTMLElement.setAttribute("part", "lwd");
    Object.entries(attrs).forEach(([key, value]) => (HTMLElement[key] = value));

    HTMLElement.set = (key, value) => {
      if (typeof value != "function") return (HTMLElement[key] = value);

      let originalValue;
      if (typeof HTMLElement[key] == "function")
        originalValue = HTMLElement[key].bind({});
      else if (Array.isArray(HTMLElement[key]))
        originalValue = [...HTMLElement[key]];
      else if (typeof HTMLElement[key] == "object")
        originalValue = { ...HTMLElement[key] };
      else originalValue = HTMLElement[key];

      return (HTMLElement[key] = value(originalValue));
    };

    return HTMLElement;
  }
};

class LwdRoot extends LwdHTML {
  constructor() {
    super("div");
    this.setAttribute("root", "");
    this.attachShadow({ mode: "open" }).appendChild(
      document.querySelector("style[data-source]").cloneNode(true)
    );
    // .appendChild(new LwdHTML('body'))

    this.append = (child) => {
      console.log("attachShadow root", this);
      if (child.nodeName) {
        this.shadowRoot.appendChild(child);
      } else {
        let childElement = document.createElement("div");
        childElement.textContent = child;
        this.shadowRoot.appendChild(childElement);
      }
    };
  }
};

class LwdA extends LwdHTML {
  constructor(attrs = {}) {
    super("a", attrs);
  }
}

class LwdAutocomplete extends LwdHTML {
  constructor(options, attrs = {}) {
    super("autocomplete");
    this.input = new LwdInput(attrs);
    this.append(this.input);
    this.list = document.createElement("div");
    this.append(this.list);

    this.input.addEventListener("input", (e) => {
      this.value = this.input.value;
      var cursorIndex = this.input.selectionStart;
      var searchText = this.input.value.slice(0, cursorIndex).split(" ").pop();

      if (searchText[0] == "-") searchText = searchText.slice(1);

      this.list.innerHTML = "";
      if (searchText.length == 0) return;

      Object.values(options)
        .filter(
          (option) =>
            option.textContent.substr(0, searchText.length).toUpperCase() ==
            searchText.toUpperCase()
        )
        .slice(0, 30)
        .forEach((option) => {
          this.list.append(new LwdAutocompleteOption(this, option));
        });
    });

    this.input.onblur = () => setTimeout(() => (this.list.hidden = true), 500);
    this.input.onfocus = () => (this.list.hidden = false);
  }
}

class LwdAutocompleteOption extends LwdHTML {
  constructor(autocomplete, option) {
    super("div");
    Object.entries(option).forEach(([k, v]) => (this[k] = v));

    this.onclick = () => {
      let cursorIndex = autocomplete.input.selectionStart;
      let textBeforeCursor = autocomplete.value
        .slice(0, cursorIndex)
        .split(" ");
      let incompleteText = textBeforeCursor.pop();
      let negativeTag = incompleteText[0] == "-" ? "-" : "";
      textBeforeCursor.push(negativeTag + option.textContent);
      autocomplete.value = autocomplete.input.value =
        textBeforeCursor.join(" ") +
        " " +
        autocomplete.value.slice(cursorIndex);

      let newCursorIndex = textBeforeCursor.join(" ").length + 1;
      autocomplete.input.setSelectionRange(newCursorIndex, newCursorIndex);
      autocomplete.input.focus();
      autocomplete.list.innerHTML = "";
    };
  }
}

class LwdContainer extends LwdHTML {
  constructor(attrs = {}) {
    super("div", attrs);
  }
}

class LwdForm extends LwdHTML {
  constructor(attrs = {}) {
    super("form", attrs);

    this.getFormData = () => {
      const formData = new FormData(this);
      let returnFormData = {};

      const uniqueKeys = [...formData.keys()].uniqueBy();
      uniqueKeys.forEach((key) => {
        let keyKeys = key.replaceAll("]", "").split("[");
        keyKeys.reduce((field, keyKey, i) => {
          let nextKeyKey = keyKeys[i + 1];

          let nextValue;
          if (!!field[keyKey]) nextValue = field[keyKey];
          else if (nextKeyKey == undefined) nextValue = formData.get(key);
          else if (nextKeyKey == "") nextValue = formData.getAll(key);
          else if (!isNaN(nextKeyKey)) nextValue = [];
          else nextValue = {};

          field[keyKey] = nextValue;

          return nextValue;
        }, returnFormData);
      });

      return returnFormData;
    };
  }
}

// items = {id, hash, href, info, onclick, src, thumb, zoom, className}
class LwdGalery extends LwdHTML {
  constructor(items, attrs = {}) {
    super("galery", attrs);

    this.focusedItem = undefined;
    this.nextItem = undefined;
    this.previousItem = undefined;
    this.items = items;

    this.focusItem = (item) => {
      console.log("focusItem", items, item, this.items.indexOf(item));
      let index = this.items.findIndex(({ _id }) => item._id == _id);
      this.focusedItem = { ...this.items[index], index: index };
      this.nextItem = { ...this.items[index + 1], index: index + 1 };
      this.previousItem = { ...this.items[index - 1], index: index - 1 };

      this.focusImageElement.src = item.imgOriginal || item.imgSample || item.srcOriginal;
      this.focusImageElement.style.zoom = item.zoom || "100%";
      this.focusContainer.hidden = false;
      this.focusContainer.className = `focus-container ${item.className}`;

      this.nextBtn.hidden = !this.nextItem?._id;
      this.previousBtn.hidden = !this.previousItem?._id;
    };
    this.focusNextItem = () =>
      this.nextItem?._id && this.focusItem(this.nextItem);
    this.focusPreviousItem = () =>
      this.previousItem?._id && this.focusItem(this.previousItem);

    this.closeFocus = () => {
      this.focusContainer.hidden = true;
      this.focusedItem = undefined;
      this.nextItem = undefined;
      this.previousItem = undefined;
    };

    items.forEach((item) => {
      let frame = new LwdHashLink(item.hash, {
        className: "frame",
        href: item.href,
      });
      this.append(frame);

      if (item.info) frame.append(item.info);

      let img = document.createElement("img");
      frame.prepend(img);

      if (item.id) img.id = item.id;
      if (item.thumbUrl) img.src = item.thumbUrl;
    });

    this.focusContainer = document.createElement("div");
    this.append(this.focusContainer);
    this.focusContainer.className = "focus-container";
    this.focusContainer.hidden = true;
    this.focusContainer.ondblclick = () => this.closeFocus(this.focusedItem);

    this.focusImageElement = document.createElement("img");
    this.focusImageElement.setAttribute("referrerpolicy", "no-referrer");
    this.focusContainer.append(this.focusImageElement);

    let enableActiveToogle = false;
    this.nextBtn = new LwdTile({ id: "next-btn", enableActiveToogle });
    this.focusContainer.append(this.nextBtn);
    this.nextBtn.onclick = this.focusNextItem;

    this.previousBtn = new LwdTile({ id: "previous-btn", enableActiveToogle });
    this.focusContainer.append(this.previousBtn);
    this.previousBtn.onclick = this.focusPreviousItem;

    this.imgControl = new LwdImgControl(attrs.imgControl);
    this.focusContainer.append(this.imgControl);
    LwdImgControl.proximityOpacity(this.focusContainer, this.imgControl);

    this.addSwipeListeners = () => {
      this.focusContainer.addEventListener("swipeup", this.closeFocus);
      this.focusContainer.addEventListener("swipedown", this.closeFocus);

      this.focusContainer.addEventListener("swipeleft", this.focusNextItem);
      this.focusContainer.addEventListener(
        "swiperight",
        this.focusPreviousItem
      );
    };
  }
}

class LwdHashLink extends LwdHTML {
  constructor(urlHash, attrs = { hash: {} }) {
    super("a", attrs);
    if (urlHash && !attrs.href)
      this.href = LwdHashRouter.stringifyLocationHash(urlHash);

    this.onclick = (e) => {
      e.preventDefault();
      LwdHashRouter.params = urlHash;
      location.hash = LwdHashRouter.stringifyLocationHash(urlHash);
      // if (!this.quiet)
      LwdHashRouter.refresh();
    };
  }
}

class LwdHeader extends LwdHTML {
  constructor(size = 1, attrs = {}) {
    super(`h${size}`, attrs);
  }
}

class LwdImgControl extends LwdHTML {
  constructor(attrs = {}) {
    super("div", attrs);
    this.classList.add("img-control");

    let ondblclick = (e) => e.stopPropagation();

    let widthTile = new LwdTile({ ondblclick, toogleActive: true });
    this.append(widthTile);
    widthTile.onclick = () => this.parentNode.classList.toggle("full-width");
    widthTile.append(new LwdSvg("horizontalArrows"));

    let heightTile = new LwdTile({ ondblclick, toogleActive: true });
    this.append(heightTile);
    heightTile.onclick = () => this.parentNode.classList.toggle("full-height");
    heightTile.append(new LwdSvg("verticalArrows"));

    let scrollTile = new LwdTile({ ondblclick, toogleActive: true });
    this.append(scrollTile);
    scrollTile.onclick = () => this.parentNode.classList.toggle("lock-scroll");
    scrollTile.append(new LwdSvg("lock"));

    let zoomInTile = new LwdTile({ ondblclick, toogleActive: false });
    this.append(zoomInTile);
    zoomInTile.onclick = () => LwdImgControl.updateZoom(this.parentNode, 3);
    zoomInTile.append(new LwdSvg("zoomIn"));

    let zoomOutTile = new LwdTile({ ondblclick, toogleActive: false });
    this.append(zoomOutTile);
    zoomOutTile.onclick = () => LwdImgControl.updateZoom(this.parentNode, -3);
    zoomOutTile.append(new LwdSvg("zoomOut"));

    if (attrs.snapshot) {
      let snapshotTile = new LwdTile({ ondblclick, toogleActive: false });
      this.append(snapshotTile);
      snapshotTile.onclick = () => LwdImgControl.saveSnapshot(this.parentNode);
      snapshotTile.append(new LwdSvg("snapshot"));
    }
  }

  static updateZoom(container, value) {
    let currentZoom = container.querySelector("img").style.zoom || "100%";
    let updatedZoom = parseInt(currentZoom.slice(0, -1)) + value + "%";
    container.querySelector("img").style.zoom = updatedZoom;
  }

  static saveSnapshot(container) {
    let currentZoom = container.querySelector("img").style.zoom || "100%";
    let containerClassName = container.className;
    console.log(currentZoom, containerClassName);

    // imageId = hashParams.get('imageId');
    // view = {
    // 	className: focusContainer.className,
    // 	scrollTop: focusContainer.scrollTop,
    // 	scrollLeft: focusContainer.scrollLeft,
    // 	zoom: focusContainer.querySelector('img').style.zoom,
    // };

    // updateAPI('images', { _id: imageId }, { view }).then(() => {
    // 	imageList.find(({ _id }) => _id == imageId).view = view;
    // });
  }

  static proximityOpacity(
    eventArea,
    eventTarget,
    minRange = 0.5,
    maxOpacity = 0.7
  ) {
    eventArea.addEventListener("mousemove", (event) => {
      let targetX = eventTarget.offsetLeft + eventTarget.offsetWidth / 2;
      let targetY = eventTarget.offsetTop + eventTarget.offsetHeight / 2;

      let offsetX = Math.max(window.innerWidth - targetX, targetX);
      let offsetY = Math.max(window.innerHeight - targetY, targetY);

      let opacityX = 1 - Math.abs(targetX - event.clientX) / offsetX;
      let opacityY = 1 - Math.abs(targetY - event.clientY) / offsetY;
      let opacity = opacityX * opacityY;

      opacity = (opacity - minRange) / (1 - minRange);

      opacity *= maxOpacity;

      eventTarget.style.opacity = opacity;
    });
  }
}

class LwdInput extends LwdHTML {
  constructor(attrs = {}) {
    super("input", { autocomplete: "off", type: "text", ...attrs });
  }
}

class LwdLabel extends LwdHTML {
  constructor(attrs = {}) {
    super("label", attrs);
  }
}

class LwdList extends LwdHTML {
  constructor(items = [], attrs = {}) {
    super("ul", attrs);

    items.forEach((item) => this.append(new LwdListItem(item)));
  }
}

class LwdListItem extends LwdHTML {
  constructor(attrs = {}) {
    super("li", attrs);
  }
}

class LwdNav extends LwdHTML {
  constructor(attrs = {}) {
    super("nav", attrs);
  }
}

class LwdModal extends LwdHTML {
  constructor(attrs = {}) {
    super("modal", attrs);

    this.hidden = true;
    this.open = () => (this.hidden = false);
    this.close = () => (this.hidden = true);

    this.append((this.headline = new LwdContainer({ className: "headline" })));
    this.append((this.body = new LwdContainer({ className: "body" })));
    this.append((this.action = new LwdContainer({ className: "action" })));

    this.header = new LwdHeader(3, { textContent: "Modal Title" });
    this.headline.append(this.header);

    this.headline.append((this.closeBtn = new LwdSvg("x")));
    this.closeBtn.onclick = this.close;
  }
}

class LwdP extends LwdHTML {
  constructor(attrs = {}) {
    super("p", attrs);
  }
}

class LwdPage extends LwdHTML {
  constructor(attrs = {}) {
    super("page", attrs);
    if (attrs.href) this.setAttribute("href", attrs.href);
  }
}

class LwdPagination extends LwdHTML {
  constructor(lastPage, currentPage = 1, attrs = {}) {
    super("pagination", attrs);

    this.lastPage = lastPage;
    this.currentPage = parseInt(currentPage);
    this.pagePadding = parseInt(attrs.pagePadding) || 5;

    this.pagesToDisplay = () => {
      let maxPages = this.pagePadding * 2 + 1;

      if (this.lastPage == 1) {
        return [1];
      } else if (this.lastPage <= maxPages) {
        return Array.from({ length: this.lastPage }, (e, i) => i + 1);
      } else if (this.currentPage - this.pagePadding <= 0) {
        return Array.from({ length: maxPages }, (e, i) => i + 1);
      } else if (this.lastPage - this.currentPage - this.pagePadding < 0) {
        return Array.from({ length: maxPages }, (e, i) => {
          return this.lastPage - maxPages + i + 1;
        });
      } else {
        return Array.from({ length: maxPages }, (e, i) => {
          return this.currentPage - this.pagePadding + i;
        });
      }
    };

    this.onPageSelection = (getPage) => {
      this.currentPage = getPage();

      this.querySelector("#numbered-selectors").replaceWith(
        this.renderNumberedSelectors()
      );
    };

    this.renderSelector = (getPage, active, textContent = getPage()) => {
      let tile = new LwdTile({ textContent, enableActiveToogle: false });
      tile.set("onclick", () => () => this.onPageSelection(getPage));
      if (active) tile.classList.add("active");
      return tile;
    };

    this.renderNumberedSelectors = () => {
      let numberedContainer = new LwdContainer({ id: "numbered-selectors" });
      this.pagesToDisplay().map((pageNumber) => {
        let activeSelector = pageNumber == this.currentPage;
        let tile = this.renderSelector(() => pageNumber, activeSelector);
        numberedContainer.append(tile);
      });

      return numberedContainer;
    };

    let backwardsContainer = new LwdContainer();
    this.append(backwardsContainer);
    backwardsContainer.append(this.renderSelector(() => 1, false, "<<"));
    backwardsContainer.append(
      this.renderSelector(() => this.currentPage - 1, false, "<")
    );

    this.append(this.renderNumberedSelectors());

    let fowardContainer = new LwdContainer();
    this.append(fowardContainer);
    fowardContainer.append(
      this.renderSelector(() => this.currentPage + 1, false, ">")
    );
    fowardContainer.append(
      this.renderSelector(() => this.lastPage, false, ">>")
    );
  }
}

class LwdSection extends LwdHTML {
  constructor(attrs = {}) {
    super("section", attrs);
  }
}

class LwdSelect extends LwdHTML {
  constructor(options, attrs = {}) {
    super("select", attrs);

    options.forEach((option) => this.append(new LwdSelectOption(option)));
  }
}

class LwdSelectOption extends LwdHTML {
  constructor(attrs = {}) {
    super("option", attrs);
  }
}

class LwdSnackbar extends LwdHTML {
  constructor(attrs = {}) {
    super("snackbar", attrs);
    document.body.append(this);
    this.fire = (textContent, className = "warning", displayTime = 5000) => {
      let message;
      this.append((message = new LwdContainer({ textContent, className })));
      setTimeout(() => message.classList.add("out"), displayTime);
    };
  }
}

class LwdTile extends LwdHTML {
  constructor(attrs = {}) {
    super("tile", attrs);

    this.enableActiveToogle = true;
    if (attrs.enableActiveToogle != undefined)
      this.enableActiveToogle = attrs.enableActiveToogle;

    this.isActive = () => this.classList.contains("active");

    this.onclick = (event) => {
      if (this.enableActiveToogle) this.classList.toggle("active");
      if (this.onclickExtra) this.onclickExtra(event);
    };

    this.__defineSetter__(
      "onclick",
      (onclick) => (this.onclickExtra = onclick)
    );
  }
}

class LwdHashRouter {
  // static href = "";

  static parseLocationHash = () =>
    Object.fromEntries(
      location.hash
        .slice(1)
        .split("&")
        .map((h) => h.split("="))
        .filter(([key, ...value]) => !!key)
    );

  static stringifyLocationHash = (params) =>
    "#" +
    Object.entries(params)
      .map((p) => p.join("="))
      .join("&");

  static updateLocationHash = () =>
  (location.hash = Object.entries(LwdHashRouter.params)
    .map((p) => p.join("="))
    .join("&"));

  static params = LwdHashRouter.parseLocationHash();

  static get(key) {
    return LwdHashRouter.params[key]
      ? decodeURI(LwdHashRouter.params[key])
      : "";
  }

  static set(key, value) {
    // if (value) LwdHashRouter.params[key] = value;
    // else delete LwdHashRouter.params[key];

    // LwdHashRouter.updateLocationHash();

    if (value) {
      location.hash = Object.entries({ ...LwdHashRouter.params, [key]: value })
        .map((p) => p.join("="))
        .join("&");
    } else delete LwdHashRouter.params[key];
  }

  static delete(key) {
    delete LwdHashRouter.params[key];
    LwdHashRouter.updateLocationHash();
  }

  static clear() {
    LwdHashRouter.params = { href: LwdHashRouter.params.href };
    LwdHashRouter.updateLocationHash();
  }

  static storeAndDelete(key) {
    let value = LwdHashRouter.get(key);
    if (value != undefined && value != "") {
      localStorage.setItem(key, value);
      LwdHashRouter.delete(key);
      console.log("LwdHashRouter.storeAndDelete", key);
      return value;
    }
  }

  static hideAllPages() {
    document.querySelectorAll("page").forEach((page) => (page.hidden = true));
  }

  static displayPage(href) {
    LwdHashRouter.hideAllPages();
    let page = document.querySelector(`page[href='${href}']`);
    console.log("displayPage", href, page);
    if (page) page.hidden = false;
    if (page) page.onRender();
    // LwdHashRouter.href = href;
    // LwdHashRouter.set("href", href);
  }

  static locationHashDiffParams() {
    return (
      JSON.stringify(LwdHashRouter.params) !==
      JSON.stringify(LwdHashRouter.parseLocationHash())
    );
  }

  static refresh() {
    if (LwdHashRouter.locationHashDiffParams())
      LwdHashRouter.params = LwdHashRouter.parseLocationHash();

    if (LwdHashRouter.get("href"))
      LwdHashRouter.displayPage(LwdHashRouter.get("href"));
  }

  // pagesDefinitions = [{ href, onCreate, onRender }]
  static createPages(
    pagesDefinitions,
    funcCreatePage = (params) => new LwdPage({ hidden: true, ...params })
  ) {
    pagesDefinitions.forEach((params) => {
      document.body.append(funcCreatePage(params));
      params.onCreate();
    });
    LwdHashRouter.displayPage(LwdHashRouter.get("href"));
  }
}
LwdHashRouter.refresh();
addEventListener("hashchange", LwdHashRouter.refresh);

const swipeUp = new CustomEvent("swipeup", {
  detail: { name: "cat" },
  bubbles: true,
});
const swipeDown = new CustomEvent("swipedown", {
  detail: { name: "cat" },
  bubbles: true,
});
const swipeLeft = new CustomEvent("swipeleft", {
  detail: { name: "cat" },
  bubbles: true,
});
const swipeRight = new CustomEvent("swiperight", {
  detail: { name: "cat" },
  bubbles: true,
});

var touchX, touchY, multiTouch;
document.addEventListener("touchstart", (e) => {
  settingsPage.append(
    new LwdP({
      textContent: `\n\n touchstart ${JSON.stringify(
        e.touches
      )}\n${JSON.stringify({ ...e.changedTouches })}`,
    })
  );
  touchX = e.changedTouches[0].clientX;
  touchY = e.changedTouches[0].clientY;
  multiTouch = e.touches.length > 1; // started touch but was already touching
});

document.addEventListener("touchend", (e) => {
  console.log(e.touches, e.changedTouches, e);

  settingsPage.append(
    new LwdP({
      textContent: `\n\n touchend ${JSON.stringify(
        e.touches
      )}\n${JSON.stringify({ ...e.changedTouches })}`,
    })
  );
  if (e.touches.length > 0) console.log("still touching screen");
  if (multiTouch) console.log("finished multi touch");
  if (e.touches.length > 0) return; // still touching screen
  if (multiTouch) return (multiTouch = undefined); // finished multi touch

  let deltaX = e.changedTouches[0].clientX - touchX || 0.0001;
  let deltaY = e.changedTouches[0].clientY - touchY || 0.0001;
  let target = e.changedTouches[0].target;

  if (
    Math.abs(deltaX / document.body.clientWidth) < 0.08 &&
    Math.abs(deltaY / document.body.clientHeight) < 0.08
  )
    return;
  console.log("yay 713");

  if (Math.abs(deltaY / deltaX) > 1.2) {
    // vertical
    if (deltaY > 0) target.dispatchEvent(swipeDown);
    else target.dispatchEvent(swipeUp);
  } else if (Math.abs(deltaX / deltaY) > 1.2) {
    // horizontal
    if (deltaX > 0) target.dispatchEvent(swipeRight);
    else target.dispatchEvent(swipeLeft);
  }
});
