const API_KEY = "2zDiX5z20sM491AZeJRM0Smg5ZNsG42dspeqHB5V";
const API_URL = "https://api.nasa.gov/planetary/apod";
const APOD_START_DATE = "1995-06-16";

const form = document.getElementById("apod-form");
const dateInput = document.getElementById("date");
const prevDayButton = document.getElementById("prev-day");
const nextDayButton = document.getElementById("next-day");
const statusMessage = document.getElementById("status-message");
const apodCard = document.getElementById("apod-card");
const mediaWrapper = document.getElementById("media-wrapper");
const apodDate = document.getElementById("apod-date");
const apodCopyright = document.getElementById("apod-copyright");
const apodTitle = document.getElementById("apod-title");
const apodExplanation = document.getElementById("apod-explanation");

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

function updateDateBoundaries() {
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
    image.src = data.hdurl || data.url;
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
  const today = updateDateBoundaries();
  const requestedDate = date || dateInput.value || today;

  if (!isValidDateString(requestedDate)) {
    setStatus("Please choose a valid date.", true);
    return;
  }

  const selectedDate = clampDate(requestedDate, today);
  dateInput.value = selectedDate;
  updateNavButtons(selectedDate);

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
    dateInput.value = data.date || selectedDate;
    updateNavButtons(dateInput.value);
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

dateInput.value = updateDateBoundaries();
updateNavButtons(dateInput.value);
loadApod();
