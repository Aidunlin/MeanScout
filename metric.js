class ToggleMetric {
  constructor(metric = { name: "Toggle" }) {
    this.name = metric.name;
    this.value = false;
    this.element = document.createElement("div");
    this.button = document.createElement("button");
    this.button.innerHTML = `<i class="square-empty"></i> ${this.name}`;
    this.button.onclick = () => {
      this.update();
      backupCurrentSurvey();
    };
    this.element.append(this.button);
  }
  update(newValue = !this.value) {
    this.value = newValue;
    this.button.innerHTML = `<i class="square-${newValue ? "checked" : "empty"}"></i> ${this.name}`;
    refreshIcons(this.element);
  }
  reset() {
    this.update(false);
  }
}

class NumberMetric {
  constructor(metric = { name: "Number" }) {
    this.name = metric.name;
    this.value = 0;
    this.element = document.createElement("div");
    this.element.innerHTML = this.name + "<br>";
    this.input = document.createElement("input");
    this.input.classList.add("number");
    this.input.type = "number";
    this.input.value = 0;
    this.input.min = 0;
    this.input.max = 99;
    this.input.oninput = () => {
      this.update();
      backupCurrentSurvey();
    };
    this.element.append(this.createCrementor("&plus;", 1), this.input, this.createCrementor("&minus;", -1));
  }
  createCrementor(text = "", dir = 0) {
    let newButton = document.createElement("button");
    newButton.innerHTML = text;
    newButton.onclick = () => {
      this.update(parseInt(this.input.value) + dir);
      backupCurrentSurvey();
    }
    return newButton;
  }
  update(newValue = this.input.value) {
    newValue = Math.max(Math.min(newValue, 99), 0);
    this.value = newValue;
    this.input.value = newValue;
  }
  reset() {
    this.update(0);
  }
}

class SelectMetric {
  constructor(metric = { name: "Select", values: [] }) {
    this.name = metric.name;
    this.values = metric.values;
    this.value = this.values[0];
    this.element = document.createElement("div");
    this.element.innerHTML = this.name + "<br>";
    this.select = document.createElement("select");
    this.select.onchange = () => {
      this.update();
      backupCurrentSurvey();
    };
    this.values.forEach(value => this.select.innerHTML += `<option value="${value}">${value}</option>`);
    this.element.append(this.select);
  }
  update(newValue = this.select.value) {
    this.value = newValue;
    this.select.value = newValue;
  }
  reset() {
    this.update(this.values[0]);
  }
}

class TextMetric {
  constructor(metric = { name: "Text", tip: "" }) {
    this.name = metric.name;
    this.value = "";
    this.tip = metric.tip;
    this.element = document.createElement("div");
    this.element.innerHTML = this.name + "<br>";
    this.element.style.width = "100%";
    this.input = document.createElement("input");
    this.input.placeholder = this.tip;
    this.input.oninput = () => {
      this.update();
      backupCurrentSurvey();
    };
    this.element.append(this.input);
  }
  update(newValue = this.input.value.replace('"', "'")) {
    this.value = newValue;
    this.input.value = newValue;
  }
  reset() {
    this.update("");
  }
}

class RatingMetric {
  constructor(metric = { name: "Rating" }) {
    this.name = metric.name;
    this.value = 0;
    this.element = document.createElement("div");
    this.element.innerHTML = this.name + "<br>";
    this.ratingBar = document.createElement("div");
    this.ratingBar.classList.add("flex");
    for (let i = 0; i < 5; i++) {
      const star = document.createElement("button");
      star.classList.add("star");
      star.innerHTML = `<i class="star-${i == 0 ? "filled" : "empty"}"></i>`;
      star.onclick = () => {
        this.update(i);
        backupCurrentSurvey();
      };
      this.ratingBar.append(star);
    }
    this.element.append(this.ratingBar);
  }
  update(newValue = 0) {
    this.value = newValue;
    this.ratingBar.querySelectorAll(".star").forEach((star, i) => {
      star.querySelector("i").className = `star-${newValue < i ? "empty" : "filled"}`;
    });
    refreshIcons(this.element);
  }
  reset() {
    this.update();
  }
}