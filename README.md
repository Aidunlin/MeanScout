# MeanScout

A lightweight FRC scouting web app, built with Svelte.

## Features

- Full offline support (progressive web app)
- Lightweight mobile-first design
- Red/blue color theme variants
- Customizable metrics: toggles, numbers, selectors, textfields, ratings, and timers
- Optional team whitelisting
- Uses browser storage to store surveys
- Different export methods (CSV, JSON)

## Frameworks/Libraries

- [Svelte](https://svelte.dev/) - Front end compiler
- [FontAwesome](https://fontawesome.com/) - Icons
- [Workbox](https://developers.google.com/web/tools/workbox) - Offline service worker

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
- `select`: A dropdown selector. Value is a string (selected option). There also must be an array of string `values` to create options for the selector.
- `text`: A text input. Value is a string. Setting a `tip` value will add a placeholder within the input field.
- `rating`: A star rating bar. Value is a number (0-4).
- `timer`: A number input with timing controls. Value is a decimal.

Setting `group` with a string adds a label before the metric and moves the metric to a new line. Metrics after will appear to be grouped together.

## Exporting

Surveys are stored in a JSON array. Each survey is also an array containing metric objects with names and values.

Currently, you can export surveys either as CSV or JSON. Here are some samples:

CSV:

```csv
2471,1,false,true,3,"Value 1","MeanScout is cool",5,4.2, ... metrics
... surveys
```

JSON:

```json
[
  [
    { "name": "Team", "value": "2471" },
    { "name": "Match", "value": 1 },
    { "name": "Absent", "value": false },
    { "name": "Toggle", "value": true },
    { "name": "Number", "value": 3 },
    { "name": "Select", "value": "Value 1" },
    { "name": "Text", "value": "MeanScout is cool" },
    { "name": "Rating", "value": 5 },
    { "name": "Timer", "value": 4.2 }
    // ... metrics
  ]
  // ... surveys
]
```

## Contributing

Find a problem? Make an issue!

Fix a problem? Make a pull request!

To develop MeanScout (or a fork), you will need Node.js/npm, a text editor, and a browser. After cloning, use `npm install` in the root folder to build your `node_modules`. The `public` folder contains everything your browser needs to run the app, so deploy with it set as your publish directory.

`npm run build`: builds minified script files to the `public/build` folder, should be used for deployment

`npm run dev`: runs a local web server that refreshes and builds MeanScout as you go