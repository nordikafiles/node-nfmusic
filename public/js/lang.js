var LangDictionary;

LangDictionary = (function() {
  function LangDictionary(json_url) {
    var lxhr, resp, sl;
    lxhr = new XMLHttpRequest();
    lxhr.open("GET", json_url, false);
    lxhr.send();
    resp = JSON.parse(lxhr.response);
    for (sl in resp) {
      this[sl] = resp[sl];
    }
    return this;
  }

  LangDictionary.prototype.play = "Play";

  LangDictionary.prototype.pause = "Pause";

  LangDictionary.prototype.prev = "Prev";

  LangDictionary.prototype.next = "Next";

  LangDictionary.prototype.unknownTitle = "Unknown title";

  LangDictionary.prototype.unknownArtist = "Unknown artist";

  LangDictionary.prototype.homepage = "Homepage";

  LangDictionary.prototype.charts = "Charts";

  LangDictionary.prototype.search = "Search";

  LangDictionary.prototype.signin = "Sign in";

  LangDictionary.prototype.signout = "Sign out";

  LangDictionary.prototype.signup = "Signup";

  return LangDictionary;

})();
