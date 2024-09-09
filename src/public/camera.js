const socket = io({
	query: {
		role: 'CAMERA'
	}
});

const view1$ = document.querySelector('.container');

view1$.style.visibility = 'block';

socket.on('do-comms', async () => {
	view1$.style.display = 'none'; 
});