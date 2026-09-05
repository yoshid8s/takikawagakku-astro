import ExcelJS from "exceljs";
import fs from "node:fs/promises";
import path from "node:path";

import { generateCommunitySvg } from "./lib/community-calendar-svg.mjs";

const ROOT = process.cwd();

const INPUT_DIR = path.join(ROOT, "data", "community-center", "raw");

const OUTPUT_FILE = path.join(ROOT, "src", "data", "community-calendar.json");

const SVG_OUTPUT_DIR = path.join(
  ROOT,
  "public",
  "images",
  "community-center",
  "availability",
);

/*
 * Excel上の名称 → Webサイト上の名称
 *
 * 完全一致だけを対象にする。
 * 「将棋」「自治協役員会」などは別予定として扱い、
 * 勝手に対象へ含めない。
 */
const TARGET_EVENTS = new Map([
  ["囲碁クラブ", "囲碁クラブ"],
  ["子ども将棋", "子ども将棋講座"],
  ["自治協理事会", "自治協議会理事会"],
  ["ワインクラブ", "ワインクラブ"],
  ["子ども大学", "子ども大学"],
  ["朝食サロン", "朝食サロン"],
]);

/*
 * 表示順
 *
 * 現在のサイトの見せ方に合わせて、
 * 日付順ではなくイベント単位でまとめる。
 */
const EVENT_ORDER = [
  "囲碁クラブ",
  "子ども将棋講座",
  "自治協議会理事会",
  "ワインクラブ",
  "子ども大学",
  "朝食サロン",
];

function normalizeCellValue(value) {
  if (value == null) return "";

  if (typeof value === "object") {
    if ("text" in value) {
      return String(value.text).trim();
    }

    if ("result" in value) {
      return String(value.result ?? "").trim();
    }
  }

  return String(value).trim();
}

/*
 * A1:
 * 2026年9月　利用台帳　　受付開始日　7月1日
 *
 * から year / month を取得
 */
function getYearMonth(worksheet) {
  const title = normalizeCellValue(worksheet.getCell("A1").value);

  const match = title.match(/(\d{4})年\s*(\d{1,2})月/);

  if (!match) {
    throw new Error(`年月を取得できません: "${title}"`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}

function isValidDay(value) {
  const day = Number(value);

  return Number.isInteger(day) && day >= 1 && day <= 31;
}

/*
 * Excelの1週間は3列 × 最大6日。
 *
 * B-D   日付1
 * E-G   日付2
 * H-J   日付3
 * K-M   日付4
 * N-P   日付5
 * Q-S   日付6
 *
 * 各日付の先頭列は
 * B, E, H, K, N, Q
 */
const DAY_START_COLUMNS = [2, 5, 8, 11, 14, 17];

/*
 * 日付行を検出する。
 *
 * 例:
 * row 3  : 1,2,3,4,5,6
 * row 9  : 8,9,10,11,12,13
 * row 15 : 15,16...
 */
function isDateRow(worksheet, rowNumber) {
  return DAY_START_COLUMNS.some((column) => {
    const value = worksheet.getCell(rowNumber, column).value;

    return isValidDay(value);
  });
}

function makeIsoDate(year, month, day) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function getJapaneseWeekday(year, month, day) {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const date = new Date(Date.UTC(year, month - 1, day));

  return weekdays[date.getUTCDay()];
}

async function parseWorkbook(filePath) {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error(`ワークシートがありません: ${filePath}`);
  }

  const { year, month } = getYearMonth(worksheet);

  /*
   * 同じ予定が複数の部屋に入っているため、
   *
   * eventName → Set(日付)
   *
   * として重複排除する。
   */
  const eventDates = new Map();

  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber++) {
    if (!isDateRow(worksheet, rowNumber)) {
      continue;
    }

    for (const startColumn of DAY_START_COLUMNS) {
      const rawDay = worksheet.getCell(rowNumber, startColumn).value;

      if (!isValidDay(rawDay)) {
        continue;
      }

      const day = Number(rawDay);

      /*
       * 日付行
       * ↓
       * 午前・午後・夜間 行
       * ↓
       * 1会
       * 2会
       * 和室
       * 調理室
       *
       * なので予定データは
       * dateRow + 2 ～ +5。
       */
      for (let roomOffset = 2; roomOffset <= 5; roomOffset++) {
        const roomRow = rowNumber + roomOffset;

        /*
         * 午前・午後・夜間の3セル
         */
        for (let timeOffset = 0; timeOffset < 3; timeOffset++) {
          const column = startColumn + timeOffset;

          const value = normalizeCellValue(
            worksheet.getCell(roomRow, column).value,
          );

          if (!value) {
            continue;
          }

          const displayName = TARGET_EVENTS.get(value);

          if (!displayName) {
            continue;
          }

          if (!eventDates.has(displayName)) {
            eventDates.set(displayName, new Set());
          }

          eventDates.get(displayName).add(day);
        }
      }
    }
  }

  const events = EVENT_ORDER.filter((name) => eventDates.has(name)).map(
    (name) => {
      const days = [...eventDates.get(name)].sort((a, b) => a - b);

      return {
        title: name,

        dates: days.map((day) => ({
          day,
          date: makeIsoDate(year, month, day),
          weekday: getJapaneseWeekday(year, month, day),
        })),
      };
    },
  );

  return {
    year,
    month,
    key: `${year}${String(month).padStart(2, "0")}`,
    label: `${month}月`,
    events,
  };
}

async function main() {
  await fs.mkdir(path.dirname(OUTPUT_FILE), {
    recursive: true,
  });

  let filenames = await fs.readdir(INPUT_DIR);

  filenames = filenames
    .filter((filename) => filename.toLowerCase().endsWith(".xlsx"))
    .filter((filename) => !filename.startsWith("~$"));

  if (filenames.length === 0) {
    throw new Error(`Excelファイルがありません: ${INPUT_DIR}`);
  }

  const months = [];

  for (const filename of filenames) {
    const filePath = path.join(INPUT_DIR, filename);

    console.log(`Reading: ${filename}`);

    const month = await parseWorkbook(filePath);

    months.push({
      ...month,
      source: filename,
    });

    const svgOutputPath = path.join(SVG_OUTPUT_DIR, `${month.key}.svg`);

    const svgResult = await generateCommunitySvg({
      inputPath: filePath,
      outputPath: svgOutputPath,
    });

    console.log(`Generated SVG: ${svgResult.outputPath}`);
  }

  months.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }

    return a.month - b.month;
  });

  const result = {
    generatedAt: new Date().toISOString(),

    months,
  };

  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify(result, null, 2) + "\n",
    "utf8",
  );

  console.log("");
  console.log(`Generated: ${OUTPUT_FILE}`);

  for (const month of months) {
    console.log("");
    console.log(`${month.year}年${month.month}月`);

    for (const event of month.events) {
      const dates = event.dates
        .map((item) => `${item.day}日(${item.weekday})`)
        .join("・");

      console.log(`  ${event.title}: ${dates}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
