

// STEP 1: Get HTML elements

const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const getImages = document.getElementById("getImages");
const gallery = document.getElementById("gallery");
const statusMessage = document.getElementById("status");

// STEP 2: NASA API information

const API_KEY = "DEMO_KEY";

const API_URL = "https://api.nasa.gov/planetary/apod";

// STEP 3: Create a function to get NASA images

async function getSpaceImages() {

    // Get dates selected by the user
    const start = startDate.value;
    const end = endDate.value;

    // Check that dates are selected
    if (!start || !end) {
        statusMessage.textContent =
            "Please select both dates.";
        return;
    }

    // Check date order
    if (start > end) {
        statusMessage.textContent =
            "Start date cannot be after end date.";
        return;
    }

    // Clear previous images
    gallery.innerHTML = "";

    statusMessage.textContent = "Loading NASA images...";

    // STEP 4: Build the API request URL

    const url = `${API_URL}?start_date=${start}&end_date=${end}&api_key=${API_KEY}`;

    try {

        // STEP 5: Send request to NASA

        const response = await fetch(url);

        // Check for errors

        if (!response.ok) {
            throw new Error("NASA API request failed.");
        }

        // STEP 6: Convert response to JSON

        const data = await response.json();

        // STEP 7: Display images

        data.forEach((item) => {

            // Skip videos
            if (item.media_type !== "image") {
                return;
            }

            // Create a card
            const card = document.createElement("div");
            card.className = "card";

            // Create image
            const image = document.createElement("img");
            image.src = item.url;
            image.alt = item.title;

            // Create title
            const title = document.createElement("h3");
            title.textContent = item.title;

            // Create date
            const date = document.createElement("p");
            date.textContent = item.date;

            // Create description
            const description = document.createElement("p");
            description.textContent = item.explanation;

            // Add elements to card
            card.appendChild(image);
            card.appendChild(title);
            card.appendChild(date);
            card.appendChild(description);

            // Add card to gallery
            gallery.appendChild(card);

        });

        statusMessage.textContent =
            `Found ${gallery.children.length} space images!`;

    } catch (error) {

        // STEP 8: Handle errors

        console.error(error);

        statusMessage.textContent =
            "Sorry, we could not load NASA images. Please try again.";

    }

}

// STEP 9: Listen for button clicks

getImages.addEventListener("click", getSpaceImages);























const startDate =
    document.getElementById("startDate");


async function getSpaceImages() {




const response = await fetch(url);


const data = await response.json();



data.forEach((item) => {
    console.log(item.title);



});


getImages.addEventListener("click", getSpaceImages);