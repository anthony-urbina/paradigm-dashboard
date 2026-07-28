/*********************
 * JAKE CONFIG
 *********************/
const GHL_KEY = "pit-bc096b6a-8b0a-44b0-a886-acf1896becfc";
const SHEET_NAME = "VET Fex";

const IMPORT_COL_NAME = "Imported";
const SHOULD_IMPORT_COL_NAME = "Should Import";

const LOCATION_ID = "CpWoq9njxkP2EEuDPIwf";

/*********************
 * JAKE CUSTOM FIELD IDS
 *********************/
const FIELD_IDS = {
  leadType: "0SmsBQOhKIvfKsOnHcOY",
  coverageRequested: "1NRWnVJ7KkQ6LJvFhCa2",
  maritalStatus: "6KrsX5ORNvLtaN6TduSk",
  age: "DQME5ncmLlm4Ggo3HYhx",
  bestTimeToCall: "Nvf9BoBFOfbs6KmY9Iq3",
  branchOfService: "PLYJZXrD1icVuZaYxlEz",
  additionalNotes: "Qs9MlOfHxngdGy7kmw2Y",
  militaryStatus: "WgSf98L9x0XN8yCXmwv3",
  dateCreated: "aFhXVKGzTvvpTxuvjzQt",
  beneficiary: "krgL69zZV3fAM7D6uqcG",
  dob: "p9TcWF2pTS3pjx31BY6c",
  leadSource: "vwb20lGCNg9akmojBRuL",
  primaryConcern: "yxJ65MdK01S3yLVRPmY2",
};

/*********************
 * COLUMN HELPERS
 *********************/

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {Object<string, number>}
 */
function getColumnMap(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  return headers.reduce(function (acc, header, index) {
    const key = String(header || "").trim();

    if (key) {
      acc[key] = index;
    }

    return acc;
  }, {});
}

/**
 * @param {unknown[]} row
 * @param {Object<string, number>} col
 * @param {string} name
 * @returns {unknown}
 */
function getCell(row, col, name) {
  if (!(name in col)) {
    return "";
  }

  return row[col[name]];
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} rowIndex
 * @param {Object<string, number>} col
 * @param {string} name
 * @param {unknown} value
 */
function setCellByHeader(sheet, rowIndex, col, name, value) {
  if (!(name in col)) {
    Logger.log("❌ Missing column: " + name);
    return;
  }

  sheet.getRange(rowIndex, col[name] + 1).setValue(value);
}

/**
 * Gets a value using the first matching column name.
 *
 * @param {unknown[]} row
 * @param {Object<string, number>} col
 * @param {string[]} possibleNames
 * @returns {unknown}
 */
function getFirstMatchingCell(row, col, possibleNames) {
  for (let i = 0; i < possibleNames.length; i++) {
    const columnName = possibleNames[i];

    if (columnName in col) {
      return row[col[columnName]];
    }
  }

  return "";
}

/*********************
 * STATE NORMALIZATION
 *********************/
const stateMap = {
  alabama: "AL",
  al: "AL",
  alaska: "AK",
  ak: "AK",
  arizona: "AZ",
  az: "AZ",
  arkansas: "AR",
  ar: "AR",
  california: "CA",
  ca: "CA",
  calif: "CA",
  colorado: "CO",
  co: "CO",
  connecticut: "CT",
  ct: "CT",
  delaware: "DE",
  de: "DE",
  florida: "FL",
  fl: "FL",
  "fl.": "FL",
  georgia: "GA",
  ga: "GA",
  hawaii: "HI",
  hi: "HI",
  idaho: "ID",
  id: "ID",
  illinois: "IL",
  il: "IL",
  indiana: "IN",
  in: "IN",
  iowa: "IA",
  ia: "IA",
  kansas: "KS",
  ks: "KS",
  kentucky: "KY",
  ky: "KY",
  louisiana: "LA",
  la: "LA",
  maine: "ME",
  me: "ME",
  maryland: "MD",
  md: "MD",
  massachusetts: "MA",
  ma: "MA",
  michigan: "MI",
  mi: "MI",
  minnesota: "MN",
  mn: "MN",
  mississippi: "MS",
  ms: "MS",
  missouri: "MO",
  mo: "MO",
  montana: "MT",
  mt: "MT",
  nebraska: "NE",
  ne: "NE",
  nevada: "NV",
  nv: "NV",
  "new hampshire": "NH",
  nh: "NH",
  "new jersey": "NJ",
  nj: "NJ",
  "new mexico": "NM",
  nm: "NM",
  "new york": "NY",
  ny: "NY",
  "north carolina": "NC",
  nc: "NC",
  "north dakota": "ND",
  nd: "ND",
  ohio: "OH",
  oh: "OH",
  oklahoma: "OK",
  ok: "OK",
  oregon: "OR",
  or: "OR",
  pennsylvania: "PA",
  pa: "PA",
  "rhode island": "RI",
  ri: "RI",
  "south carolina": "SC",
  sc: "SC",
  "south dakota": "SD",
  sd: "SD",
  tennessee: "TN",
  tn: "TN",
  texas: "TX",
  tx: "TX",
  "tex.": "TX",
  utah: "UT",
  ut: "UT",
  vermont: "VT",
  vt: "VT",
  virginia: "VA",
  va: "VA",
  washington: "WA",
  wa: "WA",
  "west virginia": "WV",
  wv: "WV",
  wisconsin: "WI",
  wi: "WI",
  wyoming: "WY",
  wy: "WY",
  "district of columbia": "DC",
  "washington dc": "DC",
  dc: "DC",
};

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizeState(value) {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  const cleaned = raw
    .toLowerCase()
    .replace(/\b\d{5}(?:-\d{4})?\b/g, "")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (stateMap[cleaned]) {
    return stateMap[cleaned];
  }

  const parts = cleaned.split(/\s+/);

  for (let i = 0; i < parts.length; i++) {
    if (stateMap[parts[i]]) {
      return stateMap[parts[i]];
    }
  }

  return cleaned.toUpperCase().slice(0, 2);
}

/*********************
 * DATE AND AGE HELPERS
 *********************/

/**
 * @param {unknown} value
 * @returns {Date|null}
 */
function parsePossibleDate(value) {
  if (!value) {
    return null;
  }

  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return value;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);

  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  const match = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2}|\d{4})$/);

  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  let year = Number(match[3]);

  if (year < 100) {
    year += year >= 30 ? 1900 : 2000;
  }

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

/**
 * @param {Date} date
 * @returns {number}
 */
function calculateAgeFromDate(date) {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();

  const birthdayHasOccurred =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());

  if (!birthdayHasOccurred) {
    age--;
  }

  return age >= 0 && age < 120 ? age : 0;
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
function normalizeAge(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return "";
  }

  const possibleDate = parsePossibleDate(raw);

  if (possibleDate) {
    const calculatedAge = calculateAgeFromDate(possibleDate);
    return calculatedAge ? String(calculatedAge) : "";
  }

  const value = String(raw).trim();

  if (/^\d{1,3}$/.test(value)) {
    const age = Number(value);
    return age > 0 && age < 120 ? String(age) : "";
  }

  const yearMatch = value.match(/\b(19|20)\d{2}\b/);

  if (yearMatch) {
    const birthYear = Number(yearMatch[0]);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    return age > 0 && age < 120 ? String(age) : "";
  }

  const numberMatch = value.match(/\b\d{1,3}\b/);

  if (numberMatch) {
    const age = Number(numberMatch[0]);
    return age > 0 && age < 120 ? String(age) : "";
  }

  return "";
}

/**
 * Only returns a DOB when the input appears to contain a full date.
 *
 * @param {unknown} raw
 * @returns {string}
 */
function normalizeDob(raw) {
  if (!raw) {
    return "";
  }

  const rawString = String(raw).trim();

  // Prevent a plain age such as "67" from being treated as a date.
  if (/^\d{1,3}$/.test(rawString)) {
    return "";
  }

  const date = parsePossibleDate(raw);

  if (!date) {
    return "";
  }

  return Utilities.formatDate(date, Session.getScriptTimeZone(), "MM/dd/yyyy");
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
function normalizeDateCreated(raw) {
  const parsed = parsePossibleDate(raw);

  if (!parsed) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

/*********************
 * VALUE HELPERS
 *********************/

/**
 * @param {unknown} value
 * @returns {string}
 */
function cleanText(value) {
  return String(value || "").trim();
}

/**
 * @param {unknown} phone
 * @returns {string}
 */
function normalizePhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 10) {
    digits = "1" + digits;
  }

  return digits ? "+" + digits : "";
}

/**
 * @param {unknown} name
 * @returns {boolean}
 */
function isTestName(name) {
  const normalized = cleanText(name).toLowerCase();

  return normalized.includes("chill") || normalized.includes("testlead") || normalized.includes("test lead");
}

/**
 * @param {unknown} phone
 * @returns {boolean}
 */
function isTestPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  return digits === "8603041607" || digits === "18603041607";
}

/**
 * Removes custom fields that have no value.
 *
 * @param {{id: string, field_value: unknown}[]} customFields
 * @returns {{id: string, field_value: unknown}[]}
 */
function removeEmptyCustomFields(customFields) {
  return customFields.filter(function (field) {
    const value = field.field_value;

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null && value !== undefined && String(value).trim() !== "";
  });
}

/*********************
 * ON CHANGE TRIGGER
 *********************/

/**
 * @param {{changeType?: string}} e
 */
function onChange(e) {
  const changeType = e && e.changeType ? e.changeType : "MANUAL";

  Logger.log("🔔 Trigger Fired, Type: " + changeType);

  if (changeType !== "INSERT_ROW" && changeType !== "MANUAL") {
    Logger.log("⛔ Not INSERT_ROW, ignoring");
    return;
  }

  importPendingLeads();
}

/*********************
 * IMPORT PENDING LEADS
 *********************/
function importPendingLeads() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    Logger.log("❌ Sheet not found: " + SHEET_NAME);
    return;
  }

  const col = getColumnMap(sheet);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  Logger.log("📄 Sheet has " + lastRow + " rows, scanning for pending leads...");

  if (!(IMPORT_COL_NAME in col)) {
    Logger.log("❌ Missing required tracking column: " + IMPORT_COL_NAME);
    return;
  }

  for (let rowIndex = lastRow; rowIndex >= 2; rowIndex--) {
    const row = sheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0];

    const importedFlag = getCell(row, col, IMPORT_COL_NAME);

    const shouldImportFlag = getCell(row, col, SHOULD_IMPORT_COL_NAME);

    if (cleanText(shouldImportFlag).toUpperCase() === "NO") {
      Logger.log("⛔ Should Import = NO, skipping row " + rowIndex);
      continue;
    }

    if (cleanText(importedFlag).toUpperCase() === "YES") {
      continue;
    }

    const ageOrDob = getFirstMatchingCell(row, col, ["Age/ DOB", "Age / DOB", "DOB/ AGE", "DOB / AGE"]);

    const lead = {
      date: getCell(row, col, "Date"),
      leadType: getCell(row, col, "Lead Type") || "Veteran",
      fullName: getCell(row, col, "Client Name"),
      phone: getCell(row, col, "Phone"),
      email: getCell(row, col, "Email"),
      state: getFirstMatchingCell(row, col, ["State", "State / Zip", "State/Zip"]),
      age: normalizeAge(ageOrDob),
      dob: normalizeDob(ageOrDob),
      militaryStatus: getCell(row, col, "Military Status"),
      branch: getCell(row, col, "Branch of Service"),
      maritalStatus: getCell(row, col, "Marital Status"),
      coverageRequested: getCell(row, col, "Desired Coverage"),
      primaryConcern: getCell(row, col, "Primary Concern"),
      beneficiary: getCell(row, col, "Beneficiary"),
      bestTimeToCall: getCell(row, col, "Time to Call"),
      notes: getCell(row, col, "Notes"),
      leadSource: "LAL",
    };

    const isEmpty = [lead.date, lead.fullName, lead.phone, lead.email, lead.state].every(function (value) {
      return !cleanText(value);
    });

    if (isEmpty) {
      continue;
    }

    Logger.log("🔎 Row " + rowIndex + ": " + JSON.stringify(lead, null, 2));

    const missingRequiredFields = [];

    if (!cleanText(lead.date)) {
      missingRequiredFields.push("Date");
    }

    if (!cleanText(lead.fullName)) {
      missingRequiredFields.push("Client Name");
    }

    if (!cleanText(lead.phone)) {
      missingRequiredFields.push("Phone");
    }

    if (!cleanText(lead.email)) {
      missingRequiredFields.push("Email");
    }

    if (!cleanText(lead.state)) {
      missingRequiredFields.push("State");
    }

    if (missingRequiredFields.length > 0) {
      Logger.log("⛔ Missing required fields on row " + rowIndex + ": " + missingRequiredFields.join(", "));
      continue;
    }

    if (isTestName(lead.fullName) || isTestPhone(lead.phone)) {
      Logger.log("🧪 Test lead skipped, row " + rowIndex);
      continue;
    }

    lead.state = normalizeState(lead.state);
    lead.phone = normalizePhone(lead.phone);
    lead.email = cleanText(lead.email).toLowerCase();
    lead.leadType = cleanText(lead.leadType) || "Veteran";

    Logger.log("🔧 Normalized Lead: " + JSON.stringify(lead, null, 2));

    const success = sendToGHL(lead);

    if (success) {
      setCellByHeader(sheet, rowIndex, col, IMPORT_COL_NAME, "Yes");

      Logger.log("✔ Imported, row " + rowIndex);
    } else {
      Logger.log("🔥 Failed, row " + rowIndex);
    }
  }

  Logger.log("🏁 Import scan complete");
}

/*********************
 * SEND TO GHL
 *********************/

/**
 * @param {{
 *   date: unknown,
 *   leadType: unknown,
 *   fullName: unknown,
 *   phone: string,
 *   email: string,
 *   state: string,
 *   age: string,
 *   dob: string,
 *   militaryStatus: unknown,
 *   branch: unknown,
 *   maritalStatus: unknown,
 *   coverageRequested: unknown,
 *   primaryConcern: unknown,
 *   beneficiary: unknown,
 *   bestTimeToCall: unknown,
 *   notes: unknown,
 *   leadSource: string
 * }} lead
 * @returns {boolean}
 */
function sendToGHL(lead) {
  try {
    const customFields = removeEmptyCustomFields([
      {
        id: FIELD_IDS.leadType,
        field_value: cleanText(lead.leadType),
      },
      {
        id: FIELD_IDS.leadSource,
        field_value: [lead.leadSource],
      },
      {
        id: FIELD_IDS.coverageRequested,
        field_value: cleanText(lead.coverageRequested),
      },
      {
        id: FIELD_IDS.maritalStatus,
        field_value: cleanText(lead.maritalStatus),
      },
      {
        id: FIELD_IDS.age,
        field_value: lead.age,
      },
      {
        id: FIELD_IDS.dob,
        field_value: lead.dob,
      },
      {
        id: FIELD_IDS.bestTimeToCall,
        field_value: cleanText(lead.bestTimeToCall),
      },
      {
        id: FIELD_IDS.branchOfService,
        field_value: cleanText(lead.branch),
      },
      {
        id: FIELD_IDS.additionalNotes,
        field_value: cleanText(lead.notes),
      },
      {
        id: FIELD_IDS.militaryStatus,
        field_value: cleanText(lead.militaryStatus),
      },
      {
        id: FIELD_IDS.beneficiary,
        field_value: cleanText(lead.beneficiary),
      },
      {
        id: FIELD_IDS.primaryConcern,
        field_value: cleanText(lead.primaryConcern),
      },
      {
        id: FIELD_IDS.dateCreated,
        field_value: normalizeDateCreated(lead.date),
      },
    ]);

    const payload = {
      name: cleanText(lead.fullName),
      phone: lead.phone,
      email: lead.email,
      state: lead.state,
      tags: ["vet"],
      locationId: LOCATION_ID,
      customFields: customFields,
    };

    Logger.log("📤 GHL Payload: " + JSON.stringify(payload, null, 2));

    const response = UrlFetchApp.fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + GHL_KEY,
        Version: "2021-07-28",
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    const status = response.getResponseCode();
    const body = response.getContentText();

    Logger.log("📥 GHL Status: " + status);
    Logger.log("📥 GHL Response: " + body);

    return status >= 200 && status < 300;
  } catch (error) {
    Logger.log("🔥 GHL ERROR: " + (error && error.message ? error.message : String(error)));

    return false;
  }
}

/*********************
 * MANUAL IMPORT
 *********************/
function manualImportPendingLeads() {
  onChange({
    changeType: "MANUAL",
  });
}

/*********************
 * DEBUG HELPERS
 *********************/
function checkSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  Logger.log("Spreadsheet name: " + spreadsheet.getName());

  Logger.log("Spreadsheet ID: " + spreadsheet.getId());

  Logger.log("Spreadsheet URL: " + spreadsheet.getUrl());

  if (!sheet) {
    Logger.log("❌ Sheet not found: " + SHEET_NAME);
    return;
  }

  Logger.log("Sheet found: " + sheet.getName());

  Logger.log("Headers: " + JSON.stringify(getColumnMap(sheet), null, 2));
}
