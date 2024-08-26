const apiKey = '8482179c92bd8c64a406e230083527e1';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const forecast = document.getElementById('forecast');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value;
        if (city) {
            getWeather(city);
        }
    }
});

async function getWeather(city) {
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        const weatherData = await weatherResponse.json();

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData);
        displayForecast(forecastData.list);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please try again.');
    }
}

function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
}

function displayForecast(forecastData) {
    forecast.innerHTML = '';
    const dailyForecasts = {};

    forecastData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });

        if (!dailyForecasts[day] || date.getHours() === 12) {
            dailyForecasts[day] = item;
        }
    });

    Object.values(dailyForecasts).slice(0, 5).forEach(item => {
        const date = new Date(item.dt * 1000);
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <p>${date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
            <p>${Math.round(item.main.temp)}°C</p>
            <p>${item.weather[0].description}</p>
        `;
        forecast.appendChild(forecastItem);
    });
}

getWeather('Colombo');