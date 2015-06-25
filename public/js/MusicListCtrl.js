app.controller("MusicListCtrl", [
  '$scope', 'PlayerFactory', function($scope, PlayerFactory) {
    window.setMusicListContent = function(pl) {
      return $scope.$apply(function() {
        return $scope.playlist = pl;
      });
    };
    $scope.play = function(song) {
      if (song === $scope.currentSong) {
        return PlayerFactory.toggle("smoothly");
      } else {
        PlayerFactory.loadPlaylist($scope.playlist);
        return PlayerFactory.play($scope.playlist.indexOf(song));
      }
    };
    $scope.playlist = [];
    $scope.paused = true;
    $scope.currentSong = new Track;
    PlayerFactory.on("loadPlaylist", function(playlist) {
      return $scope.playlist = playlist;
    });
    PlayerFactory.on("trackinfo", function(track) {
      return $scope.currentSong = track;
    });
    PlayerFactory.on("pause", function() {
      return $scope.paused = true;
    });
    return PlayerFactory.on("play", function() {
      return $scope.paused = false;
    });
  }
]);
