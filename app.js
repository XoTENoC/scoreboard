// Import the required modules
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');

// Create a new Express application
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set up the middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Set up the initial scores
let scores = {
	team1: 0,
	team2: 0,
	team3: 0
};

// Define the routes
app.get('/', (req, res) => {
	// Render the scoreboard page with the current scores
	res.render('scoreboard', { scores });
});

app.get('/control', (req, res) => {
	// Render the control page with buttons to increment the scores
	res.render('control', { scores });
});

app.post('/increase-scores', (req, res) => {
	// Update the scores based on the button that was clicked
	const { team, points } = req.body;
	scores[team] += parseInt(points);

	// Send a message to all connected clients with the updated scores
	io.emit('score-update', scores);

	// Send a response back to the client to confirm the update
	res.send('Score updated!');
});

app.post('/decrease-scores', (req, res) => {
	// Update the scores based on the button that was clicked
	const { team, points } = req.body;
	scores[team] -= parseInt(points);

	if(scores[team] < 0) {
		scores[team] = 0;
	}

	// Send a message to all connected clients with the updated scores
	io.emit('score-update', scores);

	// Send a response back to the client to confirm the update
	res.send('Score updated!');
});

app.post('/reset-scores', (req, res) => {
	teams = ['team1', 'team2', 'team3']

	for(team in teams){
		scores[teams[team]] = 0
	}

	// Send a message to all connected clients with the updated scores
	io.emit('score-update', scores);

	// Send a response back to the client to confirm the update
	res.send('Score updated!');
});

// Start the server
server.listen(3000, () => {
	console.log('Server started on port 3000');
});