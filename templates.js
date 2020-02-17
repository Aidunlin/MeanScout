// 2471's current default template
let defaultTemplate = { name: 'FRC 2020 (2471)', metrics: [
  { name: 'Passed Line',      type: 'toggle', newline: 'Auto'                                            },
  { name: 'Bottom Port',      type: 'number', newline: true                                              },
  { name: 'Outer Port',       type: 'number'                                                             },
  { name: 'Inner Port',       type: 'number'                                                             },
  { name: 'Bottom Port',      type: 'number', newline: 'Tele-Op'                                         },
  { name: 'Outer Port',       type: 'number'                                                             },
  { name: 'Inner Port',       type: 'number'                                                             },
  { name: 'Rotation Control', type: 'toggle', newline: true                                              },
  { name: 'Position Control', type: 'toggle'                                                             },
  { name: 'Endgame',          type: 'select', newline: true,        values: ['None', 'Park', 'Hang']     },
  { name: 'Penalty Card',     type: 'select', newline: 'Post-Game', values: ['None', 'Yellow', 'Red']    },
  { name: 'Primary Role',     type: 'select',                       values: ['None', 'Role 1', 'Role 2'] },
  { name: 'Secondary Role',   type: 'select',                       values: ['None', 'Role 1', 'Role 2'] },
  { name: 'Disabled',         type: 'toggle', newline: true                                              },
  { name: 'Disqualified',     type: 'toggle'                                                             },
  { name: 'Drive Rating',     type: 'select', newline: true,        values: ['Bad', 'Ok', 'Great']       },
  { name: 'Co-op Rating',     type: 'select',                       values: ['Bad', 'Ok', 'Great']       },
  { name: 'Defense Rating',   type: 'select',                       values: ['Bad', 'Ok', 'Great']       },
  { name: 'Comment(s)',       type: 'text',   newline: true                                              },
  { name: 'Breakdown',        type: 'text'                                                               }
]};
let templates = [];
let gameMetrics = [];
let currentTemp;
let isCustomTemp = false;

if (localStorage.getItem('templates')) {
  templates = JSON.parse(localStorage.getItem('templates'));
}

// Populate template picker with template options, select previously selected template
$('#opt-temp').append(new Option(defaultTemplate.name, defaultTemplate.name));
$.each(templates, (i, template) => {
  $('#opt-temp').prepend(new Option(template.name, template.name));
  if (template.selected) {
    currentTemp = template;
    isCustomTemp = true;
    loadTemplate(template.metrics);
    $('#opt-temp').val(currentTemp.name);
    $('#nav-temp').html(currentTemp.name);
  }
});
if (!isCustomTemp) {
  currentTemp = defaultTemplate;
  loadTemplate(defaultTemplate.metrics);
  $('#opt-temp').val(currentTemp.name);
  $('#nav-temp').html(currentTemp.name);
}
localStorage.setItem('templates', JSON.stringify(templates));

/** Change to selected template */
function setTemplate() {
  if (localStorage.getItem('surveys')) {
    if (confirm('There are saved surveys from another template. Download them to switch templates?')) download(false);
    else return;
  }
  isCustomTemp = false;
  $.each(templates, (i, template) => {
    template.selected = false;
    if ($('#opt-temp').val() == template.name) {
      currentTemp = template;
      isCustomTemp = true;
      template.selected = true;
      loadTemplate(template.metrics);
      setLoc(loc);
      $('#nav-temp').html(currentTemp.name);
    }
  });
  if (!isCustomTemp) {
    currentTemp = defaultTemplate;
    loadTemplate(defaultTemplate.metrics);
    $('#opt-temp').val(currentTemp.name);
    $('#nav-temp').html(currentTemp.name);
    setLoc(loc);
  }
  localStorage.setItem('templates', JSON.stringify(templates));
}
$('#opt-temp').change(() => {
  setTemplate();
});

$('#opt-temp-copy').click(() => {
  let input = $('<input>');
  let tempToCopy = currentTemp;
  delete tempToCopy['selected'];
  $('body').append(input);
  input.attr('value', JSON.stringify(tempToCopy));
  input.select();
  document.execCommand('copy');
  $(input).remove();
  alert(`Copied ${currentTemp.name}`);
});

// Create and select new template from JSON text
$('#opt-temp-add').click(() => {
  let newTempPrompt = prompt('Type/paste new template:');
  if (newTempPrompt) {
    let newTemp = JSON.parse(newTempPrompt);
    if (newTemp instanceof Array) newTemp = newTemp[0];
    newTemp.selected = true;

    let error = false;
    $.each(templates, (_i, template) => {
      if (newTemp.name == template.name) error = "Template has same name";
    });
    if (newTemp.name == defaultTemplate.name) error = "Template has same name";
    if (newTemp.name && newTemp.metrics) {
      $.each(newTemp.metrics, (_i, metric) => {
        if (!metric.name) error = "Metric has no name";
        else if (metric.type == 'number' && metric.max < 1) error = "Max is less than one";
        else if (metric.type == 'select' && !metric.values) error = "Metric has no values";
        else if (!['number', 'select', 'toggle', 'text'].includes(metric.type)) error = "Unknown metric type";
      });
    } else error = "Template is invalid";
    if (error) {
      alert(`Could not add template! Error: ${error}`);
      return;
    }

    templates.unshift(newTemp);
    $('#opt-temp').prepend(new Option(newTemp.name, newTemp.name));
    $('#opt-temp').val(newTemp.name);
    setTemplate();
  }
});

$('#opt-temp-remove').click(() => {
  if (!isCustomTemp) { alert('The default template cannot be removed.'); return; }
  if (prompt(`Are you sure? Type '${currentTemp.name}' to remove the template`)) {
    $.each(templates, (i, template) => {
      if (template.name == currentTemp.name) {
        templates.splice(i, 1);
        return false;
      }
    });
    $('#opt-temp option:checked').remove();
    setTemplate();
    localStorage.setItem('templates', JSON.stringify(templates));
  }
});

/**
 * Toggle a button metric
 * @param {number} i Index of metric
 */
function toggle(i) {
  gameMetrics[i].element.children('button').toggleClass(`w3-${theme}`);
  gameMetrics[i].value = !gameMetrics[i].value;
}

/**
 * Update a text metric
 * @param {number} i Index of metric
 */
function changeText(i) {
  gameMetrics[i].value = gameMetrics[i].element.children('input').val().replace(';', ' ');
}

/**
 * Increment or decrement a number metric
 * @param {number} i Index of metric
 * @param {string} way Either 'inc' or 'dec'
 */
function crement(i, way) {
  if (way == 'inc' && gameMetrics[i].value < gameMetrics[i].max) gameMetrics[i].value++;
  else if (way == 'dec' && gameMetrics[i].value > 0) gameMetrics[i].value--;
  gameMetrics[i].element.children('.inc').html(gameMetrics[i].value);
}

/**
 * Update a select metric
 * @param {number} i Index of metric
 */
function changeSelect(i) {
  gameMetrics[i].value = gameMetrics[i].element.children('select').val();
}

/**
 * Create scouting metrics (UI and state variables) from template
 * @param {Object[]} t An array of metrics
 */
function loadTemplate(t) {
  $('#metrics').empty();
  gameMetrics = [];
  let metricObj, newMetric, prevDiv, newDiv;
  prevDiv = $('<div></div>');
  prevDiv.addClass('w3-container');
  $.each(t, (i, metric) => {
    metricObj = { name: metric.name };
    if (metric.type == 'toggle') {
      newMetric = $('<div></div>');
      
      let button = $('<button></button>');
      button.addClass('w3-button w3-mobile w3-border-bottom w3-round w3-ripple');
      button.append(metric.name);
      button.click(() => toggle(i));
      newMetric.append(button);
      metricObj.value = false;
    
    } else if (metric.type == 'text') {
      newMetric = $('<label></label>');
      newMetric.append(metric.name, '<br>');

      let input = $('<input>')
      input.addClass('w3-input w3-round w3-black');
      input.attr('placeholder', metric.tip ? metric.tip : metric.name);
      input.on('input', () => changeText(i));
      newMetric.append(input);
      metricObj.value = '';
    
    } else if (metric.type == 'number') {
      newMetric = $('<div></div>');
      newMetric.append(metric.name, '<br>');
      
      let incBtn = $('<button></button>');
      incBtn.addClass('inc w3-button w3-border-bottom w3-round w3-ripple');
      incBtn.css('width', '6.5ch');
      incBtn.click(() => crement(i, 'inc'));
      incBtn.append('0');
      let decBtn = $('<button></button>');
      decBtn.addClass('dec w3-button w3-border-bottom w3-round w3-ripple');
      decBtn.click(() => crement(i, 'dec'));
      decBtn.append('-');
      
      newMetric.append(incBtn, ' ', decBtn);
      metricObj.max = metric.max || 100;
      metricObj.value = 0;
    
    } else if (metric.type == 'select') {
      newMetric = $('<label></label>');
      newMetric.append(metric.name, '<br>');
      
      let select = $('<select></select>');
      select.addClass('w3-select w3-round w3-black');
      select.css('width', '100%');
      select.css('min-width', 'fit-content');
      select.on('change', () => changeSelect(i));
      $.each(metric.values, (index, selValue) => {
        let newSel = $('<option></option>');
        newSel.attr('value', index);
        newSel.html(selValue);
        select.append(newSel);
      });
      newMetric.append(select);
      metricObj.value = 0;
    }
    newMetric.addClass('w3-show-inline-block w3-mobile w3-margin-left w3-margin-bottom');

    if (metric.newline) {
      newDiv = $('<div></div>');
      newDiv.addClass('w3-container');
      if (metric.newline !== true) newDiv.append(metric.newline, '<br>');
      newDiv.append(newMetric);
      $('#metrics').append(prevDiv);
      prevDiv = newDiv;
    } else {
      prevDiv.append(newMetric);
    }

    metricObj.element = newMetric;
    metricObj.type = metric.type;
    gameMetrics.push(metricObj);
  });
  $('#metrics').append(prevDiv);
}