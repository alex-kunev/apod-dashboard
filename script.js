const API_KEY = "2zDiX5z20sM491AZeJRM0Smg5ZNsG42dspeqHB5V";
const API_URL = "https://api.nasa.gov/planetary/apod";

const form = document.getElementById("apod-form");
const dateInput = document.getElementById("date");
const statusMessage = document.getElementById("status-message");
const apodCard = document.getElementById("apod-card");
const mediaWrapper = document.getElementById("media-wrapper");
const apodDate = document.getElementById("apod-date");
const apodCopyright = document.getElementById("apod-copyright");
const apodTitle = document.getElementById("apod-title");
const apodExplanation = document.getElementById("apod-explanation");

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
  setStatus("Loading picture...");
  apodCard.classList.add("hidden");

  try {
    const response = await fetch(buildUrl(date));

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    renderApod(data);
    setStatus(`Showing APOD for ${data.date}.`);
  } catch (error) {
    setStatus(`Could not load APOD. ${error.message}`, true);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadApod(dateInput.value);
});

loadApod();
