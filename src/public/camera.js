const socket = io({
	query: {
		role: 'CAMERA'
	}
});

async function wait(milliseconds) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), milliseconds);
	});
}

const view1$ = document.querySelector('.container');

view1$.style.visibility = 'block';

socket.on('do-comms', async () => {
	view1$.style.display = 'none'; 
	setTimeout(function() {
		view1$.style.display = 'block'
	}, 26000);
});