// src/background.js

// Import necessary libraries with correct import syntax
import { DateTime } from 'luxon';
import { parse } from 'chrono-node'; // Selective import
 

/**
 * Time Zone Dictionary
 * Maps common time zone abbreviations and names to IANA time zone strings.
 */
const TIMEZONE_MAP = {
  // UTC / GMT
  "UTC": "Etc/UTC",
  "GMT": "Etc/UTC",
  // Africa
  "WAT": "Africa/Lagos",
  "WEST CENTRAL AFRICA": "Africa/Lagos",
  "CAT": "Africa/Harare",
  "EAT": "Africa/Nairobi",
  "SAST": "Africa/Johannesburg",
  "LAGOS": "Africa/Lagos",
  // Europe
  "LONDON": "Europe/London",
  "WET": "Europe/Lisbon",
  "CET": "Europe/Berlin",
  "CEST": "Europe/Berlin",
  "EET": "Europe/Bucharest",
  "EEST": "Europe/Bucharest",
  // Asia
  "IST": "Asia/Kolkata",
  "DUBAI": "Asia/Dubai",
  "RIYADH": "Asia/Riyadh",
  "JST": "Asia/Tokyo",
  // North America
  "EST": "America/New_York",
  "EDT": "America/New_York",
  "CST": "America/Chicago",
  "CDT": "America/Chicago",
  "MST": "America/Denver",
  "MDT": "America/Denver",
  "PST": "America/Los_Angeles",
  "PDT": "America/Los_Angeles",
  "AKST": "America/Anchorage",
  "AKDT": "America/Anchorage",
  "HST": "Pacific/Honolulu",
  // Common synonyms or spelled-out references
  "PARIS": "Europe/Paris",
  "BERLIN": "Europe/Berlin",
  "NEW YORK": "America/New_York",
  "LOS ANGELES": "America/Los_Angeles",
  // Raw offsets
  "UTC+1": "Etc/GMT-1",
  "UTC-1": "Etc/GMT+1",
  "UTC+2": "Etc/GMT-2",
  "UTC-2": "Etc/GMT+2",
  "UTC+3": "Etc/GMT-3",
  "UTC-3": "Etc/GMT+3",
  "UTC+4": "Etc/GMT-4",
  "UTC-4": "Etc/GMT+4",
  "UTC+5": "Etc/GMT-5",
  "UTC-5": "Etc/GMT+5",
  "UTC+5:30": "Asia/Kolkata",
  "UTC+5.5": "Asia/Kolkata",
  "UTC+6": "Etc/GMT-6",
  "UTC-6": "Etc/GMT+6",
  "UTC+7": "Etc/GMT-7",
  "UTC-7": "Etc/GMT+7",
  "UTC+8": "Etc/GMT-8",
  "UTC-8": "Etc/GMT+8",
  "UTC+9": "Etc/GMT-9",
  "UTC-9": "Etc/GMT+9",
  "UTC+10": "Etc/GMT-10",
  "UTC-10": "Etc/GMT+10",
  "UTC+11": "Etc/GMT-11",
  "UTC-11": "Etc/GMT+11",
  "UTC+12": "Etc/GMT-12",
  "UTC-12": "Etc/GMT+12",
};

/**
 * Detects the language of the input text.
 * @param {string} text - The text to analyze.
 * @returns {string} - The detected language code (ISO 639-3).
 */
function detectLanguage(text) {
  return 'eng'; // Default to English
}

/**
 * Detects the first matching time zone in the given text.
 * @param {string} text - The text to search for time zone abbreviations or names.
 * @returns {string|null} - The IANA time zone string or null if not found.
 */
function detectTimeZone(text) {
  const upper = text.toUpperCase();
  for (const [token, zone] of Object.entries(TIMEZONE_MAP)) {
    // Use word boundaries to prevent partial matches
    const regex = new RegExp(`\\b${token}\\b`, 'i');
    if (regex.test(text)) {
      return zone;
    }
  }
  return null;
}

/**
 * Extracts the time zone from the text and cleans the text by removing the time zone information.
 * @param {string} text - The text containing time and time zone.
 * @returns {object} - An object containing the detected time zone and the cleaned text.
 */
function extractTimeZone(text) {
  const zone = detectTimeZone(text);
  if (!zone) return { timeZone: null, cleanedText: text };

  let cleaned = text;
  // Sort tokens by length (descending) to remove multi-word first, e.g., "WEST CENTRAL AFRICA"
  const tokens = Object.keys(TIMEZONE_MAP).sort((a, b) => b.length - a.length);
  for (let t of tokens) {
    const reg = new RegExp(`\\b${t}\\b`, "gi"); // Ensure full word match
    cleaned = cleaned.replace(reg, "");
  }
  return { timeZone: zone, cleanedText: cleaned.trim() };
}

/**
 * Removes ordinal suffixes from date strings.
 * @param {string} text - The input date string.
 * @returns {string} - The cleaned date string without ordinal suffixes.
 */
function removeOrdinalSuffixes(text) {
  return text.replace(/(\d{1,2})(st|nd|rd|th)/gi, '$1');
}

/**
 * Expands shorthand year notations.
 * @param {string} text - The input date string.
 * @returns {string} - The expanded date string.
 */
function expandShorthandYears(text) {
  return text.replace(/'(\d{2})\b/g, (match, p1) => {
    const year = parseInt(p1, 10);
    return year >= 0 && year <= 99 ? `20${p1}` : match;
  });
}

/**
 * Parses the input date string using Chrono with the specified time zone.
 * @param {string} input - The date string to parse.
 * @param {string|null} timeZone - The IANA time zone string.
 * @returns {DateTime|null} - The parsed Luxon DateTime object or null if invalid.
 */
function parseDateWithChrono(input, timeZone) {
  const results = parse(input, new Date());
  if (results.length > 0) {
    const parsedDate = results[0].start.date();

    // Create a Luxon DateTime in the specified time zone
    return DateTime.fromJSDate(parsedDate, { zone: timeZone || 'UTC' });
  }
  return null;
}

/**
 * Parses the input date string using Luxon with the specified time zone.
 * This function serves as a fallback if Chrono fails to parse.
 * @param {string} input - The date string to parse.
 * @param {string|null} timeZone - The IANA time zone string.
 * @returns {DateTime|null} - The parsed Luxon DateTime object or null if invalid.
 */
function parseDateWithLuxon(input, timeZone) {
  // Define possible formats based on expected input
  const formats = [
    "LLL d, yyyy hh:mm a",        // e.g., "Jan 15, 2025 01:00 PM"
    "LLL d yyyy hh:mm a",         // e.g., "Jan 15 2025 01:00 PM"
    "d LLL yyyy hh:mm a",         // e.g., "15 Jan 2025 01:00 PM"
    "LLL d, yyyy",                 // e.g., "Jan 15, 2025"
    "LLL d yyyy",                  // e.g., "Jan 15 2025"
    "d LLL yyyy",                  // e.g., "15 Jan 2025"
    "yyyy-LL-dd'T'HH:mm:ssZZ",    // ISO format
    "yyyy-LL-dd HH:mm:ss",         // Alternative ISO without timezone
  ];

  // Attempt to parse using the defined formats
  for (const format of formats) {
    const dt = DateTime.fromFormat(input, format, { zone: timeZone || 'UTC' });
    if (dt.isValid) {
      return dt;
    }
  }

  // Fallback to ISO parsing
  let dt = DateTime.fromISO(input, { zone: timeZone || 'UTC' });
  if (dt.isValid) return dt;

  // Fallback to RFC2822 parsing
  dt = DateTime.fromRFC2822(input, { zone: timeZone || 'UTC' });
  if (dt.isValid) return dt;

  // Final fallback: use JavaScript Date parsing
  const jsDate = new Date(Date.parse(input));
  if (!isNaN(jsDate)) {
    dt = DateTime.fromJSDate(jsDate, { zone: timeZone || 'UTC' });
    if (dt.isValid) return dt;
  }

  // If all parsing attempts fail, return null
  return null;
}

/**
 * Parses the input date string using Chrono and Luxon.
 * Prioritizes Chrono's parsing capabilities and falls back to Luxon if necessary.
 * @param {string} input - The date string to parse.
 * @param {string|null} timeZone - The IANA time zone string.
 * @returns {DateTime|null} - The parsed Luxon DateTime object or null if invalid.
 */
function parseDate(input, timeZone) {
  // First, attempt to parse with Chrono
  const parsedWithChrono = parseDateWithChrono(input, timeZone);
  if (parsedWithChrono && parsedWithChrono.isValid) return parsedWithChrono;

  // Fallback to Luxon
  return parseDateWithLuxon(input, timeZone);
}

/**
 * Parses the Zoom meeting topic and link from the selected text.
 * @param {string} text - The selected text containing Zoom details.
 * @returns {object} - An object containing the topic and Zoom link.
 */
function parseZoomData(text) {
  let zoomTopic = null;
  let zoomLink = null;

  // Extract Topic
  const topicMatch = text.match(/Topic:\s*(.+)/i);
  if (topicMatch) {
    zoomTopic = topicMatch[1].split("\n")[0].trim();
  }

  // Extract Zoom Link
  const linkMatch = text.match(/(https?:\/\/[^\s]+zoom\.us\/j\/[^\s]+)/i);
  if (linkMatch) {
    zoomLink = linkMatch[1].trim();
  }

  return { topic: zoomTopic, link: zoomLink };
}

/**
 * Converts DateTime to GCal-friendly UTC (YYYYMMDDTHHMMSSZ)
 * @param {DateTime} date - The Luxon DateTime object.
 * @returns {string} - The formatted UTC string.
 */
function toUTCString(date) {
  const iso = date.toISO(); // e.g., "2025-01-13T12:00:00.000Z"
  // Remove hyphens, colons, and milliseconds to match GCal format
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"); // "20250113T120000Z"
}

// ---------------------------
// On Installation: Context Menu + Welcome Page
// ---------------------------
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "welcome.html" });
  }
  chrome.contextMenus.create({
    id: "addToCalendar",
    title: "Add to Calendar",
    contexts: ["selection"]
  });
});

// ---------------------------
// Notification Helper
// ---------------------------
/**
 * Displays a notification to the user.
 * @param {string} message - The message to display in the notification.
 */
function showNotification(message) {
  const iconUrl = chrome.runtime.getURL("icons/icon48.png"); // Generates absolute URL

  chrome.notifications.create({
    type: "basic",
    iconUrl: iconUrl,
    title: "Add to Calendar",
    message: message
  });
}

// ---------------------------
// Context Menu onClick Handler
// ---------------------------
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToCalendar") {
    const selectedText = info.selectionText;
    if (!selectedText) return;

    // 1) Extract Zoom data (Topic and Link) - Optional
    const { topic: zoomTopic, link: zoomLink } = parseZoomData(selectedText);

    // 2) Attempt to Extract the "Time" line using regex
    //    If not found, try to find any date and time within the selected text using Chrono
    let timeText = null;
    let timeZone = null;

    // Try to match a line starting with "Time:"
    const timeMatch = selectedText.match(/Time:\s*(.+)/i);
    if (timeMatch) {
      timeText = timeMatch[1].trim();
      // Extract time zone from the "Time" line
      const extracted = extractTimeZone(timeText);
      timeZone = extracted.timeZone;
      timeText = extracted.cleanedText;
    } else {
      // If "Time:" line not found, attempt to find any date and time in the text using Chrono
      const parsed = parse(selectedText, new Date());
      if (parsed.length > 0) {
        timeText = parsed[0].text;
        // Attempt to extract time zone from the entire matched time text
        const extracted = extractTimeZone(timeText);
        timeZone = extracted.timeZone;
        timeText = extracted.cleanedText;
      }
    }

    if (!timeText) {
      showNotification(
        "Unable to find the Time information. Please ensure the selection includes a Time line or recognizable date and time."
      );
      console.error("Time information not found in the selected text.");
      return;
    }

    console.log("Extracted Time Zone:", timeZone);
    console.log("Time Text for Parsing:", timeText);

    // Preprocessing Steps
    let processedTimeText = removeOrdinalSuffixes(timeText);
    processedTimeText = expandShorthandYears(processedTimeText);

    // Parse date/time from the cleaned "Time" text using Chrono and Luxon
    const parsedDateTime = parseDate(processedTimeText, timeZone);

    if (!parsedDateTime || !parsedDateTime.isValid) {
      showNotification("Unable to recognize the date/time. Please try another selection.");
      console.error("Date parsing failed for input:", processedTimeText);
      return;
    }

    console.log("Parsed DateTime:", parsedDateTime.toISO());

    // Convert parsed DateTime to UTC for Google Calendar
    const startUTC = parsedDateTime.toUTC();
    const endUTC = startUTC.plus({ hours: 1 }); // Default duration 1 hour

    console.log("Start UTC:", startUTC.toISO());
    console.log("End UTC:", endUTC.toISO());

    // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
    const startTimeFormatted = toUTCString(startUTC);
    const endTimeFormatted = toUTCString(endUTC);

    console.log("Formatted Start Time:", startTimeFormatted);
    console.log("Formatted End Time:", endTimeFormatted);

    // Title & location for GCal
    const eventTitle = zoomTopic ? zoomTopic : "New Event";
    const eventLocation = zoomLink ? zoomLink : "";

    // Do NOT set ctz parameter to avoid misinterpretation
    // Google Calendar will use the user's system time zone by default

    // Construct GCal URL without ctz
    const calendarUrl =
      `https://calendar.google.com/calendar/render`
      + `?action=TEMPLATE`
      + `&dates=${startTimeFormatted}/${endTimeFormatted}`
      + `&text=${encodeURIComponent(eventTitle)}`
      + `&location=${encodeURIComponent(eventLocation)}`;

    console.log("Constructed Calendar URL:", calendarUrl);

    // Open in new tab and notify
    chrome.tabs.create({ url: calendarUrl }, () => {
      showNotification("Event added to Google Calendar.");
    });
  }
});
