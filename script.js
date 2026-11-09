
const APOD_ENDPOINT = "https://api.nasa.gov/planetary/apod";
const NASA_API_KEY = "DEMO_KEY";
const MAX_RANGE_DAYS = 7;
const MIN_DATE = "1995-06-16";

const form = document.getElementById("searchForm");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const searchButton = document.getElementById("searchButton");
const statusMessage = document.getElementById("status");
const gallery = document.getElementById("gallery");
const imageModal = document.getElementById("imageModal");
const closeModalButton = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalDate = document.getElementById("modalDate");
const modalTitle = document.getElementById("modalTitle");
const modalExplanation = document.getElementById("modalExplanation");
const modalMediaLink = document.getElementById("modalMediaLink");

let activeRequest;

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}

function setStatus(message, state = "") {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
}

function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return "Choose both a start date and an end date.";
  }

  if (startDate < MIN_DATE || endDate < MIN_DATE) {
    return "NASA's APOD archive starts on June 16, 1995.";
  }

  if (startDate > endDate) {
    return "The start date must be on or before the end date.";
  }

  if (endDate > formatLocalDate(new Date())) {
    return "Choose a date that is today or earlier.";
  }

  const dayCount =
    (Date.parse(`${endDate}T00:00:00Z`) -
      Date.parse(`${startDate}T00:00:00Z`)) /
      86_400_000 +
    1;

  if (dayCount > MAX_RANGE_DAYS) {
    return `Choose a range of ${MAX_RANGE_DAYS} days or fewer.`;
  }

  return "";
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  if (item.media_type === "image") {
    const imageButton = document.createElement("button");
    imageButton.className = "image-link";
    imageButton.type = "button";
    imageButton.setAttribute("aria-label", `View ${item.title}`);

    const image = document.createElement("img");
    image.src = item.url;
    image.alt = item.title;
    image.loading = "lazy";
    imageButton.append(image);
    imageButton.addEventListener("click", () => showDetails(item));
    card.append(imageButton);
  } else {
    const mediaLink = document.createElement("a");
    mediaLink.className = "media-link";
    mediaLink.href = item.url;
    mediaLink.target = "_blank";
    mediaLink.rel = "noopener noreferrer";
    mediaLink.textContent = "Open NASA video";
    card.append(mediaLink);
  }

  const content = document.createElement("div");
  content.className = "card-content";

  const date = document.createElement("p");
  date.className = "card-date";
  date.textContent = formatDisplayDate(item.date);

  const heading = document.createElement("h3");
  heading.className = "card-title";

  const titleButton = document.createElement("button");
  titleButton.className = "title-trigger";
  titleButton.type = "button";
  titleButton.textContent = item.title;
  titleButton.addEventListener("click", () => showDetails(item));
  heading.append(titleButton);

  const explanation = document.createElement("p");
  explanation.className = "explanation";
  explanation.textContent = item.explanation;

  content.append(date, heading, explanation);
  card.append(content);
  return card;
}

function showDetails(item) {
  modalDate.textContent = formatDisplayDate(item.date);
  modalTitle.textContent = item.title;
  modalExplanation.textContent = item.explanation;

  const hasImage = item.media_type === "image";
  modalImage.hidden = !hasImage;
  modalMediaLink.hidden = hasImage;

  if (hasImage) {
    modalImage.src = item.hdurl || item.url;
    modalImage.alt = item.title;
    modalMediaLink.removeAttribute("href");
  } else {
    modalImage.removeAttribute("src");
    modalImage.alt = "";
    modalMediaLink.href = item.url;
  }

  imageModal.showModal();
}

async function loadImages(startDate, endDate) {
  const validationMessage = validateDateRange(startDate, endDate);
  if (validationMessage) {
    setStatus(validationMessage, "error");
    return;
  }

  if (activeRequest) {
    activeRequest.abort();
  }

  const requestController = new AbortController();
  activeRequest = requestController;
  searchButton.disabled = true;
  gallery.setAttribute("aria-busy", "true");
  gallery.replaceChildren();
  setStatus("Searching NASA's archive…", "loading");

  const url = new URL(APOD_ENDPOINT);
  url.searchParams.set("api_key", NASA_API_KEY);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);

  try {
    const response = await fetch(url, { signal: requestController.signal });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || data.error?.message || "NASA's API request failed.");
    }

    const items = (Array.isArray(data) ? data : [data])
      .filter((item) => item && item.url && item.date && item.title)
      .sort((first, second) => second.date.localeCompare(first.date));

    if (items.length === 0) {
      setStatus("No NASA images were found for those dates.", "empty");
      return;
    }

    gallery.append(...items.map(createCard));
    setStatus(`${items.length} ${items.length === 1 ? "image" : "images"} found.`, "success");
  } catch (error) {
    if (requestController.signal.aborted) {
      return;
    }

    setStatus(
      error instanceof TypeError
        ? "Could not reach NASA. Check your internet connection and try again."
        : error.message,
      "error"
    );
  } finally {
    if (activeRequest === requestController) {
      searchButton.disabled = false;
      gallery.setAttribute("aria-busy", "false");
      activeRequest = null;
    }
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadImages(startDateInput.value, endDateInput.value);
});

closeModalButton.addEventListener("click", () => imageModal.close());

imageModal.addEventListener("click", (event) => {
  if (event.target === imageModal) {
    imageModal.close();
  }
});

const today = new Date();
const todayString = formatLocalDate(today);
const firstDate = new Date(today);
firstDate.setDate(firstDate.getDate() - (MAX_RANGE_DAYS - 1));

startDateInput.min = MIN_DATE;
startDateInput.max = todayString;
startDateInput.value = formatLocalDate(firstDate);
endDateInput.min = MIN_DATE;
endDateInput.max = todayString;
endDateInput.value = todayString;

loadImages(startDateInput.value, endDateInput.value);