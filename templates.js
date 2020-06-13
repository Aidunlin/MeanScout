// Default/example template
let exampleTemplate = {
  name: 'Example',
  metrics: [
    { name: 'Toggle Metric', type: 'toggle', newline: 'Group' },
    { name: 'Number Metric', type: 'number', max: 10 },
    { name: 'Select Metric', type: 'select', values: ['Value 1', 'Value 2', 'Value 3'] },
    { name: 'Text Metric', type: 'text', tip: 'Custom tip' },
    { name: 'Rating Metric', type: 'rating', },
  ],
  teams: [
    360, 753, 847, 1425, 1432, 1510, 1540, 1571, 2411,
    2471, 2521, 2550, 2811, 2898, 2915, 2990, 3024, 3223,
    3636, 3674, 3711, 3812, 4127, 4488, 5085, 5295, 5450,
    5468, 5803, 5977, 6343, 6465, 6696, 6831, 6845, 7448
  ]
}
let templates = []
let gameMetrics = []
let currentTemplate
let isCustom = false

if (localStorage.getItem('templates')) {
  templates = JSON.parse(localStorage.getItem('templates'))
}

// Populate template picker with template options, select previously selected template
$.each(templates, (i, template) => {
  $('#options-template').prepend(new Option(template.name, template.name))
  if (template.selected) {
    currentTemplate = template
    isCustom = true
    loadTemplate(template.metrics)
    $('#options-template').val(currentTemplate.name)
    $('#nav-template').html(currentTemplate.name)
  }
})
if (!isCustom) {
  currentTemplate = exampleTemplate
  loadTemplate(exampleTemplate.metrics)
  $('#options-template').val(currentTemplate.name)
  $('#nav-template').html(currentTemplate.name)
}
if (currentTemplate.teams) {
  $.each(currentTemplate.teams, (i, team) => {
    $('#teams').append(`<option value="${team}">`)
  })
}
localStorage.setItem('templates', JSON.stringify(templates))

// Change to selected template
function setTemplate() {
  if (localStorage.getItem('surveys')) download(false)
  isCustom = false
  $.each(templates, (i, template) => {
    template.selected = false
    if ($('#options-template').val() == template.name) {
      currentTemplate = template
      isCustom = true
      template.selected = true
      loadTemplate(template.metrics)
      $('#nav-template').html(currentTemplate.name)
    }
  })
  if (!isCustom) {
    currentTemplate = exampleTemplate
    loadTemplate(exampleTemplate.metrics)
    $('#options-template').val(currentTemplate.name)
    $('#nav-template').html(currentTemplate.name)
  }
  if (currentTemplate.teams) {
    $.each(currentTemplate.teams, (i, team) => {
      $('#teams').append(`<option value="${team}">`)
    })
  }
  setLocation(currentLocation)
  localStorage.setItem('templates', JSON.stringify(templates))
}
$('#options-template').change(() => {
  setTemplate()
})

// Create and select new template from JSON text
$('#options-template-new').click(() => {
  let newPrompt = prompt('Type/paste new template:')
  if (newPrompt) {
    let newTemplate = JSON.parse(newPrompt)
    if (newTemplate instanceof Array) {
      newTemplate = newTemplate[0]
    }
    newTemplate.selected = true

    let error = false
    if (newTemplate.name == exampleTemplate.name) {
      error = "Template has same name as example"
    }
    if (newTemplate.name && newTemplate.metrics) {
      $.each(newTemplate.metrics, (_i, metric) => {
        if (!metric.name) {
          error = "Metric has no name"
        } else if (metric.type == 'number' && metric.max < 1) {
          error = "Max is less than one"
        } else if (metric.type == 'select' && !metric.values) {
          error = "Metric has no values"
        } else if (!['toggle', 'number', 'select', 'text', 'rating'].includes(metric.type)) {
          error = "Unknown metric type"
        }
      })
    } else {
      error = "Template is invalid"
    }
    if (error) {
      alert(`Could not add template! Error: ${error}`)
      return
    }

    let skip = false
    $.each(templates, (_i, template) => {
      if (newTemplate.name == template.name) {
        if (confirm(`${newTemplate.name} already exists. Replace current template?`)) {
          $.each(templates, (i, template) => {
            if (template.name == currentTemplate.name) {
              templates.splice(i, 1)
              return false
            }
          })
          $('#options-template option:checked').remove()
          setTemplate()
          localStorage.setItem('templates', JSON.stringify(templates))
        } else {
          skip = true
          return false
        }
      }
    })
    if (!skip) {
      templates.unshift(newTemplate)
      $('#options-template').prepend(new Option(newTemplate.name, newTemplate.name))
      $('#options-template').val(newTemplate.name)
      setTemplate()
    }
  }
})

$('#options-template-copy').click(() => {
  let input = $('<input>')
  let templateToCopy = currentTemplate
  delete templateToCopy['selected']
  $('body').append(input)
  input.attr('value', JSON.stringify(templateToCopy))
  input.select()
  document.execCommand('copy')
  $(input).remove()
  alert(`Copied ${currentTemplate.name}`)
})

$('#options-template-remove').click(() => {
  if (!isCustom) {
    alert('The example template cannot be removed.')
    return
  }
  if (prompt(`Are you sure? Type '${currentTemplate.name}' to remove the template`)) {
    $.each(templates, (i, template) => {
      if (template.name == currentTemplate.name) {
        templates.splice(i, 1)
        return false
      }
    })
    $('#options-template option:checked').remove()
    setTemplate()
    localStorage.setItem('templates', JSON.stringify(templates))
  }
})

// Handles metric UI/value changes
function change(i, type, data = 0) {
  switch (type) {
    case 'toggle':
      gameMetrics[i].element.find('button').empty()
      gameMetrics[i].element.find('button').append(
        `<i class='${gameMetrics[i].value ? 'far fa-square' : 'fas fa-check-square'}'></i> ${gameMetrics[i].name}`)
      gameMetrics[i].value = !gameMetrics[i].value
      break
    case 'number':
      gameMetrics[i].value = Math.max(Math.min(gameMetrics[i].value += data, gameMetrics[i].max), 0)
      gameMetrics[i].element.children('.inc').html(gameMetrics[i].value)
      break
    case 'select':
      gameMetrics[i].value = gameMetrics[i].element.find('option:checked').html()
      break
    case 'text':
      gameMetrics[i].value = gameMetrics[i].element.children('input').val().replace(';', ' ')
      break
    case 'rating':
      gameMetrics[i].element.find('.star').html('<i class="far fa-star"></i>')
      if (data == 0 && gameMetrics[i].value == 1) {
        gameMetrics[i].value = 0
        return
      } else {
        gameMetrics[i].value = data + 1
        for (let count = 0; count <= data + 1; count++) {
          gameMetrics[i].element.find(`div>.star:nth-child(${count})`).html('<i class="fas fa-star"></i>')
        }
      }
  }
  setLocation(scoutLocation)
}

// Create scouting metrics (UI and state variables) from template
function loadTemplate(t) {
  $('#metrics').empty()
  gameMetrics = []
  let metricObject, newMetric, prevDiv, newDiv
  prevDiv = $('<div></div>')
  prevDiv.addClass('margin-left')
  $.each(t, (i, metric) => {
    metricObject = { name: metric.name }
    switch (metric.type) {
      case 'toggle':
        newMetric = $('<div></div>')
        let button = $('<button></button>')
        button.addClass('button mobile border-bottom ripple')
        button.append(`<i class="far fa-square"></i> ${metric.name}`)
        button.click(() => change(i, metric.type))
        newMetric.append(button)
        metricObject.value = false
        break
      
      case 'number':
        newMetric = $('<div></div>')
        newMetric.append(`${metric.name} <br>`)
        let incButton = $('<button></button>')
        incButton.addClass('inc button border-bottom ripple')
        incButton.css('width', '75px')
        incButton.click(() => change(i, metric.type, 1))
        incButton.append('0')
        let decButton = $('<button></button>')
        decButton.addClass('dec button border-bottom ripple')
        decButton.click(() => change(i, metric.type, -1))
        decButton.append('−')
        newMetric.append(incButton, ' ', decButton)
        metricObject.max = metric.max || 100
        metricObject.value = 0
        break
      
      case 'select':
        newMetric = $('<label></label>')
        newMetric.append(`${metric.name} <br>`)
        let select = $('<select></select>')
        select.addClass('select black')
        select.on('change', () => change(i, metric.type))
        $.each(metric.values, (index, selValue) => {
          let option = $('<option></option>')
          option.attr('value', index)
          option.html(selValue)
          select.append(option)
        })
        newMetric.append(select)
        metricObject.value = metric.values[0]
        break
      
      case 'text':
        newMetric = $('<label></label>')
        newMetric.append(`${metric.name} <br>`)
        if (metric.length == 'long') {
          newMetric.css('width', '100%')
          newMetric.css('paddingRight', '16px')
        }
        let input = $('<input>')
        input.addClass('input black')
        input.attr('placeholder', metric.tip || metric.name)
        input.on('input', () => change(i, metric.type))
        newMetric.append(input)
        metricObject.value = ''
        break
      
      case 'rating':
        newMetric = $('<div></div>')
        newMetric.append(`${metric.name} <br>`)
  
        let ratingBar = $('<div></div>')
        ratingBar.addClass('border-bottom')
        ratingBar.css('width', 'fit-content')
        for (let count = 0; count < 5; count++) {
          let star = $('<button></button>')
          star.addClass('star button ripple')
          star.append('<i class="far fa-star"></i>')
          star.click(() => change(i, metric.type, count))
          ratingBar.append(star)
        }
        newMetric.append(ratingBar)
        metricObject.value = 0
    }
    newMetric.addClass('show-inline-block margin-left margin-bottom')

    if (metric.newline) {
      newDiv = $('<div></div>')
      newDiv.addClass('margin-left')
      if (typeof metric.newline == "string") {
        newDiv.append(`${metric.newline} <br>`)
      }
      newDiv.append(newMetric)
      $('#metrics').append(prevDiv)
      prevDiv = newDiv
    } else {
      prevDiv.append(newMetric)
    }

    metricObject.element = newMetric
    metricObject.type = metric.type
    gameMetrics.push(metricObject)
  })
  $('#metrics').append(prevDiv)
}
