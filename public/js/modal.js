var Modal,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Modal = (function() {
  function Modal() {
    this.init = bind(this.init, this);
  }

  Modal.alert = function(message, title, callback) {
    var mod;
    mod = new Modal;
    mod.type = "ok";
    mod.title = title;
    mod.text = message;
    mod.init();
    mod.show(callback);
    return mod;
  };

  Modal.confirm = function(message, title, callback) {
    var mod;
    mod = new Modal;
    mod.type = "confirm";
    mod.title = title;
    mod.text = message;
    mod.init();
    mod.show(callback);
    return mod;
  };

  Modal.prototype.id = "";

  Modal.prototype.type = "";

  Modal.prototype.title = "";

  Modal.prototype.text = "";

  Modal.prototype.image = "";

  Modal.prototype.onclose = function() {};

  Modal.prototype.onapplypressed = function() {};

  Modal.prototype.oncancelpressed = function() {};

  Modal.prototype.onokpressed = function() {};

  Modal.prototype.init = function() {
    var modalBoxId;
    modalBoxId = "modal_box_" + (Math.floor(Math.random() * 10000));
    $("body").append("<div class='modal-box' id='" + modalBoxId + ("'>  <div class='modal'><div class='modal-header'>  <h4>Simple title</h4>  <div class='close'>    <i></i>  </div></div><div class='modal-body'>  Simple text</div><div class='modal-footer'>  <div class='btn btn-primary yes'>" + DICTIONARY.yes + "</div>  <div class='btn no'>" + DICTIONARY.no + "</div>  <div class='btn ok'>" + DICTIONARY.ok + "</div><div class='btn apply'>" + DICTIONARY.apply + "</div><div class='btn cancel'>" + DICTIONARY.cancel + "</div>    </div>  </div></div>"));
    this.id = modalBoxId;
    if (this.type === 'ok') {
      $("#" + this.id + " .modal").addClass("ok");
    }
    if (this.type === 'confirm') {
      $("#" + this.id + " .modal").addClass("confirm");
    }
    if (this.type === 'apply') {
      $("#" + this.id + " .modal").addClass("apply");
    }
    if (this.type === 'image') {
      $("#" + this.id + " .modal").addClass("image").append('<img src="' + this.image + '">');
    }
    $("#" + this.id + " h4").html(this.title);
    $("#" + this.id + " .modal-body").html(this.text);
    return $("#" + this.id + " .apply").on("click", (function(_this) {
      return function() {
        return _this.onapplypressed($("#" + _this.id));
      };
    })(this));
  };

  Modal.prototype.show = function(callback) {
    var hideModal;
    setTimeout((function(_this) {
      return function() {
        $("#" + _this.id).addClass("show");
        return $("#" + _this.id + " .modal").addClass("show");
      };
    })(this), 10);
    hideModal = (function(_this) {
      return function() {
        $("#" + _this.id + " .yes").off("click");
        $("#" + _this.id + " .no").off("click");
        $("#" + _this.id + " .btn.ok").off("click");
        $("#" + _this.id + " .close").off("click");
        $("#" + _this.id + " .cancel").off("click");
        $("#" + _this.id + " .modal").removeClass("show");
        return setTimeout(function() {
          return $("#" + _this.id).removeClass("show");
        }, 200);
      };
    })(this);
    $("#" + this.id + " .cancel, " + "#" + this.id + " .no").on("click", (function(_this) {
      return function() {
        hideModal();
        return setTimeout(function() {
          return callback(false, $("#" + _this.id));
        }, 200);
      };
    })(this));
    $("#" + this.id + " .yes, " + "#" + this.id + " .ok").on("click", (function(_this) {
      return function() {
        hideModal();
        return setTimeout(function() {
          return callback(true, $("#" + _this.id));
        }, 200);
      };
    })(this));
    return $("#" + this.id + " .close").on("click", (function(_this) {
      return function() {
        return hideModal();
      };
    })(this));
  };

  return Modal;

})();

window.Modal = Modal;
