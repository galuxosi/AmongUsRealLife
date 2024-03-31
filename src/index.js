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

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/admin', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/oxygen', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'oxygen.html'));
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

		const divertPowerOptions = ["Реактор", "Адмін", "Комунікації", "Медпункт"];
		const randomDivertPowerOption = divertPowerOptions[Math.floor(Math.random() * divertPowerOptions.length)];

		const testerOptions = ["OFF", "200μ", "10A", "hFE", "2000k", "200m", "2000"];
		const randomTesterOption = testerOptions[Math.floor(Math.random() * testerOptions.length)];

		const TASKS = [
			'Адмін: Проведіть карту',
			'Адмін: Введіть ID-код: ' + randomNumber,
			'Адмін-Комунікації: Завантажте дані',
			'Комунікації: Перезавантажте WiFi',
			'Турніки: Повесіть на турніку 10 с',
			'Турніки: Присядьте 10 разів',
			'Турніки: Виконайте "Джампінг Джек" 8 разів',
			'Електрична: Відкалібруйте тестер на режим ' + randomTesterOption,
			'Електрична: Перемкніть рубильник ',
			'Електрична: Подайте енергію: `' + randomDivertPowerOption + "`",
			'Медпункт: Пройдіть скан',
			'Медпункт: Подрімайте',
			'Реактор: Розсортуйте рахівничку: 3 червоних 1 зелених 4 оранжевих 5 синіх 1 жовтих',
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
		io.emit('play-meeting');
	});

	socket.on('emergency-meeting', () => {
		io.emit('play-meeting');
	});

	socket.on('comms', () => {
		io.emit('do-comms');
	});

	socket.on('reactor', () => {
		io.emit('do-reactor');
	});

	socket.on('oxygen', () => {
		io.emit('do-oxygen');
	});
	
	socket.on('lights', () => {
		io.emit('do-lights');
	});

	socket.on('oxygenHasBeenFixed', () => {
		io.emit('do-oxygenHasBeenFixed');
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