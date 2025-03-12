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


const N_TASKS = 5;
const N_IMPOSTORS = 1;

let taskProgress = {};
let reactorProgress = 0;

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

	socket.on('start-game', () => {
		io.emit('play-start');
		const min = 10000;
        const max = 99999;	
        let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

		// const divertPowerOptions = ["Реактор", "Адмін", "Комунікації", "Медпункт"];
		const divertPowerOptions = ["Адмін", "Медпункт", "Комунікації", "O2", "Реактор"];
		const randomDivertPowerOption = divertPowerOptions[Math.floor(Math.random() * divertPowerOptions.length)];

		const downloadDataOptions = ["Адмін", "Електрична", "О2", "Медпункт", "Реактор"];
		const randonDownloadDataOption = downloadDataOptions[Math.floor(Math.random() * downloadDataOptions.length)];

		const buttonRemote = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "10+", "увімк/вимк"];
		const randomButtonRemote = buttonRemote[Math.floor(Math.random() * buttonRemote.length)];

		const colorRemote = ["ЧЕРВОНОГО", "ЗЕЛЕНОГО", "СИНЬОГО", "ЖОВТОГО", "РОЖЕВОГО", "ОРАНЖЕВОГО"];
		const randomColorRemote = colorRemote[Math.floor(Math.random() * colorRemote.length)];

		const testerOptions = ["OFF", "200μ", "10A", "hFE", "2000k", "200m", "2000"];
		const randomTesterOption = testerOptions[Math.floor(Math.random() * testerOptions.length)];

		var rah1 = Math.floor(Math.random() * 10);
		var rah2 = Math.floor(Math.random() * 10);
		var rah3 = Math.floor(Math.random() * 10);
		var rah4 = Math.floor(Math.random() * 10);
		var rah5 = Math.floor(Math.random() * 10);

		const TASKS = [
			'Адмін: Проведіть карту',
			'Адмін: Введіть ID-код: ' + randomNumber,
			'Адмін: Відскануйте талон',
			'Електрична: Натисніть на пульті кнопку ' + '"' + randomButtonRemote + '"',
			'Електрична: Натисніть на RGB пульті кнопку ' + randomColorRemote + ' кольору',
			'Електрична: Перемкніть рубильник ',
			'Електрична: Подайте енергію: `' + randomDivertPowerOption + "` (2 етапа)",
			'Медпункт: Пройдіть скан',
			'Медпункт: Подрімайте',
			'Комунікації: Впімайте сигнал',
			'Комунікації: Перезавантажте WiFi',
			randonDownloadDataOption + ': Завантажте і відправте дані (починається з коммунікацій)',
			'Турніки: Повесіть на турніку 8 с',
			'Турніки: Присядьте 5 разів',
			'Турніки: Виконайте "Джампінг Джек" 5 разів',
			'Турніки: З`їздьте з гірки',
		];
		// Get player sockets
		const players = [];
		for (const [_, socket] of io.of('/').sockets) {
			if (socket.handshake.query.role === 'PLAYER') {
				players.push(socket);
			}
		}
		const playerIds = players.map(player => player.id);
		console.log('player sockets', players.length);

		// Assign impostors
		const impostors = _.shuffle(playerIds).slice(0, N_IMPOSTORS);
		for (const [id, socket] of io.of('/').sockets) {
			if (socket.handshake.query.role === 'PLAYER') {
				if (impostors.includes(id)) {
					socket.emit('role', 'Предатель');
					console.log(id, 'is impostor');
				} else {
					socket.emit('role', 'Член Екіпажу');
					console.log(id, 'is crew');
				}
			}
		}

		// Pool of tasks so they are distributed evenly
		let shuffledTasks = [];

		// Dictionary with key as socket.id and value is array of tasks
		const playerTasks = {};

		// Assign tasks
		taskProgress = {};
		for (let i = 0; i < N_TASKS; i++) {
			for (const player of players) {
				// Make sure there's a pool of shuffled tasks
				if (shuffledTasks.length === 0) {
					shuffledTasks = _.shuffle(TASKS);
				}

				if (!playerTasks[player.id]) {
					playerTasks[player.id] = {};
				}

				const taskId = uuid();
				playerTasks[player.id][taskId] = shuffledTasks.pop();

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

})});

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