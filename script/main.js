//Get element which will hold list of activities
const activityList = document.getElementById("activities");

//Get element which will hold wishlist
const wishList = document.getElementById("my-activities");

//Start value for variable that controls weather slides
let slideIndex = 0;

/*IIFE that starts weatherslides to roll.
  Displays one weather element and hides the rest.
  Ends by making the same function be called every third sec
  which creates a slideshow.*/
(function showSlides(){
    let slides = document.getElementsByClassName('weather');

    for(let i = 0; i < slides.length; i++){
        slides[i].style.display = 'none';
    }

    slides[slideIndex].style.display = 'flex';

    slideIndex++;

    slideIndex = (slideIndex == slides.length) ? slideIndex = 0 : slideIndex;
    //if(slideIndex == slides.length){slideIndex=0;}

    setTimeout(showSlides, 3000);
})();

/*Real time listener, gets snapshot from firestore collection 'activities'.
  Sends added documents to function renderActivity.
  Removed documents are removed from DOM, and the twin document in
  wishlist-collection gets deleted*/
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

/*Real time listener, gets snapshot from firestore collection 'wishlist'
  Sends added documents to function renderWishList.
  Removed documents are removed from DOM
  Function checkTwins is called for both added and removed documents*/
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

/*Is called every time a change is made i wishlist-collection
  Checks to see if there are more documents with the same class name (database-id).
  If a twin is found, the twin in the activity-list is disabled,
  to make sure one activity can neever be added to wishlist more than once. */
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

/*Adds new documents from collection 'activities' to DOM
  Adds event listener to addButton, which makes a copy of the
  clicked document, and puts it in collection wishlist */
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

/*Adds new documents from collection 'wishlist' to DOM.
  Adds event listener to removeButton, which deletes the clicked
  document from collection wishlist */
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

/*Creates asyncronous request to get data from weather API
  onreadyStatechange checks the status on the request and logs it to the console,
  and calls resolve or reject */
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

/*Sends parsed JSON data to function addWeatherData if request was sucessful,
  or logs error message to the console on failed request */
promise.then(function(){
        let APIdata = JSON.parse(request.responseText);
        console.log(APIdata);
        addWeatherData(APIdata);
        console.log("Success");
    }).catch(function(){
        console.log("Error");
});

/*Read temperature-data: temp now and temp in 24 h. Adds it to DOM
  Read weather description: now and in 24 h. Weather despriction (a number)
  is matched with a symbol by switch case, and added to DOM */
function addWeatherData(APIdata){

    setTags(0, 'wsymb1', 'temp1');
    setTags(24, 'wsymb2', 'temp2');

    function setTags(hourIndex, wsymbID, tempID){
        let weatherData = APIdata.timeSeries[hourIndex].parameters;
        console.log(weatherData);
        let temp;
        let wsymb;
        for(let i = 0; i < weatherData.length; i++){
            if(weatherData[i].name == "t"){
                temp = weatherData[i].values[0] + ' C';
            } else if(weatherData[i].name == "Wsymb2"){
                wsymb = weatherData[i].values[0];
            }
        }
        console.log(wsymb);
        console.log(temp);

        //Only for control
        console.log(tempID);
        console.log(wsymbID);
        console.log(hourIndex);
    
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
        
        //Only for control
        console.log(document.getElementById(wsymbID));
        console.log(document.getElementById(tempID));

        document.getElementById(wsymbID).setAttribute("src", src);
        document.getElementById(tempID).textContent = temp;
    }


    
}

