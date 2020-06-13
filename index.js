// Check if user wants to reload/close
window.onbeforeunload = () => {
  if (window.location.hostname.includes("aidunlin.codes")) {
    return true
  }
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.onload = () => {
    navigator.serviceWorker.register('./sw.js')
  }
}

$('.data-button').addClass('button border-bottom ripple mobile')
let theme = 'white'
let scoutLocation = 'None'
let matchCount = 1
let isAbsent = false

// Sets location and changes theme colors
function setLocation(newLocation) {
  $('input, .inc, select, #title, #nav-location, .star, i, svg').removeClass(`text-${theme}`)
  $('.data-button').removeClass(`text-${theme}`)
  $('#absent i').removeClass('far fa-square fas fa-check-square')
  $.each(gameMetrics, (_i, metric) => {
    metric.element.children('i').removeClass('far fa-square fas fa-check-square')
  })
  if (newLocation.includes('Red')) {
    theme = 'red'
  } else if (newLocation.includes('Blue')) {
    theme = 'blue'
  } else {
    theme = 'white'
  }
  scoutLocation = newLocation
  localStorage.setItem('location', newLocation)
  $('#nav-location').html(newLocation)
  $('input, .inc, select, #title, #nav-location, .star, i, svg').addClass(`text-${theme}`)
  $('.data-button').addClass(`text-${theme}`)
  $('#absent i').addClass(isAbsent ? 'fas fa-check-square' : 'far fa-square')
  $.each(gameMetrics, (_i, metric) => {
    if (metric.type == 'toggle') {
      metric.element.children('i').addClass(metric.value ? 'fas fa-check-square' : 'far fa-square')
    }
  })
}

setLocation(localStorage.getItem('location') || 'None')
$('#options-location').val(scoutLocation)

$('#options-location').change(() => {
  setLocation($('#options-location').val())
})

// Team, match value restrictions
$('#metric-team, #metric-match').keypress(event => {
  if (event.which != 8 && event.which != 0 && event.which < 48 || event.which > 57) {
    event.preventDefault()
  }
})
$('#metric-suffix').keypress(event => {
  if (!'abcdefghijklmnopqrstuvwxyz'.includes(event.key.toLowerCase())) {
    event.preventDefault()
  } else {
    $('#metric-suffix').val('')
  }
})
$('#metric-team').on('input', () => {
  if ($('#metric-team').val().length > 4) {
    $('#metric-team').val($('#metric-team').val().substring(0, 4))
  }
})
$('#metric-suffix').on('input', () => {
  $('#metric-suffix').val($('#metric-suffix').val().toUpperCase())
  if ($('#metric-suffix').val().length > 1) {
    $('#metric-suffix').val($('#metric-suffix').val().substring(0, 1))
  }
})
$('#metric-match').on('input', () => {
  if ($('#metric-match').val().length > 3) {
    $('#metric-match').val($('#metric-match').val().substring(0, 3))
  }
})

// Absent toggle
$('#metric-absent').click(() => {
  $('#metrics').toggleClass('hide')
  $('#metric-absent').empty()
  $('#metric-absent').append(`<i class='${isAbsent ? 'far fa-square' : 'fas fa-check-square'} text-${theme}'></i> Absent`)
  isAbsent = !isAbsent
})

// Options toggle
$('#options-toggle').click(() => {
  $('#options').toggleClass('hide')
})

// Saves current survey to localstorage and reset metrics
function saveSurvey() {
  if (!/\d{1,4}/.test($('#metric-team').val())) {
    alert('Please enter a proper team value!')
    $('#metric-team').focus()
    return
  }
  if (currentTemplate.teams) {
    if (!currentTemplate.teams.some(t => t == $('#metric-team').val())) {
      alert('Unaccepted team value!')
      $('#metric-team').focus()
      return
    }
  }
  if (!/\d{1,3}/.test($('#metric-match').val()) || $('#metric-match').val().length > 3) {
    alert('Please enter a proper match value!')
    $('#metric-match').focus()
    return
  }
  let values = `${$('#metric-team').val() + ($('#suffix').val() || '')}`
  values += `,${$('#metric-match').val()},${isAbsent}`
  $.each(gameMetrics, (_i, metric) => {
    values += `,${metric.type == 'text' ? `"${metric.value.replace('"', "'")}"` : metric.value}`
  })

  if (!confirm('Confirm save?')) {
    return
  }
  let savedSurveys = localStorage.getItem('surveys')
  localStorage.setItem('surveys', `${savedSurveys || ''}${values}\n`)

  $('#metric-team').val('').focus()
  $('#metric-suffix').val('')
  matchCount = parseInt($('#metric-match').val()) + 1
  $('#metric-match').val(matchCount)
  if (isAbsent) {
    $('#metric-absent').click()
  }
  $.each(gameMetrics, (_i, metric) => {
    switch (metric.type) {
      case 'toggle':
        metric.element.find('button').empty()
        metric.element.find('button').append(`<i class='far fa-square'></i> ${metric.name}`)
        metric.element.find('i').removeClass('fas fa-check-square').addClass('far fa-square')
        metric.value = false
        break
      case 'text':
        metric.element.children('input').val('')
        metric.value = ''
        break
      case 'number':
        metric.element.children('.inc').html('0')
        metric.value = 0
        break
      case 'select':
        metric.element.children('select').val(0)
        metric.value = metric.element.find('select option:checked').html()
        break
      case 'rating':
        metric.element.find('.star').html('<i class="far fa-star"></i>')
        metric.value = 0
    }
  })
}

// Downloads and clears saved surveys from localStorage
function download(askUser = true) {
  if (askUser) {
    if (!confirm('Confirm download?')) {
      return
    }
  }
  let a = document.createElement('a')
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(localStorage.getItem('surveys'))}`
  a.download = `${currentTemplate.name} Surveys.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  localStorage.setItem('surveys', '')
}
