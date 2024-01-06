let audio = new Audio()
let duration = document.querySelector('.duration');
let songs;
let currentFolder;

// if (songs == undefined) {
//     (async function call() {
//         songs = await fetchSongs(`Musics/${currentFolder}`)
//     })();

// }

function convertSecondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function fetchSongs(folder) {
    currentFolder = folder;
    let fetchingSongs = await fetch(`/${folder}/`)
    let response = await fetchingSongs.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');

    songs = [];
    for (let i = 0; i < anchors.length; i++) {
        const element = anchors[i];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    return songs;


}
function playMusics() {
    if (audio.paused) {
        audio.play()
        document.querySelector('#big-play').setAttribute('class', 'fa-solid fa-pause')
    } else {
        document.querySelector('#big-play').setAttribute('class', 'fa-solid fa-play')
        audio.pause()
    }
}

async function displayAlbums() {
    try {
        let fetchingSongs = await fetch(`http://127.0.0.1:3000/Musics/`)
        let response = await fetchingSongs.text();
        let div = document.createElement('div');
        div.innerHTML = response;
        let anchors = div.getElementsByTagName('a');
        let allAnch = Array.from(anchors)
        for (let i = 0; i < allAnch.length; i++) {
            if (allAnch[i].href.includes('/Musics') && !allAnch[i].href.includes('.htaccess')) {
                let folders = allAnch[i].href.split('/')[4];
                let fetchingSongs = await fetch(`http://127.0.0.1:3000/Musics/${folders}/info.json`)
                let response = await fetchingSongs.json();
                document.querySelector('.hero').innerHTML += `<div data-folder="${folders}" class="card">
<img class="play" src="images/play.png" alt="">
<img class="cardImg" src="Musics/${folders}/cover.jpg" alt="">
<h2>${response.title}</h2>
<p>${response.description}</p>
</div>`
            }
        }
        main()
        Array.from(document.querySelectorAll('.card')).forEach((ele) => {
            ele.addEventListener('click', async () => {
                document.querySelector('.musics').getElementsByTagName('ul')[0].innerHTML = ''
                songs = await fetchSongs("Musics/" + ele.dataset.folder)
                main()
                playMusics()

            })
        })
        document.querySelector('.forword').addEventListener('click', () => {
            let index = songs.indexOf(audio.src.split("/").slice(-1)[0])
            if ((index + 1) >= songs.length) {
                audio.src = `${currentFolder}/` + songs[songs.length - 1];
                playMusics()
                document.querySelector('.song-name').innerHTML = songs[songs.length - 1].replaceAll('%20', ' ');
            } else {
                audio.src = `${currentFolder}/` + songs[index + 1];
                playMusics()
                document.querySelector('.song-name').innerHTML = songs[index + 1].replaceAll('%20', ' ');
            }
        })
        document.querySelector('.backword').addEventListener('click', () => {
            let index = songs.indexOf(audio.src.split("/").slice(-1)[0])
            if ((index - 1) >= 0) {
                audio.src = `${currentFolder}/` + songs[index - 1];
                playMusics()

                document.querySelector('.song-name').innerHTML = songs[index - 1].replaceAll('%20', ' ');
            }
        })
        document.querySelector('#big-play').addEventListener('click', () => {
            playMusics()
        });
        document.querySelector('.volImg').addEventListener('click', (e) => {
            if (e.target.src.includes('images/volume-2.svg')) {
                e.target.src = 'images/volume-x.svg'
                audio.volume = 0;
                document.querySelector('.volRan').value = 0;
            } else {
                e.target.src = 'images/volume-2.svg'
                audio.volume = 0.5;
                document.querySelector('.volRan').value = 50;
            }
        });
    } catch (error) {

    }
}

displayAlbums()


async function main() {
    try {
        audio.src = `${currentFolder}/` + songs[0];
        document.querySelector('.song-name').innerHTML = decodeURI(songs[0]);


        let songUL = document.querySelector('.musics').getElementsByTagName('ul')[0]
        for (const song of songs) {
            songUL.innerHTML = songUL.innerHTML + `
        <li>
        <img class="invert" src="images/music.svg" alt="">
        <div>
            <h3>${song.replaceAll('%20', ' ')}</h3>
           
        </div>
        <h2>Play Now</h2>
        <img class="invert" src="images/play.svg" alt="">
    </li>
`;
        }

        Array.from(document.querySelector('.musics').getElementsByTagName('li')).forEach((e) => {
            e.querySelector('div').querySelector('h3').addEventListener('click', (e) => {
                audio.src = `${currentFolder}/` + e.target.innerHTML
                audio.play()
                document.querySelector('#big-play').setAttribute('class', 'fa-solid fa-pause')
                document.querySelector('.song-name').innerHTML = e.target.innerHTML
            })
        })


        events()

    } catch (error) {
        // console.log(error);

    }

};
function events() {
    audio.addEventListener('timeupdate', () => {
        document.querySelector('.duration').innerHTML =
            `${convertSecondsToMinutesSeconds(audio.currentTime)}
 /${convertSecondsToMinutesSeconds(audio.duration)}`
        document.querySelector('.ball').style.left = (audio.currentTime / audio.duration) * 100 + '%'

    })
    document.querySelector('.seekBar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.ball').style.left = percent + '%';
        audio.currentTime = ((audio.duration) * percent) / 100

    });
    document.querySelector('.menu').addEventListener('click', () => {
        document.querySelector('.left').style.left = '1vw';

    })
    document.querySelector('.cross').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-153vw';
    })

    document.querySelector('.volRan').addEventListener('change', (e) => {
        audio.volume = parseInt(e.target.value) / 100;
        document.querySelector('.volImg').src = 'images/volume-2.svg'
    });
}
events()
