var town = "";
var lookItUp = $("#townlookup");
var clearIt = $("#clear");
var myTown = $("#mytown");
var crrntT = $("#temperature");
var crrntH = $("#humidity");
var crrntWs = $("#wind-speed");
var crrntUv = $("#uvindex");
var srchTown = [];
var APIKey = "f9b52ab39539b99d85c2384a71f01dfd";

function find(oldsearch){
    for (var i = 0; i < srchTown.length; i++){
        if(oldsearch.toUpperCase() === srchTown[i]){
            return -1;
        }
    }
    return 1;
}


function displayWeather(event){
    event.preventDefault();
    if(lookItUp.val().trim() !== ""){
        town = lookItUp.val().trim();
        crrntWeather(town);
    }
}

function crrntWeather(town){
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + town + "&APPID=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function(response){ 
        console.log(response);
        
        var weatherIcon = response.weather[0].icon;
        var iconUrl = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
        var date = new Date(response.dt * 1000).toLocaleDateString();

        $(myTown).html(response.name + " (" + date + ") " + "<img src=" + iconUrl + ">");
        

        var tempF = (response.main.temp - 273.15) * 1.80 + 32;

        $(crrntT).html((tempF).toFixed(2) + "&#8457");
        $(crrntH).html(response.main.humidity + "%");
        
        var ws = response.wind.speed;
        var wsMph = (ws * 2.237).toFixed(1);
        $(crrntWs).html(wsMph + "mph");
        
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod == 200){
            srchTown = JSON.parse(localStorage.getItem("townname"));
            console.log(srchTown);
            if (srchTown == null){
                srchTown = [];
                srchTown.push(town.toUpperCase()
                );
                localStorage.setItem("townname", JSON.stringify(srchTown));
                addToList(town);
            }
            else {
                if(find(town) > 0){
                    srchTown.push(town.toUpperCase());
                    localStorage.setItem("townname", JSON.stringify(srchTown));
                    addToList(town);
                }
            }
        }

    });
}
    
function UVIndex(ln,lt){
    var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;

    $.ajax({
            url: uvURL,
            method: "GET"
    }).then(function(response){
        $(crrntUv).html(response.value);
        });
}
    
function forecast(cityid){
    var forcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    $.ajax({
        url: forcastURL,
        method: "GET"
    }).then(function(response){
        
        for (i = 0; i < 5; i++){
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconNum = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconUrl ="https://openweathermap.org/img/wn/" + iconNum + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempF =(((tempK - 273.5) * 1.80) + 32).toFixed(2);
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;
        
            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconUrl + ">");
            $("#fTemp" + i).html(tempF + "&#8457");
            $("#fHumidity" + i).html(humidity + "%");
        }
        
    });
}

function addToList(oldsearch){
    var lstItem = $("<li>" + oldsearch.toUpperCase() + "</li>");
    $(lstItem).attr("class", "list-group-item");
    $(lstItem).attr("data-value", oldsearch.toUpperCase());
    $(".list-group").append(lstItem);
}

function renderHistory(event){
    var lstEl = event.target;
    if (event.target.matches("li")){
        town = lstEl.textContent.trim();
        crrntWeather(town);
    }

}


function renderRecentTown(){
    $("ul").empty();
    var srchTown = JSON.parse(localStorage.getItem("townname"));
    if(srchTown !== null){
        srchTown = JSON.parse(localStorage.getItem("townname"));
        for(i = 0; i < srchTown.length; i++){
            addToList(srchTown[i]);
        }
        town = srchTown[i - 1];
        crrntWeather(town);
    }

}

function clearHistory(event){
    event.preventDefault();
    srchTown = [];
    localStorage.removeItem("townname");
    document.location.reload();

}

$("#searchbtn").on("click", displayWeather);
$(document).on("click", renderHistory);
$(window).on("load", renderRecentTown);
$("#clear").on("click", clearHistory);