//##################
//### Requires #####
//##################
var app, bodyParser, express, fs, http, io, multer;

require('dotenv').config();

express = require('express');

app = express();

http = require('http').Server(app);

io = require('socket.io')(http);

bodyParser = require('body-parser');

multer = require('multer');

fs = require("fs");

const path = require('path');

const SONGS_PATH = process.env.SONGS_PATH || path.join(__dirname, 'songs');
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3023;

//##################
//# Static server ##
//##################
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(multer());

app.post("/upload/:file/:token", function(req, res) {
  return res.end(`${req.params.file} | ${req.params.token}`);
});

app.get("/download/:song", function(req, res) {
  var i, len, track, tracklist;
  tracklist = JSON.parse(fs.readFileSync("./public/tracklist.json"));
  for (i = 0, len = tracklist.length; i < len; i++) {
    track = tracklist[i];
    res.write(track.title + "\n");
  }
  return res.end();
});

app.get("/tracklist.json", function(req, res) {
  console.log();
  return res.json(fs.readdirSync(`${__dirname}/songs`).map(x => {
    let y = path.basename(x).replace('.mp3', '').split(" - ");
    let artist = '';
    let title = '';
    if (y.length > 1) {
      artist = y[0];
      title = y[1];
    } else {
      title = y[0];
    }
    return { artist, title, type: "mp3", url: `/songs/${path.basename(x)}`, coverArt: "/img/default-album.png" }
  }));
});

app.get("/songs/:filename", (req, res) => {
  res.sendFile(path.join(SONGS_PATH, req.params.filename))
})

app.use(express.static(__dirname + "/public"));

http.listen(PORT, function() {
  console.log(`listening on *:${PORT}`);
});

//##################
//#### Sockets #####
//##################
io.on('connection', function(socket) {
  console.log('a user connected');
});
