define "NF_AUTH_URL", "http://nf.noip.me/auth.html"
window.getFullURL = (url) ->
	(new Audio(url)).src
window.getTracklistJSON = (callback) ->
	xhr = new XMLHttpRequest
	xhr.open("GET", "tracklist.json", true)
	xhr.send()
	xhr.onload = () ->
		callback xhr.response
window.focused = true 
window.addEventListener "focus", () ->
	window.focused = true
window.addEventListener "blur", () ->
	window.focused = false
CONFIG = {}
if localStorage.getItem("config") then CONFIG = JSON.parse(localStorage.getItem("config"))
else
	CONFIG = 
		invertMouseWheel: 
			value: true
			changed: false
		playerVolume:
			value: 0.7
		volumeDuration:
			value: 10
		vkAccessToken:
			value: ""
		vkUserId:
			value: ""
		language: "ru"
	localStorage.setItem "config", JSON.stringify(CONFIG)
CONFIG.update = () ->
	localStorage.setItem "config", JSON.stringify(CONFIG)
setTimeout () ->
  if CONFIG.vkAccessToken.value == ""
    $(".vk-container").attr("style", "transform: scale(1); opacity: 1;")
  else
    $(".vk-container").attr("style", "display: none")
  $(".vk-container").on "click", () ->
    do NF_AUTH
, 10
sleep = (ms) ->
  ms += new Date().getTime()
  continue  while new Date() < ms
  return
NF_AUTH = (callback) ->
	au = new Auth()
	au.authUrl = NF_AUTH_URL
	au.getToken "vk.audio", (e) ->
		if callback != undefined then callback.call this, e
		else	
			CONFIG.vkAccessToken.value = e.vk.access_token
			CONFIG.vkUserId.value = e.vk.user_id
			do CONFIG.update
			do location.reload
$(window).keydown (e) ->
	if (e.ctrlKey or e.metaKey) and e.keyCode == 79
		console.log(e.keyCode)
		e.preventDefault()
		do $("#fileDialog").click
$("#fileDialog").on "change", (e) ->
	ea = []
	qu = 0
	numberOfFiles = 0
	console.log @files
	for file in @files
		if file.type == "audio/mp3" or file.type == "audio/mpeg"
			qu++
	for file in @files
		if file.type == "audio/mp3" or file.type == "audio/mpeg"
			currentNum = numberOfFiles
			TRACK = new Track
			url = file.urn || file.name
			ID3.loadTags url , () ->
				tags = ID3.getAllTags(url)
				TRACK.title = tags.title || ""
				TRACK.artist = tags.artist || ""
				if tags.picture != undefined
					base64String = ""
					for cc in tags.picture.data
						base64String += String.fromCharCode(cc)
					TRACK.coverArt = "data:" + tags.picture.format + ";base64," + window.btoa(base64String)
				reader = new FileReader
				reader.readAsDataURL(file)
				reader.onload = (e) ->
					TRACK.url = e.target.result
					ea.push TRACK
					qu--
					if qu == 0
						pla.loadPlaylist ea
			, 
				tags:
					[
						"artist"
						"title"
						"album"
						"year"
						"comment"
						"track"
						"genre"
						"lyrics"
						"picture"
					]
				dataReader: FileAPIReader(file)
			numberOfFiles++
getRequest = (url, cb) ->
	xhr = new XMLHttpRequest
	xhr.open "GET", url
	do xhr.send
	xhr.onload = () ->
		cb xhr.response
# await getRequest "tracklist.json", defer result
# console.log result
window.CONFIG = CONFIG
DICTIONARY = {}
getLang = (language) ->
	request = new XMLHttpRequest
	request.open "GET", "/languages/#{language}.json", false
	request.send()
	JSON.parse request.response
DICTIONARY = getLang CONFIG.language
window.addEventListener "load", () ->
	setTimeout () ->
		$("#globalLoading").removeClass("show")
		setTimeout () ->
			$("#globalLoading").hide()
			$(".musiclist").removeClass("hide")
		, 500
	, 500