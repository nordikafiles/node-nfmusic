var Auth,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Auth = (function() {
  function Auth() {
    this.getToken = bind(this.getToken, this);
  }

  Auth.prototype.authUrl = "/auth.html";

  Auth.prototype.appId = "14882281488";

  Auth.prototype.iframeElement = null;

  Auth.prototype.type = "popup";

  Auth.prototype.popupWindow = null;

  Auth.prototype.getToken = function(permissions, callback) {
    var i, len, npermissions, permission, ref, url;
    npermissions = [];
    if (typeof permissions === "string") {
      ref = permissions.split(",");
      for (i = 0, len = ref.length; i < len; i++) {
        permission = ref[i];
        npermissions.push(permission.trim());
      }
    }
    permissions = npermissions;
    if (Array.isArray(permissions)) {
      url = this.authUrl;
      url += "?";
      url += "app_id=";
      url += this.appId;
      url += "&scope=" + permissions.join(",");
      if (this.type === "popup") {
        this.popupWindow = window.open(url);
        return window.addEventListener('message', (function(_this) {
          return function(e) {
            if (e.data.type === "auth_callback") {
              _this.popupWindow.close();
              callback.call(e.data, e.data);
              return window.removeEventListener('message');
            }
          };
        })(this));
      }
    }
  };

  return Auth;

})();

window.Auth = Auth;
