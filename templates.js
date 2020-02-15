// 2471's current default template
let defaultTemplate = { name: 'FRC 2020 (2471)', values: [
  { name: 'Passed Line', type: 'toggle' },
  { name: 'AUTO Bottom Port', type: 'number' },
  { name: 'AUTO Outer Port', type: 'number' },
  { name: 'AUTO Inner Port', type: 'number' },
  { name: 'TELE Bottom Port', type: 'number' },
  { name: 'TELE Outer Port', type: 'number' },
  { name: 'TELE Inner Port', type: 'number' },
  { name: 'Rotation Control', type: 'toggle' },
  { name: 'Position Control', type: 'toggle' },
  { name: 'Endgame', type: 'select', values: ['None', 'Park', 'Hang'] },
  { name: 'Primary Role', type: 'select', values: ['None', 'Role 1', 'Role 2'] },
  { name: 'Secondary Role', type: 'select', values: ['None', 'Role 1', 'Role 2'] },
  { name: 'Penalty Card', type: 'select', values: ['None', 'Yellow', 'Red'] },
  { name: 'Disabled', type: 'toggle' },
  { name: 'Disqualified', type: 'toggle' },
  { name: 'Drive Rating', type: 'select', values: ['Bad', 'Ok', 'Great'] },
  { name: 'Co-op Rating', type: 'select', values: ['Bad', 'Ok', 'Great'] },
  { name: 'Defense Rating', type: 'select', values: ['Bad', 'Ok', 'Great'] },
  { name: 'Comment(s)', type: 'text' },
  { name: 'Breakdown', type: 'text' }
]};
let templates = [];
let gameMetrics = [];
let selTemp;

if (localStorage.getItem('templates')) {
  templates = JSON.parse(localStorage.getItem('templates'));
}

// Populate template picker with template options, select previously selected template
$('#opt-temp').append(new Option(defaultTemplate.name, defaultTemplate.name));
let isCustomSel = false;
$.each(templates, (i, template) => {
  $('#opt-temp').prepend(new Option(template.name, template.name));
  if (template.selected) {
    selTemp = template.name;
    isCustomSel = true;
    loadTemplate(template.values);
    $('#opt-temp').val(selTemp);
    $('#opt-temp-text').val(JSON.stringify(template));
  }
});
if (!isCustomSel) {
  selTemp = defaultTemplate.name;
  loadTemplate(defaultTemplate.values);
  $('#opt-temp').val(selTemp);
  $('#opt-temp-text').val(JSON.stringify(defaultTemplate));
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
      selTemp = template.name;
      isCustomSel = true;
      template.selected = true;
      loadTemplate(template.values);
      setLoc(loc);
      $('#opt-temp-text').val(JSON.stringify(template));
    }
  });
  if (!isCustomSel) {
    selTemp = defaultTemplate.name;
    loadTemplate(defaultTemplate.values);
    $('#opt-temp').val(selTemp);
    $('#opt-temp-text').val(JSON.stringify(defaultTemplate));
    setLoc(loc);
  }
  localStorage.setItem('templates', JSON.stringify(templates));
}
$('#opt-temp').change(() => {
  setTemplate();
});

// Create and select new template from JSON text
$('#opt-temp-add').click(() => {
  if ($('#opt-temp-text').val()) {
    let newTemp = JSON.parse($('#opt-temp-text').val());
    if (newTemp instanceof Array) newTemp = newTemp[0];
    let isDup = false;
    $.each(templates, (_i, template) => {
      if (newTemp.name == template.name && JSON.stringify(newTemp.values) == JSON.stringify(template.values)) isDup = true;
    });
    if (isDup) { alert('This template already exists!'); return; }
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
        location.reload();
      }
    }
  }
});

// Managing scouting metric value changes
function toggle(i) {
  gameMetrics[i].element.toggleClass(`w3-${theme}`);
  gameMetrics[i].value = !gameMetrics[i].value;
}
function changeText(i) {
  gameMetrics[i].value = gameMetrics[i].element.children('input').val().replace(';', ' ');
}
function crement(i, way) {
  if (way == 'inc' && gameMetrics[i].value < (gameMetrics[i].max || Infinity)) gameMetrics[i].value++;
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
  let prevType, prevDiv, newMetric, newDiv, metricObj;
  $.each(t, (i, metric) => {
    metricObj = { name: metric.name };
    newDiv = document.createElement('div');
    if (metric.type == 'toggle') {
      newDiv.classList.add('w3-container');
      newMetric = document.createElement('button');
      newMetric.classList.add('w3-button', 'w3-border', 'w3-ripple', 'w3-margin-right', 'w3-margin-bottom');
      newMetric.appendChild(document.createTextNode(metric.name));
      newMetric.onclick = () => {toggle(i)};
      metricObj.value = false;
    
    } else if (metric.type == 'text') {
      newDiv.classList.add('w3-row-padding');
      newMetric = document.createElement('label');
      newMetric.classList.add('w3-half', 'w3-margin-bottom');
      newMetric.appendChild(document.createTextNode(metric.name));
      let input = document.createElement('input');
      input.classList.add('w3-input', 'w3-black');
      input.placeholder = metric.tip ? metric.tip : '';
      input.onchange = () => {changeText(i)};
      newMetric.appendChild(input);
      metricObj.value = '';
    
    } else if (metric.type == 'number') {
      newDiv.classList.add('w3-container');
      newMetric = document.createElement('div');
      newMetric.classList.add('w3-show-inline-block', 'w3-margin-right', 'w3-margin-bottom');
      newMetric.appendChild(document.createTextNode(metric.name));
      newMetric.appendChild(document.createElement('br'));
      let incBtn = document.createElement('button');
      incBtn.classList.add('inc', 'w3-button', 'w3-border', 'w3-ripple');
      incBtn.style.width = '6.5ch';
      incBtn.onclick = () => {crement(i, 'inc')};
      incBtn.appendChild(document.createTextNode('0'));
      let decBtn = document.createElement('button');
      decBtn.classList.add('dec', 'w3-button', 'w3-border', 'w3-ripple');
      decBtn.onclick = () => {crement(i, 'dec')};
      decBtn.appendChild(document.createTextNode('-'));
      newMetric.appendChild(incBtn);
      newMetric.appendChild(document.createTextNode(' '));
      newMetric.appendChild(decBtn);
      metricObj.max = metric.max;
      metricObj.value = 0;
    
    } else if (metric.type == 'select') {
      newDiv.classList.add('w3-row-padding');
      newMetric = document.createElement('label');
      newMetric.classList.add('w3-third', 'w3-margin-bottom');
      newMetric.appendChild(document.createTextNode(metric.name));
      let select = document.createElement('select');
      select.classList.add('w3-select', 'w3-black');
      select.onchange = () => {changeSelect(index)};
      $.each(metric.values, (index, selValue) => {
        let newSel = document.createElement('option');
        newSel.value = index;
        newSel.appendChild(document.createTextNode(selValue));
        select.appendChild(newSel);
      });
      newMetric.appendChild(select);
      metricObj.value = 0;
    }

    if (prevType == metric.type && !metric.newline) {
      prevDiv.appendChild(newMetric);
    } else {
      newDiv.appendChild(newMetric);
      document.getElementById('game-data').appendChild(newDiv);
      prevDiv = newDiv;
    }
    metricObj.element = $(newMetric);
    metricObj.type = metric.type;
    prevType = metric.type;
    gameMetrics.push(metricObj);
  });
}