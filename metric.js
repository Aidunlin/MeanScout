class Metric {
  constructor(name = "") {
    this.name = name;
    this.value = null;
    this.element = document.createElement("div");
  }
}

class ToggleMetric extends Metric {
  constructor(name = "Toggle") {
    super(name);
    this.reset();
  }
  reset() {
    this.element.innerHTML = "";
    this.button = document.createElement("button");
    this.button.innerHTML = `<i class='square-empty'></i> ${this.name}`;
    this.button.onclick = () => this.change();
    this.element.append(this.button);
    this.value = false;
  }
  change() {
    this.button.innerHTML = `<i class="square-${this.value ? "empty" : "checked"}"></i> ${this.name}`;
    this.value = !this.value;
    refreshIcons(this.element);
  }
}

class NumberMetric extends Metric {
  constructor(name = "Number") {
    super(name);
    this.reset();
  }
  reset() {
    this.element.innerHTML = this.name;
    this.input = document.createElement("input");
    this.input.classList.add("number");
    this.input.type = "number";
    this.input.value = 0;
    this.input.min = 0;
    this.input.max = 99;
    this.input.onchange = () => this.change();
    this.element.append(this.input);
    this.value = 0;
  }
  change() {
    this.value = this.input.value;
  }
}

class SelectMetric extends Metric {
  constructor(name = "Select", values = []) {
    super(name);
    this.values = values;
    this.reset();
  }
  reset() {
    this.element.innerHTML = this.name;
    this.select = document.createElement("select");
    this.select.onchange = () => this.change();
    for (let value of this.values) {
      this.select.innerHTML += `<option value="${value}">${value}</option>`;
    }
    this.element.append(this.select);
    this.value = this.values[0];
  }
  change() {
    this.value = this.select.value;
  }
}

class TextMetric extends Metric {
  constructor(name = "Text", tip = "") {
    super(name);
    this.tip = tip;
    this.reset();
  }
  reset() {
    this.element.innerHTML = this.name;
    this.element.style.width = "100%";
    this.input = document.createElement("input");
    this.input.placeholder = this.tip;
    this.input.oninput = () => this.change();
    this.element.append(this.input);
    this.value = "";
  }
  change() {
    this.value = this.input.value.replace('"', "'");
  }
}

class RatingMetric extends Metric {
  constructor(name = "Rating") {
    super(name);
    this.reset();
  }
  reset() {
    this.element.innerHTML = this.name;
    this.ratingBar = document.createElement("div");
    this.ratingBar.classList.add("flex");
    for (let i = 0; i < 5; i++) {
      let star = document.createElement("button");
      star.classList.add("star");
      star.innerHTML = "<i class='star-empty'></i>";
      star.onclick = () => this.change(i);
      this.ratingBar.append(star);
    }
    this.element.append(this.ratingBar);
    this.value = 0;
  }
  change(newValue) {
    if (newValue == 0 && this.value == 1) newValue = -1;
    for (let i = 0; i < 5; i++) {
      this.ratingBar.children[i].innerHTML = `<i class='star-${newValue < i ? "empty" : "filled"}'></i>`;
    }
    this.value = newValue + 1;
    refreshIcons(this.element);
  }
}