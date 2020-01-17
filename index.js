// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

// Template loader/setter/creator
let gameMetrics = [];
let defaults = [
  { name: 'FRC 2020', values: [/* To be completed */] },
  { name: 'BunnyBots 2019', selected: true, values: [
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
    ]
  }
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
  }
});
localStorage.setItem('templates', JSON.stringify(templates));
$('#opt-temp').change(() => {
  $.each(templates, (i, template) => {
    template.selected = false;
    if ($('#opt-temp').val() == template.name) {
      template.selected = true;
      loadTemplate(template.values);
      setLoc(loc);
    }
  });
});

// Location/theme setter
let theme = 'white';
let loc = 'None';
function setLoc(l) {
  $('input, textarea, button, select').removeClass(`outline-${theme}`);
  $('input, textarea, select, .title, #location').removeClass(`w3-text-${theme}`);
  $('.data-btn, #opt-temp-set').removeClass(`w3-hover-${theme} w3-text-${theme} w3-border-${theme}`);
  $.each(gameMetrics, (_i, metric) => {
    if (metric.type == 'toggle') metric.element.removeClass(`w3-${theme}`);
  });
  if (l.includes('Red')) theme = 'red';
  else if (l.includes('Blue')) theme = 'blue';
  else theme = 'white';
  loc = l;
  localStorage.setItem('location', l);
  $('#location').html(l);
  $('input, textarea, button, select').addClass(`outline-${theme}`);
  $('input, textarea, select, .title, #location').addClass(`w3-text-${theme}`);
  $.each(gameMetrics, (_i, metric) => {
    if (metric.type == 'toggle' && metric.value) metric.element.addClass(`w3-${theme}`);
  });
  $('.data-btn, #opt-temp-set').addClass(`w3-hover-${theme} w3-text-${theme} w3-border-${theme}`);
}
if (localStorage.getItem('location')) {
  setLoc(localStorage.getItem('location'));
  $('#opt-location').val(loc);
} else setLoc('None');
$('#opt-location').change(() => setLoc($('#opt-location option:checked').val()));

// Size setter
let size = 'medium';
function setSize(s) {
  $('body').removeClass(`w3-${size}`);
  $('nav').removeClass('w3-hide');
  size = s;
  localStorage.setItem('size', s);
  if (size == 'medium') {
    $('#title-img').height(22);
    $('main').css('margin-top', 54);
    $('.btn-spacer').height(21);
  } else if (size == 'large') {
    $('#title-img').height(27);
    $('main').css('margin-top', 60);
    $('.btn-spacer').height(26);
  } else if (size == 'xlarge') {
    $('#title-img').height(36);
    $('main').css('margin-top', 68);
    $('.btn-spacer').height(35);
  }
  $('body').addClass(`w3-${s}`);
}
if (localStorage.getItem('size')) {
  setSize(localStorage.getItem('size'));
  $('#opt-size').val(size);
} else setSize('medium');
$('#opt-size').change(() => setSize($('#opt-size').val()));

// Match/Absent stuff
let matchCount = 1;
let absent = false;
$('#absent').click(() => {
  $('#game-data').toggle();
  $('#absent').toggleClass(`w3-${theme}`);
  absent = !absent;
})

// Save data to localstorage and reset data
function save() {
  if (!/\d{1,4}[a-z]?/.test($('#team').val())) {
    alert('Please enter a proper team value!');
    $('#team').focus();
    return;
  } else if (!/\d{1,3}/.test($('#match').val()) || $('#match').val().length > 3) {
    alert('Please enter a proper match value!');
    $('#match').focus();
    return;
  }
  if (!confirm('Confirm save?')) return;
  let values = '';
  values += `${$('#team').val()};${$('#match').val()};${absent ? '1' : '0'};`;
  let emptyReq = false;
  $.each(gameMetrics, (index, metric) => {
    if (metric.required && metric.type != 'select' && !metric.value) {
      alert(`Please enter a value for ${metric.name}!`);
      emptyReq = true;
    }
    values += metric.value + ';';
  });
  if (emptyReq) return;
  let prev = localStorage.getItem('surveys');
  localStorage.setItem('surveys', `${prev || ''}${values}\n`);
  $('#team').val('').focus();
  matchCount = parseInt($('#match').val()) + 1;
  $('#match').val(matchCount);
  $('#game-data').show();
  $('#absent').removeClass(`w3-${theme}`);
  absent = false;
  $.each(gameMetrics, (index, metric) => {
    if (metric.type == 'toggle') {
      metric.value = false;
      metric.element.removeClass(`w3-${theme}`);
    } else if (metric.type == 'text') {
      metric.value = '';
      metric.element.children('input').val('');
    } else if (metric.type == 'number') {
      metric.value = 0;
      metric.element.children('.inc').html('0');
    } else if (metric.type == 'select') {
      metric.value = 0;
      metric.element.children('select').val(0);
    }
  });
}

// Download and clear saved surveys from localstorage
function download() {
  if (!confirm('Confirm download?')) return;
  let a = document.createElement('a');
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(localStorage.getItem('surveys'))}`;
  a.download = 'surveys.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  localStorage.setItem('surveys', '');
}

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
  if (way == 'inc' && metric.value < metric.max) metric.value++;
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
      input.placeholder = metric.tip;
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