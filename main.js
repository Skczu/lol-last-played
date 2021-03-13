// Misc functions
function convertTimestamp(timestamp) {
    const d = new Date(timestamp);
    const x = d.toLocaleString("en-US", {timeZoneName: "short"});
    return x;
}

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
}

// Interface object
UI = {};

UI.Button = function() {
    document.querySelector('button').addEventListener('click', () => {
        let chName = document.querySelector('.js-chname');
        let gName = document.querySelector('.js-gname');
        
        if(chName.value === '' || gName.value === '') {
            UI.InputErr('a');
        } else {
            RiotAPI.ChampionId(chName.value, gName.value);
            chName.style.border = '0.5vh solid rgb(159, 185, 240)';
            gName.style.border = '0.5vh solid rgb(159, 185, 240)';
        }
    })
}

UI.Insert = function(i, championName) {
    let result = document.querySelector('.result');
    let resultDate = document.querySelector('.result-date');
    let date = convertTimestamp(i);

    result.innerHTML = "Your last " + titleCase(championName) + " game was played on";
    resultDate.innerHTML = date;
}

UI.InputErr = function(i) {
    let result = document.querySelector('.result');
    let resultDate = document.querySelector('.result-date');
    let chInput = document.querySelector('.js-chname').style;
    let gInput = document.querySelector('.js-gname').style;
    let border = '0.5vh solid rgb(233, 70, 70)';
    
    if(i === 'a') {
        result.innerHTML = "Have you entered both values? I'd check again :)";
        resultDate.innerHTML = '';
        chInput.border = border;
        gInput.border = border;
    } else if(i === 'u') {
        result.innerHTML = "Oops! Your summoner name seems to be incorrect. Please try again.";
        resultDate.innerHTML = '';
        gInput.border = border;
    } else {
        result.innerHTML = "Umm, does that champion exist? Please try again.";
        resultDate.innerHTML = '';
        chInput.border = border;
    }
}

// API data object
RiotAPI = {};

RiotAPI.ChampionId = function(championName, username) {
    let ddragonUrl = 'http://ddragon.leagueoflegends.com/cdn/11.2.1/data/en_US/champion.json';
    let lowerName = championName.toLowerCase();
    let name = titleCase(lowerName).replace(/\s+/g, '');

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200){
            let response = JSON.parse(this.responseText);

            try {
                let cID = response.data[name].key;
                RiotAPI.UserId(cID, username, championName);
            } catch(error) {
                UI.InputErr('c');
            }
        }
    };
    xhttp.open("GET", ddragonUrl, true);
    xhttp.send();
}

RiotAPI.UserId = function(cID, username, championName) {
    let userUrl = links.SUMM_ID + username;

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200){
            let response = JSON.parse(this.responseText);
            let sumID = response.id;
            
            RiotAPI.ChampMastery(sumID, cID, championName);
        }
    };
    xhttp.open("GET", userUrl, true);
    xhttp.send();
}

RiotAPI.ChampMastery = function(sumID, cID, championName) {
    let masteryUrl = links.CH_ID + sumID + '&champ=' + cID;

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200){
            let response = JSON.parse(this.responseText);
            let playLast = response.lastPlayTime;
            if(playLast === undefined) {
                UI.InputErr('u');
            } else {
                UI.Insert(playLast, championName);
            }
        }
    };
    xhttp.open("GET", masteryUrl, true);
    xhttp.send();

}

// Start listening
UI.Button();