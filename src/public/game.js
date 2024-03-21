const socket = io({
	query: {
		role: 'PLAYER'
	}
});

const emergencyMeeting$ = document.querySelector('#emergency-meeting');
const enableSound$ = document.querySelector('#enable-sound');
const progress$ = document.querySelector('#progress');
const progressBar$ = document.querySelector('.progress-bar');
const report$ = document.querySelector('#report');
const tasks$ = document.querySelector('#tasks');
const comms$ = document.querySelector('#comms');
const reactor$ = document.querySelector('#reactor');

const soundPlayer = new Audio();
const SOUNDS = {
	meeting: '/sounds/meeting.mp3',
	sabotage: '/sounds/sabotage.mp3',
	start: '/sounds/start.mp3',
	sussyBoy: '/sounds/sussy-boy.mp3',
	voteResult: '/sounds/vote-result.mp3',
	youLose: '/sounds/you-lose.mp3',
	youWin: '/sounds/you-win.mp3',
	comms: '/sounds/comms.mp3',
	reactor: '/sounds/reactor_meltdown.mp3'
};

report$.addEventListener('click', () => {
	socket.emit('report');
});

emergencyMeeting$.addEventListener('click', () => {
	socket.emit('emergency-meeting');
	emergencyMeeting$.style.display = 'none';
});

comms$.addEventListener('click', () => {
	socket.emit('comms')
	comms$.style.display = 'none'
	tasks$.style.display = 'none'
	progressBar$.style.display = 'none'
	emergencyMeeting$.style.display = 'none'
	playSound(SOUNDS.comms);
	setTimeout(function() {
		comms$.style.display = 'inline'
	}, 60000);
	setTimeout(function(){
		tasks$.style.display = 'inline'
		progressBar$.style.display = 'block'
		emergencyMeeting$.style.display = 'inline'
	}, 26000);
})

reactor$.addEventListener('click', () => {
	socket.emit('reactor')
	comms$.style.display = 'none';
	reactor$.style.display = 'none'
	setTimeout(function() {
		comms$.style.display = 'inline'
		reactor$.style.display = 'inline'
	}, 60000);
});

socket.on('tasks', tasks => {
	// Remove existing tasks
	while (tasks$.firstChild) {
		tasks$.removeChild(tasks$.firstChild);
	}

	for (const [taskId, task] of Object.entries(tasks)) {
		const task$ = document.createElement('li');
		const label$ = document.createElement('label');

		const checkbox$ = document.createElement('input');
		checkbox$.type = 'checkbox';
		// checkbox.name = "name";
		// checkbox.value = "value";
		// checkbox.id = "id";
		checkbox$.onchange = event => {
			console.log('checkbox change', event.target.checked);
			if (event.target.checked) {
				socket.emit('task-complete', taskId);
			} else {
				socket.emit('task-incomplete', taskId);
			}
		};

		label$.appendChild(checkbox$);
		label$.appendChild(document.createTextNode(task));

		task$.appendChild(label$);
		tasks$.appendChild(task$);
	}
});

socket.on('role', role => {
	hideRole();
	const role$ = document.createElement('a');
	role$.classList.add('role');
	role$.appendChild(
		document.createTextNode(`Ви ${role}. Натисніть щоби приховати`)
	);
	role$.onclick = () => hideRole();

	document.body.appendChild(role$);
});

function hideRole() {
	document
		.querySelectorAll('.role')
		.forEach(element => (element.style.display = 'none'));
}

socket.on('progress', progress => {
	progress$.innerHTML = (progress * 100).toFixed(0);
	progressBar$.style.width = `${progress * 100}%`;
});

/**
 * Sounds
 */

async function wait(milliseconds) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), milliseconds);
	});
}

socket.on('play-meeting', async () => {
	await playSound(SOUNDS.meeting);
	await wait(2000);
	await playSound(SOUNDS.sussyBoy);
});

socket.on('play-win', async () => {
	await playSound(SOUNDS.youWin);
});

socket.on('do-comms', async () => {
	comms$.style.display = 'none'
	tasks$.style.display = 'none'
	progressBar$.style.display = 'none'
	emergencyMeeting$.style.display = 'none'
	reactor$.style.display = 'none'
	document.getElementById("tasksLabel").innerHTML = "Саботаж зв`язку";
	document.getElementById("tasksLabel").style.color = "#ff0000";
	playSound(SOUNDS.comms);
	setTimeout(function() {
		comms$.style.display = 'inline'
		reactor$.style.display = 'inline'
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
	comms$.style.display = 'none';
	reactor$.style.display = 'none'
	setTimeout(function() {
		comms$.style.display = 'inline'
		reactor$.style.display = 'inline'
	}, 60000);
});

enableSound$.addEventListener('click', async () => {
	console.log('enable sound');
	enableSound$.style.display = 'none';
	soundPlayer.play();
});

async function playSound(url) {
	soundPlayer.src = url;
	await soundPlayer.play();
}

