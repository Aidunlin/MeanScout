<script lang="ts" context="module">
  /** List of robot locations */
  export const locations = ["Red Near", "Red Mid", "Red Far", "Blue Near", "Blue Mid", "Blue Far"] as const;
  export type Location = typeof locations[number];
</script>
