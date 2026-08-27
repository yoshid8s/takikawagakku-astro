import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const projectRoot = process.cwd();

const inputDir = path.join(projectRoot, "data", "community-center", "pdf");

const outputDir = path.join(projectRoot, "src", "data", "community-center");

const roomDefinitions = [
  {
    key: "room1",
    label: "第1会議室",
    pdfLabel: "1会",
  },
  {
    key: "room2",
    label: "第2会議室",
    pdfLabel: "2会",
  },
  {
    key: "japanese",
    label: "和室",
    pdfLabel: "和室",
  },
  {
    key: "kitchen",
    label: "調理室",
    pdfLabel: "調理室",
  },
];

const timeDefinitions = [
  {
    key: "morning",
    label: "午前",
  },
  {
    key: "afternoon",
    label: "午後",
  },
  {
    key: "evening",
    label: "夜間",
  },
];

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

function normalizeText(value) {
  return value
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function createEmptyRooms() {
  return Object.fromEntries(
    roomDefinitions.map((room) => [
      room.key,
      {
        morning: null,
        afternoon: null,
        evening: null,
      },
    ]),
  );
}

function createMonthSkeleton(year, month) {
  const totalDays = getDaysInMonth(year, month);

  return Array.from({ length: totalDays }, (_, index) => {
    const date = index + 1;
    const jsDate = new Date(year, month - 1, date);
    const weekday = weekdayLabels[jsDate.getDay()];

    return {
      date,
      weekday,
      closed: weekday === "月",
      closedReason: weekday === "月" ? "休館日" : null,
      rooms: createEmptyRooms(),
    };
  });
}

async function extractPdfText(pdfPath) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "community-center-"));

  const outputPath = path.join(tempDir, "output.txt");

  try {
    await execFileAsync("pdftotext", [
      "-layout",
      "-enc",
      "UTF-8",
      pdfPath,
      outputPath,
    ]);

    return await fs.readFile(outputPath, "utf8");
  } finally {
    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
}

function extractMetadata(text, filename) {
  const headerMatch = text.match(
    /(\d{4})年(?:（[^）]+）)?\s*(\d{1,2})月\s*利用台帳/,
  );

  if (!headerMatch) {
    throw new Error(`${filename}: 年月を取得できませんでした`);
  }

  const year = Number(headerMatch[1]);
  const month = Number(headerMatch[2]);

  const reservationMatch = text.match(
    /受付開始日\s*([0-9０-９]+月[0-9０-９]+日\s*[（(][^）)]+[）)])/,
  );

  const reservationStart = reservationMatch
    ? normalizeText(reservationMatch[1])
    : null;

  return {
    year,
    month,
    reservationStart,
  };
}

/*
 * pdftotext -layout の文字列から
 * 「日付ブロック」を探す。
 *
 * このPDFは同一Excelマクロから生成されているため、
 * 日付行 → 午前/午後/夜間 → 4部屋
 * の繰り返し構造になっている。
 */
function splitIntoCalendarBlocks(text) {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/\s+$/, ""));

  const blocks = [];

  let currentBlock = [];

  for (const line of lines) {
    /*
     * 「午前 午後 夜間」が複数回現れる行を
     * 各週ブロックの開始目印として使う。
     */
    const morningCount = (line.match(/午前/g) ?? []).length;

    if (morningCount >= 1 && /午後/.test(line) && /夜間/.test(line)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
      }

      currentBlock = [line];
      continue;
    }

    if (currentBlock.length > 0) {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  return blocks;
}

function getColumnStarts(headerLine) {
  const starts = [];

  const regex = /午前/g;
  let match;

  while ((match = regex.exec(headerLine)) !== null) {
    starts.push(match.index);
  }

  return starts;
}

/*
 * 午前開始位置を基準に、
 * 1日あたり3時間帯の境界を推定する。
 */
function buildTimeColumns(headerLine) {
  const morningStarts = getColumnStarts(headerLine);

  if (morningStarts.length === 0) {
    return [];
  }

  const tokens = [];

  const regex = /(午前|午後|夜間)/g;
  let match;

  while ((match = regex.exec(headerLine)) !== null) {
    tokens.push({
      label: match[1],
      start: match.index,
    });
  }

  return tokens.map((token, index) => {
    const next = tokens[index + 1];

    return {
      label: token.label,
      start: token.start,
      end: next ? next.start : headerLine.length + 30,
    };
  });
}

function sliceCell(line, column) {
  if (!line) return "";

  return normalizeText(line.slice(column.start, column.end));
}

function findRoomLine(block, pdfLabel) {
  return block.find((line) => {
    const trimmed = line.trimStart();

    return trimmed.startsWith(`${pdfLabel} `) || trimmed === pdfLabel;
  });
}

function stripRoomLabel(line, pdfLabel) {
  if (!line) return "";

  const index = line.indexOf(pdfLabel);

  if (index === -1) return line;

  return (
    line.slice(0, index) +
    " ".repeat(pdfLabel.length) +
    line.slice(index + pdfLabel.length)
  );
}

function extractDateNumbersFromBlock(block) {
  /*
   * 日付は各時間帯見出しの直前または近辺にあるため、
   * 1〜31の数字だけが並ぶ行を探す。
   */
  const candidates = [];

  for (const line of block) {
    const matches = line.match(/(?<!\d)([1-9]|[12]\d|3[01])(?!\d)/g);

    if (!matches) continue;

    const numbers = matches.map(Number);

    if (numbers.length >= 1) {
      candidates.push({
        line,
        numbers,
      });
    }
  }

  /*
   * 最も「日付らしい」行を選ぶ。
   * 時刻や年などを避けるため、
   * 連続する1〜31が多い行を優先。
   */
  candidates.sort((a, b) => b.numbers.length - a.numbers.length);

  return candidates[0]?.numbers ?? [];
}

function assignBlockToDays(block, monthData, warnings) {
  const headerLine = block.find(
    (line) => /午前/.test(line) && /午後/.test(line) && /夜間/.test(line),
  );

  if (!headerLine) return;

  const columns = buildTimeColumns(headerLine);

  if (columns.length === 0) return;

  const dateNumbers = extractDateNumbersFromBlock(block);

  if (dateNumbers.length === 0) {
    return;
  }

  /*
   * 1日 = morning / afternoon / evening
   */
  const dayCountFromColumns = Math.ceil(columns.length / 3);

  const targetDates = dateNumbers.slice(0, dayCountFromColumns);

  for (const room of roomDefinitions) {
    const rawRoomLine = findRoomLine(block, room.pdfLabel);

    if (!rawRoomLine) {
      continue;
    }

    const roomLine = stripRoomLabel(rawRoomLine, room.pdfLabel);

    for (let dayIndex = 0; dayIndex < targetDates.length; dayIndex++) {
      const date = targetDates[dayIndex];

      const day = monthData.days.find((item) => item.date === date);

      if (!day) continue;

      for (let timeIndex = 0; timeIndex < 3; timeIndex++) {
        const columnIndex = dayIndex * 3 + timeIndex;

        const column = columns[columnIndex];

        if (!column) continue;

        const text = sliceCell(roomLine, column);

        if (!text) continue;

        const timeKey = timeDefinitions[timeIndex].key;

        if (day.rooms[room.key][timeKey]) {
          warnings.push(
            `重複: ${date}日 ${room.label} ${timeDefinitions[timeIndex].label}`,
          );
        }

        day.rooms[room.key][timeKey] = text;
      }
    }
  }
}

function buildMonthData(text, filename) {
  const metadata = extractMetadata(text, filename);

  const warnings = [];

  const monthData = {
    year: metadata.year,
    month: metadata.month,
    reservationStart: metadata.reservationStart,
    source: filename,
    generatedAt: new Date().toISOString(),
    rooms: Object.fromEntries(
      roomDefinitions.map((room) => [room.key, room.label]),
    ),
    times: Object.fromEntries(
      timeDefinitions.map((time) => [time.key, time.label]),
    ),
    days: createMonthSkeleton(metadata.year, metadata.month),
    warnings,
  };

  const blocks = splitIntoCalendarBlocks(text);

  for (const block of blocks) {
    assignBlockToDays(block, monthData, warnings);
  }

  return monthData;
}

async function processPdf(filename) {
  const pdfPath = path.join(inputDir, filename);

  const text = await extractPdfText(pdfPath);

  const data = buildMonthData(text, filename);

  const outputFilename = `${data.year}${String(data.month).padStart(
    2,
    "0",
  )}.json`;

  const outputPath = path.join(outputDir, outputFilename);

  await fs.writeFile(outputPath, JSON.stringify(data, null, 2) + "\n", "utf8");

  let usedSlots = 0;

  for (const day of data.days) {
    for (const room of Object.values(day.rooms)) {
      for (const value of Object.values(room)) {
        if (value) {
          usedSlots++;
        }
      }
    }
  }

  console.log(`✓ ${filename} -> ${outputFilename}`);

  console.log(
    `  ${data.year}年${data.month}月 / 使用枠 ${usedSlots} / warnings ${data.warnings.length}`,
  );

  for (const warning of data.warnings) {
    console.warn(`  WARNING: ${warning}`);
  }
}

async function main() {
  await fs.mkdir(outputDir, {
    recursive: true,
  });

  const requestedFiles = process.argv.slice(2);

  let filenames;

  if (requestedFiles.length > 0) {
    filenames = requestedFiles.map((value) => path.basename(value));
  } else {
    filenames = (await fs.readdir(inputDir))
      .filter((filename) => filename.toLowerCase().endsWith(".pdf"))
      .sort();
  }

  if (filenames.length === 0) {
    throw new Error(`PDFがありません: ${inputDir}`);
  }

  for (const filename of filenames) {
    await processPdf(filename);
  }
}

main().catch((error) => {
  console.error("");
  console.error("PDF抽出に失敗しました。");
  console.error(error);
  process.exitCode = 1;
});
