import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";

export type ContainerEvent = {
  activity: string;
  activityDate: string;
  locationVessel: string;
  status: string;
  country: string;
  size: string;
  type: string;
};

export type ContainerTrackingResult = {
  container: string;
  size: string;
  type: string;
  events: ContainerEvent[];
};

type RowField =
  | "container"
  | "activity"
  | "activityDate"
  | "locationVessel"
  | "status"
  | "country"
  | "size"
  | "type";

const HEADER_TO_FIELD: Record<string, RowField> = {
  container: "container",
  containerno: "container",
  containernumber: "container",
  activity: "activity",
  activitydate: "activityDate",
  activitydatetime: "activityDate",
  locationvessel: "locationVessel",
  locationvesselname: "locationVessel",
  location: "locationVessel",
  vessel: "locationVessel",
  status: "status",
  country: "country",
  size: "size",
  type: "type",
};

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[./]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s/g, "");

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

const formatDate = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

const parseExcelDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDate(value);
  }

  if (typeof value === "number") {
    const parsed = xlsx.SSF.parse_date_code(value);
    if (parsed) {
      const { y, m, d } = parsed;
      const date = new Date(y, m - 1, d);
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

const normalizeContainer = (value: string) =>
  value.replace(/[\s-]+/g, "").toUpperCase();

const readWorkbook = (filePath: string) => {
  const buffer = fs.readFileSync(filePath);
  return xlsx.read(buffer, {
    type: "buffer",
    cellDates: true,
    cellText: false,
    cellNF: false,
  });
};

const parseDateForSort = (value: string) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

export const loadContainerTracking = async (
  container: string
): Promise<ContainerTrackingResult> => {
  const filePath = path.join(process.cwd(), "public", "container-number.xlsx");
  if (!fs.existsSync(filePath)) {
    throw new Error("container-number.xlsx not found in /public");
  }
  const stats = fs.statSync(filePath);
  if (!stats.isFile() || stats.size === 0) {
    throw new Error("container-number.xlsx is empty or not a file");
  }
  fs.accessSync(filePath, fs.constants.R_OK);

  const workbook = readWorkbook(filePath);
  const preferredSheet = workbook.SheetNames.find(
    (name) => name === "Container Tracking"
  );
  const sheetName = preferredSheet ?? workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("No sheets found in container-number.xlsx");
  }
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error("Sheet not available in container-number.xlsx");
  }

  const rows = xlsx.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: "",
  }) as unknown[][];

  if (rows.length === 0) {
    return { container, size: "", type: "", events: [] };
  }

  const headers = (rows[0] ?? []).map((value) =>
    normalizeHeader(toStringValue(value))
  );
  const mappedHeaders = headers.map((header) => HEADER_TO_FIELD[header] ?? null);
  const normalizedTarget = normalizeContainer(container);

  let size = "";
  let type = "";

  const events = rows.slice(1).reduce<ContainerEvent[]>((acc, row) => {
    const record: Record<RowField, string> = {
      container: "",
      activity: "",
      activityDate: "",
      locationVessel: "",
      status: "",
      country: "",
      size: "",
      type: "",
    };

    row.forEach((value, index) => {
      const field = mappedHeaders[index];
      if (!field) {
        return;
      }
      if (field === "activityDate") {
        record.activityDate = parseExcelDate(value);
      } else {
        record[field] = toStringValue(value);
      }
    });

    const normalizedRecord = normalizeContainer(record.container);
    if (!normalizedRecord || normalizedRecord !== normalizedTarget) {
      return acc;
    }

    if (!size && record.size) {
      size = record.size;
    }
    if (!type && record.type) {
      type = record.type;
    }

    acc.push({
      activity: record.activity,
      activityDate: record.activityDate,
      locationVessel: record.locationVessel,
      status: record.status,
      country: record.country,
      size: record.size,
      type: record.type,
    });
    return acc;
  }, []);

  events.sort((a, b) => {
    const aTime = parseDateForSort(a.activityDate);
    const bTime = parseDateForSort(b.activityDate);
    if (aTime === null && bTime === null) {
      return 0;
    }
    if (aTime === null) {
      return 1;
    }
    if (bTime === null) {
      return -1;
    }
    return aTime - bTime;
  });

  return { container: container.toUpperCase(), size, type, events };
};
