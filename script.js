$(document).ready(function () {
  const storage = JSON.parse(localStorage.getItem("search-storage")) || [];
  const storageLastValue = storage[storage.length - 1];
  console.log(storageLastValue);
  renderButtons();
  function renderButtons() {
    $(".storage").empty();
    storage.forEach(function (x) {
      const recentCityButton = $("<li><button>" + x + "</button></li>");
      $(".storage").prepend(recentCityButton);
    });
  }

  // Gathers weather data and render it to a Div
  $("#search-button").on("click", function () {
    const searchVal = $("#search-value").val();
    searchClickHandler(searchVal);
  });
  $(".storage").on("click", "button", function () {
    searchClickHandler($(event.target).text());
  });

    // Fixes case settings of user input search
  const searchClickHandler = function (inputVal) {
    let caseFix = inputVal.split(" ").map((letterArr) => {
        let newWord =
          letterArr[0].toUpperCase() +
          letterArr.substring(1, letterArr.length).toLowerCase();
        return newWord;
      }).join(" ");

    const apiKey = `180c9f853ac8fcc595fe4080e0abf997`;
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${caseFix}&appid=${apiKey}&units=imperial`;
    $.ajax({
      url: queryURL,
      method: "GET",
      dataType: "json",
      success: function (res) {
        console.log("success! AJax1:");
        console.log(res);
        // HTML elements for weather data
        const currentWeatherHTML = `
          <h3 class="card-title">${res.name} ${new Date().toLocaleDateString()}</h3>
          <div class="card">
          <div class="card-body" id="currentWeather">
          <h3 class="card-title">${res.name} (${new Date().toLocaleDateString()})
          <img src="https://openweathermap.org/img/w/${res.weather[0].icon}.png"/>
          </h3>
          <p class="card-text">Temperature: ${res.main.temp} °F</p>
          <p class="card-text">Humidity: ${res.main.humidity}%</p>
          <p id="endajax1" class="card-text">Wind Speed: ${res.wind.speed} MPH</p>
          </div>
          </div>
          `;
          storage.includes(caseFix) ? "" : storage.push(caseFix);

        renderButtons();

        localStorage.setItem("search-storage", JSON.stringify(storage));
        $("#today").html(currentWeatherHTML);
        var latitude = res.coord.lat;
        var longitude = res.coord.lon;

        const queryUVIndex = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${latitude}&lon=${longitude}`;
        $.ajax({
          url: queryUVIndex,
          method: "GET",
          dataType: "json",
          success: function (res) {
            const uvIndex = res.value;
            console.log("success! AJax2:");
            console.log(res);
            $("#currentWeather").append(
              `<p class="uvDiv card-text">UV Index: ${uvIndex}</p>`
            );

            const fiveDayForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
            $.ajax({
              url: fiveDayForecastUrl,
              method: "GET",
              dataType: "json",
              success: function (res) {
                console.log(res);
                $("#forecast").empty();
                var day = 1;
                for (i = 7; i < res.list.length; i = i + 7) {
                  //Set dates on five day forecast
                  console.log("before:");
                  console.log(day);
                  const forecastDates = moment().add(day, "days").format("MMM D");
                  const fiveDayForecastHtml = `
                        <div class="forecastCards card-body col-2 shadow bg-primary text-white">
                        <h3 class="card-title forecastDate">${res.city.name} 
                        <img src="https://openweathermap.org/img/w/${res.list[i].weather[0].icon}.png"/>
                        </h3>
                        <h5>${forecastDates}</h5>
                        <p class="card-text">Temperature: ${res.list[i].main.temp} °F</p>
                        <p class="card-text">Humidity: ${res.list[i].main.humidity}%</p>
                        <p class="card-text">Wind Speed: ${res.list[i].wind.speed} MPH</p>
                        <p class="uvDiv card-text">UV Index: ${uvIndex}</p>
                        </div>
                        `; 
                  day++;

                  console.log("after:");
                  console.log(day);
                  $("#forecast").append(fiveDayForecastHtml);
                  if (uvIndex < 3) {
                    $(".uvDiv").addClass("bg-success");
                  } else if (uvIndex > 2 && uvIndex < 6) {
                    $(".uvDiv").addClass("bg-warning");
                  } else if (uvIndex > 5 && uvIndex < 8) {
                    $(".uvDiv").css("background-color", "darkorange");
                  } else {
                    $(".uvDiv").addClass("bg-danger");
                  }
                }
              },
            });
          },
        });
        $("#search-value").val("");
      },
      error: function () {
        $("#search-value").val("");
        return;
      },
    });
  };
  if (storage === []) {
    return false;
  } else {
    searchClickHandler(storageLastValue);
  }
});
