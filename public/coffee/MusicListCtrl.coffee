app.controller "MusicListCtrl", ['$scope', 'PlayerFactory', ($scope, PlayerFactory) ->
	window.setMusicListContent = (pl) ->
		$scope.$apply ->
			$scope.playlist = pl
	$scope.play = (song) ->
		if song == $scope.currentSong
			PlayerFactory.toggle "smoothly"
		else 
			PlayerFactory.loadPlaylist $scope.playlist
			PlayerFactory.play $scope.playlist.indexOf(song)
	$scope.playlist = []
	$scope.paused = true
	$scope.currentSong = new Track
	PlayerFactory.on "loadPlaylist", (playlist) ->
		$scope.playlist = playlist
	PlayerFactory.on "trackinfo", (track) ->
		$scope.currentSong = track
	PlayerFactory.on "pause", () ->
		$scope.paused = true
	PlayerFactory.on "play", () ->
		$scope.paused = false
]