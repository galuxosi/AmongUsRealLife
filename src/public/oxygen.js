const socket = io({
	query: {
		role: 'OXYGENFIX'
	}
});

const fixOxygen$ = document.querySelector('#fixOxygen');

const soundPlayer = new Audio();
const SOUNDS = {
	meeting: '/sounds/meeting.mp3',
};

fixOxygen$.addEventListener('click', () => {
	socket.emit('oxygenHasBeenFixed')
});

async function wait(milliseconds) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), milliseconds);
	});
}

async function playSound(url) {
	soundPlayer.src = url;
	await soundPlayer.play();
}

