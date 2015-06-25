class Player
	core: new Audio()
	currentCore: "html5"
	events: []
	SoundCloud: null
	TRACK: { default: true }
	CURRENT_SONG: 0
	__volume: 0.7
	__pvolume: 0.7
	saveVolumeState: true
	savePlaylist: false
	saveCurrentSongPosition: false
	volumeInterval: null
	muted: false
	udp: true


	xbmcConnected: false
	xbmcCurrentTime: 0
	xbmcDuration: 0
	xbmcVolume: 1
	xbmcPaused: true
	__pxbmcVolume: 1

	requestTrackInfo: () =>
		@trigger "trackinfo", @TRACK, @
	on: (eventNames, func) =>
		for eventName in eventNames.split(",")
			if @events[eventName] == undefined
				@events[eventName] = []
			@events[eventName].push func
	trigger: (eventName, args, th) =>
		if @events[eventName] != undefined
			for func in @events[eventName]
				if th != undefined
					func.call(th, args)
				else
					func.call(th, args)
	init: =>
		ce.init()
		window.addEventListener "load", () =>
			ce.connect CONFIG.xbmcip, CONFIG.xbmcport, (result)=>
				if result and (new Date).getTime() - CONFIG.lastXbmcNotification > 600000
					@xbmcConnected = true
					ce.sendNotification "nfmusic", "Successfully paired", () ->
					CONFIG.lastXbmcNotification = (new Date).getTime()
				@trigger "xbmcConnected", result, @	
				CONFIG.update()
		window.addEventListener "beforeunload", () =>
			if @currentCore == "xbmc" then ce.stop () ->
		ce.on "volume", (volume) =>
			@xbmcVolume = volume
			if @currentCore == "xbmc"
				@trigger "volumechange", @xbmcVolume, @
		ce.on "extensionReady", () =>
			@trigger "extensionReady", true, @ 
		@core = new Audio()
		@currentCore = "html5"
		@core.addEventListener "timeupdate", () =>
			if @currentCore == "html5"
				@trigger "timeupdate", {}, @
				@trigger "progress", @core.progress, @
		@core.addEventListener "play", () =>
			if @currentCore == "html5"
				@trigger "play", {}, @
		@core.addEventListener "ended", () =>
			if @currentCore == "html5"
				@trigger "ended", {}, @
			console.log "ended"
		@core.addEventListener "pause", () =>
			if @currentCore == "html5"
				@trigger "pause", {}, @
		@core.addEventListener "progress", () =>
			if @currentCore == "html5"
				@trigger "progress", @core.buffered.end(@core.buffered.length-1)/@duration, @
		@SoundCloud = new SoundCloud()
		@SoundCloud.init @, "sciframe"
		@SoundCloud.volume = @__volume
		@on "ended", =>
			do @next
		@on "timeupdate", =>
			if @saveCurrentSongPosition
				localStorage.setItem("player_current_song", 
					JSON.stringify 
						currentTime: @currentTime
						currentSong: @CURRENT_SONG
				)
		if CONFIG.playerVolume.value and @saveVolumeState
			@__volume = CONFIG.playerVolume.value / 1
			@volume = @__volume
			@trigger "volumechange", @volume, @
		if @savePlaylist and localStorage.getItem("player_playlist")
			@loadPlaylist JSON.parse(localStorage.getItem("player_playlist"))
			if @saveCurrentSongPosition and localStorage.getItem("player_current_song")
				curr = localStorage.getItem("player_current_song")
				curr = JSON.parse(curr)
				@play curr.currentSong
				@CURRENT_SONG = curr.currentSong
				do @pause
				@currentTime = curr.currentTime
				@TRACK = @PLAYLIST[@CURRENT_SONG]
				@trigger "trackinfo", @TRACK, @
		lastSongChange = (new Date).getTime()
		ce.on "timeupdate", (data) =>
			if @currentCore == "xbmc"
				@xbmcCurrentTime = data.time
				@xbmcDuration = data.duration
				data2 = data
				@xbmcPaused = data.paused
				if @xbmcPaused and !data2.paused then @trigger "play", {}, @
				if !@xbmcPaused and data2.paused then @trigger "pause", {}, @
				@trigger "timeupdate", {}, @
				@trigger "progress", 0, @
			if @xbmcDuration - @xbmcCurrentTime < 1 and (new Date).getTime() - lastSongChange > 5000
				@trigger "ended", {}, @
				lastSongChange = (new Date).getTime()
		@trigger "ready", {}, @


Object.defineProperties Player.prototype, 
		currentTime:
			set: (time) ->
				switch @currentCore
					when "html5"
						try
							@core.currentTime = time
						catch
							console.log "Error"
						@trigger "currrenttimechanged", true, @
					when "soundcloud"
						@SoundCloud.widget.seekTo(time*1000)
					when "xbmc"
						ce.seekTo time, () =>
							@trigger "currrenttimechanged", true, @
			get: () ->
				switch @currentCore
					when "html5"
						return @core.currentTime
					when "soundcloud"
						return @SoundCloud.currentTime
					when "xbmc"
						return @xbmcCurrentTime
				return 0
		timeLeft:
			get: () ->
				switch @currentCore
					when "html5"
						return @core.duration - @core.currentTime
					when "xbmc"
						return @xbmcDuration - @xbmcCurrentTime
				return 0
		seconds:
			get: () ->
				if @currentTime%60 < 10
					return "0" + Math.floor(@currentTime%60)
				else
					return "" + Math.floor(@currentTime%60)
		duration:
			get: () ->
				switch @currentCore
					when "html5"
						return @core.duration
					when "soundcloud"
						return @SoundCloud.duration
					when "xbmc"
						return @xbmcDuration
		progress:
			get: () ->
				return @currentTime/@duration
			set: (val) ->
				@currentTime = @duration*val
		minutes:
			get: () ->
				if @currentTime/60 < 10 and @hours > 0
					return "0" + Math.floor(@currentTime/60)
				else
					return "" + Math.floor(@currentTime/60)
		hours:
			get: () ->
				if @currentTime/360 < 10 and Math.floor(@currentTime/360) > 0
					return "0" + Math.floor(@currentTime/360)
				else if Math.floor(@currentTime/360) > 0
					return "" + Math.floor(@currentTime/360)
				else
					return ""
		secondsLeft:
			get: () ->
				if @timeLeft%60 < 10
					return "0" + Math.floor(@timeLeft%60)
				else
					return "" + Math.floor(@timeLeft%60)
		minutesLeft:
			get: () ->
				if @timeLeft/60 < 10 and @hours > 0
					return "0" + Math.floor(@timeLeft/60)
				else
					return "" + Math.floor(@timeLeft/60)
		hoursLeft:
			get: () ->
				if @timeLeft/360 < 10 and Math.floor(@timeLeft/360) > 0
					return "0" + Math.floor(@timeLeft/360)
				else if Math.floor(@timeLeft/360) > 0
					return "" + Math.floor(@timeLeft/360)
				else
					return ""
		
		volume:
			set: (volume) ->
				if @currentCore == "html5"
					try
						@SoundCloud.widget.setVolume volume
						@core.volume = volume
					catch e
						console.log e
					@__volume = volume
					@SoundCloud.volume = @__volume
					if @saveVolumeState and @udp
						CONFIG.playerVolume.value = @volume
						CONFIG.update()
					if @udp then @trigger "volumechange", @volume, @
				else if @currentCore == "xbmc"
					ce.setVolume volume, () ->
					@xbmcVolume = volume
					if @udp then @trigger "volumechange", @xbmcVolume, @
			get: () ->
				switch @currentCore
					when "html5"
						return @core.volume
					when "soundcloud"
						return @SoundCloud.volume/100
					when "xbmc"
						return @xbmcVolume
				return 0
		toggleMute:
			value: () ->
				if @currentCore == "mp3"
					@udp = false
					if @__volume != 0
						@trigger "volumechange", 0, @
						@__pvolume = @__volume
						@muted = true
						clearInterval @volumeInterval
						@volumeInterval = null
						@volumeInterval = setInterval () =>
							if @muted and @__volume >= 0.01 then @volume -= 0.01
							else
								@udp = true
								@volume = 0
								clearInterval @volumeInterval
								@trigger "volumechange", @volume, @
						, CONFIG.volumeDuration.value/(@__pvolume/0.01)
					else
						clearInterval @volumeInterval
						@volumeInterval = null
						@muted = false
						@trigger "volumechange", @__pvolume + 0.01, @
						@volumeInterval = setInterval () =>
							if !@muted and @__volume < @__pvolume - 0.01 then @volume += 0.01
							else
								@udp = true
								clearInterval @volumeInterval
								@volume = @__pvolume
								@trigger "volumechange", @volume, @
						, CONFIG.volumeDuration.value/(@__pvolume/0.01)
				else if @currentCore == "xbmc"
					if @xbmcVolume > 0
						@__pxbmcVolume = @xbmcVolume
						@volume = 0
					else
						@volume = @__pxbmcVolume

		paused:
			get: () ->
				switch @currentCore
					when "html5"
						return @core.paused
					when "soundcloud"
						return @SoundCloud.paused
					when "xbmc"
						return @xbmcPaused
				return 0
			set: (val) ->
				if val == true or val == false 
					if val
						do @pause
						@trigger "pause", {}, this
					else
						do @play
						@trigger "play", {}, this
		play:
			value: (songIndex) ->
				console.log songIndex

				if songIndex != undefined and songIndex != "smoothly" and typeof (songIndex/1) == "number"
					@CURRENT_SONG = songIndex
					@load @PLAYLIST[songIndex]
					return
				if @TRACK.default
					@load @PLAYLIST[0]
				switch @currentCore
					when "html5"
						if songIndex == "smoothly" and false
							@udp = false
							@volume = 0
							clearInterval @volumeInterval
							@volumeInterval = null
							@muted = false
							@core.play()
							@volumeInterval = setInterval () =>
								console.log @volume

								if !@muted and @__volume < @__pvolume - 0.01 and window.focused then @volume += 0.01
								else
									@volume = @__pvolume
									@udp = true
									clearInterval @volumeInterval
							, CONFIG.volumeDuration.value/(@__pvolume/0.01)
						else
							@udp = true
							clearInterval @volumeInterval
							@core.play()						
					when "soundcloud"
						@SoundCloud.widget.play()
					when "xbmc"
						if @xbmcPaused then ce.playPause () ->
		pause:
			value: (param) ->
				switch @currentCore
					when "html5"
						console.log param
						if param == "smoothly" and false
							@udp = false
							@__pvolume = @__volume
							clearInterval @volumeInterval
							@trigger "pause", {}, @
							@volumeInterval = null
							@volumeInterval = setInterval () =>
								console.log @volume
								if @__volume >= 0.01 then @volume -= 0.01
								else
									@volume = 0
									@udp = true
									clearInterval @volumeInterval
									@core.pause()
							, CONFIG.volumeDuration.value/(@__pvolume/0.01)
						else
							clearInterval @volumeInterval
							@udp = true
							@core.pause()
					when "soundcloud"
						@SoundCloud.widget.pause()
					when "xbmc"
						if !@xbmcPaused then ce.playPause () =>
		stop:
			value: () ->
				@currentTime = 0
				do @pause
				@trigger "stop", {}, this
		toggle:
			value: (reting) ->
				if @paused
					@play reting
					return false
				else
					@pause reting
					return true
				if reting != undefined and reting != "smoothly"
					return this[reting]
		next:
			value: () ->
				if @CURRENT_SONG < @PLAYLIST.length - 1
					@CURRENT_SONG++
					@play @CURRENT_SONG
		prev:
			value: () ->
				if @CURRENT_SONG > 0
					@CURRENT_SONG--
					@play @CURRENT_SONG
		load:
			value: (track) ->
				@TRACK = track
				switch track.type
					when "mp3"
						if @currentCore == "html5"
							do @stop
							do @SoundCloud.reset
							@currentCore = "html5"
							@core.src = track.url
							@core.autoplay = true
							@play "smoothly"
							if !@TRACK.title or !@TRACK.artist
								try
									ID3.loadTags track.url, =>
										setTimeout =>
											tags = ID3.getAllTags(track.url)
											@TRACK.title = tags.title
											@TRACK.artist = tags.artist
											if tags.picture != undefined
												base64String = ""
												for cc in tags.picture.data
													base64String += String.fromCharCode(cc)
												@TRACK.coverArt = "data:" + tags.picture.format + ";base64," + window.btoa(base64String)
											@trigger "trackinfo", @TRACK, @
										, 0
									, tags:
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
								catch err
									console.log(err)
									@trigger "trackinfo", @TRACK, @
							else
								@trigger "trackinfo", @TRACK, @
						else
							@trigger "loadingStart", {}, @
							@trigger "trackinfo", @TRACK, @
							ce.openMedia getFullURL(@TRACK.url), () =>
								@trigger "loadingEnd", {}, @
					when "soundcloud"
						do @stop
						@trigger "trackinfo", @TRACK, @

						@currentCore = "soundcloud"
						@SoundCloud.widget.load track.url, { auto_play: true }
		loadPlaylist:
			value: (playlist) ->
				if JSON.stringify(playlist) != JSON.stringify(@PLAYLIST)
					@PLAYLIST = playlist
					@currentTime = 0
					@stop
					@CURRENT_SONG = 0
					@TRACK = @PLAYLIST[@CURRENT_SONG]
					@play 0
					@stop
					@trigger "loadPlaylist", @PLAYLIST, @
					if !@TRACK.title or !@TRACK.artist
						try
							ID3.loadTags @TRACK.url, =>
								setTimeout =>
									tags = ID3.getAllTags(@TRACK.url)
									@TRACK.title = tags.title
									@TRACK.artist = tags.artist
									@trigger "trackinfo", @TRACK, @
								, 0
							, ["picture", "artist", "title", "album"]
						catch
							@trigger "trackinfo", @TRACK, @
					else
						@trigger "trackinfo", @TRACK, @
					if @savePlaylist then localStorage.setItem("player_playlist", JSON.stringify(@PLAYLIST))

		##############
		#### XBMC ####
		##############

		startStream:
			value: () ->
				@trigger "loadingStart", {}, @
				console.log "Starting stream..."
				ce.openMedia @core.src, () =>
					curtime = @currentTime
					ce.seekTo curtime, () =>
						@pause
						@currentCore = "xbmc"
						@core.src = ""
						@trigger "loadingEnd", {}, @
						console.log "Now straming..."
						@trigger "volumechange", @xbmcVolume, @
		stopStream:
			value: () ->
				curtime = @currentTime
				ce.stop () ->
				@currentCore = "html5"
				@trigger "volumechange", @__volume, @
				@load @TRACK
				@currentTime = curtime

window.Player = Player