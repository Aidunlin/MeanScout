window.onbeforeunload = () => { return true }

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
  })
}

$('.data-btn').addClass('button border-bottom ripple mobile')
let theme = 'white'
let loc = 'None'
let matchCount = 1
let absent = false

// Sets location and changes theme colors
function setLoc(newLoc) {
  $('input, .inc, select, #title, #nav-loc, .star, i').removeClass(`text-${theme}`)
  $('.data-btn').removeClass(`text-${theme}`)
  $('#absent i').removeClass('far fa-square fas fa-check-square')
  $.each(gameMetrics, (_i, metric) => {
    metric.element.children('i').removeClass('far fa-square fas fa-check-square')
  })
  if (newLoc.includes('Red')) {
    theme = 'red'
  } else if (newLoc.includes('Blue')) {
    theme = 'blue'
  } else {
    theme = 'white'
  }
  loc = newLoc
  localStorage.setItem('location', newLoc)
  $('#nav-loc').html(newLoc)
  $('input, .inc, select, #title, #nav-loc, .star, i').addClass(`text-${theme}`)
  $('.data-btn').addClass(`text-${theme}`)
  $('#absent i').addClass(absent ? 'fas fa-check-square' : 'far fa-square')
  $.each(gameMetrics, (_i, metric) => {
    if (metric.type == 'toggle') {
      metric.element.children('i').addClass(metric.value ? 'fas fa-check-square' : 'far fa-square')
    }
  })
}

setLoc(localStorage.getItem('location') || 'None')
$('#opt-loc').val(loc)

$('#opt-loc').change(() => {
  setLoc($('#opt-loc').val())
})

// Team, match value restrictions
$('#team, #match').keypress(e => {
  if (e.which != 8 && e.which != 0 && e.which < 48 || e.which > 57) {
    e.preventDefault()
  }
})
$('#suffix').keypress(e => {
  if (!'abcdefghijklmnopqrstuvwxyz'.includes(e.key.toLowerCase())) {
    e.preventDefault()
  } else {
    $('#suffix').val('')
  }
})
$('#team').on('input', () => {
  if ($('#team').val().length > 4) {
    $('#team').val($('#team').val().substring(0, 4))
  }
})
$('#suffix').on('input', () => {
  $('#suffix').val($('#suffix').val().toUpperCase())
  if ($('#suffix').val().length > 1) {
    $('#suffix').val($('#suffix').val().substring(0, 1))
  }
})
$('#match').on('input', () => {
  if ($('#match').val().length > 3) {
    $('#match').val($('#match').val().substring(0, 3))
  }
})

// Absent toggle
$('#absent').click(() => {
  $('#metrics').toggleClass('hide')
  $('#absent i').toggleClass('far fa-square fas fa-check-square')
  absent = !absent
})

// Options toggle
$('#opt-toggle').click(() => {
  $('#options').toggleClass('hide')
})

// Saves current survey to localstorage and reset metrics
function save() {
  if (!/\d{1,4}/.test($('#team').val())) {
    alert('Please enter a proper team value!')
    $('#team').focus()
    return
  }
  if (currentTemp.teams) {
    if (!currentTemp.teams.some(t => t == $('#team').val())) {
      alert('Unaccepted team value!')
      $('#team').focus()
      return
    }
  }
  if (!/\d{1,3}/.test($('#match').val()) || $('#match').val().length > 3) {
    alert('Please enter a proper match value!')
    $('#match').focus()
    return
  }
  let values = `${$('#team').val() + $('#suffix').val()},${$('#match').val()},${absent}`
  $.each(gameMetrics, (_i, metric) => {
    values += `,${metric.type == 'text' ? `"${metric.value.replace('"', "'")}"` : metric.value}`
  })

  if (!confirm('Confirm save?')) {
    return
  }
  let prev = localStorage.getItem('surveys')
  localStorage.setItem('surveys', `${prev || ''}${values}\n`)

  $('#team').val('').focus()
  $('#suffix').val('')
  matchCount = parseInt($('#match').val()) + 1
  $('#match').val(matchCount)
  if (absent) {
    $('#absent').click()
  }
  $.each(gameMetrics, (_i, metric) => {
    if (metric.type == 'toggle') {
      metric.element.find('i').removeClass('fas fa-check-square').addClass('far fa-square')
      metric.value = false
    } else if (metric.type == 'text') {
      metric.element.children('input').val('')
      metric.value = ''
    } else if (metric.type == 'number') {
      metric.element.children('.inc').html('0')
      metric.value = 0
    } else if (metric.type == 'select') {
      metric.element.children('select').val(0)
      metric.value = metric.element.find('select option:checked').html()
    } else if (metric.type == 'rating') {
      metric.element.find('.star').html('<i class="far fa-star"></i>')
      metric.value = 0
    }
  })
}

// Downloads and clears saved surveys from localStorage
function download(ask = true) {
  if (ask) {
    if (!confirm('Confirm download?')) {
      return
    }
  }
  let a = document.createElement('a')
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(localStorage.getItem('surveys'))}`
  a.download = `${currentTemp.name} Surveys.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  localStorage.setItem('surveys', '')
}
