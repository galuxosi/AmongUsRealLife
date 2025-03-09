const socket = io({
	query: {
		role: 'REACTOR'
	}
});

const fix$ = document.querySelector('#reactorFix');
const image = document.getElementById('reactorImage');

const soundPlayer = new Audio();
const SOUNDS = {
    // sounds
};

fix$.addEventListener('click', () => {
	socket.emit("reactor-fixed")
    image.src = 'images/reactor_wait.png';
	yourImg.style.height = '1000px';
    yourImg.style.width = '1000px';
})

socket.on('do-reactor', async () => {
    image.src = 'images/reactor_hold.png';
	yourImg.style.height = '1000px';
    yourImg.style.width = '1000px';
})	

socket.on('do-reactor-fixed', async () => {
    image.src = 'images/reactor_nominal.webp';
	yourImg.style.height = '1000px';
    yourImg.style.width = '1000px';
})

async function wait(milliseconds) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), milliseconds);
	});
}

async function playSound(url) {
	soundPlayer.src = url;
	await soundPlayer.play();
}

function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        window.location.href = "about:blank";
    }, 2000); // 5 seconds
}

document.addEventListener("mousemove", resetTimer);
document.addEventListener("keydown", resetTimer);
document.addEventListener("scroll", resetTimer);
document.addEventListener("touchstart", resetTimer); 
document.addEventListener("touchmove", resetTimer);

resetTimer();


