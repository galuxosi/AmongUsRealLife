const socket = io({
	query: {
		role: 'ADMIN'
	}
});

const startGame$ = document.querySelector('#start-game');

startGame$.addEventListener('click', () => {
	socket.emit('start-game');
});

/**
 * Sounds
 */
	
async function wait(milliseconds) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), milliseconds);
	});
}

const SOUNDS = {
	meeting: new Audio('/sounds/meeting.mp3'),
	sabotage: new Audio('/sounds/sabotage.mp3'),
	start: new Audio('/sounds/start.mp3'),
	sussyBoy: new Audio('/sounds/sussy-boy.mp3'),
	voteResult: new Audio('/sounds/vote-result.mp3'),
	youLose: new Audio('/sounds/you-lose.mp3'),
	youWin: new Audio('/sounds/you-win.mp3'),
	comms: new Audio('/sounds/comms.mp3')
};

socket.on('play-meeting', async () => {
	await SOUNDS.meeting.play();
	await wait(2000);
	await SOUNDS.sussyBoy.play();
});

socket.on('play-win', async () => {
	await SOUNDS.youWin.play();
});

socket.on('do-comms', async () => {
	comms$.style.display = 'none'
	tasks$.style.display = 'none'
	progressBar$.style.display = 'none'
	emergencyMeeting$.style.display = 'none'
	document.getElementById("tasksLabel").innerHTML = "Саботаж зв`язку";
	document.getElementById("tasksLabel").style.color = "#ff0000";
	playSound(SOUNDS.comms);
	setTimeout(function() {
		comms$.style.display = 'inline'
	}, 60000);
	setTimeout(function(){
		document.getElementById("tasksLabel").innerHTML = "Завдання";
		document.getElementById("tasksLabel").style.color = "#000000";
		tasks$.style.display = 'inline'
		progressBar$.style.display = 'block'
		emergencyMeeting$.style.display = 'inline'
	}, 26000);
});

socket.on('do-reactor', async () => {
	alert("ЗАПРОШЕНО САБОТАЖ РЕАКТОРА")
});
