const activityList = document.getElementById("activities");
const wishList = document.getElementById("my-activities");

//Real time listener som hämtar från firestore där Islands-aktiviteter lagras
//Skickar tillagda dokument till renderActivity()
//Tar bort element från DOM för de dokument som tagits bort från db,
//tar även bort motsvarande dokument från wishlist-db
//Avslutar med att skicka förändrat dokuemnt till checkTwins()
db.collection('activities').onSnapshot((snapshot)=>{
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if(change.type == 'added'){
            renderActivity(change.doc);
        } else if(change.type == 'removed'){
            let element = activityList.querySelector('.A' + change.doc.id);
            activityList.removeChild(element);
            db.collection('wishlist').doc(change.doc.id).delete();
        }
    });
});

//Real time listener som hämtar från firestore där önskelistan finns lagrad
//Skickar tillagda dokument till renderWishList()
//Tar bort element från DOM för de dokument som tagits bort från db
//Avslutar med att skicka förändrat dokument till checkTwins()
db.collection('wishlist').onSnapshot((snapshot)=>{
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if(change.type == 'added'){
            renderWishlist(change.doc);
        } else if(change.type == 'removed'){
            let element = wishList.querySelector('.A' + change.doc.id);
            wishList.removeChild(element);
        }
        checkTwins(change.doc);
    });
});

//Kollar om det finns fler element i DOM som har samma klass-namn 
//(data-bas-id) som det element som hör till det medskickade dokumentet
//Hittas en "tvilling" innebär det att elementet i aktivitets-formuläret 
//ska bli disabled, eftersom man inte ska kunna lägga till fler aktiviteter
//av samma i sin önskelista
function checkTwins(doc){
    console.log(activityList.querySelector('.A'+doc.id));
    
    let activityText = activityList.querySelector('.A' + doc.id).childNodes[0];
    let addButton = activityList.querySelector('.A' + doc.id).childNodes[1];
    if(document.getElementsByClassName('A' + doc.id).length > 1){
        addButton.disabled = true;
        addButton.style.opacity = 0.5;
        activityText.style.opacity = 0.5;
    } else if (document.getElementsByClassName('A' + doc.id).length == 1){
        addButton.disabled = false;
        addButton.style.opacity = 1;
        activityText.style.opacity = 1;
    }
} 


//Lägger till nya dokument från databasen till HTML DOM
//Lägger eventlistener på "lägga-till-i-önskelista-knapp"
//där en kopia av det klickade dokumentet hamnar i databasen för önskelistan
function renderActivity(doc){

    let div = document.createElement('div');
    div.classList.add('A'+doc.id, 'activity-item');

    let activity = document.createElement('p');

    let addButton = document.createElement('button');
    addButton.classList.add('text-button');

    activity.textContent = doc.data().activity;
    addButton.textContent = "Add";

    div.appendChild(activity);
    div.appendChild(addButton);

    activityList.appendChild(div);
    console.log(document.getElementsByClassName('A'+doc.id).length);

    if(document.getElementsByClassName('A' + doc.id).length == 2){
        addButton.disabled = true;
        activity.style.opacity = 0.5;
    }

    addButton.addEventListener("click", ()=>{
        db.collection('wishlist').doc(doc.id).set({
            activity: doc.data().activity
        });
    });
}

//Lägger till nya dokument från databasen till HTML DOM
//Lägger eventlistener på "ta-bort-från-önskelista-knapp"
//som tar bort valt dokument från databasen
function renderWishlist(doc){
    let div = document.createElement('div');
    div.classList.add('A'+ doc.id, 'activity-item');

    let activity = document.createElement('p');

    let removeButton = document.createElement('button');
    removeButton.classList.add('text-button');

    activity.textContent = doc.data().activity;
    removeButton.textContent = "Remove";

    div.appendChild(activity);
    div.appendChild(removeButton);

    wishList.appendChild(div);

    removeButton.addEventListener("click", ()=> {
        db.collection('wishlist').doc(doc.id).delete();
    });
}


//Skapar asynchronous request för att hämta data från väder-API
//Kollar status på request för att kunna se processen i konsolen 
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

//Skickar parsad JSON-data till funktion addWeatherData
//skriver ut Error i konsol om requesten stöter på error
promise.then(function(){
        let APIdata = JSON.parse(request.responseText);
        console.log(APIdata);
        addWeatherData(APIdata);
        console.log("Success");
    }).catch(function(){
        console.log("Error");
});

//Plockar ut nuvarande temperatur från API och lägger till i HTML DOM
//Plockar ut nuvarande väderbeskrivning från API och lägger till matchande vädersymbol 
//genom switch-case-sats. Lägger sen till denna i HTML DOM.
function addWeatherData(APIdata){

    let weatherData = APIdata.timeSeries[0].parameters;
    let temp;
    let wsymb;
    for(let i = 0; i < weatherData.length; i++){
        if(weatherData[i].name == "t"){
            temp = weatherData[i].values[0] + ' C';
        } else if(weatherData[i].name == "Wsymb2"){
            wsymb = weatherData[i].values[0];
        }
    }
    document.getElementById("temp").textContent = temp;

    console.log(wsymb);
    console.log(temp);


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
}