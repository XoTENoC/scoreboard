const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');

// Create a new Express application
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set up the middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(cookieParser());

app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // for development purposes, use { secure: true } in production for HTTPS
}));

// Set up the initial scores
let scores = {
    team1: 0,
    team2: 0,
    team3: 0,
    team4: 0,
    team5: 0,
    team6: 0,
    team7: 0,
    team8: 0
};

// Load scores from file on server start
fs.readFile('scores.json', 'utf8', (err, data) => {
    if (!err) {
        scores = JSON.parse(data);
    } else {
        console.log('Error loading scores from file:', err);
    }
});

// Save scores to file
const saveScoresToFile = () => {
    fs.writeFile('scores.json', JSON.stringify(scores), 'utf8', (err) => {
        if (err) {
            console.log('Error saving scores to file:', err);
        }
    });
};

app.get('/', (req, res) => {
    // Render the scoreboard page with the current scores
    res.render('scoreboard', { scores });
});

app.get('/login', (req, res) => {
    // Render the login page
    res.render('login');
});

app.post('/login', (req, res) => {
    // Check if the submitted username and password match the ones stored in the app
    if (req.body.username === 'controlboi' && req.body.password === 'applejuice') {
        req.session.loggedIn = true;
        res.redirect('/control');
    } else {
        res.redirect('/login');
    }
});

app.get('/control', (req, res) => {
    if (req.session.loggedIn) {
        res.render('control', { scores });
    } else {
        res.redirect('/login');
    }
});


app.post('/increase-scores', (req, res) => {
    // Update the scores based on the button that was clicked
    const { team, points } = req.body;
    scores[team] += parseInt(points);

    // Save scores to file
    saveScoresToFile();

    // Send a message to all connected clients with the updated scores
    io.emit('score-update', scores);

    // Send a response back to the client to confirm the update
    res.send('Score updated!');
});

app.post('/decrease-scores', (req, res) => {
    // Update the scores based on the button that was clicked
    const { team, points } = req.body;
    scores[team] -= parseInt(points);

    if (scores[team] < 0) {
        scores[team] = 0;
    }

    // Save scores to file
    saveScoresToFile();

    // Send a message to all connected clients with the updated scores
    io.emit('score-update', scores);

    // Send a response back to the client to confirm the update
    res.send('Score updated!');
});

app.post('/reset-scores', (req, res) => {
    teams = ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'];

    for (team in teams) {
        scores[teams[team]] = 0;
    }

    // Save scores to file
    saveScoresToFile();

    // Send a message to all connected clients with the updated scores
    io.emit('score-update', scores);

    // Send a response back to the client to confirm the update
    res.send('Score updated!');
});

app.get("/scores", (req, res) => {
    res.send(scores);
});

app.get('*', (req, res) => {
    res.redirect('/login');
});

// Start the server
server.listen(3000, () => {
    console.log('Server started on port 3000');
});
