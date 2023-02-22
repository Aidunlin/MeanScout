<script lang="ts">
  import { location } from "./stores";
</script>

<header>
  <div class="flex-row">
    <slot>
      <img id="logo" src="./logo.svg" alt="" />
      <h1>MeanScout</h1>
    </slot>
  </div>
  <span class="theme-text">{$location}</span>
</header>
