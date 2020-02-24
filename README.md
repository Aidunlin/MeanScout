# MeanScout
An FRC scouting web app

## Features
- Progressive Web App - full offline support
- w3.css - mininal and responsive css framework
- Dark-only theme with red/blue color variants
- Templates - customizable metrics (documentation below)
- Different metric types: toggles, numbers, selectors, text, ratings
- Uses `localStorage` to store entries
- Download saved entries as `(Template Name) Surveys.txt`
- Metrics separated with semicolons and surveys separated with newlines

### Planned Features
- Google Drive integration
- Exporting methods - `csv`, `json`, etc

## Installing MeanScout
You should be able to add/install MeanScout as an app from the browser menu.
If you can't find it, you can still use the app as normal.

## Templates
To add a template to MeanScout, simply copy and paste its JSON. MeanScout comes with an example template to get you started.

Each template should have a `name` (string) and an array of `metrics` (JSON objects).

Each metric must have a `name` and a `type` (`toggle`, `number`, `select`, `text`, or `rating`). Use short/concise names for metrics.

The `newline` value moves the metric in question to a new line, as every metric will be placed next to the last metric. Setting `newline` with a string will add a group label above the metric, and all metrics after will appear to be 'grouped' together (until the next metric with a `newline` string). In the example above, the metrics from "Passed Line" to the first "Inner Port" are 'grouped' under "Auto", wherease the metrics from the second "Bottom Port" to "Endgame" are 'grouped' under "Tele-Op".

A `toggle ` metric will have a toggleable button. Value is a boolean.

A `number` metric will have an incremental and decremental button. Including a `max` value will change the maximum value for the metric in question (default 100). Value is a number.

A `select` metric will have a dropdown selector. There must be an array of string `values` to create options for the selector. Value is a string (selected option).

A `text` metric will have a text input. Including a string `tip` value will change the placeholder (within the input element). Value is a string.

A `rating` metric will have a star rating bar. Value is a number (0-5);

When saving/downloading, every metric's value will be concatenated together in the same order the metrics were created (with team/match/absent concatenated before).