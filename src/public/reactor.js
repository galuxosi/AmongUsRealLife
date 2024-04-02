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
	socket.emit("reactorFixed")
    image.src = 'images/reactor_wait.png';
	yourImg.style.height = '1000px';
    yourImg.style.width = '1000px';
})

socket.on('do-reactor', async () => {
    image.src = 'images/reactor_hold.png';
	yourImg.style.height = '1000px';
    yourImg.style.width = '1000px';
})	

socket.on('do-reactorFixedFully', async () => {
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

