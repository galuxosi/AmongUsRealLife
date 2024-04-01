const socket = io({
	query: {
		role: 'REACTOR'
	}
});

const fix$ = document.querySelector('#reactorFix');
const image = document.getElementById('reactorImage');

socket.on('do-reactor', async () => {
	
});

const soundPlayer = new Audio();
const SOUNDS = {
    // sounds
};

fix$.addEventListener('click', () => {
	socket.emit("reactorFixed")
    image.src = 'images/reactor_wait.webp';
})

socket.on('do-reactor', async () => {
    image.src = 'images/reactor_hold.webp';
})

socket.on('do-reactorFixedFully', async () => {
    image.src = 'images/reactor_nominal.webp';
})


async function wait(milliseconds) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), milliseconds);
	});
}
// JavaScript functions to handle button clicks


async function playSound(url) {
	soundPlayer.src = url;
	await soundPlayer.play();
}

