<script lang="ts">
  import QRCode from "qrcode";
  import { onMount } from "svelte";

  let {
    data,
  }: {
    data: string;
  } = $props();

  let canvas: HTMLCanvasElement;

  onMount(() => {
    QRCode.toCanvas(canvas, data, { width: 1000, margin: 2 });
  });
</script>

<canvas bind:this={canvas}>Displays a QR code to scan.</canvas>

<style>
  canvas {
    aspect-ratio: 1/1;
    max-width: 100%;
    flex-basis: 0;
  }
</style>
