const socket = io({
	query: {
		role: 'ADMIN'
	}
});

const startGame$ = document.querySelector('#start-game');
const callOut$ = document.querySelector('#callOut');
const comms$ = document.querySelector('#comms');
const lights$ = document.querySelector('#lights');
const oxygen$ = document.querySelector('#oxygen')
const reactor$ = document.querySelector('#reactor');
const dead$ = document.querySelector('#dead');
const ejected$ = document.querySelector('#ejected');
const playerLobby$ = document.querySelector('#player-lobby')
const nameInput$ = document.querySelector('#player-name-input')
const nameSubmit$ = document.querySelector('#player-name-submit')
const gameContent$ = document.querySelector('#game-content')
const nameForm$ = document.querySelector('#name-form')

startGame$.addEventListener('click', () => {
	socket.emit('start-game');
});

callOut$.addEventListener('click', () => {
	socket.emit('callout');
});

async function wait(milliseconds) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), milliseconds);
	});
}

const SOUNDS = {
	meeting: new Audio('/sounds/meeting.ogg'),
	sabotage: new Audio('/sounds/sabotage.mp3'),
	start: new Audio('/sounds/start.mp3'),
	sussyBoy: new Audio('/sounds/sussy-boy.mp3'),
	voteResult: new Audio('/sounds/vote-result.mp3'),
	youLose: new Audio('/sounds/you-lose.mp3'),
	youWin: new Audio('/sounds/you-win.mp3'),
	comms: new Audio('/sounds/comms.mp3'),
	reactorMeltdown: new Audio('/sounds/reactor_meltdown.mp3')
};

socket.on('play-meeting', async () => {
	await SOUNDS.meeting.play();
	await wait(2000);
	await SOUNDS.sussyBoy.play();
});

socket.on('play-win', async () => {
	await SOUNDS.youWin.play();
});

comms$.addEventListener('click', () => {
	socket.emit('comms-fixed')
})

reactor$.addEventListener('click', () => {
	socket.emit('reactor-fixed')
});

oxygen$.addEventListener('click', () => {
	socket.emit('oxygen-fixed')
});

lights$.addEventListener('click', () => {
	socket.emit('lights-fixed')
})

dead$.addEventListener('click', () => {
	socket.emit('dead')
})

ejected$.addEventListener('click', () => {
	socket.emit('ejected')
})

socket.on('update-players', (players) => {
	// Clear existing players
	playerLobby$.innerHTML = '';
	
	// Add each player to the lobby
	players.forEach(player => {
		const playerElement = document.createElement('div');
		playerElement.classList.add('player-item');
		
		const playerName = document.createElement('span');
		playerName.textContent = player.name;
		
		const removeButton = document.createElement('button');
		removeButton.textContent = 'X';
		removeButton.classList.add('remove-player');
		removeButton.addEventListener('click', () => {
			socket.emit('remove-player', player.id);
		});
		
		playerElement.appendChild(playerName);
		playerElement.appendChild(removeButton);
		playerLobby$.appendChild(playerElement);
	});
});
