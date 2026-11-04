// NASA APOD API configuration
const API_KEY = "DEMO_KEY";
const API_URL = "https://api.nasa.gov/planetary/apod";

const getImages = document.getElementById("getImages");
const gallery = document.getElementById("gallery");
const statusMessage = document.getElementById("status");

async function getRandomSpaceImage() {
  gallery.replaceChildren();
  statusMessage.textContent = "Loading a random NASA image...";

  const url = `${API_URL}?count=1&api_key=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NASA API request failed (${response.status}).`);
    }

    const data = await response.json();
    const item = Array.isArray(data) ? data[0] : data;

    if (!item) {
      throw new Error("NASA returned no image data.");
    }

    const card = document.createElement("article");
    card.className = "card";

    if (item.media_type === "image" && item.url) {
      const image = document.createElement("img");
      image.src = item.url;
      image.alt = item.title || "NASA Astronomy Picture of the Day";
      image.loading = "lazy";
      card.appendChild(image);
    } else if (item.url) {
      const mediaLink = document.createElement("a");
      mediaLink.href = item.url;
      mediaLink.target = "_blank";
      mediaLink.rel = "noopener noreferrer";
      mediaLink.textContent = "Open NASA media";
      card.appendChild(mediaLink);
    }

    const title = document.createElement("h2");
    title.textContent = item.title || "NASA Astronomy Picture of the Day";
    card.appendChild(title);

    if (item.date) {
      const date = document.createElement("p");
      date.textContent = item.date;
      card.appendChild(date);
    }

    if (item.explanation) {
      const explanation = document.createElement("p");
      explanation.textContent = item.explanation;
      card.appendChild(explanation);
    }

    gallery.appendChild(card);
    statusMessage.textContent = "Here is your random NASA image.";
  } catch (error) {
    statusMessage.textContent = "Sorry, we could not load a NASA image. Please try again.";
  }
}

getImages.addEventListener("click", getRandomSpaceImage);
