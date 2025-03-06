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
	if (code.length < 5) {
		code += number;
		document.getElementById('output').value = code;
	}
}

function clearOutput() {
	code = '';
	document.getElementById('output').value = code;
}

function submitCode() {
    if (code.toString() === randomCodeOutput) {
        socket.emit('oxygenHasBeenFixed')
        clearOutput()
		playSound(SOUNDS.accept)
		window.setTimeout(function(){
			window.location = "https://google.com";
		}, 500);
    } else {
        playSound(SOUNDS.failed)
    }
    randomCode = ''
}

function getCode() {
	document.getElementById('getCode').style.display = "none";
	generateRandomNumber()
}

async function wait(milliseconds) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), milliseconds);
	});
}
 
async function playSound(url) {
	soundPlayer.src = url;
	await soundPlayer.play();
}

