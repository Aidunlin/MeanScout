// After creating a new metric, don't forget to add it to `metricTypes`, the example template, and the README.

/** A toggleable button. Value is a boolean. */
class ToggleMetric {
  constructor(metric = { name: "Toggle" }) {
    this.name = metric.name;
    this.value = false;
    this.element = document.createElement("div");
    this.toggle = document.createElement("button");
    this.toggle.innerHTML = `<i class="square-empty text-icon"></i>${this.name}`;
    this.toggle.onclick = () => {
      this.update();
      backupSurvey();
    };
    this.element.append(this.toggle);
  }

  update(newValue = !this.value) {
    this.value = newValue;
    this.toggle.innerHTML = `<i class="square-${newValue ? "checked" : "empty"} text-icon"></i>${this.name}`;
    refreshIcons(this.toggle);
  }

  reset() {
    this.update(false);
  }
}

/** A number input with increment/decrement buttons. Value is an integer. */
class NumberMetric {
  constructor(metric = { name: "Number" }) {
    this.name = metric.name;
    this.value = 0;
    this.element = document.createElement("div");
    this.element.innerHTML = this.name + "<br>";
    this.number = document.createElement("input");
    this.number.classList.add("number");
    this.number.type = "number";
    this.number.value = 0;
    this.number.pattern = "[0-9]*";
    this.number.oninput = () => {
      this.update();
      backupSurvey();
    };
    this.incrementor = this.createCrementor("plus", 1);
    this.decrementor = this.createCrementor("minus", -1);
    this.element.append(this.incrementor, this.number, this.decrementor);
  }

  createCrementor(text = "", dir = 0) {
    let crementor = document.createElement("button");
    crementor.innerHTML = `<i class="${text}"></i>`;
    crementor.onclick = () => {
      if (!this.number.value) this.number.value = 0;
      this.update(parseInt(this.number.value) + dir);
      backupSurvey();
    };
    return crementor;
  }

  update(newValue = this.number.value) {
    this.value = newValue;
    this.number.value = newValue;
  }

  reset() {
    this.update(0);
  }
}

/**
 * A dropdown selector. Value is a string (selected option).
 * There must be an array of string `values` to create options for the selector.
 */
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
      backupSurvey();
    };
    this.values.forEach(value => {
      this.select.innerHTML += `<option value="${value}">${value}</opion>`;
    });
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

/**
 * A text input. Value is a string.
 * Setting a `tip` value will add a placeholder within the input field.
 */
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
      backupSurvey();
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

/** A star rating bar. Value is a number (0-4). */
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
        backupSurvey();
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
    refreshIcons(this.ratingBar);
  }

  reset() {
    this.update();
  }
}

/** A number input with timing controls. Value is a decimal. */
class TimerMetric {
  constructor(metric = { name: "Timer" }) {
    this.name = metric.name;
    this.value = 0;
    this.running = false;
    this.interval = null;
    this.element = document.createElement("div");
    this.element.innerHTML = this.name + "<br>";
    this.number = document.createElement("input");
    this.number.classList.add("number");
    this.number.type = "number";
    this.number.value = 0;
    this.number.oninput = () => {
      this.update();
      backupSurvey();
    }
    this.toggleBtn = this.createButton(`<i class="play"></i>`);
    this.toggleBtn.onclick = () => this.toggle();
    this.stopBtn = this.createButton(`<i class="stop"></i>`);
    this.stopBtn.onclick = () => this.stop();
    this.element.append(this.toggleBtn, this.number, this.stopBtn);
  }

  createButton(text) {
    let button = document.createElement("button");
    button.innerHTML = text;
    return button;
  }

  toggle() {
    if (this.running) {
      this.running = false;
      clearInterval(this.interval);
      this.toggleBtn.innerHTML = `<i class="play"></i>`;
    } else {
      this.running = true;
      this.interval = setInterval(() => {
        if (this.running) {
          this.update(parseFloat(this.value) + 0.1);
          this.number.value = parseFloat(this.number.value).toFixed(1);
          backupSurvey();
        }
      }, 100);
      this.toggleBtn.innerHTML = `<i class="pause"></i>`;
    }
    refreshIcons(this.toggleBtn);
  }

  stop() {
    if (this.running) {
      this.toggle();
    }
    this.update(0);
    backupSurvey();
  }

  update(newValue = this.number.value) {
    this.value = newValue;
    this.number.value = newValue;
  }

  reset() {
    this.update(0);
    this.stop();
  }
}