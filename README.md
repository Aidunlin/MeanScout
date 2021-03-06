# MeanScout

A lightweight FRC scouting web app.

## Features

- Full offline support (progressive web app)
- Lightweight mobile-first design
- Red/blue color variants, auto dark/light themes
- Customizable metrics: toggles, numbers, selectors, textfields, ratings, and timers
- Optional team whitelisting
- Uses browser storage to store surveys
- Different export methods (i.e. JSON and CSV)

## Libraries

- [FontAwesome Icons](https://fontawesome.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

Otherwise, MeanScout is built with native HTML/CSS/JS.

## Location

The location selector is used to remind your scouts which robot they should scout based on the robot's starting position.

## Customization

It can be annoying to reprogram your scouting app every year to change scouting metrics. To make things easier, metrics in MeanScout can be customized with templates.

To change the metrics present, simply copy and paste JSON-based templates into MeanScout. MeanScout comes with an example template to get you started. Here is its JSON:

```json
{
  "metrics": [
    { "name": "Toggle", "type": "toggle", "group": "Group" },
    { "name": "Number", "type": "number" },
    { "name": "Select", "type": "select", "values": ["Value 1", "Value 2", "Value 3"] },
    { "name": "Text", "type": "text", "tip": "Tip" },
    { "name": "Rating", "type": "rating" },
    { "name": "Timer", "type": "timer" }
  ]
}
```

The only metrics that can't be changed are team, match, and absent.

Each template should have an array of `metrics`. Optionally, a whitelist of `teams` can be included to help scouts correctly identify teams.

Each metric must have a `name` and a `type`. Use short/concise names for metrics to save space.

Types:

- `toggle`: A toggleable button. Value is a boolean.
- `number`: A number input with increment/decrement buttons. Value is an integer.
- `select`: A dropdown selector. Value is a string (selected option). There must be an array of string `values` to create options for the selector.
- `text`: A text input. Value is a string. Setting a `tip` value will add a placeholder within the input field.
- `rating`: A star rating bar. Value is a number (0-4).
- `timer`: A number input with timing controls. Value is a decimal.

Setting `group` to a string adds a label before the metric and moves the metric to a new line. Metrics after will appear to be grouped together.

## Exporting

Surveys are stored in a JSON array. Each survey is also an array containing metric objects with names and values.

Currently, you can export surveys either as JSON or CSV. Here are some samples:

JSON:

```json
[
  [
    { "name": "Team", "value": "2471" },
    { "name": "Match", "value": "1" },
    { "name": "Absent", "value": false },
    { "name": "Toggle", "value": false },
    { "name": "Number", "value": 3 },
    { "name": "Select", "value": "Value 1" },
    { "name": "Text", "value": "MeanScout is cool" },
    { "name": "Rating", "value": 5 }
    { "name": "Timer", "value": 4.2 }
    // ... metrics
  ]
  // ... surveys
]
```

CSV:

```csv
"2471",1,false,false,3,"Value 1","MeanScout is cool",5,4.2, ... metrics
... surveys
```

## Contributing

Find a problem? Make an issue!

Fix a problem? Make a pull request!

All you'll need to develop MeanScout (or your own fork) is a text editor and a browser.