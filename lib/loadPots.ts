import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";

export type PotRow = {
  vesselName: string;
  vesselType: string;
  voyageNo: string;
  rotation: string;
  agent: string;
  line: string;
  arrivedFrom: string;
  sailTo: string;
  callTo: string;
  lastEsa: string;
  berth: string;
  eta: string;
  etd: string;
  cutoffDate: string;
  terminal: string;
  raw: Record<string, string>;
};

export type PotLoadError = {
  file: string;
  message: string;
};

export type PotLoadResult = {
  rows: PotRow[];
  berths: string[];
  errors: PotLoadError[];
};

export class PotsLoadError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type PotField = Exclude<keyof PotRow, "raw">;

const HEADER_TO_FIELD: Record<string, PotField> = {
  vesselname: "vesselName",
  vesseltype: "vesselType",
  vesseltyp: "vesselType",
  voyageno: "voyageNo",
  voyagenumber: "voyageNo",
  rotation: "rotation",
  agent: "agent",
  line: "line",
  arrivedfrom: "arrivedFrom",
  arrivedfrm: "arrivedFrom",
  sailto: "sailTo",
  callreason: "callTo",
  callto: "callTo",
  lastesa: "lastEsa",
  berth: "berth",
  eta: "eta",
  etd: "etd",
  cutoffdate: "cutoffDate",
  cutoffdatetime: "cutoffDate",
  cutoff: "cutoffDate",
};

const DATE_FIELDS = new Set<PotField>([
  "eta",
  "etd",
  "cutoffDate",
  "lastEsa",
]);

const formatDate = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const parseExcelDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDate(value);
  }

  if (typeof value === "number") {
    const parsed = xlsx.SSF.parse_date_code(value);
    if (parsed) {
      const { y, m, d, H, M } = parsed;
      const date = new Date(y, m - 1, d, H ?? 0, M ?? 0);
      if (!Number.isNaN(date.getTime())) {
        return formatDate(date);
      }
    }
  }

  if (typeof value === "string" && value.trim()) {
    if (value.includes("#")) {
      return "";
    }
    return value.trim();
  }

  return "";
};

const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const toStringValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toString() : "";
  }
  return `${value}`.trim();
};

const findHeaderRowIndex = (rows: unknown[][]) => {
  const maxScan = Math.min(rows.length, 10);
  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < maxScan; i += 1) {
    const row = (rows[i] ?? []) as unknown[];
    const score = row.reduce((count: number, value: unknown) => {
      const normalized = normalizeHeader(toStringValue(value));
      return HEADER_TO_FIELD[normalized] ? count + 1 : count;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestScore >= 2) {
    return bestIndex;
  }

  return -1;
};

const parseSheetRows = (sheet: xlsx.WorkSheet, terminal: string) => {
  const rows = xlsx.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: "",
  }) as unknown[][];

  if (rows.length === 0) {
    return [];
  }

  const headerRowIndex = findHeaderRowIndex(rows);
  if (headerRowIndex < 0) {
    return [];
  }

  const headers = (rows[headerRowIndex] ?? []).map((value) =>
    normalizeHeader(toStringValue(value))
  );
  const mappedHeaders = headers.map((header) => HEADER_TO_FIELD[header] ?? null);

  if (!mappedHeaders.some(Boolean)) {
    return [];
  }

  return rows.slice(headerRowIndex + 1).reduce<PotRow[]>((acc, row) => {
    const record: PotRow = {
      vesselName: "",
      vesselType: "",
      voyageNo: "",
      rotation: "",
      agent: "",
      line: "",
      arrivedFrom: "",
      sailTo: "",
      callTo: "",
      lastEsa: "",
      berth: "",
      eta: "",
      etd: "",
      cutoffDate: "",
      terminal,
      raw: {},
    };

    row.forEach((value, index) => {
      const headerKey = headers[index];
      const field = mappedHeaders[index];
      const rawValue =
        field && DATE_FIELDS.has(field)
          ? parseExcelDate(value)
          : toStringValue(value);

      if (headerKey) {
        record.raw[headerKey] = rawValue;
      }

      if (!field) {
        return;
      }
      if (DATE_FIELDS.has(field)) {
        record[field] = parseExcelDate(value);
      } else {
        record[field] = toStringValue(value);
      }
    });

    const { terminal: _, raw: __, ...fields } = record;
    const hasAnyValue = Object.values(fields).some((value) =>
      value.toString().trim()
    );
    if (!hasAnyValue) {
      return acc;
    }

    acc.push(record);
    return acc;
  }, []);
};

const uniqueList = (values: string[]) =>
  Array.from(new Set(values.filter((value) => value.trim()))).sort((a, b) =>
    a.localeCompare(b)
  );

const readWorkbook = (filePath: string) => {
  const buffer = fs.readFileSync(filePath);
  return xlsx.read(buffer, {
    type: "buffer",
    cellDates: true,
    cellText: false,
    cellNF: false,
  });
};

const resolveTerminalFile = (baseDir: string, terminal: string) => {
  const candidates = [`${terminal}.xls`, `${terminal}.xlsx`];
  for (const candidate of candidates) {
    const fullPath = path.join(baseDir, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
};

export const loadPots = async (terminal: string): Promise<PotLoadResult> => {
  const baseDir = path.join(process.cwd(), "public");
  const allRows: PotRow[] = [];
  const errors: PotLoadError[] = [];
  const isDev = process.env.NODE_ENV !== "production";
  const terminalUpper = terminal.toUpperCase();

  const filePath = resolveTerminalFile(baseDir, terminalUpper);
  if (!filePath) {
    throw new PotsLoadError(`Terminal file not found for ${terminalUpper}`, 400);
  }

  const fileName = path.basename(filePath);

  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile() || stats.size === 0) {
      throw new PotsLoadError("Terminal file is empty or not a file", 400);
    }
    fs.accessSync(filePath, fs.constants.R_OK);

    const workbook = readWorkbook(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new PotsLoadError("No sheets found in terminal file", 500);
    }
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new PotsLoadError("Sheet not available in terminal file", 500);
    }
    const rows = parseSheetRows(sheet, terminalUpper);
    if (isDev) {
      console.log(`[pots] ${fileName}: ${rows.length} rows`);
    }
    allRows.push(...rows);
  } catch (error) {
    if (error instanceof PotsLoadError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    if (isDev) {
      console.log(`[pots] ${fileName}: failed (${message})`);
    }
    errors.push({ file: fileName, message });
  }

  const berths = uniqueList(allRows.map((row) => row.berth));

  return { rows: allRows, berths, errors };
};
