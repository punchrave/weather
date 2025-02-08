document.addEventListener('DOMContentLoaded', function () {
  const serverUrl = 'https://api.openweathermap.org/data/2.5';
  const apiKey = 'f660a2fb1e4bad108d6160b7f58c555f';
  const cityInput = document.getElementById('city-input');
  const searchButton = document.getElementById('search-button');
  const temperatureElement = document.querySelector('.temperature');
  const cloudIconElement = document.querySelector('.cloud-icon');
  const cityNameElement = document.querySelector('.city-name');
  const weatherDescriptionElement = document.querySelector('.weather-description');
  const favoritesList = document.querySelector('.locations-list ul');
  const addFavoriteButton = document.getElementById('heart');

  searchButton.addEventListener('click', () => getWeather());
  cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') getWeather();
  });

  let currentWeatherData = null;
  const favoritesCity=new Set();

  function getWeather() {
    const cityName = cityInput.value.trim();
    if (!cityName) {
      alert('Введите название города');
      return;
    }

    const currentWeatherUrl = `${serverUrl}/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=ru`;
    const forecastUrl = `${serverUrl}/forecast?q=${cityName}&appid=${apiKey}&units=metric&lang=ru`;

    // Запрос текущей погоды
    fetch(currentWeatherUrl)
      .then(response => response.json())
      .then(data => {
        if (data.cod === 200) {
          displayWeather(data);
          displaySunInfo(data);
          currentWeatherData = data;
        } else {
          alert(`Ошибка: ${data.message || "Город не найден"}`);
          currentWeatherData = null;
        }
      })
      .catch(error => console.error('Ошибка получения данных погоды', error));

    // Запрос прогноза погоды
    fetch(forecastUrl)
      .then(response => response.json())
      .then(data => {
        if (data.cod === "200") {
          displayForecast(data);
        } else {
          console.error("Ошибка: Неверный код ответа прогноза", data.message);
        }
      })
      .catch(error => console.error('Ошибка получения прогноза', error));
  }

  function displayWeather(data) {
    const temperature = Math.round(data.main.temp);
    const iconCode = data.weather[0].icon;
    const description = data.weather[0].description;
    const city = data.name;

    temperatureElement.textContent = `${temperature}°C`;
    cloudIconElement.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" title="${description}">`;
    cityNameElement.textContent = city;
    weatherDescriptionElement.textContent = description;
    cityInput.value = '';
  }

  function displaySunInfo(data) {
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById('sunrise-time').textContent = formatTime(sunrise);
    document.getElementById('sunset-time').textContent = formatTime(sunset);
  }

  function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function displayForecast(data) {
    const forecastContainer = document.querySelector('.forecast-container');
    forecastContainer.innerHTML = '';

    // Проверка на пустой или некорректный список
    if (!data.list || data.list.length === 0) {
      console.error('Ошибка: прогноз пустой или отсутствует.');
      return;
    }

    // Отображение первых 5 временных точек прогноза
    data.list.slice(0, 5).forEach(forecast => {
      const forecastTime = new Date(forecast.dt * 1000);
      const hours = String(forecastTime.getHours()).padStart(2, '0');
      const temperature = Math.round(forecast.main.temp);
      const feelsLike = Math.round(forecast.main.feels_like);
      const iconCode = forecast.weather[0].icon;
      const weatherDescription = forecast.weather[0].description;

      const forecastItem = document.createElement('div');
      forecastItem.classList.add('forecast-item');
      forecastItem.innerHTML = `
        <p class="time">${hours}:00</p>
        <p class="temperature">${temperature}°C</p>
        <p class="feels-like">Ощущается как: ${feelsLike}°C</p>
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${weatherDescription}">
      `;
      forecastContainer.appendChild(forecastItem);
    });
  }

  // Добавление города в избранное
  addFavoriteButton.addEventListener('click', addFavorite); 
  
  function addFavorite() {
    if (!currentWeatherData) return;

    const cityName = currentWeatherData.name;
    if(!favoritesCity.has(cityName)){
      favoritesCity.add(cityName)
    
      saveFavoritesToLocalStorage();
    
      const li = document.createElement('li');
      li.textContent = cityName;
      li.dataset.city = cityName;

      li.addEventListener('click', () => {
        cityInput.value = cityName;
        getWeather();
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        removeFavorite(cityName);
      });

      li.appendChild(deleteButton);
      favoritesList.appendChild(li);
    }
  }

  function saveFavoritesToLocalStorage(){
    localStorage.setItem('favorites', JSON.stringify(Array.from(favoritesCity)))
  }


  function removeFavorite(cityName) {
  favoritesCity.delete(cityName)
  saveFavoritesToLocalStorage();
  const item = document.querySelector(`li[data-city="${cityName}"]`);
  if (item) item.remove();
  }

  // Загрузка избранных городов
  window.addEventListener('load', () => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    storedFavorites.forEach(cityName=>{
      favoritesCity.add(cityName);
      const favoritesListItem=document.createElement('li');
      favoritesListItem.textContent=cityName;
      
      favoritesListItem.addEventListener('click',()=>{
        cityInput.value=cityName
        getWeather();
      });
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        removeFavorite(cityName);
      });

      favoritesListItem.appendChild(deleteButton);
      favoritesList.appendChild(favoritesListItem);
    });
  });
});
