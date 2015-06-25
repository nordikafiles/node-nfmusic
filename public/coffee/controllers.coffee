app.controller "PlayerCtrl", ["$scope", "PlayerFactory", "$rootScope", "GetPlaylist", ($scope, PlayerFactory, $rootScope, GetPlaylist) ->
  # await GetPlaylist.jsonp defer response
  #   if response.error != undefined
  #     console.error response.error.error_msg
  #   else
  #     response = response.response.slice(1)
  #     list = []
  #     for tr in response
  #       list.push Track.fromVK(tr)
  #     PlayerFactory.loadPlaylist list
  #     PlayerFactory.play(0)
  #     PlayerFactory.stop()
  getTracklistJSON (res) ->
    setMusicListContent JSON.parse(res)
  $scope.playerLoading = false
  $scope.artist = PlayerFactory.TRACK.artist
  $scope.title = PlayerFactory.TRACK.title
  $scope.coverArt = PlayerFactory.TRACK.coverArt | ""
  window.pla = PlayerFactory
  $rootScope.player_playlist = PlayerFactory.PLAYLIST
  
  $scope.volume = CONFIG.playerVolume.value
  PlayerFactory.volume = $scope.volume
  $(".player-volume-slider .player-slider-progress").css("width", ($scope.volume*100) + "%")
  $(".player-volume-slider .player-slider-thumb").css("left", ($scope.volume*100) + "%")
  

  $scope.position = "0:00"
  $scope.duration = "0:00"
 
  udp = true
  $scope.paused = true
  $scope.hidden = true
  $scope.coverFull = false
  $rootScope.currentSong = 0
  $scope.selectedTrack = 0
  $scope.keyboardControl = false
  $scope.default = false


  seekingBack = false
  seekingForward = false
 
  scrollAnimateTimeout = null
  keyboardSeekRelativePosition = 0
 

  $rootScope.nowPlaying = ""

  $scope.showStartStreamBtn = false
  PlayerFactory.on "extensionReady", () ->
    $scope.$apply ->
      $scope.showStartStreamBtn = true
  StorageEvents.on 'play', () ->
    do $scope.pause
  PlayerFactory.on "play", () ->

    StorageEvents.trigger "play", {}
  PlayerFactory.on "currrenttimechanged", () ->
    udp = true
 #Для изменения состояния плеера
  PlayerFactory.on "play,pause,ended", () ->
    $scope.$apply =>
      $scope.hidden = false
      if @currentCore == "xbmc" then $scope.now_streaming = true else $scope.now_streaming = false  
      $scope.paused = @paused
      if !@paused then $rootScope.nowPlaying = "► " + $scope.artist + " - " + $scope.title + " | "
      else $rootScope.nowPlaying = ""

#Получаем информацию о треке
  PlayerFactory.on "trackinfo", (trackInfo) ->
    if @currentCore == "xbmc" then $scope.now_streaming = true else $scope.now_streaming = false
    $scope.coverArt = trackInfo.coverArt
    # $scope.coverArt = "http://freshall.com/img/2013-05/06/nuihujb0uf3tpg3ged9xgjgv3.jpg"
    $scope.title = trackInfo.title
    $scope.artist = trackInfo.artist
    console.log $rootScope.player_playlist = @PLAYLIST
    console.log $rootScope.currentSong = @CURRENT_SONG
    $scope.default = trackInfo.default
    $scope.hidden = false
    if !$scope.keyboardControl then $scope.selectedTrack = @CURRENT_SONG
    if scrollAnimateTimeout != null then clearTimeout scrollAnimateTimeout
    scrollAnimateTimeout = setTimeout ->
      try
        $(".playlist").animate
          scrollTop: $(".playlist li.play")[0].offsetTop - window.innerHeight / 2
      catch e
        console.log e
    , 500
  PlayerFactory.on "timeupdate", () ->
    if udp then keyboardSeekRelativePosition = @progress
    $scope.$apply =>
      if @currentCore == "xbmc" then $scope.now_streaming = true else $scope.now_streaming = false
      $rootScope.player_playlist = @PLAYLIST
      $rootScope.currentSong = @CURRENT_SONG
      $scope.paused = @paused
      if udp then $scope.position = @minutes + ":" + @seconds
      $scope.duration = Math.floor(@duration/60) + ":" + (if Math.floor(@duration % 60) < 10 then "0" + Math.floor(@duration % 60) else Math.floor(@duration % 60))
    if udp
      $(".seek-bar-container .player-slider-progress").css("width", (@progress*100) + "%")
      $(".seek-bar-container .player-slider-thumb").css("left", (@progress*100) + "%")
  PlayerFactory.on "progress", (progress) ->
    $(".seek-bar-container .player-slider-buffer").css("width", (progress*100) + "%")
  PlayerFactory.on "loadingStart", () ->
    $scope.playerLoading = true
  PlayerFactory.on "loadingEnd", () ->
    $scope.playerLoading = false
  PlayerFactory.on "volumechange", (vol) ->
    $scope.volume = vol
    console.log "Controllers volume: #{vol}"
    $(".player-volume-slider .player-slider-progress").css("width", (vol*100) + "%")
    $(".player-volume-slider .player-slider-thumb").css("left", (vol*100) + "%")
  seek = false
  seekVolume = false
  seekRelativePosition = 0
  $(".player .seek-bar-container .player-seek-bar")
  .on "mousedown", (e) ->
    seek = true
    udp = false
    if seek
      if (e.pageX-$(".player .seek-bar-container .player-seek-bar").offset().left)/$(".player .seek-bar-container .player-seek-bar").width() > 0 and (e.pageX-$(".player .seek-bar-container .player-seek-bar").offset().left)/$(".player .seek-bar-container .player-seek-bar").width() <= 1
        seekRelativePosition = (e.pageX-$(".player .seek-bar-container .player-seek-bar").offset().left)/$(".player .seek-bar-container .player-seek-bar").width()
      e.preventDefault()
      $(".seek-bar-container .player-slider-progress").css("width", (seekRelativePosition*100) + "%")
      $(".seek-bar-container .player-slider-thumb").css("left", (seekRelativePosition*100) + "%")
  $(".player-volume-slider")
  .on "mousedown", (e) ->
    seekVolume = true
    if (e.pageX-$(".player-volume-slider").offset().left)/$(".player-volume-slider").width() >= 0 and (e.pageX-$(".player-volume-slider").offset().left)/$(".player-volume-slider").width() <= 1
      volumeRelativePosition = (e.pageX-$(".player-volume-slider").offset().left)/$(".player-volume-slider").width()
    PlayerFactory.volume = volumeRelativePosition
    $scope.$apply () ->
      $scope.volume = volumeRelativePosition
  $(window).on "mousemove", (e) ->
    $scope.keyboardControl = false
    if seek
      if (e.pageX-$(".player .seek-bar-container .player-seek-bar").offset().left)/$(".player .seek-bar-container .player-seek-bar").width() > 0 and (e.pageX-$(".player .seek-bar-container .player-seek-bar").offset().left)/$(".player .seek-bar-container .player-seek-bar").width() <= 1
        seekRelativePosition = (e.pageX-$(".player .seek-bar-container .player-seek-bar").offset().left)/$(".player .seek-bar-container .player-seek-bar").width()
      $scope.$apply () ->
        $scope.position = Math.floor(seekRelativePosition*PlayerFactory.duration / 60) + ":" + (if Math.floor(seekRelativePosition*PlayerFactory.duration % 60) < 10 then "0" else "") + Math.floor(seekRelativePosition*PlayerFactory.duration % 60)
      e.preventDefault()
      $(".seek-bar-container .player-slider-progress").css("width", (seekRelativePosition*100) + "%")
      $(".seek-bar-container .player-slider-thumb").css("left", (seekRelativePosition*100) + "%")
    if seekVolume 
      if (e.pageX-$(".player-volume-slider").offset().left)/$(".player-volume-slider").width() >= 0 and (e.pageX-$(".player-volume-slider").offset().left)/$(".player-volume-slider").width() <= 1
        volumeRelativePosition = (e.pageX-$(".player-volume-slider").offset().left)/$(".player-volume-slider").width()
        $scope.$apply () ->
          $scope.volume = volumeRelativePosition
      if volumeRelativePosition != undefined
        if volumeRelativePosition > 0.05 
          PlayerFactory.muted = false
          if volumeRelativePosition < 0.95
            PlayerFactory.volume = volumeRelativePosition
          else
            PlayerFactory.volume = 1
        else PlayerFactory.volume = 0
      e.preventDefault()
  .on "mouseup", (e) ->
    if seekVolume
      seekVolume = false
    if seek
      seek = false
      if (e.pageX-$(".player .seek-bar-container .player-seek-bar").offset().left)/$(".player .seek-bar-container .player-seek-bar").width() > 0 and (e.pageX-$(".player .seek-bar-container .player-seek-bar").offset().left)/$(".player .seek-bar-container .player-seek-bar").width() <= 1
        seekRelativePosition = (e.pageX-$(".player .seek-bar-container .player-seek-bar").offset().left)/$(".player .seek-bar-container .player-seek-bar").width()
      PlayerFactory.progress = seekRelativePosition
  setInterval ->
    if seekingBack and PlayerFactory.currentTime > 0
      udp = false
      keyboardSeekRelativePosition -= 0.001
      $(".seek-bar-container .player-slider-progress").css("width", (keyboardSeekRelativePosition*100) + "%")
      $(".seek-bar-container .player-slider-thumb").css("left", (keyboardSeekRelativePosition*100) + "%")
    else if seekingForward and keyboardSeekRelativePosition + 0.001 <= 1
      udp = false
      keyboardSeekRelativePosition += 0.001
      $(".seek-bar-container .player-slider-progress").css("width", (keyboardSeekRelativePosition*100) + "%")
      $(".seek-bar-container .player-slider-thumb").css("left", (keyboardSeekRelativePosition*100) + "%")
  , 1
  downArrow = 40
  upArrow = 38
  leftArrow = 37
  rightArrow = 39
  seekTimeout = null
  window.addEventListener "keydown", (e) ->
    if e.keyCode == downArrow and document.activeElement.tagName != "INPUT"

    else if e.keyCode == upArrow and document.activeElement.tagName != "INPUT"

    else if e.keyCode == leftArrow and !seekingBack and document.activeElement.tagName != "INPUT"
      seekTimeout = setTimeout ->
        udp = false
        seekingBack = true
      , 300
    else if e.keyCode == rightArrow and !seekingForward and document.activeElement.tagName != "INPUT"
      seekTimeout = setTimeout ->
        udp = false
        seekingForward = true

      , 300
    else if e.keyCode == 32 and document.activeElement.tagName != "INPUT"
      do e.preventDefault
  window.addEventListener "keyup", (e) ->
    if e.keyCode == upArrow and document.activeElement.tagName != "INPUT"
      $scope.keyboardControl = true
      if $scope.selectedTrack > 0 then $scope.selectedTrack -= 1
    else if e.keyCode == downArrow and document.activeElement.tagName != "INPUT"
      $scope.keyboardControl = true
      if $scope.selectedTrack < $rootScope.player_playlist.length-1 
        $scope.selectedTrack += 1
    else if e.keyCode == leftArrow and document.activeElement.tagName != "INPUT"
      if seekTimeout != null
        clearTimeout seekTimeout

      if !seekingBack
        do $scope.prev
      seekingBack = false
      PlayerFactory.progress = keyboardSeekRelativePosition


    else if e.keyCode == rightArrow and document.activeElement.tagName != "INPUT"
      if seekTimeout != null
        clearTimeout seekTimeout
      if !seekingForward
        do $scope.next
      PlayerFactory.progress = keyboardSeekRelativePosition

    else if e.keyCode == 32 and document.activeElement.tagName != "INPUT"
      $scope.toggle "smoothly"
      do e.preventDefault
    seekingForward = false
    seekingBack = false

  invertMod = new Modal
  invertMod.type = 'confirm'
  invertMod.title = DICTIONARY["Invert mouse wheel"]
  invertMod.text = DICTIONARY["Invert mouse wheel to control the volume?"]
  invertMod.init()
  $(".player")[0]
    .addEventListener "mousewheel", (e) ->
      if !CONFIG.invertMouseWheel.changed
        invertMod.show (result) ->
          CONFIG.invertMouseWheel.changed = true
          CONFIG.invertMouseWheel.value = result
          CONFIG.update()
      wheelDelta = e.wheelDelta
      if CONFIG.invertMouseWheel.value then wheelDelta = e.wheelDelta * -1

      if PlayerFactory.volume + wheelDelta/100 > 0 
        if PlayerFactory.volume + wheelDelta/100 < 1
          PlayerFactory.volume += wheelDelta/100
        else
          PlayerFactory.volume = 1
      else PlayerFactory.volume = 0
      do e.preventDefault

  $scope.toggle = (param) ->
    do PlayerFactory.toggle
  $scope.prev = () ->
    do PlayerFactory.prev
  $scope.next = () ->
    do PlayerFactory.next
  $rootScope.play = (songIndex) ->
    console.log songIndex
    if songIndex == undefined then songIndex = "smoothly"
    if songIndex == $scope.currentSong then $scope.toggle "smoothly"
    else PlayerFactory.play songIndex
  $scope.pause = () ->
    PlayerFactory.pause "smoothly"
  $scope.stop = () ->
    do PlayerFactory.stop
  $scope.mute = () ->
    do PlayerFactory.toggleMute

  xbmcSettingsModal = new Modal
  xbmcSettingsModal = new Modal
  xbmcSettingsModal.type = "apply"
  xbmcSettingsModal.text = '
    <input class="ip" type="text" placeholder="XBMC/KODI ip">
    <input class="port" type="text" placeholder="XBMC/KODI port (default 80)">
    <input class="username" type="text" placeholder="Username (Optional)">
    <input class="password" type="password" placeholder="Password (Optional)">
  '
  xbmcSettingsModal.title = "Settings"
  xbmcSettingsModal.onapplypressed = (elem) ->
    CONFIG.xbmcip = elem.find(".ip").val()
    CONFIG.xbmcport = elem.find(".port").val()
    do CONFIG.update
    return false
  xbmcSettingsModal.init()
  configureXbmc = new Modal
  configureXbmc.type = "confirm"
  configureXbmc.title = DICTIONARY["Unknown destination address"]
  configureXbmc.text = DICTIONARY["Unknown destination address. Do you want to specify it now?"]
  configureXbmc.init()
  $scope.startStream = () ->
    if CONFIG.xbmcip and CONFIG.xbmcport
      do PlayerFactory.startStream
    else
      configureXbmc.show (result) ->
        if result then xbmcSettingsModal.show (result, elem) ->
          if result
            CONFIG.xbmcip = elem.find(".ip").val()
            CONFIG.xbmcport = if elem.find(".port").val() == "" then "80" else elem.find(".port").val()
            do CONFIG.update
            if CONFIG.xbmcip and CONFIG.xbmcport
              ce.sendNotification "nfmusic", "Successfully paired", () ->
                Modal.alert DICTIONARY["Successfully paired with kodi"], DICTIONARY["Successfully paired"], () ->
    return false
  $scope.stopStream = () ->
    do PlayerFactory.stopStream
  $scope.toggleCover = () ->
    if $scope.coverFull
      $('.media-poster')
        .removeClass("full")
      setTimeout () ->
        $('.media-poster img')
          .attr("style", "")
        $('.media-poster')
          .removeClass("fixed-pos")
      , 200
      $scope.coverFull = false

    else
      pos = {
        bottom: $(window).height() - $('.media-poster img').offset().top - 80,
        left: $('.media-poster img').offset().left
      }
      console.log pos
      $('.media-poster img')
        .css("left", pos.left + "px")
      $('.media-poster img')
        .css("bottom", pos.bottom + "px")
      $('.media-poster')
        .addClass("fixed-pos")
      setTimeout () ->
        $('.media-poster')
          .addClass("full")
      , 10
      $scope.coverFull = true
    return false
  $scope.loadPlaylist = (num) ->
    switch num
      when 1
        req = new XMLHttpRequest
        req.open "GET", "tracklist.json", false
        do req.send
        PlayerFactory.loadPlaylist JSON.parse(req.response)
  return false
]
app.controller "PlaylistCtrl", ["$scope", "$rootScope", "PlayerFactory", ($scope, $rootScope, PlayerFactory) ->
  $rootScope.show_playlist = false
  $rootScope.showPlaylist = () ->
    $rootScope.show_playlist = true
  $rootScope.hidePlaylist = () ->
    $rootScope.show_playlist = false


]