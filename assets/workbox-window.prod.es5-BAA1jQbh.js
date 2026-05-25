try {
  self["workbox:window:7.4.0"] && _();
} catch (n2) {
}
function n(n2, t2) {
  return new Promise((function(r2) {
    var e2 = new MessageChannel();
    e2.port1.onmessage = function(n3) {
      r2(n3.data);
    }, n2.postMessage(t2, [e2.port2]);
  }));
}
function t(n2, t2) {
  (null == t2 || t2 > n2.length) && (t2 = n2.length);
  for (var r2 = 0, e2 = Array(t2); r2 < t2; r2++) e2[r2] = n2[r2];
  return e2;
}
function r(n2, t2, r2) {
  return t2 && (function(n3, t3) {
    for (var r3 = 0; r3 < t3.length; r3++) {
      var e2 = t3[r3];
      e2.enumerable = e2.enumerable || false, e2.configurable = true, "value" in e2 && (e2.writable = true), Object.defineProperty(n3, o(e2.key), e2);
    }
  })(n2.prototype, t2), Object.defineProperty(n2, "prototype", { writable: false }), n2;
}
function e(n2, r2) {
  var e2 = "undefined" != typeof Symbol && n2[Symbol.iterator] || n2["@@iterator"];
  if (e2) return (e2 = e2.call(n2)).next.bind(e2);
  if (Array.isArray(n2) || (e2 = (function(n3, r3) {
    if (n3) {
      if ("string" == typeof n3) return t(n3, r3);
      var e3 = {}.toString.call(n3).slice(8, -1);
      return "Object" === e3 && n3.constructor && (e3 = n3.constructor.name), "Map" === e3 || "Set" === e3 ? Array.from(n3) : "Arguments" === e3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e3) ? t(n3, r3) : void 0;
    }
  })(n2)) || r2) {
    e2 && (n2 = e2);
    var i2 = 0;
    return function() {
      return i2 >= n2.length ? { done: true } : { done: false, value: n2[i2++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function i(n2, t2) {
  return i = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(n3, t3) {
    return n3.__proto__ = t3, n3;
  }, i(n2, t2);
}
function o(n2) {
  var t2 = (function(n3, t3) {
    if ("object" != typeof n3 || !n3) return n3;
    var r2 = n3[Symbol.toPrimitive];
    if (void 0 !== r2) {
      var e2 = r2.call(n3, t3);
      if ("object" != typeof e2) return e2;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(n3);
  })(n2, "string");
  return "symbol" == typeof t2 ? t2 : t2 + "";
}
try {
  self["workbox:core:7.4.0"] && _();
} catch (n2) {
}
var u = function() {
  var n2 = this;
  this.promise = new Promise((function(t2, r2) {
    n2.resolve = t2, n2.reject = r2;
  }));
};
function a(n2, t2) {
  var r2 = location.href;
  return new URL(n2, r2).href === new URL(t2, r2).href;
}
var c = function(n2, t2) {
  this.type = n2, Object.assign(this, t2);
};
function f(n2, t2, r2) {
  return n2 && n2.then || (n2 = Promise.resolve(n2)), t2 ? n2.then(t2) : n2;
}
function s() {
}
var v = { type: "SKIP_WAITING" };
function h(n2, t2) {
  return n2 && n2.then ? n2.then(s) : Promise.resolve();
}
var l = (function(t2) {
  function e2(n2, r2) {
    var e3, i2;
    return void 0 === r2 && (r2 = {}), (e3 = t2.call(this) || this).nn = {}, e3.tn = 0, e3.rn = new u(), e3.en = new u(), e3.on = new u(), e3.un = 0, e3.an = /* @__PURE__ */ new Set(), e3.cn = function() {
      var n3 = e3.fn, t3 = n3.installing;
      e3.tn > 0 || !a(t3.scriptURL, e3.sn.toString()) || performance.now() > e3.un + 6e4 ? (e3.vn = t3, n3.removeEventListener("updatefound", e3.cn)) : (e3.hn = t3, e3.an.add(t3), e3.rn.resolve(t3)), ++e3.tn, t3.addEventListener("statechange", e3.ln);
    }, e3.ln = function(n3) {
      var t3 = e3.fn, r3 = n3.target, i3 = r3.state, o3 = r3 === e3.vn, u2 = { sw: r3, isExternal: o3, originalEvent: n3 };
      !o3 && e3.mn && (u2.isUpdate = true), e3.dispatchEvent(new c(i3, u2)), "installed" === i3 ? e3.wn = self.setTimeout((function() {
        "installed" === i3 && t3.waiting === r3 && e3.dispatchEvent(new c("waiting", u2));
      }), 200) : "activating" === i3 && (clearTimeout(e3.wn), o3 || e3.en.resolve(r3));
    }, e3.yn = function(n3) {
      var t3 = e3.hn, r3 = t3 !== navigator.serviceWorker.controller;
      e3.dispatchEvent(new c("controlling", { isExternal: r3, originalEvent: n3, sw: t3, isUpdate: e3.mn })), r3 || e3.on.resolve(t3);
    }, e3.gn = (i2 = function(n3) {
      var t3 = n3.data, r3 = n3.ports, i3 = n3.source;
      return f(e3.getSW(), (function() {
        e3.an.has(i3) && e3.dispatchEvent(new c("message", { data: t3, originalEvent: n3, ports: r3, sw: i3 }));
      }));
    }, function() {
      for (var n3 = [], t3 = 0; t3 < arguments.length; t3++) n3[t3] = arguments[t3];
      try {
        return Promise.resolve(i2.apply(this, n3));
      } catch (n4) {
        return Promise.reject(n4);
      }
    }), e3.sn = n2, e3.nn = r2, navigator.serviceWorker.addEventListener("message", e3.gn), e3;
  }
  var o2, s2;
  s2 = t2, (o2 = e2).prototype = Object.create(s2.prototype), o2.prototype.constructor = o2, i(o2, s2);
  var l2 = e2.prototype;
  return l2.register = function(n2) {
    var t3 = (void 0 === n2 ? {} : n2).immediate, r2 = void 0 !== t3 && t3;
    try {
      var e3 = this;
      return f((function(n3, t4) {
        var r3 = n3();
        if (r3 && r3.then) return r3.then(t4);
        return t4(r3);
      })((function() {
        if (!r2 && "complete" !== document.readyState) return h(new Promise((function(n3) {
          return window.addEventListener("load", n3);
        })));
      }), (function() {
        return e3.mn = Boolean(navigator.serviceWorker.controller), e3.dn = e3.pn(), f(e3.bn(), (function(n3) {
          e3.fn = n3, e3.dn && (e3.hn = e3.dn, e3.en.resolve(e3.dn), e3.on.resolve(e3.dn), e3.dn.addEventListener("statechange", e3.ln, { once: true }));
          var t4 = e3.fn.waiting;
          return t4 && a(t4.scriptURL, e3.sn.toString()) && (e3.hn = t4, Promise.resolve().then((function() {
            e3.dispatchEvent(new c("waiting", { sw: t4, wasWaitingBeforeRegister: true }));
          })).then((function() {
          }))), e3.hn && (e3.rn.resolve(e3.hn), e3.an.add(e3.hn)), e3.fn.addEventListener("updatefound", e3.cn), navigator.serviceWorker.addEventListener("controllerchange", e3.yn), e3.fn;
        }));
      })));
    } catch (n3) {
      return Promise.reject(n3);
    }
  }, l2.update = function() {
    try {
      return this.fn ? f(h(this.fn.update())) : f();
    } catch (n2) {
      return Promise.reject(n2);
    }
  }, l2.getSW = function() {
    return void 0 !== this.hn ? Promise.resolve(this.hn) : this.rn.promise;
  }, l2.messageSW = function(t3) {
    try {
      return f(this.getSW(), (function(r2) {
        return n(r2, t3);
      }));
    } catch (n2) {
      return Promise.reject(n2);
    }
  }, l2.messageSkipWaiting = function() {
    this.fn && this.fn.waiting && n(this.fn.waiting, v);
  }, l2.pn = function() {
    var n2 = navigator.serviceWorker.controller;
    return n2 && a(n2.scriptURL, this.sn.toString()) ? n2 : void 0;
  }, l2.bn = function() {
    try {
      var n2 = this;
      return f((function(n3, t3) {
        try {
          var r2 = n3();
        } catch (n4) {
          return t3(n4);
        }
        if (r2 && r2.then) return r2.then(void 0, t3);
        return r2;
      })((function() {
        return f(navigator.serviceWorker.register(n2.sn, n2.nn), (function(t3) {
          return n2.un = performance.now(), t3;
        }));
      }), (function(n3) {
        throw n3;
      })));
    } catch (n3) {
      return Promise.reject(n3);
    }
  }, r(e2, [{ key: "active", get: function() {
    return this.en.promise;
  } }, { key: "controlling", get: function() {
    return this.on.promise;
  } }]);
})((function() {
  function n2() {
    this.Pn = /* @__PURE__ */ new Map();
  }
  var t2 = n2.prototype;
  return t2.addEventListener = function(n3, t3) {
    this.jn(n3).add(t3);
  }, t2.removeEventListener = function(n3, t3) {
    this.jn(n3).delete(t3);
  }, t2.dispatchEvent = function(n3) {
    n3.target = this;
    for (var t3, r2 = e(this.jn(n3.type)); !(t3 = r2()).done; ) {
      (0, t3.value)(n3);
    }
  }, t2.jn = function(n3) {
    return this.Pn.has(n3) || this.Pn.set(n3, /* @__PURE__ */ new Set()), this.Pn.get(n3);
  }, n2;
})());
export {
  l as Workbox,
  c as WorkboxEvent,
  n as messageSW
};
//# sourceMappingURL=workbox-window.prod.es5-BAA1jQbh.js.map
