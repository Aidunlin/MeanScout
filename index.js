// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(() => console.log('Service worker registered'));
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
  console.log(`Set location ${loc} and theme ${theme}`);
}
if (localStorage.getItem('location')) {
  setLoc(localStorage.getItem('location'));
  $('#opt-location').val(loc);
} else setLoc('None');
$('#opt-location').change(() => setLoc($('#opt-location option:checked').val()));

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
  $.each(gameMetrics, (_i, metric) => {
    values += metric.value + ';';
  });
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
  console.log('Save successful');
}

// Download and clear saved surveys from localstorage
function download(ask=true) {
  if (ask) if (!confirm('Confirm download?')) return;
  let a = document.createElement('a');
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(localStorage.getItem('surveys'))}`;
  a.download = `${selTemp} Surveys.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  localStorage.setItem('surveys', '');
  console.log(`Downloaded ${selTemp} Surveys.txt`);
}