// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

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
  let values = `${$('#team').val()};${$('#match').val()};${absent ? '1' : '0'};`;
  let emptyReq = false;
  $.each(gameMetrics, (_i, metric) => {
    if (metric.required && !metric.value) {
      alert(`Please enter a value for ${metric.name}!`);
      emptyReq = true;
    }
    values += metric.value + ';';
  });
  if (emptyReq) return;
  if (!confirm('Confirm save?')) return;
  let prev = localStorage.getItem('surveys');
  localStorage.setItem('surveys', `${prev || ''}${values}\n`);
  
  $('#team').val('').focus();
  matchCount = parseInt($('#match').val()) + 1;
  $('#match').val(matchCount);
  $('#game-data').show();
  $('#absent').removeClass(`w3-${theme}`);
  absent = false;
  $.each(gameMetrics, (_i, metric) => {
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
function download(ask=true) {
  if (ask) {
    if (!confirm('Confirm download?')) return;
  }
  let a = document.createElement('a');
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(localStorage.getItem('surveys'))}`;
  a.download = `${selTemp} Surveys.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  localStorage.setItem('surveys', '');
}