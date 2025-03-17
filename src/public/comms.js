const socket = io({
	query: {
		role: 'COMMSFIX'
	}
});

function playCorrectSound() {
    var sound = document.getElementById("correctSound");
    sound.play();
}

function playWrongSound() {
    var soundf = document.getElementById("wrongSound");
    soundf.play();
}

function playCompleteSound() {
    var soundv = document.getElementById("completeSound");
    soundv.play();
}

var correctSequence = [];
var currentNumber = 0;

function randomizeNumbers() {
    correctSequence = [];
    for (var i = 1; i <= 10; i++) {
        correctSequence.push(i);
    }
    correctSequence.sort(function() {
        return 0.5 - Math.random();
    });
    
    var keypad = document.getElementById('keypad');
    keypad.innerHTML = '';
    for (var i = 0; i < correctSequence.length; i++) {
        var button = document.createElement('button');
        button.textContent = correctSequence[i];
        button.className = 'number';
        button.onclick = function() { pressNumber(this.textContent); };
        keypad.appendChild(button);
    }
    currentNumber = 1;
}

function pressNumber(number) {
    number = parseInt(number, 10);
    var index = correctSequence.indexOf(number);
    var buttons = document.getElementsByClassName('number');
    if (number === currentNumber) {
        buttons[index].classList.add('correct');
        currentNumber++;
        playCorrectSound();
        if (currentNumber > 10) {
            // Task completed
            setTimeout(function() {
                window.location = "about:blank"
            }, 500);
            playCompleteSound();
            socket.emit('comms-fixed')
        }
    } else {
        // Flash keypad red and reset sequence
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.add('wrong');
        }
        playWrongSound();
        setTimeout(function() {
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('wrong');
            }
            randomizeNumbers(); 
        }, 500);
    }
}

let timeout;

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        window.location.href = "about:blank";
}});

window.onload = randomizeNumbers;
