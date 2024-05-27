let currentSong = new Audio();
let songs;
let currFolder;
function convertSecondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.round(seconds % 60);

    // Ensure leading zeros if necessary
    var minutesString = String(minutes).padStart(2, '0');
    var secondsString = String(remainingSeconds).padStart(2, '0');

    return minutesString + " : " + secondsString;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let changed = song
            .replaceAll("%20", " ")
            .replaceAll("%2", " ")
            .replaceAll("%5B", " ")
            .replaceAll("%5D", " ")
            .replaceAll("B", " ");
        songUL.innerHTML = songUL.innerHTML + `<li><div>${changed}</div></div><div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="play.svg" >
    </div></li>` ;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.getElementsByTagName("div")[0].innerHTML.trim());
        })
    })
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    if (!pause) {
        currentSong.play()
    }
    console.log(track) ; 
    currentSong.src = `/songs/${currFolder}/` + track
    play.src = "pause.svg";
    currentSong.play();
    document.querySelector(".songinfo").innerHTML = decodeURI(track.replaceAll(".mp3", ""));
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}

const playFirstMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    if (!pause) {
        currentSong.play()
    }
    currentSong.src = `/songs/${currFolder}/` + track
    play.src = "pause.svg";
    currentSong.play();
    document.querySelector(".songinfo").innerHTML = decodeURI(track.replaceAll(".mp3", ""));
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors) ; 
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && e.href.split("/").slice(-1)[0] != "songs") {
            let folder = e.href.split("/").slice(-1)[0];
            //get the metadata of folder 
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML += `<div data-folder="${response.name}" class="card">
               <div class="play">
                   <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"
                       fill="none">
                       <!-- Circular background in green -->
                       <circle cx="18" cy="18" r="17" fill="#4CAF50" />
    
                       <!-- Play triangle in black (scaled down) -->
                       <polygon points="12 8 12 28 28 18" fill="#000000" />
                   </svg>
               </div>
               <img aria-hidden="false" draggable="false" loading="lazy"
                   src="/songs/${folder}/cover.jpg"
                   alt="" 
                   sizes="(min-width: 1280px) 232px, 192px">
               <h3>${response.title}</h3>
               <p>${response.description}</p>
           </div>`
        }
    }
    //Load the playlist whenever card is cliclked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
        })
    })
    let cards = Array.from(document.getElementsByClassName("card")) ; 
    for(let index = 0 ; index<cards.length ; index++){
        cards[index].getElementsByClassName("play")[0].addEventListener("click" , async (e)=>{
            // playMusic(e.getElementsByTagName("div")[0].innerHTML.trim());
            console.log(cards[index].dataset.folder); 
            await getSongs(`${cards[index].dataset.folder}`);
            playMusic(songs[0] , true) ; 
        })
    }
}

async function main() {
    await getSongs("modern");
    // playMusic(songs[0], true)
    //show all the sonsg in the playlist  

    //Display all the albums on the page 
    displayAlbums()
    //Attach an event listener to play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "play.svg";
        }
    })

    //listen for timeupdate event 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutesAndSeconds(currentSong.currentTime)} /
        ${convertSecondsToMinutesAndSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add event to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //Add an evebt listener for hamburge r
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".left").style.width = "300px";
    })

    //Add an event listener for closing of hamburger 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
        document.querySelector(".close")
    })

    //previous 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    //next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 <= songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = "volume.svg" ; 
        }
    })

    //Add event listener to volume button 
    document.querySelector(".volume>img").addEventListener("click" , (e)=>{
        if(currentSong.volume !=0 ){
            e.target.src = "mute.svg" ; 
            currentSong.volume = 0; 
        }
        else{
            e.target.src = "volume.svg"; 
            currentSong.volume = 0.5 ; 
        }
    })
} 

main();  