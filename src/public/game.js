const socket = io({
	query: {
		role: 'PLAYER'
	}
});

var sabotageActive = false

const emergencyMeeting$ = document.querySelector('#emergency-meeting');
const enableSound$ = document.querySelector('#enable-sound');
const progress$ = document.querySelector('#progress');
const progressBar$ = document.querySelector('.progress-bar');
const report$ = document.querySelector('#report');
const tasks$ = document.querySelector('#tasks');
const tasksLabel$ = document.querySelector('#tasksLabel');
const progressLabel$ = document.querySelector('#progressLabel');
const oxygen$ = document.querySelector("#oxygen")
const comms$ = document.querySelector('#comms');
const reactor$ = document.querySelector('#reactor');
const lights$ = document.querySelector("#lights")

let countdownInterval;
let timeOutOxygen;

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
	reactor: '/sounds/reactor_meltdown.mp3',
	join: '/sounds/join.mp3',
	leave: '/sounds/leave.mp3',
	complete: '/sounds/complete.mp3',
	incomplete: '/sounds/incomplete.ogg',
	button: '/sounds/button.ogg',
	accept: '/sounds/idaccepted.ogg',
	powerdown: '/sounds/powerdown.mp3'
};

window.onload = function() {
	playSound(SOUNDS.join);
}

report$.addEventListener('click', () => {
	socket.emit('report');
});

emergencyMeeting$.addEventListener('click', () => {
	socket.emit('emergency-meeting');
	emergencyMeeting$.style.display = 'none';
});

comms$.addEventListener('click', () => {
	socket.emit('comms')
	sabotageActive = true
	comms$.style.display = 'none'
	reactor$.style.display = 'none'
	lights$.style.display = 'none'
	oxygen$.style.display = 'none'
	tasks$.style.display = 'none'
	progressBar$.style.display = 'none'
	progressLabel$.style.display = 'none'
	emergencyMeeting$.style.display = 'none'
	document.getElementById("tasksLabel").innerHTML = "Саботаж зв`язку";
	document.getElementById("tasksLabel").style.color = "#ff0000";
	setTimeout(function() {
		comms$.style.display = 'inline'
		reactor$.style.display = 'inline'
		lights$.style.display = 'inline'
		oxygen$.style.display = 'inline'
	}, 60000);
	setTimeout(function(){
		document.getElementById("tasksLabel").innerHTML = "Завдання";
		document.getElementById("tasksLabel").style.color = "#000000";
		progressBar$.style.display = 'inline'
		tasks$.style.display = 'inline'
		progressLabel$.style.display = 'block'
		emergencyMeeting$.style.display = 'inline'
		sabotageActive = false
	}, 26000);
	
})

reactor$.addEventListener('click', () => {
	socket.emit('reactor')
	comms$.style.display = 'none'
	reactor$.style.display = 'none'
	lights$.style.display = 'none'
	oxygen$.style.display = 'none'
	setTimeout(function() {
		comms$.style.display = 'inline'
		reactor$.style.display = 'inline'
		lights$.style.display = 'inline'
		oxygen$.style.display = 'inline'
	}, 60000);
});

oxygen$.addEventListener('click', () => {
	socket.emit('oxygen')
	comms$.style.display = 'none'
	reactor$.style.display = 'none'
	lights$.style.display = 'none'
	oxygen$.style.display = 'none'
	emergencyMeeting$.style.display = 'none'
	sabotageActive = true
	document.getElementById("tasksLabel").innerHTML = "Саботаж кисню " + timeLeft;
	document.getElementById("tasksLabel").style.color = "#ff0000";
	setTimeout(function() {
		comms$.style.display = 'inline'
		reactor$.style.display = 'inline'
		lights$.style.display = 'inline'
		oxygen$.style.display = 'inline'
		emergencyMeeting$.style.display = 'inline'
	}, 60000);
});

lights$.addEventListener('click', () => {
	socket.emit('lights')
	comms$.style.display = 'none'
	reactor$.style.display = 'none'
	lights$.style.display = 'none'
	oxygen$.style.display = 'none'
	emergencyMeeting$.style.display = 'none'
	report$.style.display = 'none'
	document.getElementById("tasksLabel").innerHTML = "Саботаж світла";
	document.getElementById("tasksLabel").style.color = "#ff0000";
	playSound(SOUNDS.powerdown)
	setTimeout(function() {
		comms$.style.display = 'inline'
		reactor$.style.display = 'inline'
		lights$.style.display = 'inline'
		oxygen$.style.display = 'inline'
	}, 60000);
	setTimeout(function(){
		document.getElementById("tasksLabel").innerHTML = "Завдання";
		document.getElementById("tasksLabel").style.color = "#000000";
		progressBar$.style.display = 'inline'
		tasks$.style.display = 'inline'
		progressLabel$.style.display = 'block'
		emergencyMeeting$.style.display = 'inline'
		report$.style.display = 'inline'
	}, 20000);
})

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
    let isRoleHidden = false;
    const role$ = document.createElement('a');
    role$.classList.add('role');
    role$.textContent = `Ви ${role}. Натисніть щоби приховати`;
    role$.onclick = () => {
        if (!isRoleHidden) {
            role$.textContent = 'Натисніть щоби показати роль';
            isRoleHidden = true;
        } else {
            role$.textContent = `Ви ${role}. Натисніть щоби приховати`;
            isRoleHidden = false;
        }
        playSound(SOUNDS.button);
    }

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

socket.on('play-start', async () => {
	await playSound(SOUNDS.start);
});

socket.on('play-meeting', async () => {
	await playSound(SOUNDS.meeting);
	await wait(2000);
	await playSound(SOUNDS.sussyBoy);

	await clearTimeout(timeOutOxygen);
	emergencyMeeting$.style.display = 'inline';
	if (window.currentOxygenCountdown) {
		await clearInterval(window.currentOxygenCountdown);
	 	window.currentOxygenCountdown = null;
	}

	timeLeft = 30; 
	document.getElementById("tasksLabel").innerHTML = "Завдання";
	document.getElementById("tasksLabel").style.color = "#000000";
	emergencyMeeting$.style.display = 'inline';

	clearTimeout(timeOutOxygen);
	emergencyMeeting$.style.display = 'inline';
	if (window.currentOxygenCountdown) {
		clearInterval(window.currentOxygenCountdown);
		window.currentOxygenCountdown = null;
	}
	timeLeft = 30; 
	document.getElementById("tasksLabel").innerHTML = "Завдання";
	document.getElementById("tasksLabel").style.color = "#000000";
	emergencyMeeting$.style.display = 'inline';
});

socket.on('play-win', async () => {
	await playSound(SOUNDS.youWin);
});

socket.on('play-disconnect', async () => {
	await playSound(SOUNDS.leave);
});

socket.on('do-comms', async () => {
	comms$.style.display = 'none'
	reactor$.style.display = 'none'
	lights$.style.display = 'none'
	oxygen$.style.display = 'none'
	tasks$.style.display = 'none'
	progressLabel$.style.display = 'none'
	emergencyMeeting$.style.display = 'none'
	document.getElementById("tasksLabel").innerHTML = "Саботаж зв`язку";
	document.getElementById("tasksLabel").style.color = "#ff0000";
	playSound(SOUNDS.comms);
	setTimeout(function() {
		comms$.style.display = 'inline'
		reactor$.style.display = 'inline'
		oxygen$.style.display = 'inline'
		lights$.style.display = 'inline'
	}, 60000);
	setTimeout(function(){
		document.getElementById("tasksLabel").innerHTML = "Завдання";
		document.getElementById("tasksLabel").style.color = "#000000";
		tasks$.style.display = 'block'
		progressLabel$.style.display = 'block'
		emergencyMeeting$.style.display = 'inline'
	}, 26000);
});

socket.on('do-reactorFixedFully', async () => {
	stopSound();
	clearTimeout(timeOutOxygen);
	emergencyMeeting$.style.display = 'inline';
	if (window.currentOxygenCountdown) {
		clearInterval(window.currentOxygenCountdown);
		window.currentOxygenCountdown = null;
	}
	timeLeft = 30; 
	document.getElementById("tasksLabel").innerHTML = "Завдання";
	document.getElementById("tasksLabel").style.color = "#000000";
	emergencyMeeting$.style.display = 'inline';
});

socket.on('do-reactor', async () => {
	timeLeft = 30; 
	await playSound(SOUNDS.reactor);
	comms$.style.display = 'none';
	reactor$.style.display = 'none';
	lights$.style.display = 'none';
	oxygen$.style.display = 'none';
	emergencyMeeting$.style.display = 'none';
	document.getElementById("tasksLabel").innerHTML = "Саботаж реактору " + timeLeft;
	document.getElementById("tasksLabel").style.color = "#ff0000";
	timeOutOxygen = setTimeout(() => {
		playSound(SOUNDS.youLose);
		comms$.style.display = 'inline';
		reactor$.style.display = 'inline';
		lights$.style.display = 'inline';
		oxygen$.style.display = 'inline';
		emergencyMeeting$.style.display = 'inline';
		timeLeft = 30;
		document.getElementById("tasksLabel").innerHTML = "Завдання";
		document.getElementById("tasksLabel").style.color = "#000000";
		if (window.currentOxygenCountdown) {
			clearInterval(window.currentOxygenCountdown);
			window.currentOxygenCountdown = null;
		}
	}, 30000);

	await setTimeout(() => {
		comms$.style.display = 'inline';
		reactor$.style.display = 'inline';
		oxygen$.style.display = 'inline';
		lights$.style.display = 'inline';
	}, 60000);

	const countdownInterval = setInterval(() => {
	timeLeft -= 1;
	document.getElementById("tasksLabel").innerHTML = "Саботаж реактору " + timeLeft;

	if (timeLeft <= 0) {
		clearInterval(countdownInterval);
		playSound(SOUNDS.youLose);
	}
	}, 1000);

	window.currentOxygenCountdown = countdownInterval;
});

socket.on('do-oxygen', async () => {
	timeLeft = 30; 

	await playSound(SOUNDS.reactor);

	comms$.style.display = 'none';
	reactor$.style.display = 'none';
	lights$.style.display = 'none';
	oxygen$.style.display = 'none';
	emergencyMeeting$.style.display = 'none';

	document.getElementById("tasksLabel").innerHTML = "Саботаж кисню " + timeLeft;
	document.getElementById("tasksLabel").style.color = "#ff0000";

	timeOutOxygen = setTimeout(() => {
		playSound(SOUNDS.youLose);
		comms$.style.display = 'inline';
		reactor$.style.display = 'inline';
		lights$.style.display = 'inline';
		oxygen$.style.display = 'inline';
		emergencyMeeting$.style.display = 'inline';
		timeLeft = 30;
		document.getElementById("tasksLabel").innerHTML = "Завдання";
		document.getElementById("tasksLabel").style.color = "#000000";
		if (window.currentOxygenCountdown) {
			clearInterval(window.currentOxygenCountdown);
			window.currentOxygenCountdown = null;
		}
	}, 30000);

	await setTimeout(() => {
		comms$.style.display = 'inline';
		reactor$.style.display = 'inline';
		oxygen$.style.display = 'inline';
		lights$.style.display = 'inline';
	}, 60000);

	const countdownInterval = setInterval(() => {
		timeLeft -= 1;
		document.getElementById("tasksLabel").innerHTML = "Саботаж кисню " + timeLeft;

		if (timeLeft <= 0) {
			clearInterval(countdownInterval);
			playSound(SOUNDS.youLose);
		}}, 1000);
	window.currentOxygenCountdown = countdownInterval;
	});

socket.on('do-oxygenHasBeenFixed', async () => {
	stopSound();
	clearTimeout(timeOutOxygen);
	emergencyMeeting$.style.display = 'inline';

	if (window.currentOxygenCountdown) {
		clearInterval(window.currentOxygenCountdown);
		window.currentOxygenCountdown = null;
	}

	timeLeft = 30; 
	document.getElementById("tasksLabel").innerHTML = "Завдання";
	document.getElementById("tasksLabel").style.color = "#000000";
	emergencyMeeting$.style.display = 'inline';
});

socket.on('do-lights', async () => {
	comms$.style.display = 'none'
	reactor$.style.display = 'none'
	lights$.style.display = 'none'
	oxygen$.style.display = 'none'
	emergencyMeeting$.style.display = 'none'
	report$.style.display = 'none'
	document.getElementById("tasksLabel").innerHTML = "Саботаж світла";
	document.getElementById("tasksLabel").style.color = "#ff0000";
	await playSound(SOUNDS.powerdown)
	await setTimeout(function() {
		comms$.style.display = 'inline'
		reactor$.style.display = 'inline'
		lights$.style.display = 'inline'
		oxygen$.style.display = 'inline'
	}, 60000);
	await setTimeout(function(){
		document.getElementById("tasksLabel").innerHTML = "Завдання";
		document.getElementById("tasksLabel").style.color = "#000000";
		progressBar$.style.display = 'inline'
		tasks$.style.display = 'inline'
		progressLabel$.style.display = 'block'
		emergencyMeeting$.style.display = 'inline'
		report$.style.display = 'inline'
	}, 20000);
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

async function stopSound(url) {
	soundPlayer.src = url;
	await soundPlayer.pause();
	soundPlayer.currentTime = 0;
}

// ПАСХАЛКО 1488 Что-то жарко стало включаем вентиляторі