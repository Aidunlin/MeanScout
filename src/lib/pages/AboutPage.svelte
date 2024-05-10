<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
</script>

<Header backLink="" title="About MeanScout" iconName="info-circle" />

<Container direction="column" padding="large">
  <span>A lightweight FRC scouting web app built with SvelteKit.</span>
  <h2>Features</h2>
  <ul>
    <li>Full offline support (progressive web app)</li>
    <li>Lightweight mobile-first design</li>
    <li>
      Color theme variants for <span style="color:var(--red)">red alliance</span>,
      <span style="color:var(--blue)">blue alliance</span>, and <span style="color:var(--orange)">pit scouting</span>
    </li>
    <li>Customizable fields: toggles, numbers, selectors, textfields, ratings, and timers</li>
    <li>Options for scouting matches and pits</li>
    <li>Data analysis (pick lists and expressions)</li>
    <li>Supports match schedules and team lists</li>
    <li>Stores data locally, in the browser</li>
    <li>Export/share surveys as JSON and entries as CSV</li>
  </ul>
  <h2>Powered by</h2>
  <ul>
    <li>
      <a href="https://kit.svelte.dev/" target="_blank">
        <span>SvelteKit</span>
        <i class="fa-solid fa-up-right-from-square"></i>
      </a>
    </li>
    <li>
      <a href="https://fontawesome.com/" target="_blank">
        <span>FontAwesome</span>
        <i class="fa-solid fa-up-right-from-square"></i>
      </a>
    </li>
    <li>
      <a href="https://github.com/tonsky/FiraCode" target="_blank">
        <span>Fira Code</span>
        <i class="fa-solid fa-up-right-from-square"></i>
      </a>
    </li>
    <li>
      <a href="https://www.thebluealliance.com/" target="_blank">
        <span>The Blue Alliance</span>
        <i class="fa-solid fa-up-right-from-square"></i>
      </a>
    </li>
  </ul>
  <h2>Target selector</h2>
  <ul>
    <li>Remind your scouts which team/alliance they should scout</li>
    <li>When used with TBA match data, automatically inputs team values for you</li>
    <li>Customize in the <a href="#/settings">settings page</a></li>
  </ul>
  <h2>Mode selector</h2>
  <ul>
    <li>Simplify MeanScout's UI for scouts</li>
    <li>Hide survey config menus/controls from scouts</li>
    <li>Also customizable in the <a href="#/settings">settings page</a></li>
  </ul>
  <h2>Customization</h2>
  <span>
    Do you find it annoying to reprogram your team's scouting app for every competition? MeanScout solves that problem.
  </span>
  <ol>
    <li>Create a new survey and give it a good name (e.g. PNW Champs 2024)</li>
    <li>Set up fields you need to scout</li>
    <li>Add match schedule data in the matches page</li>
    <li>If you don't have a match schedule, add teams in the teams page</li>
  </ol>
  <span>Field notes:</span>
  <ul>
    <li>Give each field a short, descriptive, and unique name</li>
    <li>Make sure to add some values for your selector fields!</li>
    <li>Use group fields to organize your fields</li>
    <li>Duplicate fields (and groups!) to quickly set up your survey</li>
  </ul>
  <h2>Data analysis</h2>
  <ol>
    <li>Analysis tools are availabe in your survey's analysis page</li>
    <li>Create expressions that transform (multiply, convert) and summarize (average, sum) your data</li>
    <li>Build pick lists using those expressions with given weights</li>
    <li>View the best teams for each pick list (and even expressions)</li>
  </ol>
  <h2>Integrating The Blue Alliance</h2>
  <ol>
    <li>
      <a href="https://www.thebluealliance.com/" target="_blank">
        <span>Create an account and Read API Key</span>
        <i class="fa-solid fa-up-right-from-square"></i>
      </a>
    </li>
    <li>Enter that API key, and your team number, in MeanScout's <a href="#/settings">settings page</a></li>
    <li>
      In your survey's options page, select one of your team's upcoming (or recent) events (or enter any valid TBA event
      key)
    </li>
    <li>In either your survey's matches page or teams page, get the corresponding data from TBA</li>
  </ol>
  <h2>Exporting</h2>
  <ul>
    <li>Export survey config as JSON from your survey's options page</li>
    <li>Export entries as CSV from your survey's entries page</li>
    <li>You'll have to manually send these files or text snippets between devices</li>
    <li>
      Use Quick Share (Android), AirDrop (Apple), USB, email, messaging, smoke signals, whatever will work best for your
      scouting system
    </li>
  </ul>
  <h2>Privacy and You</h2>
  <span>Here's all the information that can be automatically sent from your device, where it's sent to, and why:</span>
  <ul>
    <li>TBA API key - The Blue Alliance - To get event data from TBA</li>
    <li>Your team number - The Blue Alliance - To get events your team participates in</li>
    <li>FRC event keys - The Blue Alliance - To get match schedules and participating teams for those events</li>
  </ul>
  <span>(Note: this list only applies to the official/main version of MeanScout)</span>
  <span>Additional notes:</span>
  <ul>
    <li>You are not required to use The Blue Alliance and/or fill out that information to use MeanScout.</li>
    <li>All other data you put into MeanScout is stored locally, in the browser you use.</li>
    <li>
      All exportable data is exported in readable text files to your device, or your device's native sharing
      capabilities.
    </li>
    <li>
      It's your job to not accidentally put sensitive data (SSNs, passwords, bank information) into the app and store
      that data to your device, or share that data through your device's native sharing capabilities.
    </li>
  </ul>
  <span>With all that said, happy scouting!</span>
  <h2>FOSS</h2>
  <span>
    MeanScout is Free and Open Source Software.
    <a href="https://github.com/TeamMeanMachine/MeanScout" target="_blank">
      <span>Visit MeanScout's GitHub repository</span>
      <i class="fa-solid fa-up-right-from-square"></i>
    </a>
    to browse the source code, provide feedback, and/or contribute to the project.
  </span>
  <span>&copy; 2020-2024 Aidan Linerud, Aran O'Day, FRC Team Mean Machine 2471</span>
</Container>

<style>
  ul,
  ol {
    margin-block: 0;
  }

  ::marker {
    color: var(--theme-color);
  }

  li + li {
    margin-top: var(--inner-gap);
  }

  a[target="_blank"] {
    text-decoration: none;
  }

  a span {
    text-decoration: underline;
  }
</style>
