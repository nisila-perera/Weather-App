const apiKey = '8482179c92bd8c64a406e230083527e1';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const forecast = document.getElementById('forecast');
const historicalChart = document.getElementById('historicalChart');
let map;

searchBtn.addEventListener('click', function() {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const city = cityInput.value;
        if (city) {
            getWeather(city);
        }
    }
});

function getWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(function(response) { return response.json(); })
        .then(function(weatherData) {
            displayWeather(weatherData);
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
        })
        .then(function(response) { return response.json(); })
        .then(function(forecastData) {
            displayForecast(forecastData.list);
            getHistoricalData(forecastData.city.coord.lat, forecastData.city.coord.lon);
            updateMap(forecastData.city.coord.lat, forecastData.city.coord.lon);
        })
        .catch(function(error) {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data. Please try again.');
        });
}

function getWeatherByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(function(response) { return response.json(); })
        .then(function(weatherData) {
            displayWeather(weatherData);
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        })
        .then(function(response) { return response.json(); })
        .then(function(forecastData) {
            displayForecast(forecastData.list);
            getHistoricalData(lat, lon);
            updateMap(lat, lon);
        })
        .catch(function(error) {
            console.error('Error fetching weather data:', error);
            alert('Error fetching weather data. Please try again.');
        });
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

    forecastData.forEach(function(item) {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });

        if (!dailyForecasts[day] || date.getHours() === 12) {
            dailyForecasts[day] = item;
        }
    });

    Object.values(dailyForecasts).slice(0, 5).forEach(function(item) {
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

function getHistoricalData(lat, lon) {
    const today = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = today - 7 * 24 * 60 * 60;
    
    fetch(`https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${sevenDaysAgo}&units=metric&appid=${apiKey}`)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            displayHistoricalData(data.hourly);
        })
        .catch(function(error) {
            console.error('Error fetching historical data:', error);
        });
}

function displayHistoricalData(hourlyData) {
    const temperatures = hourlyData.map(function(item) { return item.temp; });
    const labels = hourlyData.map(function(item) { return new Date(item.dt * 1000).toLocaleDateString(); });

    if (window.historicalChart instanceof Chart) {
        window.historicalChart.destroy();
    }

    window.historicalChart = new Chart(historicalChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature',
                data: temperatures,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

function initMap() {
    map = L.map('mapContainer').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function updateMap(lat, lon) {
    if (!map) {
        initMap();
    }
    map.setView([lat, lon], 10);
    L.marker([lat, lon]).addTo(map);
}

function init() {
    initMap();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            function(error) {
                console.error('Error getting location:', error);
                getWeather('Colombo');
            }
        );
    } else {
        getWeather('Colombo');
    }
}

init();