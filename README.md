# MeanScout
An FRC scouting web app

## Features
- Progressive Web App - full offline support
- w3.css - mininal and responsive css framework
- Dark-only theme with red/blue color variants
- Simple error checking for scouting criteria
- Templates - customizable with text-based in-app creator (documentation below)
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
Below is an example of a scouting template. To add a template to MeanScout, simply copy and paste its JSON.
```
{ "name": "FRC 2020 (2471)", "metrics": [
  { "name": "Passed Line", "type": "toggle", "newline": "Auto" },
  { "name": "Bottom Port", "type": "number", "newline": true },
  { "name": "Outer Port", "type": "number" },
  { "name": "Inner Port", "type": "number" },
  { "name": "Bottom Port", "type": "number", "newline": "Tele-Op" },
  { "name": "Outer Port", "type": "number" },
  { "name": "Inner Port", "type": "number" },
  { "name": "Rotation Control", "type": "toggle", "newline": true },
  { "name": "Position Control", "type": "toggle" },
  { "name": "Endgame", "type": "select", "values": ["None", "Park", "Hang"], "newline": true },
  { "name": "Penalty Card", "type": "select", "values": ["None", "Yellow", "Red"], "newline": "Post-Game" },
  { "name": "Primary Role", "type": "select", "values": ["None", "Role 1", "Role 2"] },
  { "name": "Secondary Role", "type": "select", "values": ["None", "Role 1", "Role 2"] },
  { "name": "Disabled", "type": "toggle", "newline": true },
  { "name": "Disqualified", "type": "toggle" },
  { "name": "Drive Rating", "type": "select", "values": ["Bad", "Ok", "Great"], "newline": true },
  { "name": "Co-op Rating", "type": "select", "values": ["Bad", "Ok", "Great"] },
  { "name": "Defense Rating", "type": "select", "values": ["Bad", "Ok", "Great"] },
  { "name": "Comment(s)", "type": "text", "newline": true },
  { "name": "Breakdown", "type": "text" }
}
```
Each template should have a `name` (string) and an array of `metrics` (JSON objects).

Each metric must have a `name` and a `type` (`toggle`, `number`, `select`, or `text`).

The `newline` value moves the metric in question to a new line, as every metric will be placed next to the last metric. Setting `newline` with a string will add a group label above the metric, and all metrics after will appear to be 'grouped' together (until the next metric with a `newline` string). In the example above, the metrics from "Passed Line" to the first "Inner Port" are 'grouped' under "Auto", wherease the metrics from the second "Bottom Port" to "Endgame" are 'grouped' under "Tele-Op".

A `toggle ` metric will have a toggleable button (true or false).

A `number` metric will have an incremental and decremental button. Including a `max` value will change the maximum value for the metric in question (default 100).

A `select` metric will have a dropdown selector. There must be an array of string `values` to create options for the selector.

A `text` metric will have a text input. Including a string `tip` value will change the placeholder (within the input element).

When saving/downloading, every metric's value will be concatenated together in the same order the metrics were created (with team/match/absent concatenated before).