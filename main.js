const serverUrl='https://api.openweathermap.org/data/2.5/weather';
const apiKey = 'f660a2fb1e4bad108d6160b7f58c555f';
const cityInput=document.getElementById('city-input')
const searchButton=document.getElementById('search-button')
const temperatureElement=document.querySelector('.temperature')
const cloudIconElement = document.querySelector('.cloud-icon');
const cityNameElement = document.querySelector('.city-name');
const weatherDescriptionElement = document.querySelector('.weather-description');
const favoritesList = document.querySelector('.locations-list ul'); 
const addFavoriteButton = document.getElementById('heart');  

cityInput.addEventListener('keyup',(event)=>{
  if (event.key==='Enter'){
    getWeather()
  }
});

searchButton.addEventListener('click',()=>{
getWeather()
})

let currentWeatherData=null

function getWeather(){
const cityName=cityInput.value.trim();
if(!cityName){
  alert('Введите название города');
  return;
}
const url = `${serverUrl}?q=${cityName}&appid=${apiKey}&units=metric&lang=ru`;

fetch(url)
  .then(response=>response.json())
  .then(data=>{
    if(data.cod===200){
      displayWeather(data);
      addFavoriteButton.style.display='block'
      currentWeatherData=data;
    }else{
      alert(`Ошибка: ${data.message || "Город не найден"}`)
      addFavoriteButton.style.display='none';
      currentWeatherData=null
    }
  })
  .catch(error=>console.error('Ошибка получения данных', error))
}
function displayWeather(data){
  const temperature=Math.round(data.main.temp)
  const iconCode=data.weather[0].icon;
  const city=data.name;
  const description=data.weather[0].description;
  temperatureElement.textContent=`${temperature}°C`
  cloudIconElement.innerHTML=getWeatherIcon(iconCode,description)
  cityNameElement.textContent=city
  weatherDescriptionElement.textContent=description
  cityInput.value=''
  function getWeatherIcon(iconCode,description){
    return `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" title="${description}">`;
}
}

addFavoriteButton.addEventListener('click',addFavorite);

function addFavorite(){
  if(!currentWeatherData){
    return;
  }
  const cityName=currentWeatherData.name;
  const li=document.createElement('li')
  li.textContent=cityName;
  li.dataset.city=cityName;
  li.addEventListener('click',()=>{
    console.log("Клик по городу:", cityName)
  })

  const deleteButton=document.createElement('button')
  deleteButton.textContent='X'
  deleteButton.addEventListener('click',(event)=>{
    event.stopPropagation();
    console.log("Удалить город:", cityName)
  });
  li.appendChild(deleteButton);
  favoritesList.appendChild(li);
  localStorage.setItem(cityName,JSON.stringify(currentWeatherData));
}
window.addEventListener('load',()=>{
  for(let i=0;i<localStorage.length;i++){
    const cityName=localStorage.key(i);
    const dataString=localStorage.getItem(cityName);
    
    let data;
    try{
      data=JSON.parse(dataString);
      if(!data||!data.name){
        continue;
      }
    }catch(error){
      console.error("Ошибка парсинга данных из localStorage:", error);
      continue;
    }

    const li=document.createElement('li')
    li.textContent=cityName;
    li.dataset.city=cityName;
    li.addEventListener('click',()=>{
      displayWeather(data);
    })
    const deleteButton=document.createElement('button')
    deleteButton.textContent='X';
    deleteButton.addEventListener('click',(event)=>{
      event.stopPropagation();
      console.log("Удалить город:", cityName);
      localStorage.removeItem(cityName);
    })
    li.appendChild(deleteButton);
    favoritesList.appendChild(li)
  }
})