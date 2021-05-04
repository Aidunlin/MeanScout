class Metric {
  constructor(metric = { name: "" }) {
    this.name = metric.name;
    this.value = null;
    this.element = document.createElement("div");
  }
}

class ToggleMetric extends Metric {
  constructor(metric = { name: "Toggle" }) {
    super(metric);
    this.reset();
  }
  reset(newValue = false) {
    this.value = newValue;
    this.element.innerHTML = "";
    this.button = document.createElement("button");
    this.button.innerHTML = `<i class="square-${newValue ? "checked" : "empty"}"></i> ${this.name}`;
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
}

class NumberMetric extends Metric {
  constructor(metric = { name: "Number" }) {
    super(metric);
    this.reset();
  }
  reset(newValue = 0) {
    this.value = newValue;
    this.element.innerHTML = this.name + "<br>";
    
    this.incButton = document.createElement("button");
    this.incButton.innerHTML = "&plus;";
    this.incButton.onclick = () => {
      this.update(parseInt(this.input.value) + 1);
      backupCurrentSurvey();
    }
    this.element.append(this.incButton);
    
    this.input = document.createElement("input");
    this.input.classList.add("number");
    this.input.type = "number";
    this.input.value = newValue;
    this.input.min = 0;
    this.input.max = 99;
    this.input.oninput = () => {
      this.update();
      backupCurrentSurvey();
    };
    this.element.append(this.input);
    
    this.decButton = document.createElement("button");
    this.decButton.innerHTML = "&minus;";
    this.decButton.onclick = () => {
      this.update(parseInt(this.input.value) - 1);
      backupCurrentSurvey();
    }
    this.element.append(this.decButton);
  }
  update(newValue = this.input.value) {
    newValue = Math.max(Math.min(newValue, 99), 0);
    this.value = newValue;
    this.input.value = newValue;
  }
}

class SelectMetric extends Metric {
  constructor(metric = { name: "Select", values: [] }) {
    super(metric);
    this.values = metric.values;
    this.reset();
  }
  reset() {
    this.value = this.values[0];
    this.element.innerHTML = this.name;
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
}

class TextMetric extends Metric {
  constructor(metric = { name: "Text", tip: "" }) {
    super(metric);
    this.tip = metric.tip;
    this.reset();
  }
  reset() {
    this.value = "";
    this.element.innerHTML = this.name;
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
}

class RatingMetric extends Metric {
  constructor(metric = { name: "Rating" }) {
    super(metric);
    this.reset();
  }
  reset(newValue = 0) {
    this.value = newValue;
    this.element.innerHTML = this.name;
    this.ratingBar = document.createElement("div");
    this.ratingBar.classList.add("flex");
    for (let i = 0; i < 5; i++) {
      const star = document.createElement("button");
      star.classList.add("star");
      star.innerHTML = `<i class="star-${newValue == i ? "filled" : "empty"}"></i>`;
      star.onclick = () => {
        this.update(i);
        backupCurrentSurvey();
      };
      this.ratingBar.append(star);
    }
    this.element.append(this.ratingBar);
  }
  update(newValue) {
    this.value = newValue;
    this.ratingBar.querySelectorAll(".star").forEach((star, i) => {
      star.querySelector("i").className = `star-${newValue < i ? "empty" : "filled"}`;
    });
    refreshIcons(this.element);
  }
}