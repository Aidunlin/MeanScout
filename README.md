# MeanScout

A lightweight FRC scouting web app.

## Features

- Full offline support (progressive web app)
- Lightweight mobile-first design
- Red/blue color variants, auto dark/light themes
- Customizable metrics: toggles, numbers, selectors, textfields, and ratings
- Optional team whitelisting
- Uses `localStorage` to store entries
- Exports entries as JSON arrays

## Libraries

- [Normalize.css](https://necolas.github.io/normalize.css/) with CSS based on [w3.css](https://www.w3schools.com/w3css/)
- [FontAwesome Icons](https://fontawesome.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

## Location

The location selector is used to remind your scouts which robot they should scout based on the robot's starting position.

## Customization

It can be annoying to reprogram your scouting app every year to change scouting metrics. To make things easier, metrics in MeanScout can be customized with templates.

To change the metrics present, simply copy and paste JSON-based templates into MeanScout. MeanScout comes with an example template to get you started. Here is its JSON:

```json
{
  "metrics": [
    { "name": "Toggle", "type": "toggle", "group": "Group" },
    { "name": "Number", "type": "number", "max": 10 },
    { "name": "Select", "type": "select", "values": ["Value 1", "Value 2", "Value 3"] },
    { "name": "Text",   "type": "text",   "tip": "Tip" },
    { "name": "Rating", "type": "rating" }
  ]
}
```

The only metrics that can't be changed are team, match, and absent.

Each template should have an array of `metrics`. Optionally, a whitelist of `teams` can be included to help scouts correctly identify teams.

Each metric must have a `name` and a `type` (`toggle`, `number`, `select`, `text`, or `rating`). Use short/concise names for metrics to save space.

- `toggle`: a toggleable button. Value is a boolean.
- `number`: an incremental and decremental button. Value is a number. You can set a `max` value, but the maximum will always be 99.
- `select`: a dropdown selector. Value is a string (selected option). There must be an array of string `values` to create options for the selector.
- `text`: a text input. Value is a string. Setting a `tip` value will add a placeholder within the input field. Setting `length` to `"long"` will produce a full-width input.
- `rating`: a star rating bar. Value is a number (0-5). You can reset the rating bar to 0 by tapping the first star twice.

Setting `group` to true (or a string) moves the metric in question to a new line, as every metric will be placed next to the last.
Setting `group` with a string will add a group label before the current metric, and metrics after will appear to be grouped together.

## Exporting

When saving/downloading, surveys will be stored in a JSON array. Each survey is also an array containing metric objects with names and values. Here is a sample with a single survey:

```json
[
  [
    { "name": "Team",   "value": "2471" },
    { "name": "Match",  "value": "1" },
    { "name": "Absent", "value": false },
    { "name": "Toggle", "value": false },
    { "name": "Number", "value": 3 },
    { "name": "Select", "value": "Value 1" },
    { "name": "Text",   "value": "MeanScout is cool" },
    { "name": "Rating", "value": 5 }
    // ... metrics
  ]
  // ... surveys
]
```