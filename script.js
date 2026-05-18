const API_KEY = "2zDiX5z20sM491AZeJRM0Smg5ZNsG42dspeqHB5V";
const API_URL = "https://api.nasa.gov/planetary/apod";
const APOD_START_DATE = "1995-06-16";

const form = document.getElementById("apod-form");
const dateInput = document.getElementById("date");
const prevDayButton = document.getElementById("prev-day");
const nextDayButton = document.getElementById("next-day");
const toggleCalendarButton = document.getElementById("toggle-calendar");
const calendarPanel = document.getElementById("calendar-panel");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
const calendarMonthLabel = document.getElementById("calendar-month");
const calendarGrid = document.getElementById("calendar-grid");
const statusMessage = document.getElementById("status-message");
const apodCard = document.getElementById("apod-card");
const mediaWrapper = document.getElementById("media-wrapper");
const apodDate = document.getElementById("apod-date");
const apodCopyright = document.getElementById("apod-copyright");
const apodTitle = document.getElementById("apod-title");
const apodExplanation = document.getElementById("apod-explanation");

let displayedMonth = "";

function getTodayDateString() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function clampDate(date, maxDate) {
  if (date < APOD_START_DATE) return APOD_START_DATE;
  if (date > maxDate) return maxDate;
  return date;
}

function addDays(date, days) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function initializeDateBoundaries() {
  const today = getTodayDateString();
  dateInput.min = APOD_START_DATE;
  dateInput.max = today;
  return today;
}

function updateNavButtons(selectedDate) {
  const today = dateInput.max || getTodayDateString();
  prevDayButton.disabled = selectedDate <= APOD_START_DATE;
  nextDayButton.disabled = selectedDate >= today;
}

function setCalendarOpen(isOpen) {
  calendarPanel.classList.toggle("hidden", !isOpen);
  toggleCalendarButton.setAttribute("aria-expanded", String(isOpen));
  toggleCalendarButton.textContent = isOpen ? "▲" : "▼";
}

function formatDateParts(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayPart = String(day).padStart(2, "0");
  return `${year}-${month}-${dayPart}`;
}

function getMonthDate(year, monthIndex, day = 1) {
  return new Date(Date.UTC(year, monthIndex, day));
}

function getDisplayedMonthParts() {
  const [year, month] = displayedMonth.split("-").map(Number);
  return { year, monthIndex: month - 1 };
}

function updateMonthNavButtons(today) {
  const { year, monthIndex } = getDisplayedMonthParts();
  const prevMonthLastDay = getMonthDate(year, monthIndex, 0);
  const nextMonthFirstDay = getMonthDate(year, monthIndex + 1, 1);
  prevMonthButton.disabled = prevMonthLastDay.toISOString().slice(0, 10) < APOD_START_DATE;
  nextMonthButton.disabled = nextMonthFirstDay.toISOString().slice(0, 10) > today;
}

function renderCalendar(selectedDate) {
  if (!displayedMonth) {
    displayedMonth = selectedDate.slice(0, 7);
  }

  const today = dateInput.max || getTodayDateString();
  const { year, monthIndex } = getDisplayedMonthParts();
  const firstDayOfMonth = getMonthDate(year, monthIndex, 1);
  const firstWeekday = firstDayOfMonth.getUTCDay();
  const daysInMonth = getMonthDate(year, monthIndex + 1, 0).getUTCDate();

  calendarMonthLabel.textContent = firstDayOfMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstWeekday; i += 1) {
    const spacer = document.createElement("span");
    spacer.className = "calendar-spacer";
    calendarGrid.appendChild(spacer);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateValue = formatDateParts(year, monthIndex, day);
    const dayButton = document.createElement("button");
    dayButton.type = "button";
    dayButton.className = "calendar-day";
    dayButton.textContent = String(day);
    dayButton.dataset.date = dateValue;

    if (dateValue === selectedDate) {
      dayButton.classList.add("selected");
    }

    if (dateValue === today) {
      dayButton.classList.add("today");
    }

    if (dateValue < APOD_START_DATE || dateValue > today) {
      dayButton.disabled = true;
    } else {
      dayButton.addEventListener("click", () => {
        loadApod(dateValue);
      });
    }

    calendarGrid.appendChild(dayButton);
  }

  updateMonthNavButtons(today);
}

function syncDateState(selectedDate) {
  dateInput.value = selectedDate;
  displayedMonth = selectedDate.slice(0, 7);
  updateNavButtons(selectedDate);
  renderCalendar(selectedDate);
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = isError ? "error" : "";
}

function buildUrl(date) {
  const url = new URL(API_URL);
  url.searchParams.set("api_key", API_KEY);

  if (date) {
    url.searchParams.set("date", date);
  }

  return url.toString();
}

function renderMedia(data) {
  mediaWrapper.innerHTML = "";

  if (data.media_type === "image") {
    const image = document.createElement("img");
    image.src = data.url || data.hdurl;
    image.alt = data.title || "Astronomy Picture of the Day";
    image.loading = "eager";
    mediaWrapper.appendChild(image);
    return;
  }

  if (data.media_type === "video") {
    const iframe = document.createElement("iframe");
    iframe.src = data.url;
    iframe.title = data.title || "Astronomy Picture of the Day video";
    iframe.allowFullscreen = true;
    mediaWrapper.appendChild(iframe);
    return;
  }

  const fallback = document.createElement("p");
  fallback.textContent = "Unsupported media type returned by the API.";
  mediaWrapper.appendChild(fallback);
}

function renderApod(data) {
  renderMedia(data);
  apodDate.textContent = data.date || "";
  apodCopyright.textContent = data.copyright
    ? `© ${data.copyright}`
    : "";
  apodTitle.textContent = data.title || "Untitled";
  apodExplanation.textContent = data.explanation || "No description available.";
  apodCard.classList.remove("hidden");
}

async function loadApod(date = "") {
  const today = initializeDateBoundaries();
  const requestedDate = date || dateInput.value || today;

  if (!isValidDateString(requestedDate)) {
    setStatus("Please choose a valid date.", true);
    return;
  }

  const selectedDate = clampDate(requestedDate, today);
  syncDateState(selectedDate);

  if (selectedDate !== requestedDate) {
    setStatus(`Date adjusted to ${selectedDate}.`);
  }

  setStatus("Loading picture...");
  apodCard.classList.add("hidden");

  try {
    const response = await fetch(buildUrl(selectedDate));

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    renderApod(data);
    const resolvedDate = data.date || selectedDate;
    if (resolvedDate !== dateInput.value) {
      syncDateState(resolvedDate);
    }
    setStatus(`Showing APOD for ${data.date}.`);
  } catch (error) {
    setStatus(`Could not load APOD. ${error.message}`, true);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadApod(dateInput.value);
});

prevDayButton.addEventListener("click", () => {
  const currentDate = dateInput.value || dateInput.max || getTodayDateString();
  loadApod(addDays(currentDate, -1));
});

nextDayButton.addEventListener("click", () => {
  const currentDate = dateInput.value || dateInput.max || getTodayDateString();
  loadApod(addDays(currentDate, 1));
});

dateInput.addEventListener("change", () => {
  loadApod(dateInput.value);
});

function openCalendarFromInput() {
  setCalendarOpen(true);
}

dateInput.addEventListener("focus", openCalendarFromInput);
dateInput.addEventListener("click", openCalendarFromInput);

toggleCalendarButton.addEventListener("click", () => {
  const isOpen = toggleCalendarButton.getAttribute("aria-expanded") !== "true";
  setCalendarOpen(isOpen);
});

prevMonthButton.addEventListener("click", () => {
  const { year, monthIndex } = getDisplayedMonthParts();
  const previousMonth = getMonthDate(year, monthIndex - 1, 1);
  displayedMonth = previousMonth.toISOString().slice(0, 7);
  renderCalendar(dateInput.value);
});

nextMonthButton.addEventListener("click", () => {
  const { year, monthIndex } = getDisplayedMonthParts();
  const nextMonth = getMonthDate(year, monthIndex + 1, 1);
  displayedMonth = nextMonth.toISOString().slice(0, 7);
  renderCalendar(dateInput.value);
});

dateInput.value = initializeDateBoundaries();
syncDateState(dateInput.value);
setCalendarOpen(toggleCalendarButton.getAttribute("aria-expanded") === "true");
loadApod();
