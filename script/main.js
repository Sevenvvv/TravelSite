var promise = new Promise((resolve, reject) => {
    request = new XMLHttpRequest();
    request.open("get", "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/16.158/lat/58.5812/data.json");
    request.send();
    
    request.onreadystatechange = function() {
        if(this.status == 200 && this.readyState == 4){
            console.log("Request ready and status good");
            resolve();
        } else if (this.readyState < 4){
            console.log("Request not ready. ReadyState: " + this.readyState + " Status: " + this.status);
        } else if(this.status > 200){
            console.log("Request failed. ReadyState: " + this.readyState + " Status: " + this.status);
            reject();
        }
    }
    
});

promise.then(function(){
        let APIdata = JSON.parse(request.responseText);
        console.log(APIdata);
        addWeatherData(APIdata);
        console.log("Success");
    }).catch(function(){
        console.log("Error");
});

function addWeatherData(APIdata){
    let temp = APIdata.timeSeries[0].parameters[1].values[0] + " C";
    console.log(temp);

    let wsymb = APIdata.timeSeries[69].parameters[18].values[0];
    var src = "images/";

    switch(wsymb){
        case 1: //sun
            src +="sun.png";
            break;
        case 2:
        case 3:
        case 4:
        case 5://partly cloudy day
            src +="partlycloudy.png";
            break;
        case 6: //clouds
            src +="clouds.png";
            break;
        case 7: //dust
            src +="dust.png";
            break;
        case 8:
        case 9:
        case 10: // rain cloud (sun and two drops)
            src +="sunrain.png";
            break;
        case 11: // stormy weather
            src +="stormy.png";
            break;
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17: // Snowy sunny day
            src +="snowsun.png";
            break;
        case 18: //rain cloud (one drop)
            src +="raincloud.png";
            break;
        case 19: //light rain
            src +="lightrain.png";
            break;
        case 20: //moderate rain
            src +="moderaterain.png";
            break;
        case 21: //storm
            src +="storm.png";
            break;
        case 22:
        case 23:
        case 24: //sleet
            src +="sleet.png";
            break;
        case 25: //light snow
            src +="lightsnow.png";
            break;
        case 26:
        case 27: //snow
            src +="snow.png";
            break;
    }

    document.getElementById("wsymb").setAttribute("src", src);
    //document.getElementById("temp").innerText(temp);
    console.log(wsymb);

}