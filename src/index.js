const PORT = process.env.PORT || 5001

const express = require('express');
const http = require('http');
const _ = require('lodash');
const path = require('path');
const { Server } = require('socket.io');
const { v4: uuid } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const N_IMPOSTORS = 1;
const DEFAULT_SHORT_TASKS = 2;
const DEFAULT_LONG_TASKS = 1;
const DEFAULT_COMMON_TASKS = 2;

let shortTasksCount = DEFAULT_SHORT_TASKS;
let longTasksCount = DEFAULT_LONG_TASKS;
let commonTasksCount = DEFAULT_COMMON_TASKS;

let playerTasks = {};
let livingCrewMembers = [];
let livingImpostors = [];
let taskProgress = {};
let players = [];

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/admin', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/oxygen', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'oxygen.html'));
});

app.get('/reactor', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'reactor.html'));
});

app.get('/camera', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'camera.html'));
});

app.get('/comms', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'comms.html'));
});

app.get('/lights', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'lights.html'));
});

app.use('/', express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
	console.log(
		`A user connected with role: ${socket.handshake.query.role}, total: ${
			io.of('/').sockets.size
		}`
	);

	// When player joins with a name
	socket.on('player-join', (playerName) => {
		// Add player to the list
		players.push({
			id: socket.id,
			name: playerName,
			role: socket.handshake.query.role
		});
		
		// Update all clients with the new player list
		io.emit('update-players', players);
		
		console.log(`Player ${playerName} joined the game`);
	});
	
	// When player is removed (via admin.html)
	socket.on('remove-player', (playerId) => {
		players = players.filter(player => player.id !== playerId);
		io.emit('update-players', players);
		io.emit('play-disconnect')
		io.to(playerId).emit('player-leave');
		console.log(`Player ${playerId} was removed from the game`);
	});
	
	// When player is disconnected (closed tab, lost connection etc.)
	socket.on('disconnect', () => {
		const disconnectedPlayer = players.find(player => player.id === socket.id);
		if (disconnectedPlayer) {
			console.log(`Player ${disconnectedPlayer.name} disconnected`);
			
			// Mark only this player's tasks as complete
			if (playerTasks[socket.id]) {
				for (const taskId in playerTasks[socket.id]) {
					if (typeof taskProgress[taskId] === 'boolean') {
						taskProgress[taskId] = true;
					}
				}
			}
			
			// Update player lists if they were part of a game
			if (livingCrewMembers.includes(socket.id)) {
				livingCrewMembers = livingCrewMembers.filter(id => id !== socket.id);
				checkWinCondition();
			} else if (livingImpostors.includes(socket.id)) {
				livingImpostors = livingImpostors.filter(id => id !== socket.id);
				if (livingImpostors.length === 0) {
					io.emit('do-ejected');
				} else {
					checkWinCondition();
				}
			}
			
			// Update player list and emit task progress
			players = players.filter(player => player.id !== socket.id);
			io.emit('update-players', players);
			emitTaskProgress();
		}
	});

	// When game started (START button pressed via admin.js)
	socket.on('start-game', () => {
		io.emit('play-start');

		// Generate random number from 10000 to 99999
		function generateRandomTask(taskType) {
			// Random values for different task types
			const min = 10000;
			const max = 99999;
			const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
			
			const locations = ["Адмін", "Медпункт", "Електрична", "Комунікації", "О2", "Реактор"];
			const randomLocation = locations[Math.floor(Math.random() * locations.length)];

			const DownLoadLocations = ["Адмін", "Медпункт", "Електрична", "О2", "Реактор"];
			const DownLoadRandomLocation = DownLoadLocations[Math.floor(Math.random() * DownLoadLocations.length)];
			
			const buttonRemote = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "10+", "увімк/вимк"];
			const randomButtonRemote = buttonRemote[Math.floor(Math.random() * buttonRemote.length)];
			
			const colorRemote = ["ЧЕРВОНОГО", "ЗЕЛЕНОГО", "СИНЬОГО", "ЖОВТОГО", "РОЖЕВОГО", "ОРАНЖЕВОГО"];
			const randomColorRemote = colorRemote[Math.floor(Math.random() * colorRemote.length)];
			
			// Generate tasks based on task type
			switch(taskType) {
				case 'id-code':
					return `Адмін: Введіть ID-код: ${randomNumber}`;
				case 'button':
					return `Електрична: Натисніть на пульті кнопку "${randomButtonRemote}"`;
				case 'color':
					return `Електрична: Натисніть на RGB пульті кнопку ${randomColorRemote} кольору`;
				case 'power':
					return `Електрична: Подайте енергію: ${randomLocation} (2 етапа)`;
				case 'download':
					return `${DownLoadRandomLocation}: Завантажте і відправте дані в комунікаціях`;
				default:
					return taskType;
			}
		}
	
		// Define task types (instead of full task descriptions)
		const TASK_TYPES = {
			COMMON: [
				'Адмін: Відскануйте талон', // Звичайне
				'Медпункт: Пройдіть скан', // Звичайне
			],
			SHORT: [
				'button', // Коротке
				'color', // Коротке
				'Електрична: Перемкніть рубильник', // Коротке
				'Електрична: Замініть батарейки',
				'Склад: Перезарядіть пістолет',
				'Склад: Перемкніть вимикач',
				'Комунікації: Впімайте сигнал', // Коротке
				'Турніки: Повесіть на турніку 8 с', // Коротке
				'Турніки: Присядьте 5 разів', // Коротке
				'Турніки: Виконайте "Джампінг Джек" 5 разів', // Коротке
				'Турніки: З`їздьте з гірки', // Коротке
				'O2: Пообприскуйте рослини',
			],
			LONG: [
				'power', // Довге
				'Медпункт: Подрімайте', // Довге
				'download', // Довге
			],
		};

		// Get player sockets
		const playerSockets = [];
		for (const [_, socket] of io.of('/').sockets) {
			if (socket.handshake.query.role === 'PLAYER') {
				playerSockets.push(socket);
			}
		}
		const playerIds = playerSockets.map(player => player.id);
		console.log('player sockets', playerSockets.length);

		// Assign impostors
		const impostors = _.shuffle(playerIds).slice(0, N_IMPOSTORS);
		const impostorNames = players
		  .filter(player => impostors.includes(player.id))
		  .map(player => player.name);
		
		for (const [id, socket] of io.of('/').sockets) {
		  if (socket.handshake.query.role === 'PLAYER') {
			if (impostors.includes(id)) {
			  const otherImpostors = impostorNames.filter(name => name !== players.find(p => p.id === id).name);
			  socket.emit('role', { 
				role: 'Предатель', 
				teammates: otherImpostors 
			  });
			} else {
			  socket.emit('role', { 
				role: 'Член Екіпажу', 
				teammates: [] 
			  });
			}
		  }
		}

		// Pool of tasks so they are distributed evenly
		let shuffledTaskTypes = [];
    
    	// Assign tasks
		taskProgress = {};
		playerTasks = {};
		let playerAssignedTasks = {};
		
		for (const player of playerSockets) {
			playerTasks[player.id] = {}; 
			playerAssignedTasks[player.id] = new Set(); 
		
			let commonTasks = _.shuffle(TASK_TYPES.COMMON).slice(0, commonTasksCount);
			let shortTasks = _.shuffle(TASK_TYPES.SHORT).slice(0, shortTasksCount);
			let longTasks = _.shuffle(TASK_TYPES.LONG).slice(0, longTasksCount);
			
			let selectedTasks = [...commonTasks, ...shortTasks, ...longTasks,];
			
			for (const taskType of selectedTasks) {
				let taskDescription = generateRandomTask(taskType);
		
				while (playerAssignedTasks[player.id].has(taskDescription)) {
					taskDescription = generateRandomTask(taskType);
				}
		
				playerAssignedTasks[player.id].add(taskDescription);
		
				const taskId = uuid();
				playerTasks[player.id][taskId] = taskDescription;
		
				if (!impostors.includes(player.id)) {
					taskProgress[taskId] = false;
				}
			}
		}

		console.log('player tasks', playerTasks);

		for (const [id, socket] of io.of('/').sockets) {
			if (playerIds.includes(id)) {
				socket.emit('tasks', playerTasks[id]);
			}
		}

		emitTaskProgress();

		livingCrewMembers = [];
		livingImpostors = [];
		
		// Initialize living players lists
		for (const [id, socket] of io.of('/').sockets) {
			if (socket.handshake.query.role === 'PLAYER') {
				if (impostors.includes(id)) {
					livingImpostors.push(id);
				} else {
					livingCrewMembers.push(id);
				}
			}
		}
	});

	socket.on('report', () => {
		console.log("A dead body found.")
		io.emit('play-meeting');
	});

	socket.on('emergency-meeting', () => {
		console.log("The emergency button pressed.")
		io.emit('play-meeting');
	});

	socket.on('comms', () => {
		console.log("Comms sabotage started.")
		io.emit('do-comms');
	});

	socket.on('comms-fixed', () => {
		console.log("Comms sabotage fixed.")
		io.emit('do-comms-fixed');
	});

	socket.on('lights', () => {
		console.log("Lights sabotage started.")
		io.emit('do-lights');
	});

	socket.on('lights-fixed', () => {
		console.log("Lights sabotage fixed.")
		io.emit('do-lights-fixed');
	});

	socket.on('oxygen', () => {
		console.log("Oxygen sabotage started.")
		io.emit('do-oxygen');
	});

	socket.on('oxygen-fixed', () => {
		console.log("Oxygen sabotage fixed.")
		io.emit('do-criticalSabotage-fixed');
	});
	
	socket.on('reactor', () => {
		console.log("Reactor sabotage started.")
		io.emit('do-reactor');
	});

	socket.on('reactor-fixed', () => {
		console.log("Reactor sabotage fixed.")
		io.emit('do-criticalSabotage-fixed') 
	});

	socket.on('callout', () => {
		console.log("Callout pressed.")
		io.emit('do-callout');
	});

	socket.on('dead', () => {
		console.log("Everyone's dead.")
		io.emit('do-dead');
	});

	socket.on('ejected', () => {
		console.log("All impostors ejected.")
		io.emit('do-ejected');
	});

	socket.on('player-ejected', () => {
		console.log(`Impostor ${socket.id} was ejected`);
		
		// Remove from living impostors list
		livingImpostors = livingImpostors.filter(id => id !== socket.id);
		
		// Check if all impostors are ejected
		if (livingImpostors.length === 0) {
			console.log("All impostors ejected. Crew wins!");
			io.emit('do-ejected');
		} else {
			// Notify all players that an impostor was ejected
			io.emit('impostor-ejected');
			
			// Check win condition in case this changes the game state
			checkWinCondition();
		}
	});
	
	// Modify the player-dead event handler to not use role parameter
	socket.on('player-dead', () => {
		console.log(`Crew member ${socket.id} is dead`);
		
		// Update living crew members count
		livingCrewMembers = livingCrewMembers.filter(id => id !== socket.id);
		
		// Check win condition
		checkWinCondition();
	});

	socket.on('task-complete', taskId => {
		if (typeof taskProgress[taskId] === 'boolean') {
			taskProgress[taskId] = true;
		}
		emitTaskProgress();
	});

	socket.on('task-incomplete', taskId => {
		if (typeof taskProgress[taskId] === 'boolean') {
			taskProgress[taskId] = false;
		}
		emitTaskProgress();
	});
});

function checkWinCondition() {
    console.log(`Living crew: ${livingCrewMembers.length}, Living impostors: ${livingImpostors.length}`);
    
    // Impostors win if they have equal or more players than crew
    if (livingImpostors.length > 0 && livingImpostors.length >= livingCrewMembers.length) {
        console.log("Impostors win by eliminating enough crew members");
        io.emit('do-dead');
    }
}

function emitTaskProgress() {
	const tasks = Object.values(taskProgress);
	const completed = tasks.filter(task => task).length;
	const total = completed / tasks.length;
	io.emit('progress', total);

	if (total === 1) {
		io.emit('play-win');
	}
}

server.listen(PORT, () => console.log(`Server listening on *:${PORT}`));
