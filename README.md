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

- [w3.css](https://www.w3schools.com/w3css/) - CSS framework
- [jQuery](https://jquery.com/) - JS library
- [FontAwesome](https://fontawesome.com/) - icon library
- [Workbox](https://developers.google.com/web/tools/workbox) - JS service worker library

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

It can be annoying to reprogram your scouting app every year to change scouting metrics. To make things easier, MeanScout can be customized with flexible scouting templates.

The only metrics that can't be changed are team (and team suffix), match, and absent, as it is generally assumed that these will stay consistent with all future FRC games.

To add a template to MeanScout, simply copy and paste its JSON. MeanScout comes with an example template to get you started. Here is its JSON:

```json
{ "name": "Example Template", "metrics": [
  { "name": "Toggle Metric", "type": "toggle", "newline": "Group" },
  { "name": "Number Metric", "type": "number", "max": 10 },
  { "name": "Select Metric", "type": "select", "values": ["Value 1", "Value 2", "Value 3"] },
  { "name": "Text Metric",   "type": "text",   "tip": "Custom tip" },
  { "name": "Rating Metric", "type": "rating" },
]}
```

Each template should have a `name` and an array of `metrics`. Optionally, a whitelist of `teams` can be included to restrict what team numbers can be entered. Keep team suffixes out of the whitelist.

Each metric must have a `name` and a `type` (`toggle`, `number`, `select`, `text`, or `rating`). Use short/concise names for metrics.

The `newline` value moves the metric in question to a new line, as every metric will be placed next to the last metric. Setting `newline` with a string will add a group label above the metric, and all metrics after will appear to be 'grouped' together (until the next metric with a `newline` string).

- A `toggle ` metric will have a toggleable button. Value is a boolean.
- A `number` metric will have an incremental and decremental button. Including a `max` value will change the maximum value for the metric in question (default 100). Value is a number.
- A `select` metric will have a dropdown selector. There must be an array of string `values` to create options for the selector. Value is a string (selected option).
- A `text` metric will have a text input. Including a string `tip` value will change the placeholder (within the input element). Including `length` set to `long` will produce a full-width input. Value is a string.
- A `rating` metric will have a star rating bar. Value is a number (0-5). You can reset the rating bar to 0 by tapping the first star twice.

When saving/downloading, every metric's value will be placed in the same order the metrics were created (with team/match/absent first).