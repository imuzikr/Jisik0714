// WeatherAPI 설정
const API_KEY = '374708dba34e44e2a0421032251307';
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM 요소들
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherContainer = document.getElementById('weatherContainer');
const loading = document.getElementById('loading');
const weatherInfo = document.getElementById('weatherInfo');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const currentTime = document.getElementById('currentTime');
const currentDate = document.getElementById('currentDate');

// 날씨 정보 표시 요소들
const cityName = document.getElementById('cityName');
const countryName = document.getElementById('countryName');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weatherDescription');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const visibility = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecastContainer');

// SweetAlert2 설정
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

// 이벤트 리스너 등록
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    searchWeatherByCity('Seoul');
    
    // 환영 메시지
    Toast.fire({
        icon: 'success',
        title: '날씨 앱에 오신 것을 환영합니다! 🌤️'
    });
});

// 현재 시간 업데이트
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    currentTime.textContent = timeString;
}

// 날씨 검색 함수
async function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showSweetAlert('warning', '도시명을 입력해주세요', '검색할 도시명을 입력해주세요.');
        return;
    }
    
    await searchWeatherByCity(city);
}

// 도시명으로 날씨 검색
async function searchWeatherByCity(city) {
    showLoading();
    
    try {
        // 현재 날씨 정보 가져오기
        const currentWeather = await fetchWeatherData(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=no`);
        
        // 3일 예보 정보 가져오기
        const forecast = await fetchWeatherData(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no`);
        
        displayWeatherInfo(currentWeather, forecast);
        
        // 성공 메시지
        Toast.fire({
            icon: 'success',
            title: `${city}의 날씨 정보를 가져왔습니다!`
        });
        
    } catch (err) {
        console.error('날씨 정보 가져오기 실패:', err);
        showSweetAlert('error', '날씨 정보 가져오기 실패', '도시명을 확인해주세요. 또는 잠시 후 다시 시도해주세요.');
    }
}

// API 호출 함수
async function fetchWeatherData(url) {
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// 날씨 정보 표시
function displayWeatherInfo(currentData, forecastData) {
    const current = currentData.current;
    const location = currentData.location;
    
    // 현재 날짜 표시
    const now = new Date();
    const dateString = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    currentDate.textContent = dateString;
    
    // 위치 정보
    cityName.textContent = location.name;
    countryName.textContent = `${location.country}, ${location.region}`;
    
    // 현재 날씨
    weatherIcon.src = `https:${current.condition.icon}`;
    temperature.textContent = `${Math.round(current.temp_c)}°C`;
    weatherDescription.textContent = current.condition.text;
    
    // 상세 정보
    feelsLike.textContent = `${Math.round(current.feelslike_c)}°C`;
    humidity.textContent = `${current.humidity}%`;
    windSpeed.textContent = `${current.wind_kph} km/h`;
    visibility.textContent = `${current.vis_km} km`;
    
    // 3일 예보 표시
    displayForecast(forecastData.forecast.forecastday);
    
    // 날씨 상태에 따른 배경 변경
    updateBackground(current.condition.code);
    
    showWeatherInfo();
    
    // 애니메이션 효과 추가
    weatherInfo.classList.add('fade-in');
}

// 예보 정보 표시
function displayForecast(forecastDays) {
    forecastContainer.innerHTML = '';
    
    forecastDays.forEach((day, index) => {
        const date = new Date(day.date);
        const dayName = getDayName(date.getDay());
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'col-md-4 col-sm-6';
        forecastDay.innerHTML = `
            <div class="forecast-card slide-in" style="animation-delay: ${index * 0.1}s;">
                <div class="forecast-date">${dayName}</div>
                <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="날씨 아이콘">
                <div class="forecast-temp">${Math.round(day.day.avgtemp_c)}°C</div>
                <div class="forecast-desc">${day.day.condition.text}</div>
                <div class="mt-2">
                    <small class="text-muted">
                        <i class="fas fa-thermometer-half me-1"></i>
                        ${Math.round(day.day.mintemp_c)}°C ~ ${Math.round(day.day.maxtemp_c)}°C
                    </small>
                </div>
            </div>
        `;
        
        forecastContainer.appendChild(forecastDay);
    });
}

// 요일 이름 반환
function getDayName(dayIndex) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[dayIndex];
}

// 로딩 상태 표시
function showLoading() {
    loading.style.display = 'block';
    weatherInfo.style.display = 'none';
    error.style.display = 'none';
}

// 날씨 정보 표시
function showWeatherInfo() {
    loading.style.display = 'none';
    weatherInfo.style.display = 'block';
    error.style.display = 'none';
}

// SweetAlert2를 사용한 에러 표시
function showSweetAlert(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonColor: '#667eea',
        confirmButtonText: '확인',
        customClass: {
            popup: 'swal2-custom-popup'
        }
    });
}

// 에러 표시 (기존 방식)
function showError(message) {
    loading.style.display = 'none';
    weatherInfo.style.display = 'none';
    error.style.display = 'block';
    errorMessage.textContent = message;
}

// 날씨 상태에 따른 배경색 변경
function updateBackground(weatherCode) {
    const body = document.body;
    
    // 날씨 코드에 따른 배경색 설정
    if (weatherCode >= 1000 && weatherCode <= 1003) {
        // 맑음
        body.className = 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen';
    } else if (weatherCode >= 1006 && weatherCode <= 1009) {
        // 흐림
        body.className = 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 min-h-screen';
    } else if (weatherCode >= 1030 && weatherCode <= 1032) {
        // 안개
        body.className = 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 min-h-screen';
    } else if (weatherCode >= 1063 && weatherCode <= 1087) {
        // 비
        body.className = 'bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 min-h-screen';
    } else if (weatherCode >= 1114 && weatherCode <= 1117) {
        // 눈
        body.className = 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-200 min-h-screen';
    } else {
        // 기본
        body.className = 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen';
    }
}

// 도시 자동완성 기능
const popularCities = [
    'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan',
    'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya',
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam',
    'Sydney', 'Melbourne', 'Brisbane', 'Perth',
    'Toronto', 'Vancouver', 'Montreal', 'Calgary'
];

// 도시 입력 시 자동완성 제안
cityInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    if (value.length > 1) {
        const suggestions = popularCities.filter(city => 
            city.toLowerCase().includes(value)
        ).slice(0, 5);
        
        if (suggestions.length > 0) {
            showCitySuggestions(suggestions);
        }
    }
});

// 도시 제안 표시
function showCitySuggestions(suggestions) {
    // 기존 제안 제거
    const existingSuggestions = document.querySelector('.city-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'city-suggestions position-absolute bg-white border rounded shadow-sm';
    suggestionsDiv.style.cssText = 'top: 100%; left: 0; right: 0; z-index: 1000; max-height: 200px; overflow-y: auto;';
    
    suggestions.forEach(city => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'p-2 border-bottom cursor-pointer hover:bg-gray-100';
        suggestionItem.textContent = city;
        suggestionItem.addEventListener('click', () => {
            cityInput.value = city;
            suggestionsDiv.remove();
            searchWeather();
        });
        suggestionsDiv.appendChild(suggestionItem);
    });
    
    cityInput.parentElement.style.position = 'relative';
    cityInput.parentElement.appendChild(suggestionsDiv);
}

// 클릭 시 제안 숨기기
document.addEventListener('click', (e) => {
    if (!e.target.closest('.city-suggestions') && !e.target.closest('#cityInput')) {
        const suggestions = document.querySelector('.city-suggestions');
        if (suggestions) {
            suggestions.remove();
        }
    }
});

// 키보드 네비게이션
cityInput.addEventListener('keydown', (e) => {
    const suggestions = document.querySelector('.city-suggestions');
    if (!suggestions) return;
    
    const items = suggestions.querySelectorAll('div');
    const currentIndex = Array.from(items).findIndex(item => item.classList.contains('bg-primary'));
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items.forEach(item => item.classList.remove('bg-primary', 'text-white'));
        items[nextIndex].classList.add('bg-primary', 'text-white');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        items.forEach(item => item.classList.remove('bg-primary', 'text-white'));
        items[prevIndex].classList.add('bg-primary', 'text-white');
    } else if (e.key === 'Enter' && currentIndex >= 0) {
        e.preventDefault();
        items[currentIndex].click();
    }
});
