# MeanScout

A lightweight FRC scouting web app, built with SvelteKit.

## Features

- Full offline support (progressive web app)
- Lightweight mobile-first design
- Red/blue color theme variants
- Customizable metrics: toggles, numbers, selectors, textfields, ratings, and timers
- Optional team whitelisting
- Uses browser storage to store surveys
- Exoprt entries as CSV

## Frameworks/Libraries

- [SvelteKit](https://kit.svelte.dev/)
- [FontAwesome](https://fontawesome.com/)

## Location

The location selector is used to remind your scouts which robot they should scout.

## Customization

It can be annoying to reprogram your scouting app every year to change scouting metrics. To make things easier, metrics in MeanScout can be customized!

Simply create a new survey and give it a good name (e.g. District Champs 2023). Then, in the configs page, set up whatever metrics you need. Give each a short, descriptive name, select the right type, and configure any additional settings for each metric. If you fill out the `Group` field for a metric, it will add a group label above that particular metric. For selectors, make sure to add some values in the additional settings.

In the options page, you can add teams to the survey's whitelist to prevent entering any teams not in the particular event.

You can also copy/paste surveys as JSON for setting up multiple devices.

## Exporting

In the entries list page, you can download all entries from one survey as a CSV file.

## Contributing

Find a problem? Make an issue!

Fix a problem? Make a pull request!

To develop MeanScout (or a fork), you will need Node.js/npm, a text editor, a terminal, and a browser. After cloning, use `npm install` in the root folder to build `node_modules` and `.svelte-kit` folders.

[View the SvelteKit docs](https://kit.svelte.dev/docs/building-your-app) to learn how to build and deploy MeanScout.
