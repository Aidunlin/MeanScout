// Template loader/setter/creator
let gameMetrics = [];
let defaults = [
  // { name: 'FRC 2020 (2471)', values: [] }, TO BE COMPLETED
  { name: 'BunnyBots 2019 (2471)', selected: true, values: [
    { name: 'Tub Supported', type: 'toggle' },
    { name: 'Spoiled', type: 'toggle' },
    { name: 'Bunnies', type: 'number', max: 6 },
    { name: 'Tubs', type: 'number', max: 8 },
    { name: 'Cubes', type: 'number', max: 120 },
    { name: 'Penalty', type: 'select', values: [ 'None', 'Yellow', 'Red' ]},
    { name: 'Drive', type: 'select', values: [ 'Terrible', 'Bad', 'Good', 'Great', 'Excellent' ]},
    { name: 'Defense', type: 'select', values: [ 'Terrible', 'Bad', 'Good', 'Great', 'Excellent' ]},
    { name: 'Comment', type: 'text', tip: 'Useful info', required: true },
    { name: 'Breakdown', type: 'text', tip: 'Reason if broke down' }
  ]}
];
let templates = [];
if (localStorage.getItem('templates')) {
  templates = JSON.parse(localStorage.getItem('templates'));
} else {
  templates = defaults;
}
$.each(templates, (i, template) => {
  $('#opt-temp').append(new Option(template.name, template.name));
  if (template.selected) {
    loadTemplate(template.values);
    $('#opt-temp').val(template.name);
    $('#opt-temp-text').val(JSON.stringify(template));
  }
});
localStorage.setItem('templates', JSON.stringify(templates));

function setTemplate() {
  if (localStorage.getItem('surveys')) {
    if (confirm('There are saved surveys from another template. Download them to switch templates?')) download(false);
    else return;
  }
  $.each(templates, (i, template) => {
    template.selected = false;
    if ($('#opt-temp').val() == template.name) {
      template.selected = true;
      loadTemplate(template.values);
      setLoc(loc);
    }
  });
  localStorage.setItem('templates', JSON.stringify(templates));
}

$('#opt-temp').change(() => {
  setTemplate();
  $('#opt-temp-text').val(JSON.stringify(templates.filter(t => {if (t.selected) return t})[0]));
});
$('#opt-temp-add').click(() => {
  if ($('#opt-temp-text').val()) {
    let newTemplate = JSON.parse($('#opt-temp-text').val());
    if (newTemplate instanceof Array) newTemplate = newTemplate[0];
    let isDup = false;
    $.each(templates, (_i, template) => {
      if (newTemplate.name == template.name && JSON.stringify(newTemplate.values) == JSON.stringify(template.values)) {
        isDup = true;
      }
    });
    if (isDup) {
      alert('This template already exists!');
      return;
    }
    newTemplate.selected = true;
    let error = false;
    if (newTemplate.name && newTemplate.values) {
      $.each(newTemplate.values, (_i, value) => {
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
    templates.unshift(newTemplate);
    $('#opt-temp').prepend(new Option(newTemplate.name, newTemplate.name));
    $('#opt-temp').val(newTemplate.name);
    setTemplate();
  }
});
$('#opt-temp-reset').click(() => {
  if (confirm('This will remove all custom templates created. Are you sure?')) {
    if (confirm('No, seriously, you will not be able to undo this action. Are you sure?')) {
      if (['debug', 'I understand that all templates will be removed and it is my fault if I do this on accident'].includes(
        prompt('Type "I understand that all templates will be removed and it is my fault if I do this on accident" to reset templates'))) {
        localStorage.removeItem('templates');
        location.reload();
      }
    }
  }
});

// Managing scouting metric value changes
function toggle(i) {
  let metric = gameMetrics[i];
  metric.element.toggleClass(`w3-${theme}`);
  metric.value = !metric.value;
}
function changeText(i) {
  let metric = gameMetrics[i];
  metric.value = metric.element.children('input').val();
}
function crement(i, way) {
  let metric = gameMetrics[i];
  if (way == 'inc' && metric.value < (metric.max ? metrix.max : Infinity)) metric.value++;
  else if (way == 'dec' && metric.value > 0) metric.value--;
  metric.element.children('.inc').html(metric.value);
}
function changeSelect(i) {
  let metric = gameMetrics[i];
  metric.value = metric.element.children('select').val();
}

// Load scouting metrics from template
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
    
    if (prevType == metric.type) {
      prevDiv.appendChild(newMetric);
    } else {
      newDiv.appendChild(newMetric);
      document.getElementById('game-data').appendChild(newDiv);
      prevDiv = newDiv;
    }
    metricObj.element = $(newMetric);
    metricObj.type = metric.type;
    metricObj.required = metric.required;
    prevType = metric.type;
    gameMetrics.push(metricObj);
  });
}