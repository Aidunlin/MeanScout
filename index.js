// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

$('.data-btn').addClass('button border-bottom round ripple mobile');
let theme = 'white';
let loc = 'None';
let matchCount = 1;
let absent = false;
let skipWarning = false;

/**
 * Sets location and changes theme colors
 * @param {string} newLoc Name of location
 */
function setLoc(newLoc) {
  $('input, button, select').removeClass(`outline-${theme}`);
  $('input, .inc, select, #title, #nav-loc, .star, .fa-check-square').removeClass(`text-${theme}`);
  $('.data-btn').removeClass(`text-${theme} border-${theme}`);
  $('#absent i').removeClass('far fas');
  $.each(gameMetrics, (_i, metric) => {
    metric.element.children('i').removeClass('far fas');
  });
  if (newLoc.includes('Red')) theme = 'red';
  else if (newLoc.includes('Blue')) theme = 'blue';
  else theme = 'white';
  loc = newLoc;
  localStorage.setItem('location', newLoc);
  $('#nav-loc').html(newLoc);
  $('input, button, select').addClass(`outline-${theme}`);
  $('input, .inc, select, #title, #nav-loc, .star, .fa-check-square').addClass(`text-${theme}`);
  $('.data-btn').addClass(`text-${theme} border-${theme}`);
  $('#absent i').addClass(absent ? 'fas' : 'far');
  $.each(gameMetrics, (_i, metric) => {
    if (metric.type == 'toggle') metric.element.children('i').addClass(metric.value ? 'fas' : 'far');
  });
}
if (localStorage.getItem('location')) {
  setLoc(localStorage.getItem('location'));
  $('#opt-loc').val(loc);
} else setLoc('None');
$('#opt-loc').change(() => setLoc($('#opt-loc').val()));

// Absent stuff
$('#absent').click(() => {
  $('#metrics').toggle();
  $('#absent i').toggleClass('far fas');
  absent = !absent;
})

// Options toggle
$('#opt-toggle').click(() => {
  $('#options').toggleClass('hide');
});

window.onbeforeunload = () => {return skipWarning};

/** Saves current survey to localstorage and reset metrics */
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
  let values = `${$('#team').val()};${$('#match').val()};${absent};`;
  $.each(gameMetrics, (_i, metric) => {
    if (metric.type == 'text') values += metric.value.replace(';', ' ') + ';';
    else values += metric.value + ';';
  });
  if (!confirm('Confirm save?')) return;
  let prev = localStorage.getItem('surveys');
  localStorage.setItem('surveys', `${prev || ''}${values}\n`);
  
  $('#team').val('').focus();
  matchCount = parseInt($('#match').val()) + 1;
  $('#match').val(matchCount);
  $('#metrics').show();
  $('#absent').removeClass(theme);
  absent = false;
  $.each(gameMetrics, (_i, metric) => {
    if (metric.type == 'toggle') {
      metric.value = false;
      metric.element.find('i').removeClass('fas').addClass('far');
    } else if (metric.type == 'text') {
      metric.value = '';
      metric.element.children('input').val('');
    } else if (metric.type == 'number') {
      metric.value = 0;
      metric.element.children('.inc').html('0');
    } else if (metric.type == 'select') {
      metric.value = 0;
      metric.element.children('select').val(0);
    } else if (metric.type == 'rating') {
      metric.value = 0;
      metric.element.find('.star').html('<i class="far fa-star"></i>');
    }
  });
}

/**
 * Downloads and clears saved surveys from localStorage
 * @param {boolean} ask If true, confirm download with user
 */
function download(ask=true) {
  if (ask) if (!confirm('Confirm download?')) return;
  let a = document.createElement('a');
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(localStorage.getItem('surveys'))}`;
  a.download = `${currentTemp.name} Surveys.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  localStorage.setItem('surveys', '');
}