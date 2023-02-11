<script lang="ts" context="module">
  import { writable } from "svelte/store";

  /** List of supported survey file types */
  export const fileFormats = ["CSV", "JSON"] as const;
  export type FileFormat = typeof fileFormats[number];

  /** List of robot locations */
  export const locations = [
    "Red Near",
    "Red Mid",
    "Red Far",
    "Blue Near",
    "Blue Mid",
    "Blue Far",
  ] as const;
  export type Location = typeof locations[number];

  /** List of metric types */
  export const metricTypes = [
    "toggle",
    "number",
    "select",
    "text",
    "rating",
    "timer",
  ] as const;
  export type MetricType = typeof metricTypes[number];

  type BaseMetric = {
    name: string;
    type: MetricType;
    group?: string;
  };

  type UniqueMetric =
    | { type: "toggle" }
    | { type: "number" }
    | { type: "select"; values: string[] }
    | { type: "text"; tip?: string }
    | { type: "rating" }
    | { type: "timer" };

  export type CustomMetric = BaseMetric & UniqueMetric;

  export interface Template {
    teams?: string[];
    metrics: CustomMetric[];
  }

  interface MS {
    location: Location;
    team: string;
    match: number;
    isAbsent: boolean;
    template: Template;
    metrics: { name: string; value: any; default: any }[];
    menuVisible: boolean;
  }

  /** Global object of state values, must use `$ms` to use/change a value */
  export const ms = writable<MS>({
    location: "Red Near",
    team: "",
    match: 1,
    isAbsent: false,
    template: { metrics: [] },
    metrics: [],
    menuVisible: false,
  });

  /** Default template used to showcase different metrics */
  export const exampleTemplate: Template = {
    metrics: [
      { name: "Toggle", type: "toggle", group: "Group" },
      { name: "Number", type: "number" },
      {
        name: "Select",
        type: "select",
        values: ["Value 1", "Value 2", "Value 3"],
      },
      { name: "Text", type: "text", tip: "Tip" },
      { name: "Rating", type: "rating" },
      { name: "Timer", type: "timer" },
    ],
  };

  /** Default values for each metric type */
  export const metricDefaults: { name: MetricType; default: any }[] = [
    { name: "toggle", default: false },
    { name: "number", default: 0 },
    { name: "select", default: 0 },
    { name: "text", default: "" },
    { name: "rating", default: 0 },
    { name: "timer", default: 0 },
  ];

  /**
   * Helper function for getting default metric values
   * @param type The metric's type
   * @returns The default value defined in `metricDefaults` or `null`
   */
  export function getMetricDefaultValue(type: MetricType) {
    return metricDefaults.find((t) => t.name == type)?.default;
  }

  /**
   * Helper function for creating a survey
   * @param data A reference to `ms` (must be referenced outside of definition)
   * @returns An array of objects, each representing a metric
   */
  export function getSurvey(data: MS) {
    return [
      { name: "Team", value: data.team },
      { name: "Match", value: data.match },
      { name: "Absent", value: data.isAbsent },
      ...data.metrics.map((metric) => {
        return { name: metric.name, value: metric.value };
      }),
    ];
  }

  /**
   * Helper function for storing a backup to `localStorage`
   * @param data A reference to `ms` (must be referenced outside of definition)
   */
  export function backupSurvey(data: MS) {
    localStorage.setItem("backup", JSON.stringify(getSurvey(data)));
  }

  /**
   * Contains SVG information for every icon
   */
  export const icons = [
    {
      name: "bars",
      width: 448,
      path: "M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z",
    },
    {
      name: "copy",
      width: 512,
      path: "M384 96L384 0h-112c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48H464c26.51 0 48-21.49 48-48V128h-95.1C398.4 128 384 113.6 384 96zM416 0v96h96L416 0zM192 352V128h-144c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48L288 416h-32C220.7 416 192 387.3 192 352z",
    },
    {
      name: "check",
      width: 448,
      path: "M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM339.8 211.8C350.7 200.9 350.7 183.1 339.8 172.2C328.9 161.3 311.1 161.3 300.2 172.2L192 280.4L147.8 236.2C136.9 225.3 119.1 225.3 108.2 236.2C97.27 247.1 97.27 264.9 108.2 275.8L172.2 339.8C183.1 350.7 200.9 350.7 211.8 339.8L339.8 211.8z",
    },
    {
      name: "download",
      width: 512,
      path: "M480 352h-133.5l-45.25 45.25C289.2 409.3 273.1 416 256 416s-33.16-6.656-45.25-18.75L165.5 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h448c17.67 0 32-14.33 32-32v-96C512 366.3 497.7 352 480 352zM432 456c-13.2 0-24-10.8-24-24c0-13.2 10.8-24 24-24s24 10.8 24 24C456 445.2 445.2 456 432 456zM233.4 374.6C239.6 380.9 247.8 384 256 384s16.38-3.125 22.62-9.375l128-128c12.49-12.5 12.49-32.75 0-45.25c-12.5-12.5-32.76-12.5-45.25 0L288 274.8V32c0-17.67-14.33-32-32-32C238.3 0 224 14.33 224 32v242.8L150.6 201.4c-12.49-12.5-32.75-12.5-45.25 0c-12.49 12.5-12.49 32.75 0 45.25L233.4 374.6z",
    },
    {
      name: "erase",
      width: 512,
      path: "M480 416C497.7 416 512 430.3 512 448C512 465.7 497.7 480 480 480H150.6C133.7 480 117.4 473.3 105.4 461.3L25.37 381.3C.3786 356.3 .3786 315.7 25.37 290.7L258.7 57.37C283.7 32.38 324.3 32.38 349.3 57.37L486.6 194.7C511.6 219.7 511.6 260.3 486.6 285.3L355.9 416H480zM265.4 416L332.7 348.7L195.3 211.3L70.63 336L150.6 416L265.4 416z",
    },
    {
      name: "minus",
      width: 448,
      path: "M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z",
    },
    {
      name: "nocheck",
      width: 448,
      path: "M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM384 80H64C55.16 80 48 87.16 48 96V416C48 424.8 55.16 432 64 432H384C392.8 432 400 424.8 400 416V96C400 87.16 392.8 80 384 80z",
    },
    {
      name: "nostar",
      width: 576,
      path: "M287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0L287.9 0zM287.9 78.95L235.4 187.2C231.9 194.3 225.1 199.3 217.3 200.5L98.98 217.9L184.9 303C190.4 308.5 192.9 316.4 191.6 324.1L171.4 443.7L276.6 387.5C283.7 383.7 292.2 383.7 299.2 387.5L404.4 443.7L384.2 324.1C382.9 316.4 385.5 308.5 391 303L476.9 217.9L358.6 200.5C350.7 199.3 343.9 194.3 340.5 187.2L287.9 78.95z",
    },
    {
      name: "pause",
      width: 384,
      path: "M272 63.1l-32 0c-26.51 0-48 21.49-48 47.1v288c0 26.51 21.49 48 48 48L272 448c26.51 0 48-21.49 48-48v-288C320 85.49 298.5 63.1 272 63.1zM80 63.1l-32 0c-26.51 0-48 21.49-48 48v288C0 426.5 21.49 448 48 448l32 0c26.51 0 48-21.49 48-48v-288C128 85.49 106.5 63.1 80 63.1z",
    },
    {
      name: "pen",
      width: 512,
      path: "M362.7 19.32C387.7-5.678 428.3-5.678 453.3 19.32L492.7 58.75C517.7 83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32zM421.7 220.3L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3z",
    },
    {
      name: "play",
      width: 384,
      path: "M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z",
    },
    {
      name: "plus",
      width: 448,
      path: "M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z",
    },
    {
      name: "question",
      width: 320,
      path: "M204.3 32.01H96c-52.94 0-96 43.06-96 96c0 17.67 14.31 31.1 32 31.1s32-14.32 32-31.1c0-17.64 14.34-32 32-32h108.3C232.8 96.01 256 119.2 256 147.8c0 19.72-10.97 37.47-30.5 47.33L127.8 252.4C117.1 258.2 112 268.7 112 280v40c0 17.67 14.31 31.99 32 31.99s32-14.32 32-31.99V298.3L256 251.3c39.47-19.75 64-59.42 64-103.5C320 83.95 268.1 32.01 204.3 32.01zM144 400c-22.09 0-40 17.91-40 40s17.91 39.1 40 39.1s40-17.9 40-39.1S166.1 400 144 400z",
    },
    {
      name: "reset",
      width: 512,
      path: "M480 256c0 123.4-100.5 223.9-223.9 223.9c-48.84 0-95.17-15.58-134.2-44.86c-14.12-10.59-16.97-30.66-6.375-44.81c10.59-14.12 30.62-16.94 44.81-6.375c27.84 20.91 61 31.94 95.88 31.94C344.3 415.8 416 344.1 416 256s-71.69-159.8-159.8-159.8c-37.46 0-73.09 13.49-101.3 36.64l45.12 45.14c17.01 17.02 4.955 46.1-19.1 46.1H35.17C24.58 224.1 16 215.5 16 204.9V59.04c0-24.04 29.07-36.08 46.07-19.07l47.6 47.63C149.9 52.71 201.5 32.11 256.1 32.11C379.5 32.11 480 132.6 480 256z",
    },
    {
      name: "save",
      width: 448,
      path: "M433.1 129.1l-83.9-83.9C342.3 38.32 327.1 32 316.1 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64V163.9C448 152.9 441.7 137.7 433.1 129.1zM224 416c-35.34 0-64-28.66-64-64s28.66-64 64-64s64 28.66 64 64S259.3 416 224 416zM320 208C320 216.8 312.8 224 304 224h-224C71.16 224 64 216.8 64 208v-96C64 103.2 71.16 96 80 96h224C312.8 96 320 103.2 320 112V208z",
    },
    {
      name: "star",
      width: 576,
      path: "M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z",
    },
    {
      name: "stop",
      width: 384,
      path: "M384 128v255.1c0 35.35-28.65 64-64 64H64c-35.35 0-64-28.65-64-64V128c0-35.35 28.65-64 64-64H320C355.3 64 384 92.65 384 128z",
    },
  ];

  /**
   * Helper function for getting icon information
   * @param iconName The name of the icon
   * @returns SVG information for the icon
   */
  export function getIcon(iconName: string) {
    return (
      icons.find((icon) => icon.name == iconName) ?? {
        name: "question",
        width: 320,
        path: "M204.3 32.01H96c-52.94 0-96 43.06-96 96c0 17.67 14.31 31.1 32 31.1s32-14.32 32-31.1c0-17.64 14.34-32 32-32h108.3C232.8 96.01 256 119.2 256 147.8c0 19.72-10.97 37.47-30.5 47.33L127.8 252.4C117.1 258.2 112 268.7 112 280v40c0 17.67 14.31 31.99 32 31.99s32-14.32 32-31.99V298.3L256 251.3c39.47-19.75 64-59.42 64-103.5C320 83.95 268.1 32.01 204.3 32.01zM144 400c-22.09 0-40 17.91-40 40s17.91 39.1 40 39.1s40-17.9 40-39.1S166.1 400 144 400z",
      }
    );
  }
</script>
