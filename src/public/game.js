const socket = io({
	query: {
		role: 'PLAYER'
	}
});

let playerName = '';

const emergencyMeeting$ = document.querySelector('#emergency-meeting');
const enableSound$ = document.querySelector('#enable-sound');
const progress$ = document.querySelector('#progress');
const progressBar$ = document.querySelector('.progress-bar');
const report$ = document.querySelector('#report');
const tasks$ = document.querySelector('#tasks');
const tasksLabel$ = document.querySelector('#tasksLabel');
const progressLabel$ = document.querySelector('#progressLabel');
const progressGreen$ = document.querySelector('#progressGreen')
const oxygen$ = document.querySelector('#oxygen')
const comms$ = document.querySelector('#comms');
const reactor$ = document.querySelector('#reactor');
const lights$ = document.querySelector("#lights");
const map$ = document.querySelector('#map')
const mapToggle$ = document.querySelector('#map-toggle')
const sabotageButtons$ = document.querySelector('#sabotageButtons')
const lobbyToggle$ = document.querySelector('#sabotage-toggle')
const roleDiv$ = document.querySelector('#roleDiv')
const playerLobby$ = document.querySelector('#player-lobby')
const playerLobbyDiv$ = document.querySelector('#lobby-container')
const nameInput$ = document.querySelector('#player-name-input')
const nameSubmit$ = document.querySelector('#player-name-submit')
const gameContent$ = document.querySelector('#game-content')
const nameForm$ = document.querySelector('#name-form')
const deadButton$ = document.querySelector('#dead-button');

// Defining variables
let emergencyButtonUsed = false;
let playerRole = '';
let isDead = false;
let countdownInterval;
let timeOutSabotage;

// Sounds
const soundPlayer = new Audio();
const SOUNDS = {
	meeting: '/sounds/meeting.ogg',
	sabotage: '/sounds/sabotage.mp3',
	start: '/sounds/start.mp3',
	sussyBoy: '/sounds/sussy-boy.mp3',
	voteResult: '/sounds/vote-result.ogg',
	youLose: '/sounds/you-lose.mp3',
	youWin: '/sounds/you-win.ogg',
	comms: '/sounds/comms.ogg',
	powerdown: '/sounds/powerdown.mp3',
	siren: '/sounds/siren.mp3',
	join: '/sounds/join.mp3',
	leave: '/sounds/leave.mp3',
	complete: '/sounds/complete.mp3',
	incomplete: '/sounds/incomplete.ogg',
	button: '/sounds/button.ogg',
	accept: '/sounds/idaccepted.ogg',
	callout: '/sounds/callout.ogg'
};

// When page loaded
window.onload = function() {
	gameContent$.style.display = 'none';
}

// Submit player name
nameSubmit$.addEventListener('click', (e) => {
	e.preventDefault();
	playerName = nameInput$.value.trim();
	if (playerName) {
		socket.emit('player-join', playerName);
		nameForm$.style.display = 'none';
		gameContent$.style.display = 'block';
		playSound(SOUNDS.join);
	}
});

// When "Report" button clicked
report$.addEventListener('click', () => {
	socket.emit('report');
});

// When "Emergency meeting" button clicked
emergencyMeeting$.addEventListener('click', () => {
    socket.emit('emergency-meeting');
    emergencyMeeting$.disabled = true;
    emergencyButtonUsed = true;
});

// When communications sabotage clicked
comms$.addEventListener('click', () => {
	socket.emit('comms')
	sabotageActive = true
})

// When lights sabotage clicked
lights$.addEventListener('click', () => {
	socket.emit('lights')
})

// When oxygen sabotage clicked
oxygen$.addEventListener('click', () => {
	socket.emit('oxygen')
});

// When reactor sabotage clicked
reactor$.addEventListener('click', () => {
	socket.emit('reactor')
});

// When dead-button clicked
deadButton$.addEventListener('click', () => {
    if (!isDead) {
        isDead = true;
        deadButton$.disabled = true;
        deadButton$.style.backgroundColor = "#A9A9A9";
        
        if (playerRole === 'Предатель') {
            socket.emit('player-ejected');
            disableReportButton();
            disableMeetingButton();
            // Note: Impostors can still use sabotage buttons
        } else {
            socket.emit('player-dead');
            disableReportButton();
            disableMeetingButton();
            disableSabotageButtons();
        }
    }
});

// Update player lobby
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
		removeButton.addEventListener('click', () => {});
		
		playerElement.appendChild(playerName);
		playerLobby$.appendChild(playerElement);
	});
});

// Handle player disconnect
socket.on('player-leave', (playerId) => {
	playSound(SOUNDS.leave);
	document.querySelectorAll('#tasks input[type="checkbox"]').forEach(checkbox => {
		if (!checkbox.checked) {
			checkbox.checked = true;
			socket.emit('task-complete', checkbox.dataset.taskId); // Ensure each task ID is emitted
		}
	});
});

// Assign a tasks for every player
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
		checkbox$.dataset.taskId = taskId; // Store the task ID in the checkbox
		checkbox$.onchange = event => {
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

// Assign a role
socket.on('role', ({role, teammates}) => {
    hideRole();
	playerRole = role;
    let isRoleHidden = true;
    const role$ = document.createElement('a');
    role$.classList.add('role');
    role$.textContent = `Натисніть щоби показати роль`;
    
    let roleText = `Ви ${role}.`;
    if (teammates.length > 0) {
        if (teammates.length === 1) {
            roleText += ` Разом із ${teammates[0]}`;
        } else {
            const last = teammates.pop();
            roleText += ` Разом із ${teammates.join(', ')} та ${last}`;
        }
    }

    role$.onclick = () => {
        if (!isRoleHidden) {
            role$.textContent = 'Натисніть щоби показати роль';
            isRoleHidden = true;
        } else {
            role$.textContent = `${roleText}. Натисніть щоби приховати`;
            isRoleHidden = false;
        }
        playSound(SOUNDS.button);
    }
    roleDiv$.appendChild(role$);
});

socket.on('progress', progress => {
	progress$.innerHTML = (progress * 100).toFixed(0);
	progressBar$.style.width = `${progress * 100}%`;
});

// Hide role button

socket.on('play-start', async () => {
    resetGame(); // Add this line to reset everything
    defaultTasksLabel();
    await playSound(SOUNDS.start);
});

socket.on('play-meeting', async () => {
	await clearTimeout(timeOutSabotage);
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
    // Instead of enabling buttons directly, check player state first
    if (!isDead) {
        enableSabotageButtons();
        enableMeetingButton();
    }
    defaultTasksLabel();
    progressGreen$.style.display = 'block';
    tasks$.style.display = 'block';
    progressLabel$.style.display = 'block';
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
    // Check player state before enabling buttons
    checkButtonState();
    defaultTasksLabel();
});

socket.on('do-oxygen', async () => {
	timeLeft = 30; 
	playSound(SOUNDS.siren);
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
	playSound(SOUNDS.siren);
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
    clearTimeout(timeOutSabotage);
    // Check player state before enabling buttons
    checkButtonState();
    if (window.currentOxygenCountdown) {
        clearInterval(window.currentOxygenCountdown);
        window.currentOxygenCountdown = null;
    }
    timeLeft = 30; 
    defaultTasksLabel();
});

socket.on('check-win-condition', () => {
    // Handle UI updates when win condition check happens
});

socket.on('do-dead', async () => {
	sabotageEndgame("Гра закінчена. Предателі вбили усіх членів екіпажу.")
});

socket.on('do-ejected', async () => {
	crewEndgame("Гра закінчена. Усі предателі були викинуті.")
});

socket.on('impostor-ejected', () => {
    // Optional: Play a sound or show a message when an impostor is ejected
    playSound(SOUNDS.voteResult);
});

// When callout called (from admin.html)
socket.on('do-callout', async () => {
	await playSound(SOUNDS.callout)
});

function hideRole() {
    document.querySelectorAll('.role').forEach(element => {
        element.style.display = 'none';
    });
}

async function wait(milliseconds) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), milliseconds);
	});
}

function toggleMap() {
	if (map$.style.display === "block" || map$.style.display === "") {
		map$.style.display = "none";
	} else {
		map$.style.display = "block";
	}
}

function toggleLobby() {
    if (playerLobbyDiv$.style.display === "block" || playerLobbyDiv$.style.display === "") {
        playerLobbyDiv$.style.display = "none";
    } else {
        playerLobbyDiv$.style.display = "block";
    }
}

function disableSabotageButtons() {
    [comms$, lights$, oxygen$, reactor$].forEach(button => {
        button.disabled = true;
        button.style.backgroundColor = "darkred";
    });

}
function enableSabotageButtons() {
    if (!isDead || playerRole === 'Предатель') {
        setTimeout(() => {
            [comms$, lights$, oxygen$, reactor$].forEach(button => {
                button.disabled = false;
                button.style.backgroundColor = "#e72f2f";
            });
        }, 30000);
    }
}

function enableSabotageButtonsForce() {
    if (!isDead || playerRole === 'Предатель') {
        [comms$, lights$, oxygen$, reactor$].forEach(button => {
            button.disabled = false;
            button.style.backgroundColor = "#e72f2f";
        });
    }
}

function disableMeetingButton() {
	emergencyMeeting$.disabled = true;
    emergencyMeeting$.style.backgroundColor = "#A9A9A9";
}

function enableMeetingButton() {
    if (!isDead && !emergencyButtonUsed) {
        emergencyMeeting$.disabled = false;
        emergencyMeeting$.style.backgroundColor = "#F0F0F0";
    }
}

function disableReportButton() {
	report$.disabled = true;
    report$.style.backgroundColor = "#A9A9A9";
}

function enableReportButton() {
    if (!isDead) {
        report$.disabled = false;
        report$.style.backgroundColor = "#F0F0F0";
    }
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

async function playSound(url, loop = false) {
    soundPlayer.src = url;
    soundPlayer.loop = loop;
    await soundPlayer.play();
}

function resetGame() {
    // Reset player state
    isDead = false;
	emergencyButtonUsed = false;

	while (roleDiv$.firstChild) {
        roleDiv$.removeChild(roleDiv$.firstChild);
    }
    // Enable all buttons
    enableReportButton();
    enableMeetingButton();
    enableSabotageButtonsForce();
    
    // Reset dead button
    deadButton$.disabled = false;
	deadButton$.style.backgroundColor = '#dc3545'
    
    // Reset task display
    defaultTasksLabel();
    
    // Clear existing role display
    hideRole();
    
    // Reset any countdown timers
    if (window.currentOxygenCountdown) {
        clearInterval(window.currentOxygenCountdown);
        window.currentOxygenCountdown = null;
    }
}

function checkButtonState() {
    if (isDead) {
        // Player is dead, keep buttons disabled
        disableReportButton();
        disableMeetingButton();
        
        // If player is crew, also disable sabotage buttons
        if (playerRole !== 'Предатель') {
            disableSabotageButtons();
        }
    } else {
        // Player is alive, enable buttons
        enableReportButton();
        enableMeetingButton();
        enableSabotageButtons();
    }
}

async function stopSound(url) {
    await soundPlayer.pause();
    soundPlayer.currentTime = 0;
    soundPlayer.loop = false;
	soundPlayer.src = url;
}