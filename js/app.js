// ====== CONFIG ======
const apiKey = "fe26f9b7cd68727512db54822aa9e2f6"; // Already provided
const weatherIcons = {
  clear: "fa-sun",
  clouds: "fa-cloud",
  rain: "fa-cloud-showers-heavy",
  snow: "fa-snowflake",
  thunderstorm: "fa-bolt",
  drizzle: "fa-cloud-rain",
  mist: "fa-smog",
  fog: "fa-smog",
  haze: "fa-smog",
};
const backgroundMap = {
  clear: "clear",
  clouds: "clouds",
  rain: "rain",
  snow: "snow",
  thunderstorm: "thunderstorm",
  drizzle: "drizzle",
  mist: "mist",
  fog: "fog",
  haze: "mist",
};

// ====== DOM ELEMENTS ======
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const weatherContainer = document.getElementById("weatherContainer");
const loadingDiv = document.getElementById("loading");
const currentWeatherDiv = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecastSection");
const forecastContainer = document.getElementById("forecastContainer");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");
const background = document.getElementById("background");
const themeToggle = document.getElementById("themeToggle");

// Current weather fields
const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const currentTime = document.getElementById("currentTime");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const weatherDescription = document.getElementById("weatherDescription");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

// ====== UTILS ======
function setLoading(isLoading) {
  loadingDiv.style.display = isLoading ? "block" : "none";
  currentWeatherDiv.style.display = isLoading ? "none" : "block";
  forecastSection.style.display = isLoading ? "none" : "block";
  errorMessage.style.display = "none";
}

function showError(msg) {
  errorText.textContent = msg;
  errorMessage.style.display = "block";
  loadingDiv.style.display = "none";
  currentWeatherDiv.style.display = "none";
  forecastSection.style.display = "none";
}

function updateBackground(weatherType) {
  background.className = "background ";
  if (backgroundMap[weatherType]) {
    background.classList.add(backgroundMap[weatherType]);
  }
}

function getWeatherIcon(weatherType) {
  return weatherIcons[weatherType] || "fa-sun";
}

function formatTime(dt, timezone) {
  // dt: unix timestamp, timezone: seconds offset
  const local = new Date((dt + timezone) * 1000);
  return local.toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true, weekday: 'short', month: 'short', day: 'numeric' });
}

function kelvinToC(tempK) {
  return Math.round(tempK - 273.15);
}

function mpsToKmh(mps) {
  return Math.round(mps * 3.6);
}

function metersToKm(m) {
  return (m / 1000).toFixed(1);
}

// ====== MAIN WEATHER FETCH ======
async function fetchWeather(city) {
  setLoading(true);
  try {
    // Current weather
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
    if (!weatherRes.ok) throw new Error("City not found");
    const weatherData = await weatherRes.json();

    // Forecast
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
    if (!forecastRes.ok) throw new Error("Forecast not found");
    const forecastData = await forecastRes.json();

    renderWeather(weatherData, forecastData);
  } catch (err) {
    showError("Error: " + err.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  setLoading(true);
  try {
    // Current weather
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    if (!weatherRes.ok) throw new Error("Location not found");
    const weatherData = await weatherRes.json();

    // Forecast
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    if (!forecastRes.ok) throw new Error("Forecast not found");
    const forecastData = await forecastRes.json();

    renderWeather(weatherData, forecastData);
  } catch (err) {
    showError("Error: " + err.message);
  }
}

// ====== RENDERING ======
function renderWeather(weather, forecast) {
  // Current weather
  const weatherType = weather.weather[0].main.toLowerCase();
  updateBackground(weatherType);
  cityName.textContent = weather.name;
  countryName.textContent = weather.sys.country;
  currentTime.textContent = formatTime(weather.dt, weather.timezone);
  weatherIcon.innerHTML = `<i class="fas ${getWeatherIcon(weatherType)}"></i>`;
  temperature.textContent = Math.round(weather.main.temp);
  feelsLike.textContent = Math.round(weather.main.feels_like);
  weatherDescription.textContent = weather.weather[0].description;
  humidity.textContent = weather.main.humidity + "%";
  windSpeed.textContent = mpsToKmh(weather.wind.speed) + " km/h";
  pressure.textContent = weather.main.pressure + " hPa";
  visibility.textContent = metersToKm(weather.visibility) + " km";

  // 5-day forecast (one per day, at 12:00)
  const daily = {};
  forecast.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (item.dt_txt.includes("12:00:00")) {
      daily[date] = item;
    }
  });
  forecastContainer.innerHTML = "";
  Object.values(daily).slice(0, 5).forEach(item => {
    const type = item.weather[0].main.toLowerCase();
    forecastContainer.innerHTML += `
      <div class="forecast-card">
        <div class="forecast-date">${new Date(item.dt_txt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        <div class="forecast-icon"><i class="fas ${getWeatherIcon(type)}"></i></div>
        <div class="forecast-temp">${Math.round(item.main.temp)}°C</div>
        <div class="forecast-desc">${item.weather[0].description}</div>
      </div>
    `;
  });

  setLoading(false);
  currentWeatherDiv.style.display = "block";
  forecastSection.style.display = "block";
  errorMessage.style.display = "none";
}

// ====== EVENT HANDLERS ======
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      err => {
        showError("Could not get your location.");
      }
    );
  } else {
    showError("Geolocation is not supported by your browser.");
  }
});

// ====== THEME TOGGLE ======
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggle.innerHTML = theme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  setTheme(current === "dark" ? "light" : "dark");
});

(function initTheme() {
  const saved = localStorage.getItem("theme");
  setTheme(saved || "light");
})();

// ====== INIT ======
setLoading(false);
currentWeatherDiv.style.display = "none";
forecastSection.style.display = "none";
errorMessage.style.display = "none";

// Optionally, auto-fetch weather for user's location on load
// Uncomment below to enable:
// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(
//     pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude)
//   );
// }
