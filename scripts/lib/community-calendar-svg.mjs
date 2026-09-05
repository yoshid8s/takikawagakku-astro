import ExcelJS from "exceljs";
import fs from "node:fs/promises";
import path from "node:path";

export async function generateCommunitySvg({
  inputPath,
  outputPath,
}) {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(inputPath);

  const sheet = workbook.worksheets[0];

  if (!sheet) {
    throw new Error("Excelシートが見つかりません。");
  }

/*
 * 今回の利用台帳の範囲
 */
const MIN_ROW = 1;
const MAX_ROW = 32;
const MIN_COL = 1;
const MAX_COL = 19;

/*
 * Excelの旧式indexed color。
 * この台帳で実際に使われている色を含みます。
 */
const indexedColors = {
  0: "#000000",
  1: "#ffffff",
  2: "#ff0000",
  3: "#00ff00",
  4: "#0000ff",
  5: "#ffff00",
  6: "#ff00ff",
  7: "#00ffff",

  8: "#000000",
  9: "#ffffff",
  10: "#ff0000",
  11: "#00ff00",
  12: "#0000ff",
  13: "#ffff00",
  14: "#ff00ff",
  15: "#00ffff",

  16: "#800000",
  17: "#008000",
  18: "#000080",
  19: "#808000",
  20: "#800080",
  21: "#008080",
  22: "#c0c0c0",
  23: "#808080",

  24: "#9999ff",
  25: "#993366",
  26: "#ffffcc",
  27: "#ccffff",
  28: "#660066",
  29: "#ff8080",
  30: "#0066cc",
  31: "#ccccff",

  32: "#000080",
  33: "#ff00ff",
  34: "#ffff00",
  35: "#00ffff",
  36: "#800080",
  37: "#800000",
  38: "#008080",
  39: "#0000ff",

  40: "#00ccff",
  41: "#ccffff",
  42: "#ccffcc",
  43: "#ffff99",
  44: "#99ccff",
  45: "#ff99cc",
  46: "#cc99ff",
  47: "#ffcc99",

  48: "#3366ff",
  49: "#33cccc",
  50: "#99cc00",
  51: "#ffcc00",
  52: "#ff9900",
  53: "#ff6600",
  54: "#666699",
  55: "#969696",

  56: "#003366",
  57: "#339966",
  58: "#003300",
  59: "#333300",
  60: "#993300",
  61: "#993366",
  62: "#333399",
  63: "#333333",
};

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeArgb(argb) {
  if (!argb) {
    return null;
  }

  const value = String(argb).replace("#", "");

  if (value.length === 8) {
    return `#${value.slice(2)}`;
  }

  if (value.length === 6) {
    return `#${value}`;
  }

  return null;
}

function excelColorToCss(color, fallback = null) {
  if (!color) {
    return fallback;
  }

  if (color.argb) {
    return normalizeArgb(color.argb) ?? fallback;
  }

  if (color.indexed !== undefined && indexedColors[color.indexed]) {
    return indexedColors[color.indexed];
  }

  /*
   * theme color はこのExcelではほぼ
   * 黒・白なので最低限対応。
   */
  if (color.theme === 0) {
    return "#ffffff";
  }

  if (color.theme === 1) {
    return "#000000";
  }

  return fallback;
}

function getCellText(cell) {
  const value = cell.value;

  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return String(value.getDate());
  }

  if (typeof value === "object") {
    if ("richText" in value) {
      return value.richText.map((item) => item.text).join("");
    }

    if ("text" in value) {
      return String(value.text ?? "");
    }

    if ("result" in value) {
      return String(value.result ?? "");
    }
  }

  return String(value);
}

/*
 * Excel列幅 → おおよそのpixel。
 */
function getColumnWidth(colNumber) {
  const column = sheet.getColumn(colNumber);

  const excelWidth = typeof column.width === "number" ? column.width : 8.43;

  return Math.max(24, Math.round(excelWidth * 7 + 5));
}

/*
 * Excel行高はpointなのでpixel換算。
 */
function getRowHeight(rowNumber) {
  const row = sheet.getRow(rowNumber);

  const points = typeof row.height === "number" ? row.height : 15;

  return Math.max(16, Math.round((points * 96) / 72));
}

const columnWidths = [];

for (let col = MIN_COL; col <= MAX_COL; col += 1) {
  columnWidths[col] = getColumnWidth(col);
}

const rowHeights = [];

for (let row = MIN_ROW; row <= MAX_ROW; row += 1) {
  rowHeights[row] = getRowHeight(row);
}

const xPositions = [];
let runningX = 0;

for (let col = MIN_COL; col <= MAX_COL; col += 1) {
  xPositions[col] = runningX;
  runningX += columnWidths[col];
}

const yPositions = [];
let runningY = 0;

for (let row = MIN_ROW; row <= MAX_ROW; row += 1) {
  yPositions[row] = runningY;
  runningY += rowHeights[row];
}

const tableWidth = runningX;
const tableHeight = runningY;

/*
 * 結合セルを取得。
 */
const mergedRanges = Array.isArray(sheet.model?.merges)
  ? sheet.model.merges
  : [];

const mergedCells = new Map();
const mergedChildren = new Set();

function columnLettersToNumber(letters) {
  let result = 0;

  for (const char of letters) {
    result = result * 26 + char.charCodeAt(0) - 64;
  }

  return result;
}

function parseAddress(address) {
  const match = /^([A-Z]+)(\d+)$/i.exec(address);

  if (!match) {
    throw new Error(`Invalid cell address: ${address}`);
  }

  return {
    col: columnLettersToNumber(match[1].toUpperCase()),
    row: Number(match[2]),
  };
}

for (const range of mergedRanges) {
  const [startAddress, endAddress] = range.split(":");

  const start = parseAddress(startAddress);

  const end = parseAddress(endAddress ?? startAddress);

  const masterKey = `${start.row}:${start.col}`;

  mergedCells.set(masterKey, {
    startRow: start.row,
    startCol: start.col,
    endRow: end.row,
    endCol: end.col,
  });

  for (let row = start.row; row <= end.row; row += 1) {
    for (let col = start.col; col <= end.col; col += 1) {
      if (row === start.row && col === start.col) {
        continue;
      }

      mergedChildren.add(`${row}:${col}`);
    }
  }
}

function getRectForCell(row, col) {
  const key = `${row}:${col}`;

  const merged = mergedCells.get(key);

  const endRow = merged?.endRow ?? row;

  const endCol = merged?.endCol ?? col;

  let width = 0;

  for (let c = col; c <= endCol; c += 1) {
    width += columnWidths[c];
  }

  let height = 0;

  for (let r = row; r <= endRow; r += 1) {
    height += rowHeights[r];
  }

  return {
    x: xPositions[col],
    y: yPositions[row],
    width,
    height,
  };
}

function getFillColor(cell) {
  const fill = cell.fill;

  if (fill && fill.type === "pattern" && fill.pattern !== "none") {
    return excelColorToCss(fill.fgColor, "#ffffff");
  }

  return "#ffffff";
}

function getFontColor(cell) {
  return excelColorToCss(cell.font?.color, "#000000");
}

function borderStyleWidth(style) {
  switch (style) {
    case "medium":
    case "mediumDashed":
      return 1.5;

    case "thick":
      return 2;

    case "double":
      return 2;

    default:
      return 0.7;
  }
}

function getBorder(cell, side) {
  const border = cell.border?.[side];

  if (!border?.style) {
    return null;
  }

  return {
    width: borderStyleWidth(border.style),
    color: excelColorToCss(border.color, "#666666"),
  };
}

function getBaseFontSize(cell) {
  const pointSize = typeof cell.font?.size === "number" ? cell.font.size : 11;

  /*
   * Excel pt → px
   */
  return (pointSize * 96) / 72;
}

function estimateTextWidth(text, fontSize) {
  let units = 0;

  for (const char of text) {
    /*
     * 日本語等は全角、
     * ASCIIは少し狭く評価。
     */
    if (char.charCodeAt(0) <= 0x7f) {
      units += 0.56;
    } else {
      units += 1;
    }
  }

  return units * fontSize;
}

function fitFontSize(text, baseSize, width) {
  if (!text) {
    return baseSize;
  }

  const available = Math.max(4, width - 5);

  const estimated = estimateTextWidth(text, baseSize);

  if (estimated <= available) {
    return baseSize;
  }

  return Math.max(6, (baseSize * available) / estimated);
}

function getTextAnchor(cell) {
  const alignment = cell.alignment?.horizontal;

  switch (alignment) {
    case "left":
      return "start";

    case "right":
      return "end";

    default:
      return "middle";
  }
}

function getTextX(cell, rect) {
  const anchor = getTextAnchor(cell);

  if (anchor === "start") {
    return rect.x + 4;
  }

  if (anchor === "end") {
    return rect.x + rect.width - 4;
  }

  return rect.x + rect.width / 2;
}

function getTextY(cell, rect) {
  const vertical = cell.alignment?.vertical;

  if (vertical === "top") {
    return rect.y + 4;
  }

  if (vertical === "bottom") {
    return rect.y + rect.height - 4;
  }

  return rect.y + rect.height / 2;
}

const padding = 14;

const svgWidth = tableWidth + padding * 2;

const svgHeight = tableHeight + padding * 2;

const svg = [];

svg.push('<?xml version="1.0" encoding="UTF-8"?>');

svg.push(
  `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `width="${svgWidth}" ` +
    `height="${svgHeight}" ` +
    `viewBox="0 0 ${svgWidth} ${svgHeight}">`,
);

svg.push(`
<style>
	text {
		font-family:
			"Hiragino Kaku Gothic ProN",
			"Hiragino Sans",
			"Yu Gothic",
			"YuGothic",
			"Meiryo",
			sans-serif;
		text-rendering: geometricPrecision;
	}

	.cell-border {
		shape-rendering: crispEdges;
	}
</style>
`);

/*
 * Illustratorで追加していた白背景。
 */
svg.push(
  `<rect ` +
    `x="0" y="0" ` +
    `width="${svgWidth}" ` +
    `height="${svgHeight}" ` +
    `fill="#ffffff"/>`,
);

svg.push(`<g transform="translate(${padding} ${padding})">`);

for (let row = MIN_ROW; row <= MAX_ROW; row += 1) {
  for (let col = MIN_COL; col <= MAX_COL; col += 1) {
    const key = `${row}:${col}`;

    if (mergedChildren.has(key)) {
      continue;
    }

    const cell = sheet.getCell(row, col);

    const rect = getRectForCell(row, col);

    const fill = getFillColor(cell);

    svg.push(
      `<rect ` +
        `x="${rect.x}" ` +
        `y="${rect.y}" ` +
        `width="${rect.width}" ` +
        `height="${rect.height}" ` +
        `fill="${fill}"/>`,
    );

    /*
     * Excelの罫線を各辺ごとに描画。
     */
    const top = getBorder(cell, "top");

    if (top) {
      svg.push(
        `<line class="cell-border" ` +
          `x1="${rect.x}" ` +
          `y1="${rect.y}" ` +
          `x2="${rect.x + rect.width}" ` +
          `y2="${rect.y}" ` +
          `stroke="${top.color}" ` +
          `stroke-width="${top.width}"/>`,
      );
    }

    const bottom = getBorder(cell, "bottom");

    if (bottom) {
      svg.push(
        `<line class="cell-border" ` +
          `x1="${rect.x}" ` +
          `y1="${rect.y + rect.height}" ` +
          `x2="${rect.x + rect.width}" ` +
          `y2="${rect.y + rect.height}" ` +
          `stroke="${bottom.color}" ` +
          `stroke-width="${bottom.width}"/>`,
      );
    }

    const left = getBorder(cell, "left");

    if (left) {
      svg.push(
        `<line class="cell-border" ` +
          `x1="${rect.x}" ` +
          `y1="${rect.y}" ` +
          `x2="${rect.x}" ` +
          `y2="${rect.y + rect.height}" ` +
          `stroke="${left.color}" ` +
          `stroke-width="${left.width}"/>`,
      );
    }

    const right = getBorder(cell, "right");

    if (right) {
      svg.push(
        `<line class="cell-border" ` +
          `x1="${rect.x + rect.width}" ` +
          `y1="${rect.y}" ` +
          `x2="${rect.x + rect.width}" ` +
          `y2="${rect.y + rect.height}" ` +
          `stroke="${right.color}" ` +
          `stroke-width="${right.width}"/>`,
      );
    }

    const text = getCellText(cell);

    if (!text) {
      continue;
    }

    const baseFontSize = getBaseFontSize(cell);

    const fontSize = fitFontSize(text, baseFontSize, rect.width);

    const fontWeight = cell.font?.bold ? "700" : "400";

    const fontStyle = cell.font?.italic ? "italic" : "normal";

    const color = getFontColor(cell);

    const anchor = getTextAnchor(cell);

    const x = getTextX(cell, rect);

    const y = getTextY(cell, rect);

    const vertical = cell.alignment?.vertical;

    const baseline =
      vertical === "top"
        ? "hanging"
        : vertical === "bottom"
          ? "auto"
          : "middle";

    svg.push(
      `<text ` +
        `x="${x}" ` +
        `y="${y}" ` +
        `font-size="${fontSize.toFixed(2)}" ` +
        `font-weight="${fontWeight}" ` +
        `font-style="${fontStyle}" ` +
        `fill="${color}" ` +
        `text-anchor="${anchor}" ` +
        `dominant-baseline="${baseline}">` +
        `${escapeXml(text)}` +
        `</text>`,
    );
  }
}

svg.push("</g>");
svg.push("</svg>");

await fs.mkdir(path.dirname(outputPath), { recursive: true });

await fs.writeFile(outputPath, svg.join("\n"), "utf8");

return {
    outputPath,
    mergedCells: mergedRanges.length,
    width: svgWidth,
    height: svgHeight,
  };
}
