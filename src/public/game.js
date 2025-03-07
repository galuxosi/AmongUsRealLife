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
const oxygen$ = document.querySelector("#oxygen")
const comms$ = document.querySelector('#comms');
const reactor$ = document.querySelector('#reactor');
const lights$ = document.querySelector("#lights")

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

socket.on('play-start', async () => {
	await playSound(SOUNDS.start);
});

socket.on('play-meeting', async () => {
	await playSound(SOUNDS.meeting);
	await wait(2000);
	await playSound(SOUNDS.sussyBoy);
	await clearTimeout(timeOutOxygen);
	if (window.currentOxygenCountdown) {
		await clearInterval(window.currentOxygenCountdown);
	 	window.currentOxygenCountdown = null;
		emergencyMeeting$.disabled = false;	
		tasksLabel$.innerHTML = "Завдання";
		tasksLabel$.style.color = "#000000";
	}

	timeLeft = 30; 

});

socket.on('play-win', async () => {
	await playSound(SOUNDS.youWin);
	window.alert("Гра завершена. Члени екіпажу виконали всі завдання.")
});

socket.on('play-disconnect', async () => {
	await playSound(SOUNDS.leave);
});

socket.on('do-comms', async () => {
	await playSound(SOUNDS.comms);
	comms$.disabled = true;   
	reactor$.disabled = true;   
	lights$.disabled = true;   
	oxygen$.disabled = true;
	tasks$.style.display = 'none';   
	progressLabel$.style.display = 'none';
	emergencyMeeting$.disabled = true;
	tasksLabel$.innerHTML = "Саботаж зв`язку";
	tasksLabel$.style.color = "#ff0000";
});

socket.on('do-comms-fixed', async () => {
	setTimeout(() => {
		comms$.disabled = false;   
		reactor$.disabled = false;   
		oxygen$.disabled = false;   
		lights$.disabled = false;
	}, 30000);   
	tasksLabel$.innerHTML = "Завдання";
	tasksLabel$.style.color = "#000000";
	tasks$.style.display = 'block'
	progressLabel$.style.display = 'block'
	emergencyMeeting$.disabled = false;   
	stopSound();
});

socket.on('do-lights', async () => {
	playSound(SOUNDS.powerdown);
	comms$.disabled = true; 
	reactor$.disabled = true;   
	lights$.disabled = true;  
	oxygen$.disabled = true; 
	report$.disabled = true;
	emergencyMeeting$.disabled = true;
	tasks$.style.display = 'none';
	tasksLabel$.innerHTML = "Саботаж світла";
	tasksLabel$.style.color = "#ff0000";
});

socket.on('do-lights-fixed', async () => {
	stopSound();
	tasksLabel$.innerHTML = "Завдання";
	tasksLabel$.style.color = "#000000";
	tasks$.style.display = 'block';
	emergencyMeeting$.disabled = false;
	report$.disabled = false;
	setTimeout(function() {
		comms$.disabled = false;   
		reactor$.disabled = false;   
		lights$.disabled = false;   
		oxygen$.disabled = false;  
	}, 30000);
});

socket.on('do-reactor', async () => {
	timeLeft = 30; 
	await playSound(SOUNDS.reactor);
	comms$.disabled = true;   
	reactor$.disabled = true;   
	lights$.disabled = true;   
	oxygen$.disabled = true;   
	emergencyMeeting$.disabled = true;
	tasksLabel$.innerHTML = "Саботаж реактору " + timeLeft;
	tasksLabel$.style.color = "#ff0000";
	timeOutOxygen = setTimeout(() => {
		playSound(SOUNDS.youLose);
		comms$.disabled = false;   
		reactor$.disabled = false;   
		lights$.disabled = false;   
		oxygen$.disabled = false;   
		emergencyMeeting$.disabled = false;
		timeLeft = 30;
		tasksLabel$.innerHTML = "Завдання";
		tasksLabel$.style.color = "#000000";
		if (window.currentOxygenCountdown) {
			clearInterval(window.currentOxygenCountdown);
			window.currentOxygenCountdown = null;
		}
		window.alert("Гра закінчена. Предателі перемогли саботажем реактору.")
	}, 30000);

	await setTimeout(() => {
		comms$.disabled = false;   
		reactor$.disabled = false;   
		lights$.disabled = false;   
		oxygen$.disabled = false;  
	}, 30000);

	const countdownInterval = setInterval(() => {
	timeLeft -= 1;
	tasksLabel$.innerHTML = "Саботаж реактору " + timeLeft;

	if (timeLeft <= 0) {
		clearInterval(countdownInterval);
		playSound(SOUNDS.youLose);
	}
	}, 1000);

	window.currentOxygenCountdown = countdownInterval;
});

socket.on('do-reactorFixedFully', async () => {
	stopSound();
	clearTimeout(timeOutOxygen);
	emergencyMeeting$.disabled = 'false';
	if (window.currentOxygenCountdown) {
		clearInterval(window.currentOxygenCountdown);
		window.currentOxygenCountdown = null;
	}
	timeLeft = 30; 
	tasksLabel$.innerHTML = "Завдання";
	tasksLabel$.style.color = "#000000";
});

socket.on('do-oxygen', async () => {
	timeLeft = 30; 
	await playSound(SOUNDS.reactor);
	comms$.disabled = true; 
	reactor$.disabled = true;   
	lights$.disabled = true;  
	oxygen$.disabled = true; 
	emergencyMeeting$.disabled = true;
	tasksLabel$.innerHTML = "Саботаж кисню " + timeLeft;
	tasksLabel$.style.color = "#ff0000";
	timeOutOxygen = setTimeout(() => {
		playSound(SOUNDS.youLose);
		comms$.disabled = false;   
		reactor$.disabled = false;   
		lights$.disabled = false;   
		oxygen$.disabled = false;  
		emergencyMeeting$.disabled = false;
		timeLeft = 30;
		tasksLabel$.innerHTML = "Завдання";
		tasksLabel$.style.color = "#000000";
		window.alert("Гра завершена. Предателі перемогли саботажем кисню.")
		if (window.currentOxygenCountdown) {
			clearInterval(window.currentOxygenCountdown);
			window.currentOxygenCountdown = null;
		}
	}, 30000);

	await setTimeout(() => {
		comms$.disabled = false;   
		reactor$.disabled = false;   
		lights$.disabled = false;   
		oxygen$.disabled = false;  
	}, 30000);

	const countdownInterval = setInterval(() => {
		timeLeft -= 1;
		tasksLabel$.innerHTML = "Саботаж кисню " + timeLeft;

		if (timeLeft <= 0) {
			clearInterval(countdownInterval);
			playSound(SOUNDS.youLose);
		}}, 1000);
	window.currentOxygenCountdown = countdownInterval;
	});

socket.on('do-oxygenHasBeenFixed', async () => {
	stopSound();
	clearTimeout(timeOutOxygen);
	emergencyMeeting$.disabled = false;

	if (window.currentOxygenCountdown) {
		clearInterval(window.currentOxygenCountdown);
		window.currentOxygenCountdown = null;
	}

	timeLeft = 30; 
	tasksLabel$.innerHTML = "Завдання";
	tasksLabel$.style.color = "#000000";
	emergencyMeeting$.disabled = false;
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