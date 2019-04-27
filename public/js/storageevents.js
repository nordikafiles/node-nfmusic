var StorageEvents,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

StorageEvents = (function() {
  function StorageEvents() {
    this.__trigger = bind(this.__trigger, this);
    this.trigger = bind(this.trigger, this);
    this.on = bind(this.on, this);
  }

  StorageEvents.prototype.events = [];

  StorageEvents.prototype.on = function(eventNames, func) {
    var eventName, i, len, ref, results;
    ref = eventNames.split(",");
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      eventName = ref[i];
      if (this.events[eventName] === void 0) {
        this.events[eventName] = [];
      }
      results.push(this.events[eventName].push(func));
    }
    return results;
  };

  StorageEvents.prototype.trigger = function(eventName, args) {
    return localStorage.setItem("__StorageEvent__" + eventName, JSON.stringify({
      key: Math.random(),
      content: args
    }));
  };

  StorageEvents.prototype.__trigger = function(eventName, args, th) {
    var func, i, len, ref, results;
    if (this.events[eventName] !== void 0) {
      ref = this.events[eventName];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        func = ref[i];
        results.push(func.call(th, args));
      }
      return results;
    }
  };

  return StorageEvents;

})();

StorageEvents = new StorageEvents;

window.addEventListener('storage', function(e) {
  return StorageEvents.__trigger(e.key.slice(16), JSON.parse(e.newValue).content, {});
});

window.StorageEvents = StorageEvents;
