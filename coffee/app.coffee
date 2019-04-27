###################
#### Requires #####
###################
require('dotenv').config()
express = require('express')
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)
bodyParser = require('body-parser')
multer = require('multer')
fs = require "fs"

###################
## Static server ##
###################

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(multer())
app.post "/upload/:file/:token", (req, res) ->
	res.end "#{req.params.file} | #{req.params.token}"
app.get "/download/:song", (req, res) ->
	tracklist = JSON.parse fs.readFileSync "./public/tracklist.json"
	for track in tracklist
		res.write track.title + "\n"
	res.end()
app.get "/tracklist.json", (req, res) ->
	console.log(fs.readdirSync("#{__dirname}/songs"))
	res.json([])
app.use express.static(__dirname+"/public")
http.listen 3000, ->
  console.log 'listening on *:3000'
  return

###################
##### Sockets #####
###################

io.on 'connection', (socket) ->
  console.log 'a user connected'
  return