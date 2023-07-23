const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".containerweather");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

// variables that are needed initially

// this tells that on what tab we are 
let currentTab = userTab;

// API key to be used for fetching the data
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

// adding some CSS properties to the currentTab of the cureentTab
currentTab.classList.add("current-tab");

getfromSessionStorage();

// this function add some properties on the tab which is clicked and remove the properties of the tab which is earlier clicked
function switchTab(newTab) {

    // this says that if the currentTab is not equal to the ClickedTab then only change the 
    if(newTab != currentTab) {

        // this says that if the currentTab is not equal to the ClickedTab then only change the CSS properties
        currentTab.classList.remove("current-tab");
        currentTab = newTab;
        currentTab.classList.add("current-tab");


         // this tells if the search form does not contain any active properties 
        // the active property makes the search for visible on the UI
        if(!searchForm.classList.contains("active")) {

            //then add the active property to make it visible on the screen and remove the active property
            // from the rest of the containers 
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {

            // the else statement tells us that if the SearchForm is not open then 
            // make the userInfoContainer visible by adding the active property to it.
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");


             // this function is used to show the weather in the userInfoContainer so this function
            // will check wheather the cordinates are saves there or not for the weather
            getfromSessionStorage();
        }
    }
}

// this eventlistener says that if you click on the userTab call the function switchTab
userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
});

// this eventlistener says that if you click on the searchTab call the function switchTab
searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});


// this function checks wheather the cordinates are already present in the sessions storage or not
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);

        // this fuction fetches the use weather information by its coordinates
        fetchUserWeatherInfo(coordinates);
    }

}

// this fuction fetches the use weather information by its coordinates
// async function is used because we are taking teh data from the API
async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    

    // to show the loading screen we have make the grantAccessConatiner screen invisible
    grantAccessContainer.classList.remove("active");

    // now loading screen is visible in the UI by adding the active property
    loadingScreen.classList.add("active");

    // API call to fetch the weather
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();

         //   when the weather is fetched on the basis of the logitude and latitude the the loading screen will be removed 
        // and the userIndoContainer sceen will be visible to show the weather according to the given logitude and latitude
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        //   this function is used to fetch the data from te json file and will put in the UI 
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        

    }

}


//   this function is used to fetch the data from te json file and will put in the UI 
function renderWeatherInfo(weatherInfo) {
     

    // this is used to fetch the elements and store them in a variable
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");


    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;


}
// this function will tell us that  weather geolocation API is supported or not
function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        console.log('No Geological Support');
    }
}
// this call back function is used to get the coordinates 
function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

     // these cordinates which we have get will be stored in the sessionsStorage
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    
    // this call back function is used show the coordinates in the UI
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
// this eventListener is added so that if we click on the grant location button then we would get the
// location by getLocation() call back function this will fing out our live coordinates
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    // The preventDefault() method cancels the event if it is cancelable,
    //  meaning that the default action that belongs to the event will not occur.

    //  For example, this can be useful when:

        // Clicking on a "Submit" button, prevent it from submitting a form
        // Clicking on a link, prevent the link from following the URL
    e.preventDefault();
    let cityName = searchInput.value;

    // this statement tells us that if there is no name returned in the input section
    // then return because if there is no name written how can the search section would find the weather of the city
    if(cityName === "")
        return;
    else 
    // this function is call back function which asks the API to fetcch the weather of the cityName
        fetchSearchWeatherInfo(cityName);
});

// this variable is made so that is there is a wrong input in the input section then or a wrong name 
// of the city then to throw an error
const errContainer = document.querySelector(".err-container");

// this function is amde to fetch the weather data of a city by an API.
async function fetchSearchWeatherInfo(city) {

    // it says when you will be fetching the data till then the loading page will be shown
    loadingScreen.classList.add("active");

    // it will remove the userInfoContainer page from the UI
    userInfoContainer.classList.remove("active");

    // it will remove the grantAccessContainer page from the UI
    grantAccessContainer.classList.remove("active");

    // this async function is made in try and catch block because to show an erroe is there is
    // a wrong input of a city or an invalid input
    try {

        // this is code to fetch a weather data from an API
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );

        // this  line tells us that the data we have fetched from the API is now converted to json fromat
        // so that the data can be accessed easily
        const data = await response.json();

        // this if statement tells us that if there is an invalid input or a name of a city
        // then it will add the active class in the errContainer 
        if(data.cod==='404'){
            loadingScreen.classList.remove("active");
            errContainer.classList.add("active");
        }
        else{
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            errContainer.classList.remove("active");

            // thsi function will help us to render the data which we have earlier converted into 
            // json format and fetch its details like windspeed, humidity, etc
            renderWeatherInfo(data);
        }
        
    }
    // this is the catch block if there is an error in code we have written we can print the error 
    // in the console section
    catch(err) {
        console.log(err);
    }
}

