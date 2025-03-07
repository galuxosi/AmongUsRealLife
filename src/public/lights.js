const socket = io({
	query: {
		role: 'LIGHTSFIX'
	}
});

const box$ = document.getElementById("box");
const scoreDisplay$ = document.getElementById("score");
let score = 0;

function moveBox() {
    const x = Math.random() * 250;
    const y = Math.random() * 350;
    box$.style.left = x + "px";
    box$.style.top = y + "px";
}

box$.addEventListener("click", () => {
    score++;
    scoreDisplay$.textContent = "Рахунок: " + score;
    if (score >= 10) {   
        socket.emit('lights-fixed');
        setTimeout(function() {
            alert("Саботаж світла поремонтований. Сайт буде закритий");
            window.location = "https://google.com" // Randomize again for the next round
        }, 500);
        box.remove();
    } else {
        moveBox();
    }
});

moveBox();