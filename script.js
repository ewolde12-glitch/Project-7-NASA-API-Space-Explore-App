const API_URL = "https://api.nasa.gov/planetary/apod";
const API_KEY = "";
const EARLIEST_APOD_DATE = "1995-06-16";
const MAX_RANGE_DAYS = 100;

const form = document.getElementById("searchForm");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const getImagesButton = document.getElementById("getImages");
const gallery = document.getElementById("gallery");
const statusMessage = document.getElementById("status");

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const today = formatDate(new Date());
startDateInput.min = EARLIEST_APOD_DATE;
startDateInput.max = today;
endDateInput.min = EARLIEST_APOD_DATE;
endDateInput.max = today;
startDateInput.value = formatDate(addDays(new Date(), -6));
endDateInput.value = today;

startDateInput.addEventListener("change", () => {
  endDateInput.min = startDateInput.value || EARLIEST_APOD_DATE;
  if (endDateInput.value && endDateInput.value < startDateInput.value) {
    endDateInput.value = startDateInput.value;
  }
});

endDateInput.addEventListener("change", () => {
  startDateInput.max = endDateInput.value || today;
  if (startDateInput.value && startDateInput.value > endDateInput.value) {
    startDateInput.value = endDateInput.value;
  }
});

function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  if (item.media_type === "image" && item.url) {
    const imageLink = document.createElement("a");
    imageLink.className = "image-link";
    imageLink.href = item.hdurl || item.url;
    imageLink.target = "_blank";
    imageLink.rel = "noopener noreferrer";
    imageLink.setAttribute("aria-label", `Open full-size image: ${item.title || "NASA APOD"}`);

    const image = document.createElement("img");
    image.src = item.url;
    image.alt = item.title || "NASA Astronomy Picture of the Day";
    image.loading = "lazy";
    imageLink.appendChild(image);
    card.appendChild(imageLink);
  } else if (item.url) {
    const mediaLink = document.createElement("a");
    mediaLink.className = "media-link";
    mediaLink.href = item.url;
    mediaLink.target = "_blank";
    mediaLink.rel = "noopener noreferrer";
    mediaLink.textContent = item.media_type === "video" ? "▶ Watch this day's video" : "Open NASA media";
    card.appendChild(mediaLink);
  }

  const content = document.createElement("div");
  content.className = "card-content";

  const date = document.createElement("p");
  date.className = "card-date";
  date.textContent = item.date || "NASA APOD";
  content.appendChild(date);

  const title = document.createElement("h3");
  title.textContent = item.title || "Astronomy Picture of the Day";
  content.appendChild(title);

  if (item.explanation) {
    const explanation = document.createElement("p");
    explanation.className = "explanation";
    explanation.textContent = item.explanation;
    content.appendChild(explanation);
  }

  if (item.copyright) {
    const copyright = document.createElement("p");
    copyright.className = "copyright";
    copyright.textContent = `Image credit: ${item.copyright}`;
    content.appendChild(copyright);
  }

  card.appendChild(content);
  return card;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate || !endDate) {
    statusMessage.textContent = "Please choose both a start and end date.";
    return;
  }
  if (startDate < EARLIEST_APOD_DATE || endDate > today || startDate > endDate) {
    statusMessage.textContent = "Choose a valid date range from June 16, 1995 through today.";
    return;
  }

  const dayCount = Math.round((new Date(`${endDate}T00:00:00`) - new Date(`${startDate}T00:00:00`)) / 86400000) + 1;
  if (dayCount > MAX_RANGE_DAYS) {
    statusMessage.textContent = "Please choose a range of 100 days or fewer.";
    return;
  }

  gallery.replaceChildren();
  statusMessage.textContent = "Fetching pictures from the cosmos…";
  getImagesButton.disabled = true;
  getImagesButton.querySelector("span").textContent = "Loading…";

  const params = new URLSearchParams({ start_date: startDate, end_date: endDate, api_key: API_KEY });

  try {
    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`NASA API returned ${response.status}`);
    }

    const responseData = await response.json();
    const items = (Array.isArray(responseData) ? responseData : [responseData])
      .filter((item) => item && (item.url || item.media_type === "image"))
      .sort((a, b) => b.date.localeCompare(a.date));

    if (!items.length) {
      statusMessage.textContent = "No pictures were returned for those dates. Try another range.";
      return;
    }

    const cards = document.createDocumentFragment();
    items.forEach((item) => cards.appendChild(createCard(item)));
    gallery.appendChild(cards);
    statusMessage.textContent = `Showing ${items.length} ${items.length === 1 ? "picture" : "pictures"} · newest first`;
  } catch (error) {
    console.error("Unable to load NASA APOD data:", error);
    statusMessage.textContent = "We couldn't load NASA's pictures right now. Please check your connection and try again.";
  } finally {
    getImagesButton.disabled = false;
    getImagesButton.querySelector("span").textContent = "Explore images";
  }
});
