// 2471's current default template
let defaultTemplate = { name: 'FRC 2020 (2471)', values: [
  { name: 'Passed Line', type: 'toggle' },
  { name: 'AUTO Bottom', type: 'number', newline: true },
  { name: 'AUTO Outer', type: 'number' },
  { name: 'AUTO Inner', type: 'number' },
  { name: 'TELE Bottom', type: 'number', newline: true },
  { name: 'TELE Outer', type: 'number' },
  { name: 'TELE Inner', type: 'number' },
  { name: 'Rotation Control', type: 'toggle', newline: true },
  { name: 'Position Control', type: 'toggle' },
  { name: 'Endgame', type: 'select', values: ['None', 'Park', 'Hang'], newline: true },
  { name: 'Penalty Card', type: 'select', values: ['None', 'Yellow', 'Red'] },
  { name: 'Primary Role', type: 'select', values: ['None', 'Role 1', 'Role 2'] },
  { name: 'Secondary Role', type: 'select', values: ['None', 'Role 1', 'Role 2'] },
  { name: 'Disabled', type: 'toggle', newline: true },
  { name: 'Disqualified', type: 'toggle' },
  { name: 'Drive Rating', type: 'select', values: ['Bad', 'Ok', 'Great'], newline: true },
  { name: 'Co-op Rating', type: 'select', values: ['Bad', 'Ok', 'Great'] },
  { name: 'Defense Rating', type: 'select', values: ['Bad', 'Ok', 'Great'] },
  { name: 'Comment(s)', type: 'text', newline: true },
  { name: 'Breakdown', type: 'text' }
]};
let templates = [];
let gameMetrics = [];
let currentTemp;

if (localStorage.getItem('templates')) {
  templates = JSON.parse(localStorage.getItem('templates'));
}

// Populate template picker with template options, select previously selected template
$('#opt-temp').append(new Option(defaultTemplate.name, defaultTemplate.name));
let isCustomSel = false;
$.each(templates, (i, template) => {
  $('#opt-temp').prepend(new Option(template.name, template.name));
  if (template.selected) {
    currentTemp = template;
    isCustomSel = true;
    loadTemplate(template.values);
    $('#opt-temp').val(currentTemp.name);
    $('#nav-temp').html(currentTemp.name);
  }
});
if (!isCustomSel) {
  currentTemp = defaultTemplate;
  loadTemplate(defaultTemplate.values);
  $('#opt-temp').val(currentTemp.name);
  $('#nav-temp').html(currentTemp.name);
}
localStorage.setItem('templates', JSON.stringify(templates));

// Change to new template
function setTemplate() {
  if (localStorage.getItem('surveys')) {
    if (confirm('There are saved surveys from another template. Download them to switch templates?')) download(false);
    else return;
  }
  let isCustomSel = false;
  $.each(templates, (i, template) => {
    template.selected = false;
    if ($('#opt-temp').val() == template.name) {
      currentTemp = template;
      isCustomSel = true;
      template.selected = true;
      loadTemplate(template.values);
      setLoc(loc);
      $('#nav-temp').html(currentTemp.name);
    }
  });
  if (!isCustomSel) {
    currentTemp = defaultTemplate;
    loadTemplate(defaultTemplate.values);
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
  let tempInput = $('<input>');
  $('body').append(tempInput);
  tempInput.attr('value', JSON.stringify(currentTemp));
  tempInput.select();
  document.execCommand('copy');
  $('body').remove(tempInput);
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
    if (newTemp.name && newTemp.values) {
      $.each(newTemp.values, (_i, value) => {
        if (!value.name) error = true;
        else if (value.type == 'number') error = value.max < 1;
        else if (value.type == 'select') error = !value.values;
        else if (value.type != 'toggle' && value.type != 'text') error = true;
      });
    } else error = true;
    if (error) {
      alert('Invalid JSON/template! Please try again.');
      return;
    }
    templates.unshift(newTemp);
    $('#opt-temp').prepend(new Option(newTemp.name, newTemp.name));
    $('#opt-temp').val(newTemp.name);
    setTemplate();
  }
});

// ;D
$('#opt-temp-reset').click(() => {
  if (confirm('This will remove all custom templates created. Are you sure?')) {
    if (confirm('No, seriously, you will not be able to undo this action. Are you sure?')) {
      if (['debug', 'I am completely sure'].includes(prompt('Type "I am completely sure" to reset templates'))) {
        localStorage.removeItem('templates');
        skipWarning = null;
        location.reload();
      }
    }
  }
});

// Managing scouting metric value changes
function toggle(i) {
  gameMetrics[i].element.children('button').toggleClass(`w3-${theme}`);
  gameMetrics[i].value = !gameMetrics[i].value;
}
function changeText(i) {
  gameMetrics[i].value = gameMetrics[i].element.children('input').val().replace(';', ' ');
}
function crement(i, way) {
  if (way == 'inc' && gameMetrics[i].value < gameMetrics[i].max) gameMetrics[i].value++;
  else if (way == 'dec' && gameMetrics[i].value > 0) gameMetrics[i].value--;
  gameMetrics[i].element.children('.inc').html(gameMetrics[i].value);
}
function changeSelect(i) {
  gameMetrics[i].value = gameMetrics[i].element.children('select').val();
}

// Create scouting metrics (UI and state variables) from template
function loadTemplate(t) {
  $('#game-data').empty();
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
    newMetric.addClass('w3-show-inline-block w3-mobile w3-margin-right w3-margin-bottom');

    if (metric.newline) {
      newDiv = $('<div></div>');
      newDiv.addClass('w3-container');
      newDiv.append(newMetric);
      $('#game-data').append(prevDiv);
      prevDiv = newDiv;
    } else {
      prevDiv.append(newMetric);
    }

    metricObj.element = newMetric;
    metricObj.type = metric.type;
    gameMetrics.push(metricObj);
  });
  $('#game-data').append(prevDiv);
}