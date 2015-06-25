class SoundCloud
	volume: 0.1
	ready: false
	widget: null
	currentTime: 0
	paused: true
	duration: 0
	init: (PLAYER, iframe_obj) =>
		@widget = new SC.Widget iframe_obj
		@reset = () =>
			document.getElementById(iframe_obj).src = "https://w.soundcloud.com/player/?url="
		@ready = true
		@widget.bind SC.Widget.Events.READY, () =>
			@widget.getDuration (e) =>
				@duration = e/1000
			@widget.getCurrentSound (e) =>
				if e
					if !PLAYER.TRACK.title then PLAYER.TRACK.title = e.title.split(" - ").slice(1, e.title.split(" - ").length).join(" - ")
					if !PLAYER.TRACK.artist then PLAYER.TRACK.artist = e.title.split(" - ")[0]
					if !PLAYER.TRACK.coverArt then PLAYER.TRACK.coverArt = e.artwork_url else 

				PLAYER.trigger "trackinfo", PLAYER.TRACK, this
		@widget.bind SC.Widget.Events.PLAY, (e) =>
			@widget.setVolume @volume
			@currentTime = e.currentPosition/1000
			@paused = false
			PLAYER.trigger "play", {}, PLAYER
			PLAYER.trigger "trackinfo", PLAYER.TRACK, this

		@widget.bind SC.Widget.Events.PLAY_PROGRESS, (e) =>
			@currentTime = e.currentPosition/1000
			PLAYER.trigger "timeupdate", {}, PLAYER
		@widget.bind SC.Widget.Events.PAUSE, (e) =>
			@currentTime = e.currentPosition/1000
			@paused = true
			PLAYER.trigger "pause", {}, PLAYER
		@widget.bind SC.Widget.Events.FINISH, (e) =>
			@currentTime = e.currentPosition/1000
			@paused = true
			PLAYER.trigger "ended", {}, PLAYER
window.SoundCloud = SoundCloud
