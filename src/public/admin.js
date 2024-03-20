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

socket.on('play-comms', async () => {
    await SOUNDS.comms.play();
    comms$.style.display = 'none';
    tasks$.style.display = 'none';
    progressBar$.style.display = 'none';
    emergencyMeeting$.style.display = 'none';
    playSound(SOUNDS.comms);

    await setTimeoutPromise(26000);

    tasks$.style.display = 'inline';
    progressBar$.style.display = 'inline';
    emergencyMeeting$.style.display = 'inline';

    comms$.style.display = 'inline';
  });

  // Helper function to create setTimeout with a promise
  const setTimeoutPromise = (time) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  };

  // Add wait function implementation here
  async function wait(milliseconds) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), milliseconds);
    });
  }
})();