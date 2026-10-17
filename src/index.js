
import "./style.css";
import { processWeatherData } from "./weather.js";

const API_KEY = "C3D9NBZU786VZSYFLE2TKE9T3";

const form = document.querySelector("#search-form");
const locationInput = document.querySelector("#location-input");
const weatherDisplay = document.querySelector("#weather-display");
const status = document.querySelector("#status");

const celsiusBtn = document.querySelector("#celsius-btn");
const fahrenheitBtn = document.querySelector("#fahrenheit-btn");

let currentWeather = null;
let currentUnit = "C";

// Fetch weather data from Visual Crossing
async function getWeather(location) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?key=${API_KEY}&unitGroup=metric`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not fetch weather. Check the location or API key.");
  }

  const data = await response.json();
  return processWeatherData(data);
}

// Convert Celsius to Celsius or Fahrenheit
function convertTemperature(celsius) {
  if (currentUnit === "F") {
    return (celsius * 9) / 5 + 32;
  }

  return celsius;
}

// Display the correct weather emoji
function getWeatherEmoji(icon = "") {
  const icons = {
    "clear-day": "☀️",
    "clear-night": "🌙",
    "partly-cloudy-day": "🌤️",
    "partly-cloudy-night": "☁️",
    cloudy: "☁️",
    rain: "🌧️",
    "showers-day": "🌦️",
    "showers-night": "🌧️",
    snow: "❄️",
    wind: "💨",
    fog: "🌫️",
    "thunder-rain": "⛈️",
    "thunder-showers-day": "⛈️",
    "thunder-showers-night": "⛈️"
  };

  return icons[icon] || "🌡️";
}

// Choose an image based on the weather condition
function getWeatherImage(icon = "") {
  if (icon.includes("thunder")) {
    return "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&q=80";
  }

  if (icon.includes("rain") || icon.includes("showers")) {
    return "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80";
  }

  if (icon.includes("snow")) {
    return "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?auto=format&fit=crop&w=1200&q=80";
  }

  if (icon.includes("fog")) {
    return "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80";
  }

  if (icon.includes("cloud")) {
    return "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80";
  }

  if (icon.includes("night")) {
    return "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=80";
  }

  // Default image for sunny weather
  return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";
}

// Change the page theme based on the weather
function applyWeatherTheme(weather) {
  const icon = weather.icon || "";
  let theme = "weather-default";

  if (icon.includes("thunder")) {
    theme = "weather-stormy";
  } else if (icon.includes("rain") || icon.includes("showers")) {
    theme = "weather-rainy";
  } else if (icon.includes("snow")) {
    theme = "weather-snowy";
  } else if (icon.includes("fog")) {
    theme = "weather-foggy";
  } else if (icon.includes("cloud")) {
    theme = "weather-cloudy";
  } else if (icon === "clear-day") {
    theme = "weather-sunny";
  } else if (icon === "clear-night") {
    theme = "weather-night";
  }

  document.body.classList.remove(
    "weather-sunny",
    "weather-cloudy",
    "weather-rainy",
    "weather-snowy",
    "weather-foggy",
    "weather-stormy",
    "weather-night",
    "weather-default"
  );

  document.body.classList.add(theme);
}

// Display current weather and five-day forecast
function displayWeather(weather) {
  applyWeatherTheme(weather);

  const currentTemperature = convertTemperature(weather.temperature);
  const feelsLike = convertTemperature(weather.feelsLike);

  const forecastHTML = weather.forecast
    .map((day) => {
      const date = new Date(`${day.date}T00:00:00`).toLocaleDateString(
        undefined,
        { weekday: "short", month: "short", day: "numeric" }
      );

      return `
        <article class="forecast-card">
          <h3>${date}</h3>
          <div class="forecast-icon">${getWeatherEmoji(day.icon)}</div>
          <p>${day.conditions}</p>
          <p class="forecast-temperatures">
            <strong>${Math.round(convertTemperature(day.maxTemp))}°${currentUnit}</strong>
            /
            ${Math.round(convertTemperature(day.minTemp))}°${currentUnit}
          </p>
        </article>
      `;
    })
    .join("");

  weatherDisplay.innerHTML = `
    <section class="current-weather">
      <h2>${weather.location}</h2>

      <img
        class="weather-hero-image"
        src="${getWeatherImage(weather.icon)}"
        alt="${weather.conditions} weather"
      >

      <div class="current-weather-summary">
        <div class="current-weather-icon">
          ${getWeatherEmoji(weather.icon)}
        </div>

        <p class="current-temperature">
          ${Math.round(currentTemperature)}°${currentUnit}
        </p>

        <p class="weather-conditions">${weather.conditions}</p>
        <p class="weather-description">${weather.description || ""}</p>
      </div>

      <div class="weather-details">
        <article class="weather-detail">
          <h3>Feels Like</h3>
          <p>${Math.round(feelsLike)}°${currentUnit}</p>
        </article>

        <article class="weather-detail">
          <h3>Humidity</h3>
          <p>${weather.humidity}%</p>
        </article>

        <article class="weather-detail">
          <h3>Wind Speed</h3>
          <p>${weather.windSpeed} km/h</p>
        </article>
      </div>
    </section>

    <section class="forecast-section">
      <h2>5-Day Forecast</h2>
      <div class="forecast-container">
        ${forecastHTML}
      </div>
    </section>
  `;

  // Show a fallback message if the image cannot load
  const heroImage = weatherDisplay.querySelector(".weather-hero-image");

  heroImage.addEventListener("error", () => {
    heroImage.alt = "Weather image unavailable";
    heroImage.style.display = "none";
  });
}

// Handle location searches
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const location = locationInput.value.trim();

  if (!location) {
    status.textContent = "Please enter a city name.";
    return;
  }

  status.textContent = "Loading weather...";

  try {
    const newWeather = await getWeather(location);

    currentWeather = newWeather;
    displayWeather(currentWeather);

    status.textContent = "";
  } catch (error) {
    console.error("Weather request failed:", error);

    status.textContent =
      "Sorry, we couldn't load the weather. Please check the city name and try again.";
  }
});

// Switch to Celsius
celsiusBtn.addEventListener("click", () => {
  currentUnit = "C";

  celsiusBtn.classList.add("active");
  fahrenheitBtn.classList.remove("active");

  if (currentWeather) {
    displayWeather(currentWeather);
  }
});

// Switch to Fahrenheit
fahrenheitBtn.addEventListener("click", () => {
  currentUnit = "F";

  fahrenheitBtn.classList.add("active");
  celsiusBtn.classList.remove("active");

  if (currentWeather) {
    displayWeather(currentWeather);
  }
});
