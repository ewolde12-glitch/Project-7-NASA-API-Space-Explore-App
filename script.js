// NASA APOD API configuration
const API_KEY = "DEMO_KEY";
const API_URL = "https://api.nasa.gov/planetary/apod";

const getImages = document.getElementById("getImages");
const statusMessage = document.getElementById("status");

async function getRandomSpaceImage() {
  statusMessage.textContent = "Loading a random NASA image...";

  const url = `${API_URL}?count=1&api_key=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NASA API request failed (${response.status}).`);
    }

    const data = await response.json();
    console.log(data);
    statusMessage.textContent = "Random NASA image response logged to the console.";
  } catch (error) {
    console.error("Could not load a random NASA image:", error);
    statusMessage.textContent = "Sorry, we could not load a NASA image. Please try again.";
  }
}

getImages.addEventListener("click", getRandomSpaceImage);
