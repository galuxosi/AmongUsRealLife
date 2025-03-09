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
const tasksLabel$ = document.querySelector('#tasksLabel');
const progressLabel$ = document.querySelector('#progressLabel');
const progressGreen$ = document.querySelector('#progressGreen')
const oxygen$ = document.querySelector("#oxygen")
const comms$ = document.querySelector('#comms');
const reactor$ = document.querySelector('#reactor');
const lights$ = document.querySelector("#lights");

let sabotageActive = false
let countdownInterval;
let timeOutOxygen;

const soundPlayer = new Audio();
const SOUNDS = {
	meeting: '/sounds/meeting.ogg',
	sabotage: '/sounds/sabotage.mp3',
	start: '/sounds/start.mp3',
	sussyBoy: '/sounds/sussy-boy.mp3',
	voteResult: '/sounds/vote-result.mp3',
	youLose: '/sounds/you-lose.mp3',
	youWin: '/sounds/you-win.mp3',
	comms: '/sounds/comms.ogg',
	reactor: '/sounds/reactor_meltdown.mp3',
	join: '/sounds/join.mp3',
	leave: '/sounds/leave.mp3',
	complete: '/sounds/complete.mp3',
	incomplete: '/sounds/incomplete.ogg',
	button: '/sounds/button.ogg',
	accept: '/sounds/idaccepted.ogg',
	powerdown: '/sounds/powerdown.mp3',
	callout: '/sounds/callout.ogg'
};

window.onload = function() {
	playSound(SOUNDS.join);
}

report$.addEventListener('click', () => {
	socket.emit('report');
});

emergencyMeeting$.addEventListener('click', () => {
	socket.emit('emergency-meeting');
	emergencyMeeting$.disabled = true;
});

comms$.addEventListener('click', () => {
	socket.emit('comms')
	sabotageActive = true
})

reactor$.addEventListener('click', () => {
	socket.emit('reactor')
});

oxygen$.addEventListener('click', () => {
	socket.emit('oxygen')
});

lights$.addEventListener('click', () => {
	socket.emit('lights')
})

socket.on('do-callout', async () => {
	await playSound(SOUNDS.callout)
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
    let isRoleHidden = true;
    const role$ = document.createElement('a');
    role$.classList.add('role');
    role$.textContent = `Натисніть щоби показати роль`;
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
	document.querySelectorAll('.role').forEach(element => (element.style.display = 'none'));
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

function disableSabotageButtons() {
    [comms$, lights$, oxygen$, reactor$].forEach(button => {
        button.disabled = true;
        button.style.backgroundColor = "darkred";
    });

}
function enableSabotageButtons() {
    setTimeout(() => {
        [comms$, lights$, oxygen$, reactor$].forEach(button => {
            button.disabled = false;
            button.style.backgroundColor = "#e72f2f";
        });
    }, 30000);
}

function enableSabotageButtonsForce() {
	[comms$, lights$, oxygen$, reactor$].forEach(button => {
		button.disabled = false;
		button.style.backgroundColor = "#e72f2f";
	});
}

function disableMeetingButton() {
	emergencyMeeting$.disabled = true;
    emergencyMeeting$.style.backgroundColor = "#A9A9A9";
}

function enableMeetingButton() {
	emergencyMeeting$.disabled = false;
	emergencyMeeting$.style.backgroundColor = "#F0F0F0";
}

function disableReportButton() {
	report$.disabled = true;
    report$.style.backgroundColor = "#A9A9A9";
}

function enableReportButton() {
	report$.disabled = false;
	report$.style.backgroundColor = "#F0F0F0";
}

function editTasksLabel(sabotageType) {
	tasksLabel$.innerHTML = sabotageType;
	tasksLabel$.style.color = "#ff0000";
}

function defaultTasksLabel() {
	tasksLabel$.innerHTML = "Завдання";
	tasksLabel$.style.color = "#000000";
}

function sabotageEndgame(sabotageEndgameType) {
	timeLeft = 30;
	playSound(SOUNDS.youLose);
	enableSabotageButtonsForce();
	enableMeetingButton();
	defaultTasksLabel();
	if (window.currentOxygenCountdown) {
		clearInterval(window.currentOxygenCountdown);
		window.currentOxygenCountdown = null;
	}
	editTasksLabel(sabotageEndgameType)
}

function crewEndgame(crewEndgameType) {
	timeLeft = 30;
	playSound(SOUNDS.youWin);
	enableSabotageButtonsForce();
	enableMeetingButton();
	defaultTasksLabel();
	if (window.currentOxygenCountdown) {
		clearInterval(window.currentOxygenCountdown);
		window.currentOxygenCountdown = null;
	}
	editTasksLabel(crewEndgameType)
}

socket.on('play-start', async () => {
	defaultTasksLabel();
	await playSound(SOUNDS.start);
});

socket.on('play-meeting', async () => {
	await clearTimeout(timeOutOxygen);
	if (window.currentOxygenCountdown) {
		await clearInterval(window.currentOxygenCountdown);
	 	window.currentOxygenCountdown = null;
		enableMeetingButton()
		enableSabotageButtons();
		defaultTasksLabel()
	}
	timeLeft = 30; 
	await playSound(SOUNDS.meeting);
	await wait(2000);
	await playSound(SOUNDS.sussyBoy);
});

socket.on('play-win', async () => {
	await playSound(SOUNDS.youWin);
	crewEndgame("Гра завершена. Екіпаж виконав усі завдання.")
});

socket.on('play-disconnect', async () => {
	await playSound(SOUNDS.leave);
});

socket.on('do-comms', async () => {
	playSound(SOUNDS.comms, true);
	disableSabotageButtons();
	disableMeetingButton();
	editTasksLabel("Саботаж комунікаційного модуля")
	progressGreen$.style.display = 'none'
    tasks$.style.display = 'none';
    progressLabel$.style.display = 'none';
});

socket.on('do-comms-fixed', async () => {
	stopSound();
    enableSabotageButtons();
	enableMeetingButton();
	defaultTasksLabel();
	progressGreen$.style.display = 'block'
	tasks$.style.display = 'block'
	progressLabel$.style.display = 'block'
});

socket.on('do-lights', async () => {
	playSound(SOUNDS.powerdown, false);
	disableSabotageButtons()
	disableMeetingButton()
	disableReportButton();
	editTasksLabel("Полагодьте світло")
});

socket.on('do-lights-fixed', async () => {
	stopSound();
	enableSabotageButtons();
	enableMeetingButton()
	enableReportButton();
	defaultTasksLabel();
});

socket.on('do-oxygen', async () => {
	timeLeft = 30; 
	playSound(SOUNDS.reactor);
	disableSabotageButtons();
	disableMeetingButton();
	editTasksLabel("Витік кисню через " + timeLeft)
	const countdownInterval = setInterval(() => {
		timeLeft -= 1;
		editTasksLabel("Витік кисню через " + timeLeft)
		if (timeLeft <= 0) {
			clearInterval(countdownInterval);
			sabotageEndgame("Гра закінчена. Предателі перемогли саботажем кисню.")
		}}, 1000);
	window.currentOxygenCountdown = countdownInterval;
});

socket.on('do-reactor', async () => {
	timeLeft = 30; 
	playSound(SOUNDS.reactor);
	disableSabotageButtons();
	disableMeetingButton();
	editTasksLabel("Вибух реактора через " + timeLeft)
	const countdownInterval = setInterval(() => {
		timeLeft -= 1;
		editTasksLabel("Вибух реактора через " + timeLeft)
		if (timeLeft <= 0) {
			clearInterval(countdownInterval);
			sabotageEndgame("Гра закінчена. Предателі перемогли саботажем реактору.")
		}}, 1000);
	window.currentOxygenCountdown = countdownInterval;
});

socket.on('do-criticalSabotage-fixed', async () => {
	stopSound();
	clearTimeout(timeOutOxygen);
	enableSabotageButtons();
	enableMeetingButton();
	if (window.currentOxygenCountdown) {
		clearInterval(window.currentOxygenCountdown);
		window.currentOxygenCountdown = null;
	}
	timeLeft = 30; 
	defaultTasksLabel();
});

socket.on('do-dead', async () => {
	sabotageEndgame("Гра закінчена. Предателі вбили усіх членів екіпажу.")
});

socket.on('do-ejected', async () => {
	crewEndgame("Гра закінчена. Усі предателі були викинуті.")
});

enableSound$.addEventListener('click', async () => {
	console.log('enable sound');
	enableSound$.style.display = 'none';
	soundPlayer.play();
});

async function playSound(url, loop = false) {
    soundPlayer.src = url;
    soundPlayer.loop = loop;
    await soundPlayer.play();
}

async function stopSound(url) {
    await soundPlayer.pause();
    soundPlayer.currentTime = 0;
    soundPlayer.loop = false;
	soundPlayer.src = url;
}