<script lang="ts">
  import { parseValueFromString, type Entry, type Survey } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import jsQR from "jsqr";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;
  export let exportedEntries: IDBRecord<Entry>[];

  let dialog: Dialog;
  let error = "";

  let readingQrCode = false;
  let qrCodeData: string | undefined = undefined;

  let videoElement: HTMLVideoElement = document.createElement("video");
  let canvasElement: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D;

  let cameraStream: MediaStream;

  function tickVideo() {
    if (videoElement.readyState == videoElement.HAVE_ENOUGH_DATA) {
      canvasElement.height = videoElement.videoHeight;
      canvasElement.width = videoElement.videoWidth;

      canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      const image = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const code = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" });

      if (code) {
        qrCodeData = code.data;
        readingQrCode = false;
      }
    }

    if (readingQrCode) requestAnimationFrame(tickVideo);
  }

  function onOpen() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then((stream) => {
      cameraStream = stream;

      const context = canvasElement.getContext("2d", { willReadFrequently: true });
      if (context) {
        canvasContext = context;
      }

      videoElement.srcObject = cameraStream;
      videoElement.playsInline = true;
      videoElement.play();

      readingQrCode = true;

      requestAnimationFrame(tickVideo);
    });
  }

  async function onConfirm() {
    if (!qrCodeData) {
      error = "No input";
      return;
    }

    const entryCSV = qrCodeData
      .trim()
      .split(",")
      .map((value) => value.trim());

    if (!entryCSV.length || !entryCSV[0].length) {
      error = "No input";
      return;
    }

    if (entryCSV[0] == "Team") {
      return;
    }

    if (surveyRecord.type == "match") {
      var entry: Entry = {
        surveyId: surveyRecord.id,
        type: surveyRecord.type,
        status: "exported",
        team: entryCSV[0],
        match: parseInt(entryCSV[1]),
        absent: entryCSV[2].toLowerCase() == "true" ? true : false,
        values: entryCSV.slice(3).map(parseValueFromString),
        created: new Date(),
        modified: new Date(),
      };
    } else {
      var entry: Entry = {
        surveyId: surveyRecord.id,
        type: surveyRecord.type,
        status: "exported",
        team: entryCSV[0],
        values: entryCSV.slice(1).map(parseValueFromString),
        created: new Date(),
        modified: new Date(),
      };
    }
    const addRequest = idb.transaction("entries", "readwrite").objectStore("entries").add(entry);
    addRequest.onsuccess = () => {
      const id = addRequest.result;
      if (!id) {
        error = "Could not add entry!";
        return;
      }

      exportedEntries = [{ ...entry, id: id as number }, ...exportedEntries];
      dialog.close();
    };

    addRequest.onerror = (e) => {
      e.preventDefault();
      error = "Could not add entry!";
    };
  }
</script>

<Dialog
  bind:this={dialog}
  {onConfirm}
  {onOpen}
  on:close={() => {
    readingQrCode = false;
    cameraStream.getTracks().forEach((track) => track.stop());
    videoElement.pause();
    videoElement = document.createElement("video");
    error = "";
  }}
>
  <Button slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="qrcode" />
      Import from QR code
    </Container>
  </Button>

  <span>Import from QR code</span>
  <canvas
    bind:this={canvasElement}
    style:display={readingQrCode ? "block" : "none"}
    style="max-width:100%;flex-basis:0;"
  >
    Displays the camera when trying to read a QR code.
  </canvas>
  {#if qrCodeData}
    <span>{qrCodeData}</span>
  {/if}
</Dialog>
