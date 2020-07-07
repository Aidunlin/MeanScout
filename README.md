# MeanScout

A lightweight FRC scouting web app.

## Features

- Progressive web app - full offline support
- Dark theme with red/blue color variants
- Customizable metrics (documentation below)
- Different metric types: toggles, numbers, selectors, text, ratings
- Team whitelist customization - make sure entered team is correct
- Uses `localStorage` to store entries
- Download saved entries as `(Template Name) Surveys.csv`
- Approximately 1 MB cache size

### Planned Features

- In-app GUI-based template editor
- More exporting methods (e.g. json)

## Libraries/Frameworks

- CSS based on [w3.css](https://www.w3schools.com/w3css/)
- [jQuery](https://jquery.com/)
- [FontAwesome](https://fontawesome.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

## Installing MeanScout

You should be able to add/install MeanScout as an app from the browser menu.
If you can't find it, you can still use the app as normal.

## Options

Pressing the menu button (on small devices) will reveal useful options for MeanScout.
These options are shown automatically on larger devices.
Make sure to tell your scouts they shouldn't mess with these.

- Set which robot location will be scouted
- Download (and remove) saved surveys
- Copy the JSON of the template
- Edit the template and download any saved surveys from before

## Customization

It can be annoying to reprogram your scouting app every year to change scouting metrics.
To make things easier, metrics in MeanScout can be customized with templates.

To change the metrics present, simply copy and paste JSON-based templates into MeanScout.
MeanScout comes with an example template to get you started. Here is its JSON:

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

Each template should have an array of `metrics`.
Optionally, a whitelist of `teams` can be included to help scouts correctly identify teams.

Each metric must have a `name` and a `type` (`toggle`, `number`, `select`, `text`, or `rating`).
Use short/concise names for metrics to save space.

- `toggle`: a toggleable button. Value is a boolean.
- `number`: an incremental and decremental button. Value is a number. You can set a `max` value, but the maximum will always be 99.
- `select`: a dropdown selector. Value is a string (selected option). There must be an array of string `values` to create options for the selector.
- `text`: a text input. Value is a string. Setting a `tip` value will add a placeholder within the input field. Setting `length` to `"long"` will produce a full-width input.
- `rating`: a star rating bar. Value is a number (0-5). You can reset the rating bar to 0 by tapping the first star twice.

Setting `group` to a truthy value moves the metric in question to a new line, as every metric will be placed next to the last.
Setting `group` with a string will add a group label before the current metric, and all metrics after will appear to be 'grouped' together (until the next metric with a `group` string).

When downloaded, every metric's value will be placed in the same order the metrics were created (with team/match/absent first).
