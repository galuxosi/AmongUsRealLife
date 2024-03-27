const socket = io({
	query: {
		role: 'OXYGENFIX'
	}
});

socket.on('do-oxygen', async () => {
	generateRandomNumber()
});

const soundPlayer = new Audio();
const SOUNDS = {
	accept: '/sounds/idaccept.ogg',
	failed: '/sounds/idfailed.ogg',
	button: '/sounds/button.ogg'
};

const keypad$ = document.querySelector('#keypad');

keypad$.addEventListener('click', () => {
	playSound(SOUNDS.button)
})

let randomCodeOutput = '';
let randomCode = '';
let code = '';

function generateRandomNumber() {
	randomCode = Math.floor(10000 + Math.random() * 90000);
	randomCodeOutput = randomCode.toString();
	document.getElementById('random').value = randomCodeOutput
	}

function addNumber(number) {
	// Add number to code if less than 5 digits
	if (code.length < 5) {
		code += number;
		document.getElementById('output').value = code;
	}
}

function clearOutput() {
	// Clear the output display
	code = '';
	document.getElementById('output').value = code;
	playFail();
}

function submitCode() {
    // Check if 5 digits are entered and alert accordingly
    if (code.toString() === randomCodeOutput) {
        // Code matches
        socket.emit('oxygenHasBeenFixed')
        clearOutput()
    } else {
        // Code doesn't match
        playSound(SOUNDS.failed)
    }
    randomCode = ''
}


async function wait(milliseconds) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), milliseconds);
	});
}
// JavaScript functions to handle button clicks


async function playSound(url) {
	soundPlayer.src = url;
	await soundPlayer.play();
}

