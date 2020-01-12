if ('serviceWorker' in navigator)
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));

let theme = 'white';
let loc = 'None';
function setLoc(l) {
  $('input, button, select').removeClass(`outline-${theme}`);
  $('input, select, .title, #location').removeClass(`w3-text-${theme}`);
  $('.data-btn').removeClass(`w3-hover-${theme} w3-text-${theme} w3-border-${theme}`);

  if (l.includes('Red')) theme = 'red';
  else if (l.includes('Blue')) theme = 'blue';
  else theme = 'white';
  loc = l;
  localStorage.setItem('location', l);

  $('#location').html(l);
  $('input, button, select').addClass(`outline-${theme}`);
  $('input, select, .title, #location').addClass(`w3-text-${theme}`);
  $('.data-btn').addClass(`w3-hover-${theme} w3-text-${theme} w3-border-${theme}`);
}

if (localStorage.getItem('location')) {
  setLoc(localStorage.getItem('location'));
  $('#opt-location').val(loc);
} else setLoc('None');
$('#opt-location').change(() => setLoc($('#opt-location option:checked').val()));

$('.crement-btn')
  .addClass('w3-button w3-border w3-ripple')
  .click((e) => crement(e.target.id));
$('.toggle-btn')
  .addClass('w3-button w3-border w3-ripple w3-margin-right w3-margin-bottom')
  .click((e) => toggle(e.target.id));

let size = 'medium';
function setSize(s) {
  $('body').removeClass(`w3-${size}`);
  size = s;
  localStorage.setItem('size', s);
  switch (size) {
    case 'medium':
      $('#title-img').height(22);
      $('main').css('margin-top', 54);
      $('.btn-spacer').height(21);
      break;
    case 'large':
      $('#title-img').height(27);
      $('main').css('margin-top', 60);
      $('.btn-spacer').height(26);
      break;
    case 'xlarge':
      $('#title-img').height(36);
      $('main').css('margin-top', 68);
      $('.btn-spacer').height(35);
      break;
  }
  $('body').addClass(`w3-${s}`);
}

if (localStorage.getItem('size')) {
  setSize(localStorage.getItem('size'));
  $('#opt-size').val(size);
} else setSize('medium');
$('#opt-size').change(() => setSize($('#opt-size').val()));

let matchCount = 1;
let absent = false;
let tubSup = false;
let bunSpl = false;
let bunCount = 0;
let tubCount = 0;
let cubCount = 0;

function toggle(thing, reset = false) {
  if (thing == 'absent') {
    if (reset) $('#game-data').show();
    else $('#game-data').toggle();
    absent = reset ? false : !absent;
  }
  if (thing == 'tubsup') tubSup = reset ? false : !tubSup;
  if (thing == 'bunspl') bunSpl = reset ? false : !bunSpl;
  if (reset) $('#' + thing).removeClass(`w3-${theme}`);
  else $('#' + thing).toggleClass(`w3-${theme}`);
}

function crement(btn) {
  if (btn == 'bun-inc' && bunCount < 6) bunCount++;
  if (btn == 'bun-dec' && bunCount > 0) bunCount--;
  if (btn == 'tub-inc' && tubCount < 8) tubCount++;
  if (btn == 'tub-dec' && tubCount > 0) tubCount--;
  if (btn == 'cub-inc' && cubCount < 120) cubCount++;
  if (btn == 'cub-dec' && cubCount > 0) cubCount--;
  $('#bun-inc').html(bunCount);
  $('#tub-inc').html(tubCount);
  $('#cub-inc').html(cubCount);
}

window.onload = () => {
  if (localStorage.getItem('temp-survey')) {
    let input = localStorage.getItem('temp-survey').split(';');
    $('#team').val(input[0]);
    $('#match').val((matchCount = input[1]));
    if (input[2] == '1') toggle('absent');
    if (input[3] == '1') toggle('tubsup');
    if (input[6] == '1') toggle('bunspl');
    $('#bun-inc').html((bunCount = input[4]));
    $('#tub-inc').html((tubCount = input[5]));
    $('#cub-inc').html((cubCount = input[7]));
    $('#penalty').prop('selectedIndex', input[8]);
    $('#drive').prop('selectedIndex', input[9]);
    $('#defense').prop('selectedIndex', input[10]);
    $('#comment').val(input[11]);
    $('#breakdown').val(input[12]);
  }
};

function getValuesStr() {
  let values = [$('#team').val(), $('#match').val(), absent];
  if (absent) values.push(0, 0, 0, 0, 0, 0, 0, 0, '', '');
  else
    values.push(
      tubSup,
      bunCount,
      tubCount,
      bunSpl,
      cubCount,
      $('#penalty').prop('selectedIndex'),
      $('#drive').prop('selectedIndex'),
      $('#defense').prop('selectedIndex'),
      $('#comment').val(),
      $('#breakdown').val()
    );
  let output = '';
  for (let value in values) {
    if (typeof values[value] == 'boolean') output += values[value] ? '1;' : '0;';
    else output += values[value] + ';';
  }
  return output + '\n';
}

window.onbeforeunload = () => localStorage.setItem('temp-survey', getValuesStr());

function save() {
  if (!/\d{1,4}[a-z]?/.test($('#team').val())) {
    alert('Please enter a proper team value!');
    $('#team').focus();
    return;
  } else if (!/\d{1,3}/.test($('#match').val()) || $('#match').val().length > 3) {
    alert('Please enter a proper match value!');
    $('#match').focus();
    return;
  } else if (!$('#comment').val() && !absent) {
    alert('Please enter a useful comment!');
    $('#comment').focus();
    return;
  }

  if (!confirm('Confirm save?')) return;

  let prev = localStorage.getItem('surveys');
  localStorage.setItem('surveys', (prev ? prev : '') + getValuesStr());

  $('#team')
    .val('')
    .focus();
  matchCount = $('#match').val() + 1;
  $('#match').val(matchCount);
  toggle('absent', true);
  toggle('tubsup', true);
  toggle('bunspl', true);
  $('#bun-inc').html((bunCount = 0));
  $('#tub-inc').html((tubCount = 0));
  $('#cub-inc').html((cubCount = 0));
  $('#penalty').prop('selectedIndex', 0);
  $('#drive').prop('selectedIndex', 0);
  $('#defense').prop('selectedIndex', 0);
  $('#comment').val('');
  $('#breakdown').val('');
}

function download() {
  if (!confirm('Confirm download?')) return;
  let a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.getItem('surveys'));
  a.download = 'surveys.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
