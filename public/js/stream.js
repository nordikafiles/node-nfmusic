var AuthorisationKey, Destination, Stream, StreamReceiverDestination;

Stream = (function() {
  function Stream(Player, AuthorisationKey) {
    this.Player = Player;
    this.AuthorisationKey = AuthorisationKey;
  }

  Stream.prototype.Player = null;

  Stream.prototype.AuthorisationKey = null;

  Stream.prototype.getPossible = function(success, error) {
    socket.emit("getPossibleStreamReceivers", this.AuthorisationKey.Key);
    return socket.on("getPossibleStreamReceiversResponseFor" + this.AuthorisationKey.Key, function(data) {
      var dest, ret, sr, _i, _len;
      if (data.error) {
        error(data.errorCode, data.errorText);
        return;
      }
      ret = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        sr = data[_i];
        dest = new Destination(sr.key);
        ret.push(new StreamReceiver(sr.name, dest));
      }
      return success(ret);
    });
  };

  Stream.prototype.start = function(sReceiver) {
    socket.emit("startStreamFor" + sReceiver.Destination.Key);
    return socket.emit("streamFor" + sReceiver.Destination.Key);
  };

  return Stream;

})();

StreamReceiverDestination = (function() {
  function StreamReceiverDestination(Name, Destination) {
    this.Name = Name;
    this.Destination = Destination;
  }

  StreamReceiverDestination.prototype.Name = null;

  StreamReceiverDestination.prototype.Destination = null;

  return StreamReceiverDestination;

})();

Destination = (function() {
  function Destination(key) {
    this.key = key;
  }

  Destination.prototype.key = "";

  return Destination;

})();

AuthorisationKey = (function() {
  function AuthorisationKey() {}

  AuthorisationKey.prototype.Key = "";

  constructor(function(key) {
    this.key = key;
  });

  return AuthorisationKey;

})();
