# MeanScout

A responsive, flexible, and powerful FRC scouting web app.

## Features

- Progressive Web App - full offline support
- w3.css - mininal and responsive css framework
- Dark-only theme with red/blue color variants
- Templates - customizable metrics (documentation below)
- Different metric types: toggles, numbers, selectors, text, ratings
- Team whitelist customization - make sure entered team is correct
- Uses `localStorage` to store entries
- Download saved entries as `(Template Name) Surveys.txt`
- Metrics separated with semicolons and surveys separated with newlines

## Installing MeanScout

You should be able to add/install MeanScout as an app from the browser menu.
If you can't find it, you can still use the app as normal.

## Options

Clicking the gear icon next to the template name and location will reveal useful options for MeanScout. (Make sure to tell your scouts they probably shouldn't mess with these).

- The location setting is useful for reminding scouts which robot they will focus on. It will also change some UI elements to the location's alliance color.
- Click Download Surveys to download currently saved surveys. This will also clear the surveys from the app's `localStorage`.
- The template selector changes templates. When you change templates, It will detect any saved surveys from the previous template and download them automatically.
- The next three buttons relate to templates: copy the JSON text of the current template, type/paste new templates in (templates with same name can be replaced), and remove custom templates.

## Templates

It can be annoying to reprogram the scouting app every year to change scouting metrics. To make things easier, MeanScout can be customized with flexible scouting templates.

The only metrics that can't be changed are team (and team suffix), match, and absent, as it is generally assumed that these will stay consistent with all future FRC games.

To add a template to MeanScout, simply copy and paste its JSON. MeanScout comes with an example template to get you started. Here is its JSON:

```json
{ "name": "Example Template", "metrics": [
  { "name": "Toggle Metric", "type": "toggle", "newline": "Group" },
  { "name": "Number Metric", "type": "number", "max": 10 },
  { "name": "Select Metric", "type": "select", "values": ["Value 1", "Value 2", "Value 3"] },
  { "name": "Text Metric",   "type": "text",   "tip": "Custom tip" },
  { "name": "Rating Metric", "type": "rating" },
], "teams": [
  360,753,847,1425,1432,1510,1540,1571,2411,
  2471,2521,2550,2811,2898,2915,2990,3024,3223,
  3636,3674,3711,3812,4127,4488,5085,5295,5450,
  5468,5803,5977,6343,6465,6696,6831,6845,7448
]}
```

Each template should have a `name` and an array of `metrics`. Optionally, a whitelist of `teams` can be included to restrict what team numbers can be entered.

Each metric must have a `name` and a `type` (`toggle`, `number`, `select`, `text`, or `rating`). Use short/concise names for metrics.

The `newline` value moves the metric in question to a new line, as every metric will be placed next to the last metric. Setting `newline` with a string will add a group label above the metric, and all metrics after will appear to be 'grouped' together (until the next metric with a `newline` string).

- A `toggle ` metric will have a toggleable button. Value is a boolean.
- A `number` metric will have an incremental and decremental button. Including a `max` value will change the maximum value for the metric in question (default 100). Value is a number.
- A `select` metric will have a dropdown selector. There must be an array of string `values` to create options for the selector. Value is a string (selected option).
- A `text` metric will have a text input. Including a string `tip` value will change the placeholder (within the input element). Including a string `length` set to `long` will produce a full-width input on desktop. Value is a string.
- A `rating` metric will have a star rating bar. Value is a number (0-5). You can reset the rating bar (to 0) by tapping the first star twice.

When saving/downloading, every metric's value will be concatenated together in the same order the metrics were created (with team/match/absent concatenated before).
