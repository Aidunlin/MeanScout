# MeanScout

A responsive, flexible, and powerful FRC scouting web app.

## Features

- Progressive web app - full offline support
- Dark-only theme with red/blue color variants
- Templates - customizable metrics (documentation below)
- Different metric types: toggles, numbers, selectors, text, ratings
- Team whitelist customization - make sure entered team is correct
- Uses `localStorage` to store entries
- Download saved entries as `(Template Name) Surveys.csv`

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

Clicking the MeanScout logo will reveal useful options for MeanScout. (Make sure to tell your scouts they probably shouldn't mess with these).

- Set which robot location will be scouted, only used to remind scouts which robot they are scouting.
- Download surveys and clear the in-app survey storage (prevents duplicate surveys if you download more than once).
- Change templates and download any saved surveys from the previous template.
- Add a new template (templates with same name can be replaced).
- Copy the JSON text of the current template.
- Remove the current template (the example can't be removed).

## Templates

It can be annoying to reprogram your scouting app every year to change scouting metrics. To make things easier, MeanScout can be customized with flexible scouting templates.

The only metrics that can't be changed are team (and team suffix), match, and absent, as it is generally assumed that these will stay consistent with all future FRC games.

To add a template to MeanScout, simply copy and paste its JSON. MeanScout comes with an example template to get you started. Here is its JSON:

```json
{
  "name": "Example Template",
  "metrics": [
    { "name": "Toggle", "type": "toggle", "group": "Group" },
    { "name": "Number", "type": "number", "max": 10 },
    { "name": "Select", "type": "select", "values": ["Value 1", "Value 2", "Value 3"] },
    { "name": "Text",   "type": "text",   "tip": "Tip" },
    { "name": "Rating", "type": "rating" }
  ]
}
```

Each template should have a `name` and an array of `metrics`. Optionally, a whitelist of `teams` can be included to restrict what team numbers can be entered. Keep team suffixes out of the whitelist so all team values are numbers.

Each metric must have a `name` and a `type` (`toggle`, `number`, `select`, `text`, or `rating`). Use short/concise names for metrics.

Setting `group` to a truthy value moves the metric in question to a new line, as every metric will be placed next to the last metric. Setting `group` with a string will add a group label before the current metric, and all metrics after will appear to be 'grouped' together (until the next metric with a `group` string).

- A `toggle` metric will have a toggleable button. Value is a boolean.
- A `number` metric will have an incremental and decremental button. You can set a `max` value, but the maximum will always be 99. Value is a number.
- A `select` metric will have a dropdown selector. There must be an array of string `values` to create options for the selector. Value is a string (selected option).
- A `text` metric will have a text input. Setting a `tip` value will add a placeholder within the input field. Setting `length` to `"long"` will produce a full-width input. Value is a string.
- A `rating` metric will have a star rating bar. Value is a number (0-5). You can reset the rating bar to 0 by tapping the first star twice.

When saving/downloading, every metric's value will be placed in the same order the metrics were created (with team/match/absent first).
