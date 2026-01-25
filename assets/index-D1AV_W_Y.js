(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production;
function requireReactJsxRuntime_production() {
  if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
  hasRequiredReactJsxRuntime_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  function jsxProd(type, config, maybeKey) {
    var key = null;
    void 0 !== maybeKey && (key = "" + maybeKey);
    void 0 !== config.key && (key = "" + config.key);
    if ("key" in config) {
      maybeKey = {};
      for (var propName in config)
        "key" !== propName && (maybeKey[propName] = config[propName]);
    } else maybeKey = config;
    config = maybeKey.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== config ? config : null,
      props: maybeKey
    };
  }
  reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
  reactJsxRuntime_production.jsx = jsxProd;
  reactJsxRuntime_production.jsxs = jsxProd;
  return reactJsxRuntime_production;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  {
    jsxRuntime.exports = requireReactJsxRuntime_production();
  }
  return jsxRuntime.exports;
}
var jsxRuntimeExports = requireJsxRuntime();
var react = { exports: {} };
var react_production = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReact_production;
function requireReact_production() {
  if (hasRequiredReact_production) return react_production;
  hasRequiredReact_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var ReactNoopUpdateQueue = {
    isMounted: function() {
      return false;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, assign = Object.assign, emptyObject = {};
  function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  Component.prototype.isReactComponent = {};
  Component.prototype.setState = function(partialState, callback) {
    if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, partialState, callback, "setState");
  };
  Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  };
  function ComponentDummy() {
  }
  ComponentDummy.prototype = Component.prototype;
  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
  pureComponentPrototype.constructor = PureComponent;
  assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;
  var isArrayImpl = Array.isArray;
  function noop() {
  }
  var ReactSharedInternals = { H: null, A: null, T: null, S: null }, hasOwnProperty = Object.prototype.hasOwnProperty;
  function ReactElement(type, key, props) {
    var refProp = props.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== refProp ? refProp : null,
      props
    };
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    return ReactElement(oldElement.type, newKey, oldElement.props);
  }
  function isValidElement(object) {
    return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
  }
  function escape(key) {
    var escaperLookup = { "=": "=0", ":": "=2" };
    return "$" + key.replace(/[=:]/g, function(match) {
      return escaperLookup[match];
    });
  }
  var userProvidedKeyEscapeRegex = /\/+/g;
  function getElementKey(element, index) {
    return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
  }
  function resolveThenable(thenable) {
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenable.reason;
      default:
        switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
          function(fulfilledValue) {
            "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
          },
          function(error) {
            "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
          }
        )), thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
        }
    }
    throw thenable;
  }
  function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    var type = typeof children;
    if ("undefined" === type || "boolean" === type) children = null;
    var invokeCallback = false;
    if (null === children) invokeCallback = true;
    else
      switch (type) {
        case "bigint":
        case "string":
        case "number":
          invokeCallback = true;
          break;
        case "object":
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
              break;
            case REACT_LAZY_TYPE:
              return invokeCallback = children._init, mapIntoArray(
                invokeCallback(children._payload),
                array,
                escapedPrefix,
                nameSoFar,
                callback
              );
          }
      }
    if (invokeCallback)
      return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
        return c;
      })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
        callback,
        escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
          userProvidedKeyEscapeRegex,
          "$&/"
        ) + "/") + invokeCallback
      )), array.push(callback)), 1;
    invokeCallback = 0;
    var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
    if (isArrayImpl(children))
      for (var i = 0; i < children.length; i++)
        nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if (i = getIteratorFn(children), "function" === typeof i)
      for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
        nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if ("object" === type) {
      if ("function" === typeof children.then)
        return mapIntoArray(
          resolveThenable(children),
          array,
          escapedPrefix,
          nameSoFar,
          callback
        );
      array = String(children);
      throw Error(
        "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return invokeCallback;
  }
  function mapChildren(children, func, context) {
    if (null == children) return children;
    var result = [], count = 0;
    mapIntoArray(children, result, "", "", function(child) {
      return func.call(context, child, count++);
    });
    return result;
  }
  function lazyInitializer(payload) {
    if (-1 === payload._status) {
      var ctor = payload._result;
      ctor = ctor();
      ctor.then(
        function(moduleObject) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 1, payload._result = moduleObject;
        },
        function(error) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 2, payload._result = error;
        }
      );
      -1 === payload._status && (payload._status = 0, payload._result = ctor);
    }
    if (1 === payload._status) return payload._result.default;
    throw payload._result;
  }
  var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
    if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event)) return;
    } else if ("object" === typeof process && "function" === typeof process.emit) {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  }, Children = {
    map: mapChildren,
    forEach: function(children, forEachFunc, forEachContext) {
      mapChildren(
        children,
        function() {
          forEachFunc.apply(this, arguments);
        },
        forEachContext
      );
    },
    count: function(children) {
      var n = 0;
      mapChildren(children, function() {
        n++;
      });
      return n;
    },
    toArray: function(children) {
      return mapChildren(children, function(child) {
        return child;
      }) || [];
    },
    only: function(children) {
      if (!isValidElement(children))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return children;
    }
  };
  react_production.Activity = REACT_ACTIVITY_TYPE;
  react_production.Children = Children;
  react_production.Component = Component;
  react_production.Fragment = REACT_FRAGMENT_TYPE;
  react_production.Profiler = REACT_PROFILER_TYPE;
  react_production.PureComponent = PureComponent;
  react_production.StrictMode = REACT_STRICT_MODE_TYPE;
  react_production.Suspense = REACT_SUSPENSE_TYPE;
  react_production.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
  react_production.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(size) {
      return ReactSharedInternals.H.useMemoCache(size);
    }
  };
  react_production.cache = function(fn) {
    return function() {
      return fn.apply(null, arguments);
    };
  };
  react_production.cacheSignal = function() {
    return null;
  };
  react_production.cloneElement = function(element, config, children) {
    if (null === element || void 0 === element)
      throw Error(
        "The argument must be a React element, but you passed " + element + "."
      );
    var props = assign({}, element.props), key = element.key;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
    var propName = arguments.length - 2;
    if (1 === propName) props.children = children;
    else if (1 < propName) {
      for (var childArray = Array(propName), i = 0; i < propName; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    return ReactElement(element.type, key, props);
  };
  react_production.createContext = function(defaultValue) {
    defaultValue = {
      $$typeof: REACT_CONTEXT_TYPE,
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    };
    defaultValue.Provider = defaultValue;
    defaultValue.Consumer = {
      $$typeof: REACT_CONSUMER_TYPE,
      _context: defaultValue
    };
    return defaultValue;
  };
  react_production.createElement = function(type, config, children) {
    var propName, props = {}, key = null;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) props.children = children;
    else if (1 < childrenLength) {
      for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    if (type && type.defaultProps)
      for (propName in childrenLength = type.defaultProps, childrenLength)
        void 0 === props[propName] && (props[propName] = childrenLength[propName]);
    return ReactElement(type, key, props);
  };
  react_production.createRef = function() {
    return { current: null };
  };
  react_production.forwardRef = function(render) {
    return { $$typeof: REACT_FORWARD_REF_TYPE, render };
  };
  react_production.isValidElement = isValidElement;
  react_production.lazy = function(ctor) {
    return {
      $$typeof: REACT_LAZY_TYPE,
      _payload: { _status: -1, _result: ctor },
      _init: lazyInitializer
    };
  };
  react_production.memo = function(type, compare) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: void 0 === compare ? null : compare
    };
  };
  react_production.startTransition = function(scope) {
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    try {
      var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
      "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
    } catch (error) {
      reportGlobalError(error);
    } finally {
      null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
    }
  };
  react_production.unstable_useCacheRefresh = function() {
    return ReactSharedInternals.H.useCacheRefresh();
  };
  react_production.use = function(usable) {
    return ReactSharedInternals.H.use(usable);
  };
  react_production.useActionState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useActionState(action, initialState, permalink);
  };
  react_production.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
  };
  react_production.useContext = function(Context) {
    return ReactSharedInternals.H.useContext(Context);
  };
  react_production.useDebugValue = function() {
  };
  react_production.useDeferredValue = function(value, initialValue) {
    return ReactSharedInternals.H.useDeferredValue(value, initialValue);
  };
  react_production.useEffect = function(create, deps) {
    return ReactSharedInternals.H.useEffect(create, deps);
  };
  react_production.useEffectEvent = function(callback) {
    return ReactSharedInternals.H.useEffectEvent(callback);
  };
  react_production.useId = function() {
    return ReactSharedInternals.H.useId();
  };
  react_production.useImperativeHandle = function(ref, create, deps) {
    return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
  };
  react_production.useInsertionEffect = function(create, deps) {
    return ReactSharedInternals.H.useInsertionEffect(create, deps);
  };
  react_production.useLayoutEffect = function(create, deps) {
    return ReactSharedInternals.H.useLayoutEffect(create, deps);
  };
  react_production.useMemo = function(create, deps) {
    return ReactSharedInternals.H.useMemo(create, deps);
  };
  react_production.useOptimistic = function(passthrough, reducer) {
    return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
  };
  react_production.useReducer = function(reducer, initialArg, init) {
    return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
  };
  react_production.useRef = function(initialValue) {
    return ReactSharedInternals.H.useRef(initialValue);
  };
  react_production.useState = function(initialState) {
    return ReactSharedInternals.H.useState(initialState);
  };
  react_production.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
    return ReactSharedInternals.H.useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );
  };
  react_production.useTransition = function() {
    return ReactSharedInternals.H.useTransition();
  };
  react_production.version = "19.2.0";
  return react_production;
}
var hasRequiredReact;
function requireReact() {
  if (hasRequiredReact) return react.exports;
  hasRequiredReact = 1;
  {
    react.exports = requireReact_production();
  }
  return react.exports;
}
var reactExports = requireReact();
const React = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
var client = { exports: {} };
var reactDomClient_production = {};
var scheduler = { exports: {} };
var scheduler_production = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredScheduler_production;
function requireScheduler_production() {
  if (hasRequiredScheduler_production) return scheduler_production;
  hasRequiredScheduler_production = 1;
  (function(exports) {
    function push(heap, node) {
      var index = heap.length;
      heap.push(node);
      a: for (; 0 < index; ) {
        var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
        if (0 < compare(parent, node))
          heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
        else break a;
      }
    }
    function peek(heap) {
      return 0 === heap.length ? null : heap[0];
    }
    function pop(heap) {
      if (0 === heap.length) return null;
      var first = heap[0], last = heap.pop();
      if (last !== first) {
        heap[0] = last;
        a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength; ) {
          var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
          if (0 > compare(left, last))
            rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
          else if (rightIndex < length && 0 > compare(right, last))
            heap[index] = right, heap[rightIndex] = last, index = rightIndex;
          else break a;
        }
      }
      return first;
    }
    function compare(a, b) {
      var diff = a.sortIndex - b.sortIndex;
      return 0 !== diff ? diff : a.id - b.id;
    }
    exports.unstable_now = void 0;
    if ("object" === typeof performance && "function" === typeof performance.now) {
      var localPerformance = performance;
      exports.unstable_now = function() {
        return localPerformance.now();
      };
    } else {
      var localDate = Date, initialTime = localDate.now();
      exports.unstable_now = function() {
        return localDate.now() - initialTime;
      };
    }
    var taskQueue = [], timerQueue = [], taskIdCounter = 1, currentTask = null, currentPriorityLevel = 3, isPerformingWork = false, isHostCallbackScheduled = false, isHostTimeoutScheduled = false, needsPaint = false, localSetTimeout = "function" === typeof setTimeout ? setTimeout : null, localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null, localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
    function advanceTimers(currentTime) {
      for (var timer = peek(timerQueue); null !== timer; ) {
        if (null === timer.callback) pop(timerQueue);
        else if (timer.startTime <= currentTime)
          pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
        else break;
        timer = peek(timerQueue);
      }
    }
    function handleTimeout(currentTime) {
      isHostTimeoutScheduled = false;
      advanceTimers(currentTime);
      if (!isHostCallbackScheduled)
        if (null !== peek(taskQueue))
          isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline());
        else {
          var firstTimer = peek(timerQueue);
          null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
    }
    var isMessageLoopRunning = false, taskTimeoutID = -1, frameInterval = 5, startTime = -1;
    function shouldYieldToHost() {
      return needsPaint ? true : exports.unstable_now() - startTime < frameInterval ? false : true;
    }
    function performWorkUntilDeadline() {
      needsPaint = false;
      if (isMessageLoopRunning) {
        var currentTime = exports.unstable_now();
        startTime = currentTime;
        var hasMoreWork = true;
        try {
          a: {
            isHostCallbackScheduled = false;
            isHostTimeoutScheduled && (isHostTimeoutScheduled = false, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
            isPerformingWork = true;
            var previousPriorityLevel = currentPriorityLevel;
            try {
              b: {
                advanceTimers(currentTime);
                for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost()); ) {
                  var callback = currentTask.callback;
                  if ("function" === typeof callback) {
                    currentTask.callback = null;
                    currentPriorityLevel = currentTask.priorityLevel;
                    var continuationCallback = callback(
                      currentTask.expirationTime <= currentTime
                    );
                    currentTime = exports.unstable_now();
                    if ("function" === typeof continuationCallback) {
                      currentTask.callback = continuationCallback;
                      advanceTimers(currentTime);
                      hasMoreWork = true;
                      break b;
                    }
                    currentTask === peek(taskQueue) && pop(taskQueue);
                    advanceTimers(currentTime);
                  } else pop(taskQueue);
                  currentTask = peek(taskQueue);
                }
                if (null !== currentTask) hasMoreWork = true;
                else {
                  var firstTimer = peek(timerQueue);
                  null !== firstTimer && requestHostTimeout(
                    handleTimeout,
                    firstTimer.startTime - currentTime
                  );
                  hasMoreWork = false;
                }
              }
              break a;
            } finally {
              currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = false;
            }
            hasMoreWork = void 0;
          }
        } finally {
          hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = false;
        }
      }
    }
    var schedulePerformWorkUntilDeadline;
    if ("function" === typeof localSetImmediate)
      schedulePerformWorkUntilDeadline = function() {
        localSetImmediate(performWorkUntilDeadline);
      };
    else if ("undefined" !== typeof MessageChannel) {
      var channel = new MessageChannel(), port = channel.port2;
      channel.port1.onmessage = performWorkUntilDeadline;
      schedulePerformWorkUntilDeadline = function() {
        port.postMessage(null);
      };
    } else
      schedulePerformWorkUntilDeadline = function() {
        localSetTimeout(performWorkUntilDeadline, 0);
      };
    function requestHostTimeout(callback, ms) {
      taskTimeoutID = localSetTimeout(function() {
        callback(exports.unstable_now());
      }, ms);
    }
    exports.unstable_IdlePriority = 5;
    exports.unstable_ImmediatePriority = 1;
    exports.unstable_LowPriority = 4;
    exports.unstable_NormalPriority = 3;
    exports.unstable_Profiling = null;
    exports.unstable_UserBlockingPriority = 2;
    exports.unstable_cancelCallback = function(task) {
      task.callback = null;
    };
    exports.unstable_forceFrameRate = function(fps) {
      0 > fps || 125 < fps ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
    };
    exports.unstable_getCurrentPriorityLevel = function() {
      return currentPriorityLevel;
    };
    exports.unstable_next = function(eventHandler) {
      switch (currentPriorityLevel) {
        case 1:
        case 2:
        case 3:
          var priorityLevel = 3;
          break;
        default:
          priorityLevel = currentPriorityLevel;
      }
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;
      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
    exports.unstable_requestPaint = function() {
      needsPaint = true;
    };
    exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
      switch (priorityLevel) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          priorityLevel = 3;
      }
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;
      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
    exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
      var currentTime = exports.unstable_now();
      "object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
      switch (priorityLevel) {
        case 1:
          var timeout = -1;
          break;
        case 2:
          timeout = 250;
          break;
        case 5:
          timeout = 1073741823;
          break;
        case 4:
          timeout = 1e4;
          break;
        default:
          timeout = 5e3;
      }
      timeout = options + timeout;
      priorityLevel = {
        id: taskIdCounter++,
        callback,
        priorityLevel,
        startTime: options,
        expirationTime: timeout,
        sortIndex: -1
      };
      options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = true, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline())));
      return priorityLevel;
    };
    exports.unstable_shouldYield = shouldYieldToHost;
    exports.unstable_wrapCallback = function(callback) {
      var parentPriorityLevel = currentPriorityLevel;
      return function() {
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = parentPriorityLevel;
        try {
          return callback.apply(this, arguments);
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      };
    };
  })(scheduler_production);
  return scheduler_production;
}
var hasRequiredScheduler;
function requireScheduler() {
  if (hasRequiredScheduler) return scheduler.exports;
  hasRequiredScheduler = 1;
  {
    scheduler.exports = requireScheduler_production();
  }
  return scheduler.exports;
}
var reactDom = { exports: {} };
var reactDom_production = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactDom_production;
function requireReactDom_production() {
  if (hasRequiredReactDom_production) return reactDom_production;
  hasRequiredReactDom_production = 1;
  var React2 = requireReact();
  function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
      url += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2; i < arguments.length; i++)
        url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function noop() {
  }
  var Internals = {
    d: {
      f: noop,
      r: function() {
        throw Error(formatProdErrorMessage(522));
      },
      D: noop,
      C: noop,
      L: noop,
      m: noop,
      X: noop,
      S: noop,
      M: noop
    },
    p: 0,
    findDOMNode: null
  }, REACT_PORTAL_TYPE = Symbol.for("react.portal");
  function createPortal$1(children, containerInfo, implementation) {
    var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
    return {
      $$typeof: REACT_PORTAL_TYPE,
      key: null == key ? null : "" + key,
      children,
      containerInfo,
      implementation
    };
  }
  var ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function getCrossOriginStringAs(as, input) {
    if ("font" === as) return "";
    if ("string" === typeof input)
      return "use-credentials" === input ? input : "";
  }
  reactDom_production.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
  reactDom_production.createPortal = function(children, container) {
    var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
    if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType)
      throw Error(formatProdErrorMessage(299));
    return createPortal$1(children, container, null, key);
  };
  reactDom_production.flushSync = function(fn) {
    var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
    try {
      if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
    } finally {
      ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
    }
  };
  reactDom_production.preconnect = function(href, options) {
    "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
  };
  reactDom_production.prefetchDNS = function(href) {
    "string" === typeof href && Internals.d.D(href);
  };
  reactDom_production.preinit = function(href, options) {
    if ("string" === typeof href && options && "string" === typeof options.as) {
      var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
      "style" === as ? Internals.d.S(
        href,
        "string" === typeof options.precedence ? options.precedence : void 0,
        {
          crossOrigin,
          integrity,
          fetchPriority
        }
      ) : "script" === as && Internals.d.X(href, {
        crossOrigin,
        integrity,
        fetchPriority,
        nonce: "string" === typeof options.nonce ? options.nonce : void 0
      });
    }
  };
  reactDom_production.preinitModule = function(href, options) {
    if ("string" === typeof href)
      if ("object" === typeof options && null !== options) {
        if (null == options.as || "script" === options.as) {
          var crossOrigin = getCrossOriginStringAs(
            options.as,
            options.crossOrigin
          );
          Internals.d.M(href, {
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
          });
        }
      } else null == options && Internals.d.M(href);
  };
  reactDom_production.preload = function(href, options) {
    if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
      var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
      Internals.d.L(href, as, {
        crossOrigin,
        integrity: "string" === typeof options.integrity ? options.integrity : void 0,
        nonce: "string" === typeof options.nonce ? options.nonce : void 0,
        type: "string" === typeof options.type ? options.type : void 0,
        fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
        referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
        imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
        imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
        media: "string" === typeof options.media ? options.media : void 0
      });
    }
  };
  reactDom_production.preloadModule = function(href, options) {
    if ("string" === typeof href)
      if (options) {
        var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d.m(href, {
          as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
          crossOrigin,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0
        });
      } else Internals.d.m(href);
  };
  reactDom_production.requestFormReset = function(form) {
    Internals.d.r(form);
  };
  reactDom_production.unstable_batchedUpdates = function(fn, a) {
    return fn(a);
  };
  reactDom_production.useFormState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useFormState(action, initialState, permalink);
  };
  reactDom_production.useFormStatus = function() {
    return ReactSharedInternals.H.useHostTransitionStatus();
  };
  reactDom_production.version = "19.2.0";
  return reactDom_production;
}
var hasRequiredReactDom;
function requireReactDom() {
  if (hasRequiredReactDom) return reactDom.exports;
  hasRequiredReactDom = 1;
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  {
    checkDCE();
    reactDom.exports = requireReactDom_production();
  }
  return reactDom.exports;
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactDomClient_production;
function requireReactDomClient_production() {
  if (hasRequiredReactDomClient_production) return reactDomClient_production;
  hasRequiredReactDomClient_production = 1;
  var Scheduler = requireScheduler(), React2 = requireReact(), ReactDOM = requireReactDom();
  function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
      url += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2; i < arguments.length; i++)
        url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function isValidContainer(node) {
    return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
  }
  function getNearestMountedFiber(fiber) {
    var node = fiber, nearestMounted = fiber;
    if (fiber.alternate) for (; node.return; ) node = node.return;
    else {
      fiber = node;
      do
        node = fiber, 0 !== (node.flags & 4098) && (nearestMounted = node.return), fiber = node.return;
      while (fiber);
    }
    return 3 === node.tag ? nearestMounted : null;
  }
  function getSuspenseInstanceFromFiber(fiber) {
    if (13 === fiber.tag) {
      var suspenseState = fiber.memoizedState;
      null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
      if (null !== suspenseState) return suspenseState.dehydrated;
    }
    return null;
  }
  function getActivityInstanceFromFiber(fiber) {
    if (31 === fiber.tag) {
      var activityState = fiber.memoizedState;
      null === activityState && (fiber = fiber.alternate, null !== fiber && (activityState = fiber.memoizedState));
      if (null !== activityState) return activityState.dehydrated;
    }
    return null;
  }
  function assertIsMounted(fiber) {
    if (getNearestMountedFiber(fiber) !== fiber)
      throw Error(formatProdErrorMessage(188));
  }
  function findCurrentFiberUsingSlowPath(fiber) {
    var alternate = fiber.alternate;
    if (!alternate) {
      alternate = getNearestMountedFiber(fiber);
      if (null === alternate) throw Error(formatProdErrorMessage(188));
      return alternate !== fiber ? null : fiber;
    }
    for (var a = fiber, b = alternate; ; ) {
      var parentA = a.return;
      if (null === parentA) break;
      var parentB = parentA.alternate;
      if (null === parentB) {
        b = parentA.return;
        if (null !== b) {
          a = b;
          continue;
        }
        break;
      }
      if (parentA.child === parentB.child) {
        for (parentB = parentA.child; parentB; ) {
          if (parentB === a) return assertIsMounted(parentA), fiber;
          if (parentB === b) return assertIsMounted(parentA), alternate;
          parentB = parentB.sibling;
        }
        throw Error(formatProdErrorMessage(188));
      }
      if (a.return !== b.return) a = parentA, b = parentB;
      else {
        for (var didFindChild = false, child$0 = parentA.child; child$0; ) {
          if (child$0 === a) {
            didFindChild = true;
            a = parentA;
            b = parentB;
            break;
          }
          if (child$0 === b) {
            didFindChild = true;
            b = parentA;
            a = parentB;
            break;
          }
          child$0 = child$0.sibling;
        }
        if (!didFindChild) {
          for (child$0 = parentB.child; child$0; ) {
            if (child$0 === a) {
              didFindChild = true;
              a = parentB;
              b = parentA;
              break;
            }
            if (child$0 === b) {
              didFindChild = true;
              b = parentB;
              a = parentA;
              break;
            }
            child$0 = child$0.sibling;
          }
          if (!didFindChild) throw Error(formatProdErrorMessage(189));
        }
      }
      if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
    }
    if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
    return a.stateNode.current === a ? fiber : alternate;
  }
  function findCurrentHostFiberImpl(node) {
    var tag = node.tag;
    if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
    for (node = node.child; null !== node; ) {
      tag = findCurrentHostFiberImpl(node);
      if (null !== tag) return tag;
      node = node.sibling;
    }
    return null;
  }
  var assign = Object.assign, REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy");
  var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
  var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
  var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
  function getComponentNameFromType(type) {
    if (null == type) return null;
    if ("function" === typeof type)
      return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
    if ("string" === typeof type) return type;
    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return "Fragment";
      case REACT_PROFILER_TYPE:
        return "Profiler";
      case REACT_STRICT_MODE_TYPE:
        return "StrictMode";
      case REACT_SUSPENSE_TYPE:
        return "Suspense";
      case REACT_SUSPENSE_LIST_TYPE:
        return "SuspenseList";
      case REACT_ACTIVITY_TYPE:
        return "Activity";
    }
    if ("object" === typeof type)
      switch (type.$$typeof) {
        case REACT_PORTAL_TYPE:
          return "Portal";
        case REACT_CONTEXT_TYPE:
          return type.displayName || "Context";
        case REACT_CONSUMER_TYPE:
          return (type._context.displayName || "Context") + ".Consumer";
        case REACT_FORWARD_REF_TYPE:
          var innerType = type.render;
          type = type.displayName;
          type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
          return type;
        case REACT_MEMO_TYPE:
          return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
        case REACT_LAZY_TYPE:
          innerType = type._payload;
          type = type._init;
          try {
            return getComponentNameFromType(type(innerType));
          } catch (x) {
          }
      }
    return null;
  }
  var isArrayImpl = Array.isArray, ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, sharedNotPendingObject = {
    pending: false,
    data: null,
    method: null,
    action: null
  }, valueStack = [], index = -1;
  function createCursor(defaultValue) {
    return { current: defaultValue };
  }
  function pop(cursor) {
    0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
  }
  function push(cursor, value) {
    index++;
    valueStack[index] = cursor.current;
    cursor.current = value;
  }
  var contextStackCursor = createCursor(null), contextFiberStackCursor = createCursor(null), rootInstanceStackCursor = createCursor(null), hostTransitionProviderCursor = createCursor(null);
  function pushHostContainer(fiber, nextRootInstance) {
    push(rootInstanceStackCursor, nextRootInstance);
    push(contextFiberStackCursor, fiber);
    push(contextStackCursor, null);
    switch (nextRootInstance.nodeType) {
      case 9:
      case 11:
        fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
        break;
      default:
        if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI)
          nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
        else
          switch (fiber) {
            case "svg":
              fiber = 1;
              break;
            case "math":
              fiber = 2;
              break;
            default:
              fiber = 0;
          }
    }
    pop(contextStackCursor);
    push(contextStackCursor, fiber);
  }
  function popHostContainer() {
    pop(contextStackCursor);
    pop(contextFiberStackCursor);
    pop(rootInstanceStackCursor);
  }
  function pushHostContext(fiber) {
    null !== fiber.memoizedState && push(hostTransitionProviderCursor, fiber);
    var context = contextStackCursor.current;
    var JSCompiler_inline_result = getChildHostContextProd(context, fiber.type);
    context !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
  }
  function popHostContext(fiber) {
    contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
    hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
  }
  var prefix, suffix;
  function describeBuiltInComponentFrame(name) {
    if (void 0 === prefix)
      try {
        throw Error();
      } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || "";
        suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return "\n" + prefix + name + suffix;
  }
  var reentry = false;
  function describeNativeComponentFrame(fn, construct) {
    if (!fn || reentry) return "";
    reentry = true;
    var previousPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var RunInRootFrame = {
        DetermineComponentFrameRoot: function() {
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if ("object" === typeof Reflect && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  var control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x$1) {
                  control = x$1;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x$2) {
                control = x$2;
              }
              (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {
              });
            }
          } catch (sample) {
            if (sample && control && "string" === typeof sample.stack)
              return [sample.stack, control.stack];
          }
          return [null, null];
        }
      };
      RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var namePropDescriptor = Object.getOwnPropertyDescriptor(
        RunInRootFrame.DetermineComponentFrameRoot,
        "name"
      );
      namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(
        RunInRootFrame.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
      if (sampleStack && controlStack) {
        var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
        for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot"); )
          RunInRootFrame++;
        for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes(
          "DetermineComponentFrameRoot"
        ); )
          namePropDescriptor++;
        if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
          for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]; )
            namePropDescriptor--;
        for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)
          if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
            if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
              do
                if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                  var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                  fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                  return frame;
                }
              while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
            }
            break;
          }
      }
    } finally {
      reentry = false, Error.prepareStackTrace = previousPrepareStackTrace;
    }
    return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
  }
  function describeFiber(fiber, childFiber) {
    switch (fiber.tag) {
      case 26:
      case 27:
      case 5:
        return describeBuiltInComponentFrame(fiber.type);
      case 16:
        return describeBuiltInComponentFrame("Lazy");
      case 13:
        return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
      case 19:
        return describeBuiltInComponentFrame("SuspenseList");
      case 0:
      case 15:
        return describeNativeComponentFrame(fiber.type, false);
      case 11:
        return describeNativeComponentFrame(fiber.type.render, false);
      case 1:
        return describeNativeComponentFrame(fiber.type, true);
      case 31:
        return describeBuiltInComponentFrame("Activity");
      default:
        return "";
    }
  }
  function getStackByFiberInDevAndProd(workInProgress2) {
    try {
      var info = "", previous = null;
      do
        info += describeFiber(workInProgress2, previous), previous = workInProgress2, workInProgress2 = workInProgress2.return;
      while (workInProgress2);
      return info;
    } catch (x) {
      return "\nError generating stack: " + x.message + "\n" + x.stack;
    }
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty, scheduleCallback$3 = Scheduler.unstable_scheduleCallback, cancelCallback$1 = Scheduler.unstable_cancelCallback, shouldYield = Scheduler.unstable_shouldYield, requestPaint = Scheduler.unstable_requestPaint, now = Scheduler.unstable_now, getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel, ImmediatePriority = Scheduler.unstable_ImmediatePriority, UserBlockingPriority = Scheduler.unstable_UserBlockingPriority, NormalPriority$1 = Scheduler.unstable_NormalPriority, LowPriority = Scheduler.unstable_LowPriority, IdlePriority = Scheduler.unstable_IdlePriority, log$1 = Scheduler.log, unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue, rendererID = null, injectedHook = null;
  function setIsStrictModeForDevtools(newIsStrictMode) {
    "function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
    if (injectedHook && "function" === typeof injectedHook.setStrictMode)
      try {
        injectedHook.setStrictMode(rendererID, newIsStrictMode);
      } catch (err) {
      }
  }
  var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback, log = Math.log, LN2 = Math.LN2;
  function clz32Fallback(x) {
    x >>>= 0;
    return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
  }
  var nextTransitionUpdateLane = 256, nextTransitionDeferredLane = 262144, nextRetryLane = 4194304;
  function getHighestPriorityLanes(lanes) {
    var pendingSyncLanes = lanes & 42;
    if (0 !== pendingSyncLanes) return pendingSyncLanes;
    switch (lanes & -lanes) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return lanes & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return lanes & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return lanes & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return lanes;
    }
  }
  function getNextLanes(root2, wipLanes, rootHasPendingCommit) {
    var pendingLanes = root2.pendingLanes;
    if (0 === pendingLanes) return 0;
    var nextLanes = 0, suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes;
    root2 = root2.warmLanes;
    var nonIdlePendingLanes = pendingLanes & 134217727;
    0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root2, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root2, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
    return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
  }
  function checkIfRootIsPrerendering(root2, renderLanes2) {
    return 0 === (root2.pendingLanes & ~(root2.suspendedLanes & ~root2.pingedLanes) & renderLanes2);
  }
  function computeExpirationTime(lane, currentTime) {
    switch (lane) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return currentTime + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return currentTime + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function claimNextRetryLane() {
    var lane = nextRetryLane;
    nextRetryLane <<= 1;
    0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
    return lane;
  }
  function createLaneMap(initial) {
    for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
    return laneMap;
  }
  function markRootUpdated$1(root2, updateLane) {
    root2.pendingLanes |= updateLane;
    268435456 !== updateLane && (root2.suspendedLanes = 0, root2.pingedLanes = 0, root2.warmLanes = 0);
  }
  function markRootFinished(root2, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
    var previouslyPendingLanes = root2.pendingLanes;
    root2.pendingLanes = remainingLanes;
    root2.suspendedLanes = 0;
    root2.pingedLanes = 0;
    root2.warmLanes = 0;
    root2.expiredLanes &= remainingLanes;
    root2.entangledLanes &= remainingLanes;
    root2.errorRecoveryDisabledLanes &= remainingLanes;
    root2.shellSuspendCounter = 0;
    var entanglements = root2.entanglements, expirationTimes = root2.expirationTimes, hiddenUpdates = root2.hiddenUpdates;
    for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes; ) {
      var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
      entanglements[index$7] = 0;
      expirationTimes[index$7] = -1;
      var hiddenUpdatesForLane = hiddenUpdates[index$7];
      if (null !== hiddenUpdatesForLane)
        for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
          var update = hiddenUpdatesForLane[index$7];
          null !== update && (update.lane &= -536870913);
        }
      remainingLanes &= ~lane;
    }
    0 !== spawnedLane && markSpawnedDeferredLane(root2, spawnedLane, 0);
    0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root2.tag && (root2.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
  }
  function markSpawnedDeferredLane(root2, spawnedLane, entangledLanes) {
    root2.pendingLanes |= spawnedLane;
    root2.suspendedLanes &= ~spawnedLane;
    var spawnedLaneIndex = 31 - clz32(spawnedLane);
    root2.entangledLanes |= spawnedLane;
    root2.entanglements[spawnedLaneIndex] = root2.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
  }
  function markRootEntangled(root2, entangledLanes) {
    var rootEntangledLanes = root2.entangledLanes |= entangledLanes;
    for (root2 = root2.entanglements; rootEntangledLanes; ) {
      var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
      lane & entangledLanes | root2[index$8] & entangledLanes && (root2[index$8] |= entangledLanes);
      rootEntangledLanes &= ~lane;
    }
  }
  function getBumpedLaneForHydration(root2, renderLanes2) {
    var renderLane = renderLanes2 & -renderLanes2;
    renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
    return 0 !== (renderLane & (root2.suspendedLanes | renderLanes2)) ? 0 : renderLane;
  }
  function getBumpedLaneForHydrationByLane(lane) {
    switch (lane) {
      case 2:
        lane = 1;
        break;
      case 8:
        lane = 4;
        break;
      case 32:
        lane = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        lane = 128;
        break;
      case 268435456:
        lane = 134217728;
        break;
      default:
        lane = 0;
    }
    return lane;
  }
  function lanesToEventPriority(lanes) {
    lanes &= -lanes;
    return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
  }
  function resolveUpdatePriority() {
    var updatePriority = ReactDOMSharedInternals.p;
    if (0 !== updatePriority) return updatePriority;
    updatePriority = window.event;
    return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
  }
  function runWithPriority(priority, fn) {
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      return ReactDOMSharedInternals.p = priority, fn();
    } finally {
      ReactDOMSharedInternals.p = previousPriority;
    }
  }
  var randomKey = Math.random().toString(36).slice(2), internalInstanceKey = "__reactFiber$" + randomKey, internalPropsKey = "__reactProps$" + randomKey, internalContainerInstanceKey = "__reactContainer$" + randomKey, internalEventHandlersKey = "__reactEvents$" + randomKey, internalEventHandlerListenersKey = "__reactListeners$" + randomKey, internalEventHandlesSetKey = "__reactHandles$" + randomKey, internalRootNodeResourcesKey = "__reactResources$" + randomKey, internalHoistableMarker = "__reactMarker$" + randomKey;
  function detachDeletedInstance(node) {
    delete node[internalInstanceKey];
    delete node[internalPropsKey];
    delete node[internalEventHandlersKey];
    delete node[internalEventHandlerListenersKey];
    delete node[internalEventHandlesSetKey];
  }
  function getClosestInstanceFromNode(targetNode) {
    var targetInst = targetNode[internalInstanceKey];
    if (targetInst) return targetInst;
    for (var parentNode = targetNode.parentNode; parentNode; ) {
      if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
        parentNode = targetInst.alternate;
        if (null !== targetInst.child || null !== parentNode && null !== parentNode.child)
          for (targetNode = getParentHydrationBoundary(targetNode); null !== targetNode; ) {
            if (parentNode = targetNode[internalInstanceKey]) return parentNode;
            targetNode = getParentHydrationBoundary(targetNode);
          }
        return targetInst;
      }
      targetNode = parentNode;
      parentNode = targetNode.parentNode;
    }
    return null;
  }
  function getInstanceFromNode(node) {
    if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
      var tag = node.tag;
      if (5 === tag || 6 === tag || 13 === tag || 31 === tag || 26 === tag || 27 === tag || 3 === tag)
        return node;
    }
    return null;
  }
  function getNodeFromInstance(inst) {
    var tag = inst.tag;
    if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
    throw Error(formatProdErrorMessage(33));
  }
  function getResourcesFromRoot(root2) {
    var resources = root2[internalRootNodeResourcesKey];
    resources || (resources = root2[internalRootNodeResourcesKey] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() });
    return resources;
  }
  function markNodeAsHoistable(node) {
    node[internalHoistableMarker] = true;
  }
  var allNativeEvents = /* @__PURE__ */ new Set(), registrationNameDependencies = {};
  function registerTwoPhaseEvent(registrationName, dependencies) {
    registerDirectEvent(registrationName, dependencies);
    registerDirectEvent(registrationName + "Capture", dependencies);
  }
  function registerDirectEvent(registrationName, dependencies) {
    registrationNameDependencies[registrationName] = dependencies;
    for (registrationName = 0; registrationName < dependencies.length; registrationName++)
      allNativeEvents.add(dependencies[registrationName]);
  }
  var VALID_ATTRIBUTE_NAME_REGEX = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), illegalAttributeNameCache = {}, validatedAttributeNameCache = {};
  function isAttributeNameSafe(attributeName) {
    if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
      return true;
    if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return false;
    if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
      return validatedAttributeNameCache[attributeName] = true;
    illegalAttributeNameCache[attributeName] = true;
    return false;
  }
  function setValueForAttribute(node, name, value) {
    if (isAttributeNameSafe(name))
      if (null === value) node.removeAttribute(name);
      else {
        switch (typeof value) {
          case "undefined":
          case "function":
          case "symbol":
            node.removeAttribute(name);
            return;
          case "boolean":
            var prefix$10 = name.toLowerCase().slice(0, 5);
            if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
              node.removeAttribute(name);
              return;
            }
        }
        node.setAttribute(name, "" + value);
      }
  }
  function setValueForKnownAttribute(node, name, value) {
    if (null === value) node.removeAttribute(name);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          node.removeAttribute(name);
          return;
      }
      node.setAttribute(name, "" + value);
    }
  }
  function setValueForNamespacedAttribute(node, namespace, name, value) {
    if (null === value) node.removeAttribute(name);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          node.removeAttribute(name);
          return;
      }
      node.setAttributeNS(namespace, name, "" + value);
    }
  }
  function getToStringValue(value) {
    switch (typeof value) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return value;
      case "object":
        return value;
      default:
        return "";
    }
  }
  function isCheckable(elem) {
    var type = elem.type;
    return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
  }
  function trackValueOnNode(node, valueField, currentValue) {
    var descriptor = Object.getOwnPropertyDescriptor(
      node.constructor.prototype,
      valueField
    );
    if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
      var get = descriptor.get, set = descriptor.set;
      Object.defineProperty(node, valueField, {
        configurable: true,
        get: function() {
          return get.call(this);
        },
        set: function(value) {
          currentValue = "" + value;
          set.call(this, value);
        }
      });
      Object.defineProperty(node, valueField, {
        enumerable: descriptor.enumerable
      });
      return {
        getValue: function() {
          return currentValue;
        },
        setValue: function(value) {
          currentValue = "" + value;
        },
        stopTracking: function() {
          node._valueTracker = null;
          delete node[valueField];
        }
      };
    }
  }
  function track(node) {
    if (!node._valueTracker) {
      var valueField = isCheckable(node) ? "checked" : "value";
      node._valueTracker = trackValueOnNode(
        node,
        valueField,
        "" + node[valueField]
      );
    }
  }
  function updateValueIfChanged(node) {
    if (!node) return false;
    var tracker = node._valueTracker;
    if (!tracker) return true;
    var lastValue = tracker.getValue();
    var value = "";
    node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
    node = value;
    return node !== lastValue ? (tracker.setValue(node), true) : false;
  }
  function getActiveElement(doc) {
    doc = doc || ("undefined" !== typeof document ? document : void 0);
    if ("undefined" === typeof doc) return null;
    try {
      return doc.activeElement || doc.body;
    } catch (e) {
      return doc.body;
    }
  }
  var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
  function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
    return value.replace(
      escapeSelectorAttributeValueInsideDoubleQuotesRegex,
      function(ch) {
        return "\\" + ch.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
    element.name = "";
    null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
    if (null != value)
      if ("number" === type) {
        if (0 === value && "" === element.value || element.value != value)
          element.value = "" + getToStringValue(value);
      } else
        element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
    else
      "submit" !== type && "reset" !== type || element.removeAttribute("value");
    null != value ? setDefaultValue(element, type, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, type, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
    null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
    null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
    null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
  }
  function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating2) {
    null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
    if (null != value || null != defaultValue) {
      if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value)) {
        track(element);
        return;
      }
      defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
      value = null != value ? "" + getToStringValue(value) : defaultValue;
      isHydrating2 || value === element.value || (element.value = value);
      element.defaultValue = value;
    }
    checked = null != checked ? checked : defaultChecked;
    checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
    element.checked = isHydrating2 ? element.checked : !!checked;
    element.defaultChecked = !!checked;
    null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
    track(element);
  }
  function setDefaultValue(node, type, value) {
    "number" === type && getActiveElement(node.ownerDocument) === node || node.defaultValue === "" + value || (node.defaultValue = "" + value);
  }
  function updateOptions(node, multiple, propValue, setDefaultSelected) {
    node = node.options;
    if (multiple) {
      multiple = {};
      for (var i = 0; i < propValue.length; i++)
        multiple["$" + propValue[i]] = true;
      for (propValue = 0; propValue < node.length; propValue++)
        i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = true);
    } else {
      propValue = "" + getToStringValue(propValue);
      multiple = null;
      for (i = 0; i < node.length; i++) {
        if (node[i].value === propValue) {
          node[i].selected = true;
          setDefaultSelected && (node[i].defaultSelected = true);
          return;
        }
        null !== multiple || node[i].disabled || (multiple = node[i]);
      }
      null !== multiple && (multiple.selected = true);
    }
  }
  function updateTextarea(element, value, defaultValue) {
    if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
      element.defaultValue !== value && (element.defaultValue = value);
      return;
    }
    element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
  }
  function initTextarea(element, value, defaultValue, children) {
    if (null == value) {
      if (null != children) {
        if (null != defaultValue) throw Error(formatProdErrorMessage(92));
        if (isArrayImpl(children)) {
          if (1 < children.length) throw Error(formatProdErrorMessage(93));
          children = children[0];
        }
        defaultValue = children;
      }
      null == defaultValue && (defaultValue = "");
      value = defaultValue;
    }
    defaultValue = getToStringValue(value);
    element.defaultValue = defaultValue;
    children = element.textContent;
    children === defaultValue && "" !== children && null !== children && (element.value = children);
    track(element);
  }
  function setTextContent(node, text) {
    if (text) {
      var firstChild = node.firstChild;
      if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
        firstChild.nodeValue = text;
        return;
      }
    }
    node.textContent = text;
  }
  var unitlessNumbers = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function setValueForStyle(style2, styleName, value) {
    var isCustomProperty = 0 === styleName.indexOf("--");
    null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style2.setProperty(styleName, "") : "float" === styleName ? style2.cssFloat = "" : style2[styleName] = "" : isCustomProperty ? style2.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style2.cssFloat = value : style2[styleName] = ("" + value).trim() : style2[styleName] = value + "px";
  }
  function setValueForStyles(node, styles, prevStyles) {
    if (null != styles && "object" !== typeof styles)
      throw Error(formatProdErrorMessage(62));
    node = node.style;
    if (null != prevStyles) {
      for (var styleName in prevStyles)
        !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "");
      for (var styleName$16 in styles)
        styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && setValueForStyle(node, styleName$16, styleName);
    } else
      for (var styleName$17 in styles)
        styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
  }
  function isCustomElement(tagName) {
    if (-1 === tagName.indexOf("-")) return false;
    switch (tagName) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return false;
      default:
        return true;
    }
  }
  var aliases = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function sanitizeURL(url) {
    return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
  }
  function noop$1() {
  }
  var currentReplayingEvent = null;
  function getEventTarget(nativeEvent) {
    nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
    nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
    return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
  }
  var restoreTarget = null, restoreQueue = null;
  function restoreStateOfTarget(target) {
    var internalInstance = getInstanceFromNode(target);
    if (internalInstance && (target = internalInstance.stateNode)) {
      var props = target[internalPropsKey] || null;
      a: switch (target = internalInstance.stateNode, internalInstance.type) {
        case "input":
          updateInput(
            target,
            props.value,
            props.defaultValue,
            props.defaultValue,
            props.checked,
            props.defaultChecked,
            props.type,
            props.name
          );
          internalInstance = props.name;
          if ("radio" === props.type && null != internalInstance) {
            for (props = target; props.parentNode; ) props = props.parentNode;
            props = props.querySelectorAll(
              'input[name="' + escapeSelectorAttributeValueInsideDoubleQuotes(
                "" + internalInstance
              ) + '"][type="radio"]'
            );
            for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
              var otherNode = props[internalInstance];
              if (otherNode !== target && otherNode.form === target.form) {
                var otherProps = otherNode[internalPropsKey] || null;
                if (!otherProps) throw Error(formatProdErrorMessage(90));
                updateInput(
                  otherNode,
                  otherProps.value,
                  otherProps.defaultValue,
                  otherProps.defaultValue,
                  otherProps.checked,
                  otherProps.defaultChecked,
                  otherProps.type,
                  otherProps.name
                );
              }
            }
            for (internalInstance = 0; internalInstance < props.length; internalInstance++)
              otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
          }
          break a;
        case "textarea":
          updateTextarea(target, props.value, props.defaultValue);
          break a;
        case "select":
          internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, false);
      }
    }
  }
  var isInsideEventHandler = false;
  function batchedUpdates$1(fn, a, b) {
    if (isInsideEventHandler) return fn(a, b);
    isInsideEventHandler = true;
    try {
      var JSCompiler_inline_result = fn(a);
      return JSCompiler_inline_result;
    } finally {
      if (isInsideEventHandler = false, null !== restoreTarget || null !== restoreQueue) {
        if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn))
          for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
      }
    }
  }
  function getListener(inst, registrationName) {
    var stateNode = inst.stateNode;
    if (null === stateNode) return null;
    var props = stateNode[internalPropsKey] || null;
    if (null === props) return null;
    stateNode = props[registrationName];
    a: switch (registrationName) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
        inst = !props;
        break a;
      default:
        inst = false;
    }
    if (inst) return null;
    if (stateNode && "function" !== typeof stateNode)
      throw Error(
        formatProdErrorMessage(231, registrationName, typeof stateNode)
      );
    return stateNode;
  }
  var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), passiveBrowserEventsSupported = false;
  if (canUseDOM)
    try {
      var options = {};
      Object.defineProperty(options, "passive", {
        get: function() {
          passiveBrowserEventsSupported = true;
        }
      });
      window.addEventListener("test", options, options);
      window.removeEventListener("test", options, options);
    } catch (e) {
      passiveBrowserEventsSupported = false;
    }
  var root = null, startText = null, fallbackText = null;
  function getData() {
    if (fallbackText) return fallbackText;
    var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
    for (start = 0; start < startLength && startValue[start] === endValue[start]; start++) ;
    var minEnd = startLength - start;
    for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++) ;
    return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
  }
  function getEventCharCode(nativeEvent) {
    var keyCode = nativeEvent.keyCode;
    "charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
    10 === nativeEvent && (nativeEvent = 13);
    return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
  }
  function functionThatReturnsTrue() {
    return true;
  }
  function functionThatReturnsFalse() {
    return false;
  }
  function createSyntheticEvent(Interface) {
    function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
      this._reactName = reactName;
      this._targetInst = targetInst;
      this.type = reactEventType;
      this.nativeEvent = nativeEvent;
      this.target = nativeEventTarget;
      this.currentTarget = null;
      for (var propName in Interface)
        Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
      this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : false === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
      this.isPropagationStopped = functionThatReturnsFalse;
      return this;
    }
    assign(SyntheticBaseEvent.prototype, {
      preventDefault: function() {
        this.defaultPrevented = true;
        var event = this.nativeEvent;
        event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = false), this.isDefaultPrevented = functionThatReturnsTrue);
      },
      stopPropagation: function() {
        var event = this.nativeEvent;
        event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = true), this.isPropagationStopped = functionThatReturnsTrue);
      },
      persist: function() {
      },
      isPersistent: functionThatReturnsTrue
    });
    return SyntheticBaseEvent;
  }
  var EventInterface = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(event) {
      return event.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, SyntheticEvent = createSyntheticEvent(EventInterface), UIEventInterface = assign({}, EventInterface, { view: 0, detail: 0 }), SyntheticUIEvent = createSyntheticEvent(UIEventInterface), lastMovementX, lastMovementY, lastMouseEvent, MouseEventInterface = assign({}, UIEventInterface, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: getEventModifierState,
    button: 0,
    buttons: 0,
    relatedTarget: function(event) {
      return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
    },
    movementX: function(event) {
      if ("movementX" in event) return event.movementX;
      event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
      return lastMovementX;
    },
    movementY: function(event) {
      return "movementY" in event ? event.movementY : lastMovementY;
    }
  }), SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface), DragEventInterface = assign({}, MouseEventInterface, { dataTransfer: 0 }), SyntheticDragEvent = createSyntheticEvent(DragEventInterface), FocusEventInterface = assign({}, UIEventInterface, { relatedTarget: 0 }), SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface), AnimationEventInterface = assign({}, EventInterface, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface), ClipboardEventInterface = assign({}, EventInterface, {
    clipboardData: function(event) {
      return "clipboardData" in event ? event.clipboardData : window.clipboardData;
    }
  }), SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface), CompositionEventInterface = assign({}, EventInterface, { data: 0 }), SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface), normalizeKey = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, translateToKey = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, modifierKeyToProp = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function modifierStateGetter(keyArg) {
    var nativeEvent = this.nativeEvent;
    return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : false;
  }
  function getEventModifierState() {
    return modifierStateGetter;
  }
  var KeyboardEventInterface = assign({}, UIEventInterface, {
    key: function(nativeEvent) {
      if (nativeEvent.key) {
        var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
        if ("Unidentified" !== key) return key;
      }
      return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: getEventModifierState,
    charCode: function(event) {
      return "keypress" === event.type ? getEventCharCode(event) : 0;
    },
    keyCode: function(event) {
      return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
    },
    which: function(event) {
      return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
    }
  }), SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface), PointerEventInterface = assign({}, MouseEventInterface, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface), TouchEventInterface = assign({}, UIEventInterface, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: getEventModifierState
  }), SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface), TransitionEventInterface = assign({}, EventInterface, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface), WheelEventInterface = assign({}, MouseEventInterface, {
    deltaX: function(event) {
      return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
    },
    deltaY: function(event) {
      return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface), ToggleEventInterface = assign({}, EventInterface, {
    newState: 0,
    oldState: 0
  }), SyntheticToggleEvent = createSyntheticEvent(ToggleEventInterface), END_KEYCODES = [9, 13, 27, 32], canUseCompositionEvent = canUseDOM && "CompositionEvent" in window, documentMode = null;
  canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
  var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode, useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode), SPACEBAR_CHAR = String.fromCharCode(32), hasSpaceKeypress = false;
  function isFallbackCompositionEnd(domEventName, nativeEvent) {
    switch (domEventName) {
      case "keyup":
        return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
      case "keydown":
        return 229 !== nativeEvent.keyCode;
      case "keypress":
      case "mousedown":
      case "focusout":
        return true;
      default:
        return false;
    }
  }
  function getDataFromCustomEvent(nativeEvent) {
    nativeEvent = nativeEvent.detail;
    return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
  }
  var isComposing = false;
  function getNativeBeforeInputChars(domEventName, nativeEvent) {
    switch (domEventName) {
      case "compositionend":
        return getDataFromCustomEvent(nativeEvent);
      case "keypress":
        if (32 !== nativeEvent.which) return null;
        hasSpaceKeypress = true;
        return SPACEBAR_CHAR;
      case "textInput":
        return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
      default:
        return null;
    }
  }
  function getFallbackBeforeInputChars(domEventName, nativeEvent) {
    if (isComposing)
      return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = false, domEventName) : null;
    switch (domEventName) {
      case "paste":
        return null;
      case "keypress":
        if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
          if (nativeEvent.char && 1 < nativeEvent.char.length)
            return nativeEvent.char;
          if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
        }
        return null;
      case "compositionend":
        return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
      default:
        return null;
    }
  }
  var supportedInputTypes = {
    color: true,
    date: true,
    datetime: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true
  };
  function isTextInputElement(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? true : false;
  }
  function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
    restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
    inst = accumulateTwoPhaseListeners(inst, "onChange");
    0 < inst.length && (nativeEvent = new SyntheticEvent(
      "onChange",
      "change",
      null,
      nativeEvent,
      target
    ), dispatchQueue.push({ event: nativeEvent, listeners: inst }));
  }
  var activeElement$1 = null, activeElementInst$1 = null;
  function runEventInBatch(dispatchQueue) {
    processDispatchQueue(dispatchQueue, 0);
  }
  function getInstIfValueChanged(targetInst) {
    var targetNode = getNodeFromInstance(targetInst);
    if (updateValueIfChanged(targetNode)) return targetInst;
  }
  function getTargetInstForChangeEvent(domEventName, targetInst) {
    if ("change" === domEventName) return targetInst;
  }
  var isInputEventSupported = false;
  if (canUseDOM) {
    var JSCompiler_inline_result$jscomp$286;
    if (canUseDOM) {
      var isSupported$jscomp$inline_427 = "oninput" in document;
      if (!isSupported$jscomp$inline_427) {
        var element$jscomp$inline_428 = document.createElement("div");
        element$jscomp$inline_428.setAttribute("oninput", "return;");
        isSupported$jscomp$inline_427 = "function" === typeof element$jscomp$inline_428.oninput;
      }
      JSCompiler_inline_result$jscomp$286 = isSupported$jscomp$inline_427;
    } else JSCompiler_inline_result$jscomp$286 = false;
    isInputEventSupported = JSCompiler_inline_result$jscomp$286 && (!document.documentMode || 9 < document.documentMode);
  }
  function stopWatchingForValueChange() {
    activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
  }
  function handlePropertyChange(nativeEvent) {
    if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
      var dispatchQueue = [];
      createAndAccumulateChangeEvent(
        dispatchQueue,
        activeElementInst$1,
        nativeEvent,
        getEventTarget(nativeEvent)
      );
      batchedUpdates$1(runEventInBatch, dispatchQueue);
    }
  }
  function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
    "focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
  }
  function getTargetInstForInputEventPolyfill(domEventName) {
    if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName)
      return getInstIfValueChanged(activeElementInst$1);
  }
  function getTargetInstForClickEvent(domEventName, targetInst) {
    if ("click" === domEventName) return getInstIfValueChanged(targetInst);
  }
  function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
    if ("input" === domEventName || "change" === domEventName)
      return getInstIfValueChanged(targetInst);
  }
  function is(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is;
  function shallowEqual(objA, objB) {
    if (objectIs(objA, objB)) return true;
    if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB)
      return false;
    var keysA = Object.keys(objA), keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    for (keysB = 0; keysB < keysA.length; keysB++) {
      var currentKey = keysA[keysB];
      if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey]))
        return false;
    }
    return true;
  }
  function getLeafNode(node) {
    for (; node && node.firstChild; ) node = node.firstChild;
    return node;
  }
  function getNodeForCharacterOffset(root2, offset) {
    var node = getLeafNode(root2);
    root2 = 0;
    for (var nodeEnd; node; ) {
      if (3 === node.nodeType) {
        nodeEnd = root2 + node.textContent.length;
        if (root2 <= offset && nodeEnd >= offset)
          return { node, offset: offset - root2 };
        root2 = nodeEnd;
      }
      a: {
        for (; node; ) {
          if (node.nextSibling) {
            node = node.nextSibling;
            break a;
          }
          node = node.parentNode;
        }
        node = void 0;
      }
      node = getLeafNode(node);
    }
  }
  function containsNode(outerNode, innerNode) {
    return outerNode && innerNode ? outerNode === innerNode ? true : outerNode && 3 === outerNode.nodeType ? false : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : false : false;
  }
  function getActiveElementDeep(containerInfo) {
    containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
    for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement; ) {
      try {
        var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
      } catch (err) {
        JSCompiler_inline_result = false;
      }
      if (JSCompiler_inline_result) containerInfo = element.contentWindow;
      else break;
      element = getActiveElement(containerInfo.document);
    }
    return element;
  }
  function hasSelectionCapabilities(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
  }
  var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode, activeElement = null, activeElementInst = null, lastSelection = null, mouseDown = false;
  function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
    var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
    mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = { start: doc.selectionStart, end: doc.selectionEnd } : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
      anchorNode: doc.anchorNode,
      anchorOffset: doc.anchorOffset,
      focusNode: doc.focusNode,
      focusOffset: doc.focusOffset
    }), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent(
      "onSelect",
      "select",
      null,
      nativeEvent,
      nativeEventTarget
    ), dispatchQueue.push({ event: nativeEvent, listeners: doc }), nativeEvent.target = activeElement)));
  }
  function makePrefixMap(styleProp, eventName) {
    var prefixes = {};
    prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
    prefixes["Webkit" + styleProp] = "webkit" + eventName;
    prefixes["Moz" + styleProp] = "moz" + eventName;
    return prefixes;
  }
  var vendorPrefixes = {
    animationend: makePrefixMap("Animation", "AnimationEnd"),
    animationiteration: makePrefixMap("Animation", "AnimationIteration"),
    animationstart: makePrefixMap("Animation", "AnimationStart"),
    transitionrun: makePrefixMap("Transition", "TransitionRun"),
    transitionstart: makePrefixMap("Transition", "TransitionStart"),
    transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
    transitionend: makePrefixMap("Transition", "TransitionEnd")
  }, prefixedEventNames = {}, style = {};
  canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
  function getVendorPrefixedEventName(eventName) {
    if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
    if (!vendorPrefixes[eventName]) return eventName;
    var prefixMap = vendorPrefixes[eventName], styleProp;
    for (styleProp in prefixMap)
      if (prefixMap.hasOwnProperty(styleProp) && styleProp in style)
        return prefixedEventNames[eventName] = prefixMap[styleProp];
    return eventName;
  }
  var ANIMATION_END = getVendorPrefixedEventName("animationend"), ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration"), ANIMATION_START = getVendorPrefixedEventName("animationstart"), TRANSITION_RUN = getVendorPrefixedEventName("transitionrun"), TRANSITION_START = getVendorPrefixedEventName("transitionstart"), TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel"), TRANSITION_END = getVendorPrefixedEventName("transitionend"), topLevelEventsToReactNames = /* @__PURE__ */ new Map(), simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  simpleEventPluginEvents.push("scrollEnd");
  function registerSimpleEvent(domEventName, reactName) {
    topLevelEventsToReactNames.set(domEventName, reactName);
    registerTwoPhaseEvent(reactName, [domEventName]);
  }
  var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
    if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event)) return;
    } else if ("object" === typeof process && "function" === typeof process.emit) {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  }, concurrentQueues = [], concurrentQueuesIndex = 0, concurrentlyUpdatedLanes = 0;
  function finishQueueingConcurrentUpdates() {
    for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex; ) {
      var fiber = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var queue = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var update = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var lane = concurrentQueues[i];
      concurrentQueues[i++] = null;
      if (null !== queue && null !== update) {
        var pending = queue.pending;
        null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
        queue.pending = update;
      }
      0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
    }
  }
  function enqueueUpdate$1(fiber, queue, update, lane) {
    concurrentQueues[concurrentQueuesIndex++] = fiber;
    concurrentQueues[concurrentQueuesIndex++] = queue;
    concurrentQueues[concurrentQueuesIndex++] = update;
    concurrentQueues[concurrentQueuesIndex++] = lane;
    concurrentlyUpdatedLanes |= lane;
    fiber.lanes |= lane;
    fiber = fiber.alternate;
    null !== fiber && (fiber.lanes |= lane);
  }
  function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
    enqueueUpdate$1(fiber, queue, update, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function enqueueConcurrentRenderForLane(fiber, lane) {
    enqueueUpdate$1(fiber, null, null, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
    sourceFiber.lanes |= lane;
    var alternate = sourceFiber.alternate;
    null !== alternate && (alternate.lanes |= lane);
    for (var isHidden = false, parent = sourceFiber.return; null !== parent; )
      parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = true)), sourceFiber = parent, parent = parent.return;
    return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
  }
  function getRootForUpdatedFiber(sourceFiber) {
    if (50 < nestedUpdateCount)
      throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
    for (var parent = sourceFiber.return; null !== parent; )
      sourceFiber = parent, parent = sourceFiber.return;
    return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
  }
  var emptyContextObject = {};
  function FiberNode(tag, pendingProps, key, mode) {
    this.tag = tag;
    this.key = key;
    this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
    this.index = 0;
    this.refCleanup = this.ref = null;
    this.pendingProps = pendingProps;
    this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
    this.mode = mode;
    this.subtreeFlags = this.flags = 0;
    this.deletions = null;
    this.childLanes = this.lanes = 0;
    this.alternate = null;
  }
  function createFiberImplClass(tag, pendingProps, key, mode) {
    return new FiberNode(tag, pendingProps, key, mode);
  }
  function shouldConstruct(Component) {
    Component = Component.prototype;
    return !(!Component || !Component.isReactComponent);
  }
  function createWorkInProgress(current, pendingProps) {
    var workInProgress2 = current.alternate;
    null === workInProgress2 ? (workInProgress2 = createFiberImplClass(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    ), workInProgress2.elementType = current.elementType, workInProgress2.type = current.type, workInProgress2.stateNode = current.stateNode, workInProgress2.alternate = current, current.alternate = workInProgress2) : (workInProgress2.pendingProps = pendingProps, workInProgress2.type = current.type, workInProgress2.flags = 0, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null);
    workInProgress2.flags = current.flags & 65011712;
    workInProgress2.childLanes = current.childLanes;
    workInProgress2.lanes = current.lanes;
    workInProgress2.child = current.child;
    workInProgress2.memoizedProps = current.memoizedProps;
    workInProgress2.memoizedState = current.memoizedState;
    workInProgress2.updateQueue = current.updateQueue;
    pendingProps = current.dependencies;
    workInProgress2.dependencies = null === pendingProps ? null : { lanes: pendingProps.lanes, firstContext: pendingProps.firstContext };
    workInProgress2.sibling = current.sibling;
    workInProgress2.index = current.index;
    workInProgress2.ref = current.ref;
    workInProgress2.refCleanup = current.refCleanup;
    return workInProgress2;
  }
  function resetWorkInProgress(workInProgress2, renderLanes2) {
    workInProgress2.flags &= 65011714;
    var current = workInProgress2.alternate;
    null === current ? (workInProgress2.childLanes = 0, workInProgress2.lanes = renderLanes2, workInProgress2.child = null, workInProgress2.subtreeFlags = 0, workInProgress2.memoizedProps = null, workInProgress2.memoizedState = null, workInProgress2.updateQueue = null, workInProgress2.dependencies = null, workInProgress2.stateNode = null) : (workInProgress2.childLanes = current.childLanes, workInProgress2.lanes = current.lanes, workInProgress2.child = current.child, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null, workInProgress2.memoizedProps = current.memoizedProps, workInProgress2.memoizedState = current.memoizedState, workInProgress2.updateQueue = current.updateQueue, workInProgress2.type = current.type, renderLanes2 = current.dependencies, workInProgress2.dependencies = null === renderLanes2 ? null : {
      lanes: renderLanes2.lanes,
      firstContext: renderLanes2.firstContext
    });
    return workInProgress2;
  }
  function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
    var fiberTag = 0;
    owner = type;
    if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1);
    else if ("string" === typeof type)
      fiberTag = isHostHoistableType(
        type,
        pendingProps,
        contextStackCursor.current
      ) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
    else
      a: switch (type) {
        case REACT_ACTIVITY_TYPE:
          return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
        case REACT_FRAGMENT_TYPE:
          return createFiberFromFragment(pendingProps.children, mode, lanes, key);
        case REACT_STRICT_MODE_TYPE:
          fiberTag = 8;
          mode |= 24;
          break;
        case REACT_PROFILER_TYPE:
          return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
        case REACT_SUSPENSE_TYPE:
          return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
        case REACT_SUSPENSE_LIST_TYPE:
          return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
        default:
          if ("object" === typeof type && null !== type)
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                fiberTag = 10;
                break a;
              case REACT_CONSUMER_TYPE:
                fiberTag = 9;
                break a;
              case REACT_FORWARD_REF_TYPE:
                fiberTag = 11;
                break a;
              case REACT_MEMO_TYPE:
                fiberTag = 14;
                break a;
              case REACT_LAZY_TYPE:
                fiberTag = 16;
                owner = null;
                break a;
            }
          fiberTag = 29;
          pendingProps = Error(
            formatProdErrorMessage(130, null === type ? "null" : typeof type, "")
          );
          owner = null;
      }
    key = createFiberImplClass(fiberTag, pendingProps, key, mode);
    key.elementType = type;
    key.type = owner;
    key.lanes = lanes;
    return key;
  }
  function createFiberFromFragment(elements, mode, lanes, key) {
    elements = createFiberImplClass(7, elements, key, mode);
    elements.lanes = lanes;
    return elements;
  }
  function createFiberFromText(content, mode, lanes) {
    content = createFiberImplClass(6, content, null, mode);
    content.lanes = lanes;
    return content;
  }
  function createFiberFromDehydratedFragment(dehydratedNode) {
    var fiber = createFiberImplClass(18, null, null, 0);
    fiber.stateNode = dehydratedNode;
    return fiber;
  }
  function createFiberFromPortal(portal, mode, lanes) {
    mode = createFiberImplClass(
      4,
      null !== portal.children ? portal.children : [],
      portal.key,
      mode
    );
    mode.lanes = lanes;
    mode.stateNode = {
      containerInfo: portal.containerInfo,
      pendingChildren: null,
      implementation: portal.implementation
    };
    return mode;
  }
  var CapturedStacks = /* @__PURE__ */ new WeakMap();
  function createCapturedValueAtFiber(value, source) {
    if ("object" === typeof value && null !== value) {
      var existing = CapturedStacks.get(value);
      if (void 0 !== existing) return existing;
      source = {
        value,
        source,
        stack: getStackByFiberInDevAndProd(source)
      };
      CapturedStacks.set(value, source);
      return source;
    }
    return {
      value,
      source,
      stack: getStackByFiberInDevAndProd(source)
    };
  }
  var forkStack = [], forkStackIndex = 0, treeForkProvider = null, treeForkCount = 0, idStack = [], idStackIndex = 0, treeContextProvider = null, treeContextId = 1, treeContextOverflow = "";
  function pushTreeFork(workInProgress2, totalChildren) {
    forkStack[forkStackIndex++] = treeForkCount;
    forkStack[forkStackIndex++] = treeForkProvider;
    treeForkProvider = workInProgress2;
    treeForkCount = totalChildren;
  }
  function pushTreeId(workInProgress2, totalChildren, index2) {
    idStack[idStackIndex++] = treeContextId;
    idStack[idStackIndex++] = treeContextOverflow;
    idStack[idStackIndex++] = treeContextProvider;
    treeContextProvider = workInProgress2;
    var baseIdWithLeadingBit = treeContextId;
    workInProgress2 = treeContextOverflow;
    var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
    baseIdWithLeadingBit &= ~(1 << baseLength);
    index2 += 1;
    var length = 32 - clz32(totalChildren) + baseLength;
    if (30 < length) {
      var numberOfOverflowBits = baseLength - baseLength % 5;
      length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
      baseIdWithLeadingBit >>= numberOfOverflowBits;
      baseLength -= numberOfOverflowBits;
      treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index2 << baseLength | baseIdWithLeadingBit;
      treeContextOverflow = length + workInProgress2;
    } else
      treeContextId = 1 << length | index2 << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress2;
  }
  function pushMaterializedTreeId(workInProgress2) {
    null !== workInProgress2.return && (pushTreeFork(workInProgress2, 1), pushTreeId(workInProgress2, 1, 0));
  }
  function popTreeContext(workInProgress2) {
    for (; workInProgress2 === treeForkProvider; )
      treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
    for (; workInProgress2 === treeContextProvider; )
      treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
  }
  function restoreSuspendedTreeContext(workInProgress2, suspendedContext) {
    idStack[idStackIndex++] = treeContextId;
    idStack[idStackIndex++] = treeContextOverflow;
    idStack[idStackIndex++] = treeContextProvider;
    treeContextId = suspendedContext.id;
    treeContextOverflow = suspendedContext.overflow;
    treeContextProvider = workInProgress2;
  }
  var hydrationParentFiber = null, nextHydratableInstance = null, isHydrating = false, hydrationErrors = null, rootOrSingletonContext = false, HydrationMismatchException = Error(formatProdErrorMessage(519));
  function throwOnHydrationMismatch(fiber) {
    var error = Error(
      formatProdErrorMessage(
        418,
        1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    queueHydrationError(createCapturedValueAtFiber(error, fiber));
    throw HydrationMismatchException;
  }
  function prepareToHydrateHostInstance(fiber) {
    var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
    instance[internalInstanceKey] = fiber;
    instance[internalPropsKey] = props;
    switch (type) {
      case "dialog":
        listenToNonDelegatedEvent("cancel", instance);
        listenToNonDelegatedEvent("close", instance);
        break;
      case "iframe":
      case "object":
      case "embed":
        listenToNonDelegatedEvent("load", instance);
        break;
      case "video":
      case "audio":
        for (type = 0; type < mediaEventTypes.length; type++)
          listenToNonDelegatedEvent(mediaEventTypes[type], instance);
        break;
      case "source":
        listenToNonDelegatedEvent("error", instance);
        break;
      case "img":
      case "image":
      case "link":
        listenToNonDelegatedEvent("error", instance);
        listenToNonDelegatedEvent("load", instance);
        break;
      case "details":
        listenToNonDelegatedEvent("toggle", instance);
        break;
      case "input":
        listenToNonDelegatedEvent("invalid", instance);
        initInput(
          instance,
          props.value,
          props.defaultValue,
          props.checked,
          props.defaultChecked,
          props.type,
          props.name,
          true
        );
        break;
      case "select":
        listenToNonDelegatedEvent("invalid", instance);
        break;
      case "textarea":
        listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
    }
    type = props.children;
    "string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || true === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = true) : instance = false;
    instance || throwOnHydrationMismatch(fiber, true);
  }
  function popToNextHostParent(fiber) {
    for (hydrationParentFiber = fiber.return; hydrationParentFiber; )
      switch (hydrationParentFiber.tag) {
        case 5:
        case 31:
        case 13:
          rootOrSingletonContext = false;
          return;
        case 27:
        case 3:
          rootOrSingletonContext = true;
          return;
        default:
          hydrationParentFiber = hydrationParentFiber.return;
      }
  }
  function popHydrationState(fiber) {
    if (fiber !== hydrationParentFiber) return false;
    if (!isHydrating) return popToNextHostParent(fiber), isHydrating = true, false;
    var tag = fiber.tag, JSCompiler_temp;
    if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
      if (JSCompiler_temp = 5 === tag)
        JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
      JSCompiler_temp = !JSCompiler_temp;
    }
    JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
    popToNextHostParent(fiber);
    if (13 === tag) {
      fiber = fiber.memoizedState;
      fiber = null !== fiber ? fiber.dehydrated : null;
      if (!fiber) throw Error(formatProdErrorMessage(317));
      nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
    } else if (31 === tag) {
      fiber = fiber.memoizedState;
      fiber = null !== fiber ? fiber.dehydrated : null;
      if (!fiber) throw Error(formatProdErrorMessage(317));
      nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
    } else
      27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
    return true;
  }
  function resetHydrationState() {
    nextHydratableInstance = hydrationParentFiber = null;
    isHydrating = false;
  }
  function upgradeHydrationErrorsToRecoverable() {
    var queuedErrors = hydrationErrors;
    null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(
      workInProgressRootRecoverableErrors,
      queuedErrors
    ), hydrationErrors = null);
    return queuedErrors;
  }
  function queueHydrationError(error) {
    null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
  }
  var valueCursor = createCursor(null), currentlyRenderingFiber$1 = null, lastContextDependency = null;
  function pushProvider(providerFiber, context, nextValue) {
    push(valueCursor, context._currentValue);
    context._currentValue = nextValue;
  }
  function popProvider(context) {
    context._currentValue = valueCursor.current;
    pop(valueCursor);
  }
  function scheduleContextWorkOnParentPath(parent, renderLanes2, propagationRoot) {
    for (; null !== parent; ) {
      var alternate = parent.alternate;
      (parent.childLanes & renderLanes2) !== renderLanes2 ? (parent.childLanes |= renderLanes2, null !== alternate && (alternate.childLanes |= renderLanes2)) : null !== alternate && (alternate.childLanes & renderLanes2) !== renderLanes2 && (alternate.childLanes |= renderLanes2);
      if (parent === propagationRoot) break;
      parent = parent.return;
    }
  }
  function propagateContextChanges(workInProgress2, contexts, renderLanes2, forcePropagateEntireTree) {
    var fiber = workInProgress2.child;
    null !== fiber && (fiber.return = workInProgress2);
    for (; null !== fiber; ) {
      var list = fiber.dependencies;
      if (null !== list) {
        var nextFiber = fiber.child;
        list = list.firstContext;
        a: for (; null !== list; ) {
          var dependency = list;
          list = fiber;
          for (var i = 0; i < contexts.length; i++)
            if (dependency.context === contexts[i]) {
              list.lanes |= renderLanes2;
              dependency = list.alternate;
              null !== dependency && (dependency.lanes |= renderLanes2);
              scheduleContextWorkOnParentPath(
                list.return,
                renderLanes2,
                workInProgress2
              );
              forcePropagateEntireTree || (nextFiber = null);
              break a;
            }
          list = dependency.next;
        }
      } else if (18 === fiber.tag) {
        nextFiber = fiber.return;
        if (null === nextFiber) throw Error(formatProdErrorMessage(341));
        nextFiber.lanes |= renderLanes2;
        list = nextFiber.alternate;
        null !== list && (list.lanes |= renderLanes2);
        scheduleContextWorkOnParentPath(nextFiber, renderLanes2, workInProgress2);
        nextFiber = null;
      } else nextFiber = fiber.child;
      if (null !== nextFiber) nextFiber.return = fiber;
      else
        for (nextFiber = fiber; null !== nextFiber; ) {
          if (nextFiber === workInProgress2) {
            nextFiber = null;
            break;
          }
          fiber = nextFiber.sibling;
          if (null !== fiber) {
            fiber.return = nextFiber.return;
            nextFiber = fiber;
            break;
          }
          nextFiber = nextFiber.return;
        }
      fiber = nextFiber;
    }
  }
  function propagateParentContextChanges(current, workInProgress2, renderLanes2, forcePropagateEntireTree) {
    current = null;
    for (var parent = workInProgress2, isInsidePropagationBailout = false; null !== parent; ) {
      if (!isInsidePropagationBailout) {
        if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = true;
        else if (0 !== (parent.flags & 262144)) break;
      }
      if (10 === parent.tag) {
        var currentParent = parent.alternate;
        if (null === currentParent) throw Error(formatProdErrorMessage(387));
        currentParent = currentParent.memoizedProps;
        if (null !== currentParent) {
          var context = parent.type;
          objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
        }
      } else if (parent === hostTransitionProviderCursor.current) {
        currentParent = parent.alternate;
        if (null === currentParent) throw Error(formatProdErrorMessage(387));
        currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
      }
      parent = parent.return;
    }
    null !== current && propagateContextChanges(
      workInProgress2,
      current,
      renderLanes2,
      forcePropagateEntireTree
    );
    workInProgress2.flags |= 262144;
  }
  function checkIfContextChanged(currentDependencies) {
    for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies; ) {
      if (!objectIs(
        currentDependencies.context._currentValue,
        currentDependencies.memoizedValue
      ))
        return true;
      currentDependencies = currentDependencies.next;
    }
    return false;
  }
  function prepareToReadContext(workInProgress2) {
    currentlyRenderingFiber$1 = workInProgress2;
    lastContextDependency = null;
    workInProgress2 = workInProgress2.dependencies;
    null !== workInProgress2 && (workInProgress2.firstContext = null);
  }
  function readContext(context) {
    return readContextForConsumer(currentlyRenderingFiber$1, context);
  }
  function readContextDuringReconciliation(consumer, context) {
    null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
    return readContextForConsumer(consumer, context);
  }
  function readContextForConsumer(consumer, context) {
    var value = context._currentValue;
    context = { context, memoizedValue: value, next: null };
    if (null === lastContextDependency) {
      if (null === consumer) throw Error(formatProdErrorMessage(308));
      lastContextDependency = context;
      consumer.dependencies = { lanes: 0, firstContext: context };
      consumer.flags |= 524288;
    } else lastContextDependency = lastContextDependency.next = context;
    return value;
  }
  var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
    var listeners = [], signal = this.signal = {
      aborted: false,
      addEventListener: function(type, listener) {
        listeners.push(listener);
      }
    };
    this.abort = function() {
      signal.aborted = true;
      listeners.forEach(function(listener) {
        return listener();
      });
    };
  }, scheduleCallback$2 = Scheduler.unstable_scheduleCallback, NormalPriority = Scheduler.unstable_NormalPriority, CacheContext = {
    $$typeof: REACT_CONTEXT_TYPE,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function createCache() {
    return {
      controller: new AbortControllerLocal(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function releaseCache(cache) {
    cache.refCount--;
    0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
      cache.controller.abort();
    });
  }
  var currentEntangledListeners = null, currentEntangledPendingCount = 0, currentEntangledLane = 0, currentEntangledActionThenable = null;
  function entangleAsyncAction(transition, thenable) {
    if (null === currentEntangledListeners) {
      var entangledListeners = currentEntangledListeners = [];
      currentEntangledPendingCount = 0;
      currentEntangledLane = requestTransitionLane();
      currentEntangledActionThenable = {
        status: "pending",
        value: void 0,
        then: function(resolve) {
          entangledListeners.push(resolve);
        }
      };
    }
    currentEntangledPendingCount++;
    thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
    return thenable;
  }
  function pingEngtangledActionScope() {
    if (0 === --currentEntangledPendingCount && null !== currentEntangledListeners) {
      null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
      var listeners = currentEntangledListeners;
      currentEntangledListeners = null;
      currentEntangledLane = 0;
      currentEntangledActionThenable = null;
      for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
    }
  }
  function chainThenableValue(thenable, result) {
    var listeners = [], thenableWithOverride = {
      status: "pending",
      value: null,
      reason: null,
      then: function(resolve) {
        listeners.push(resolve);
      }
    };
    thenable.then(
      function() {
        thenableWithOverride.status = "fulfilled";
        thenableWithOverride.value = result;
        for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
      },
      function(error) {
        thenableWithOverride.status = "rejected";
        thenableWithOverride.reason = error;
        for (error = 0; error < listeners.length; error++)
          (0, listeners[error])(void 0);
      }
    );
    return thenableWithOverride;
  }
  var prevOnStartTransitionFinish = ReactSharedInternals.S;
  ReactSharedInternals.S = function(transition, returnValue) {
    globalMostRecentTransitionTime = now();
    "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
    null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
  };
  var resumedCache = createCursor(null);
  function peekCacheFromPool() {
    var cacheResumedFromPreviousRender = resumedCache.current;
    return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
  }
  function pushTransition(offscreenWorkInProgress, prevCachePool) {
    null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
  }
  function getSuspendedCache() {
    var cacheFromPool = peekCacheFromPool();
    return null === cacheFromPool ? null : { parent: CacheContext._currentValue, pool: cacheFromPool };
  }
  var SuspenseException = Error(formatProdErrorMessage(460)), SuspenseyCommitException = Error(formatProdErrorMessage(474)), SuspenseActionException = Error(formatProdErrorMessage(542)), noopSuspenseyCommitThenable = { then: function() {
  } };
  function isThenableResolved(thenable) {
    thenable = thenable.status;
    return "fulfilled" === thenable || "rejected" === thenable;
  }
  function trackUsedThenable(thenableState2, thenable, index2) {
    index2 = thenableState2[index2];
    void 0 === index2 ? thenableState2.push(thenable) : index2 !== thenable && (thenable.then(noop$1, noop$1), thenable = index2);
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
      default:
        if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
        else {
          thenableState2 = workInProgressRoot;
          if (null !== thenableState2 && 100 < thenableState2.shellSuspendCounter)
            throw Error(formatProdErrorMessage(482));
          thenableState2 = thenable;
          thenableState2.status = "pending";
          thenableState2.then(
            function(fulfilledValue) {
              if ("pending" === thenable.status) {
                var fulfilledThenable = thenable;
                fulfilledThenable.status = "fulfilled";
                fulfilledThenable.value = fulfilledValue;
              }
            },
            function(error) {
              if ("pending" === thenable.status) {
                var rejectedThenable = thenable;
                rejectedThenable.status = "rejected";
                rejectedThenable.reason = error;
              }
            }
          );
        }
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
        }
        suspendedThenable = thenable;
        throw SuspenseException;
    }
  }
  function resolveLazy(lazyType) {
    try {
      var init = lazyType._init;
      return init(lazyType._payload);
    } catch (x) {
      if (null !== x && "object" === typeof x && "function" === typeof x.then)
        throw suspendedThenable = x, SuspenseException;
      throw x;
    }
  }
  var suspendedThenable = null;
  function getSuspendedThenable() {
    if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
    var thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
  }
  function checkIfUseWrappedInAsyncCatch(rejectedReason) {
    if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException)
      throw Error(formatProdErrorMessage(483));
  }
  var thenableState$1 = null, thenableIndexCounter$1 = 0;
  function unwrapThenable(thenable) {
    var index2 = thenableIndexCounter$1;
    thenableIndexCounter$1 += 1;
    null === thenableState$1 && (thenableState$1 = []);
    return trackUsedThenable(thenableState$1, thenable, index2);
  }
  function coerceRef(workInProgress2, element) {
    element = element.props.ref;
    workInProgress2.ref = void 0 !== element ? element : null;
  }
  function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
    if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
      throw Error(formatProdErrorMessage(525));
    returnFiber = Object.prototype.toString.call(newChild);
    throw Error(
      formatProdErrorMessage(
        31,
        "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber
      )
    );
  }
  function createChildReconciler(shouldTrackSideEffects) {
    function deleteChild(returnFiber, childToDelete) {
      if (shouldTrackSideEffects) {
        var deletions = returnFiber.deletions;
        null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
      }
    }
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
      if (!shouldTrackSideEffects) return null;
      for (; null !== currentFirstChild; )
        deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
      return null;
    }
    function mapRemainingChildren(currentFirstChild) {
      for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild; )
        null !== currentFirstChild.key ? existingChildren.set(currentFirstChild.key, currentFirstChild) : existingChildren.set(currentFirstChild.index, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
      return existingChildren;
    }
    function useFiber(fiber, pendingProps) {
      fiber = createWorkInProgress(fiber, pendingProps);
      fiber.index = 0;
      fiber.sibling = null;
      return fiber;
    }
    function placeChild(newFiber, lastPlacedIndex, newIndex) {
      newFiber.index = newIndex;
      if (!shouldTrackSideEffects)
        return newFiber.flags |= 1048576, lastPlacedIndex;
      newIndex = newFiber.alternate;
      if (null !== newIndex)
        return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 67108866, lastPlacedIndex) : newIndex;
      newFiber.flags |= 67108866;
      return lastPlacedIndex;
    }
    function placeSingleChild(newFiber) {
      shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 67108866);
      return newFiber;
    }
    function updateTextNode(returnFiber, current, textContent, lanes) {
      if (null === current || 6 !== current.tag)
        return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
      current = useFiber(current, textContent);
      current.return = returnFiber;
      return current;
    }
    function updateElement(returnFiber, current, element, lanes) {
      var elementType = element.type;
      if (elementType === REACT_FRAGMENT_TYPE)
        return updateFragment(
          returnFiber,
          current,
          element.props.children,
          lanes,
          element.key
        );
      if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type))
        return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
      current = createFiberFromTypeAndProps(
        element.type,
        element.key,
        element.props,
        null,
        returnFiber.mode,
        lanes
      );
      coerceRef(current, element);
      current.return = returnFiber;
      return current;
    }
    function updatePortal(returnFiber, current, portal, lanes) {
      if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation)
        return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
      current = useFiber(current, portal.children || []);
      current.return = returnFiber;
      return current;
    }
    function updateFragment(returnFiber, current, fragment, lanes, key) {
      if (null === current || 7 !== current.tag)
        return current = createFiberFromFragment(
          fragment,
          returnFiber.mode,
          lanes,
          key
        ), current.return = returnFiber, current;
      current = useFiber(current, fragment);
      current.return = returnFiber;
      return current;
    }
    function createChild(returnFiber, newChild, lanes) {
      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
        return newChild = createFiberFromText(
          "" + newChild,
          returnFiber.mode,
          lanes
        ), newChild.return = returnFiber, newChild;
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return lanes = createFiberFromTypeAndProps(
              newChild.type,
              newChild.key,
              newChild.props,
              null,
              returnFiber.mode,
              lanes
            ), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
          case REACT_PORTAL_TYPE:
            return newChild = createFiberFromPortal(
              newChild,
              returnFiber.mode,
              lanes
            ), newChild.return = returnFiber, newChild;
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return newChild = createFiberFromFragment(
            newChild,
            returnFiber.mode,
            lanes,
            null
          ), newChild.return = returnFiber, newChild;
        if ("function" === typeof newChild.then)
          return createChild(returnFiber, unwrapThenable(newChild), lanes);
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return createChild(
            returnFiber,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return null;
    }
    function updateSlot(returnFiber, oldFiber, newChild, lanes) {
      var key = null !== oldFiber ? oldFiber.key : null;
      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
        return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
          case REACT_PORTAL_TYPE:
            return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
        if ("function" === typeof newChild.then)
          return updateSlot(
            returnFiber,
            oldFiber,
            unwrapThenable(newChild),
            lanes
          );
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return updateSlot(
            returnFiber,
            oldFiber,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return null;
    }
    function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
        return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return existingChildren = existingChildren.get(
              null === newChild.key ? newIdx : newChild.key
            ) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
          case REACT_PORTAL_TYPE:
            return existingChildren = existingChildren.get(
              null === newChild.key ? newIdx : newChild.key
            ) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), updateFromMap(
              existingChildren,
              returnFiber,
              newIdx,
              newChild,
              lanes
            );
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
        if ("function" === typeof newChild.then)
          return updateFromMap(
            existingChildren,
            returnFiber,
            newIdx,
            unwrapThenable(newChild),
            lanes
          );
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return updateFromMap(
            existingChildren,
            returnFiber,
            newIdx,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return null;
    }
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
      for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
        oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
        var newFiber = updateSlot(
          returnFiber,
          oldFiber,
          newChildren[newIdx],
          lanes
        );
        if (null === newFiber) {
          null === oldFiber && (oldFiber = nextOldFiber);
          break;
        }
        shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
        currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
        null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
      }
      if (newIdx === newChildren.length)
        return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
      if (null === oldFiber) {
        for (; newIdx < newChildren.length; newIdx++)
          oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(
            oldFiber,
            currentFirstChild,
            newIdx
          ), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
        isHydrating && pushTreeFork(returnFiber, newIdx);
        return resultingFirstChild;
      }
      for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++)
        nextOldFiber = updateFromMap(
          oldFiber,
          returnFiber,
          newIdx,
          newChildren[newIdx],
          lanes
        ), null !== nextOldFiber && (shouldTrackSideEffects && null !== nextOldFiber.alternate && oldFiber.delete(
          null === nextOldFiber.key ? newIdx : nextOldFiber.key
        ), currentFirstChild = placeChild(
          nextOldFiber,
          currentFirstChild,
          newIdx
        ), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
      shouldTrackSideEffects && oldFiber.forEach(function(child) {
        return deleteChild(returnFiber, child);
      });
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
      if (null == newChildren) throw Error(formatProdErrorMessage(151));
      for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
        oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
        var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
        if (null === newFiber) {
          null === oldFiber && (oldFiber = nextOldFiber);
          break;
        }
        shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
        currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
        null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
      }
      if (step.done)
        return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
      if (null === oldFiber) {
        for (; !step.done; newIdx++, step = newChildren.next())
          step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
        isHydrating && pushTreeFork(returnFiber, newIdx);
        return resultingFirstChild;
      }
      for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next())
        step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && null !== step.alternate && oldFiber.delete(null === step.key ? newIdx : step.key), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
      shouldTrackSideEffects && oldFiber.forEach(function(child) {
        return deleteChild(returnFiber, child);
      });
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
      "object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && (newChild = newChild.props.children);
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            a: {
              for (var key = newChild.key; null !== currentFirstChild; ) {
                if (currentFirstChild.key === key) {
                  key = newChild.type;
                  if (key === REACT_FRAGMENT_TYPE) {
                    if (7 === currentFirstChild.tag) {
                      deleteRemainingChildren(
                        returnFiber,
                        currentFirstChild.sibling
                      );
                      lanes = useFiber(
                        currentFirstChild,
                        newChild.props.children
                      );
                      lanes.return = returnFiber;
                      returnFiber = lanes;
                      break a;
                    }
                  } else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
                    deleteRemainingChildren(
                      returnFiber,
                      currentFirstChild.sibling
                    );
                    lanes = useFiber(currentFirstChild, newChild.props);
                    coerceRef(lanes, newChild);
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  }
                  deleteRemainingChildren(returnFiber, currentFirstChild);
                  break;
                } else deleteChild(returnFiber, currentFirstChild);
                currentFirstChild = currentFirstChild.sibling;
              }
              newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(
                newChild.props.children,
                returnFiber.mode,
                lanes,
                newChild.key
              ), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(
                newChild.type,
                newChild.key,
                newChild.props,
                null,
                returnFiber.mode,
                lanes
              ), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
            }
            return placeSingleChild(returnFiber);
          case REACT_PORTAL_TYPE:
            a: {
              for (key = newChild.key; null !== currentFirstChild; ) {
                if (currentFirstChild.key === key)
                  if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
                    deleteRemainingChildren(
                      returnFiber,
                      currentFirstChild.sibling
                    );
                    lanes = useFiber(currentFirstChild, newChild.children || []);
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  } else {
                    deleteRemainingChildren(returnFiber, currentFirstChild);
                    break;
                  }
                else deleteChild(returnFiber, currentFirstChild);
                currentFirstChild = currentFirstChild.sibling;
              }
              lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
              lanes.return = returnFiber;
              returnFiber = lanes;
            }
            return placeSingleChild(returnFiber);
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), reconcileChildFibersImpl(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            );
        }
        if (isArrayImpl(newChild))
          return reconcileChildrenArray(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes
          );
        if (getIteratorFn(newChild)) {
          key = getIteratorFn(newChild);
          if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
          newChild = key.call(newChild);
          return reconcileChildrenIterator(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes
          );
        }
        if ("function" === typeof newChild.then)
          return reconcileChildFibersImpl(
            returnFiber,
            currentFirstChild,
            unwrapThenable(newChild),
            lanes
          );
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return reconcileChildFibersImpl(
            returnFiber,
            currentFirstChild,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
    }
    return function(returnFiber, currentFirstChild, newChild, lanes) {
      try {
        thenableIndexCounter$1 = 0;
        var firstChildFiber = reconcileChildFibersImpl(
          returnFiber,
          currentFirstChild,
          newChild,
          lanes
        );
        thenableState$1 = null;
        return firstChildFiber;
      } catch (x) {
        if (x === SuspenseException || x === SuspenseActionException) throw x;
        var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
        fiber.lanes = lanes;
        fiber.return = returnFiber;
        return fiber;
      } finally {
      }
    };
  }
  var reconcileChildFibers = createChildReconciler(true), mountChildFibers = createChildReconciler(false), hasForceUpdate = false;
  function initializeUpdateQueue(fiber) {
    fiber.updateQueue = {
      baseState: fiber.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function cloneUpdateQueue(current, workInProgress2) {
    current = current.updateQueue;
    workInProgress2.updateQueue === current && (workInProgress2.updateQueue = {
      baseState: current.baseState,
      firstBaseUpdate: current.firstBaseUpdate,
      lastBaseUpdate: current.lastBaseUpdate,
      shared: current.shared,
      callbacks: null
    });
  }
  function createUpdate(lane) {
    return { lane, tag: 0, payload: null, callback: null, next: null };
  }
  function enqueueUpdate(fiber, update, lane) {
    var updateQueue = fiber.updateQueue;
    if (null === updateQueue) return null;
    updateQueue = updateQueue.shared;
    if (0 !== (executionContext & 2)) {
      var pending = updateQueue.pending;
      null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
      updateQueue.pending = update;
      update = getRootForUpdatedFiber(fiber);
      markUpdateLaneFromFiberToRoot(fiber, null, lane);
      return update;
    }
    enqueueUpdate$1(fiber, updateQueue, update, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function entangleTransitions(root2, fiber, lane) {
    fiber = fiber.updateQueue;
    if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
      var queueLanes = fiber.lanes;
      queueLanes &= root2.pendingLanes;
      lane |= queueLanes;
      fiber.lanes = lane;
      markRootEntangled(root2, lane);
    }
  }
  function enqueueCapturedUpdate(workInProgress2, capturedUpdate) {
    var queue = workInProgress2.updateQueue, current = workInProgress2.alternate;
    if (null !== current && (current = current.updateQueue, queue === current)) {
      var newFirst = null, newLast = null;
      queue = queue.firstBaseUpdate;
      if (null !== queue) {
        do {
          var clone = {
            lane: queue.lane,
            tag: queue.tag,
            payload: queue.payload,
            callback: null,
            next: null
          };
          null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
          queue = queue.next;
        } while (null !== queue);
        null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
      } else newFirst = newLast = capturedUpdate;
      queue = {
        baseState: current.baseState,
        firstBaseUpdate: newFirst,
        lastBaseUpdate: newLast,
        shared: current.shared,
        callbacks: current.callbacks
      };
      workInProgress2.updateQueue = queue;
      return;
    }
    workInProgress2 = queue.lastBaseUpdate;
    null === workInProgress2 ? queue.firstBaseUpdate = capturedUpdate : workInProgress2.next = capturedUpdate;
    queue.lastBaseUpdate = capturedUpdate;
  }
  var didReadFromEntangledAsyncAction = false;
  function suspendIfUpdateReadFromEntangledAsyncAction() {
    if (didReadFromEntangledAsyncAction) {
      var entangledActionThenable = currentEntangledActionThenable;
      if (null !== entangledActionThenable) throw entangledActionThenable;
    }
  }
  function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes2) {
    didReadFromEntangledAsyncAction = false;
    var queue = workInProgress$jscomp$0.updateQueue;
    hasForceUpdate = false;
    var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
    if (null !== pendingQueue) {
      queue.shared.pending = null;
      var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
      lastPendingUpdate.next = null;
      null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
      lastBaseUpdate = lastPendingUpdate;
      var current = workInProgress$jscomp$0.alternate;
      null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
    }
    if (null !== firstBaseUpdate) {
      var newState = queue.baseState;
      lastBaseUpdate = 0;
      current = firstPendingUpdate = lastPendingUpdate = null;
      pendingQueue = firstBaseUpdate;
      do {
        var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
        if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes2 & updateLane) === updateLane) {
          0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = true);
          null !== current && (current = current.next = {
            lane: 0,
            tag: pendingQueue.tag,
            payload: pendingQueue.payload,
            callback: null,
            next: null
          });
          a: {
            var workInProgress2 = workInProgress$jscomp$0, update = pendingQueue;
            updateLane = props;
            var instance = instance$jscomp$0;
            switch (update.tag) {
              case 1:
                workInProgress2 = update.payload;
                if ("function" === typeof workInProgress2) {
                  newState = workInProgress2.call(instance, newState, updateLane);
                  break a;
                }
                newState = workInProgress2;
                break a;
              case 3:
                workInProgress2.flags = workInProgress2.flags & -65537 | 128;
              case 0:
                workInProgress2 = update.payload;
                updateLane = "function" === typeof workInProgress2 ? workInProgress2.call(instance, newState, updateLane) : workInProgress2;
                if (null === updateLane || void 0 === updateLane) break a;
                newState = assign({}, newState, updateLane);
                break a;
              case 2:
                hasForceUpdate = true;
            }
          }
          updateLane = pendingQueue.callback;
          null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
        } else
          isHiddenUpdate = {
            lane: updateLane,
            tag: pendingQueue.tag,
            payload: pendingQueue.payload,
            callback: pendingQueue.callback,
            next: null
          }, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
        pendingQueue = pendingQueue.next;
        if (null === pendingQueue)
          if (pendingQueue = queue.shared.pending, null === pendingQueue)
            break;
          else
            isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
      } while (1);
      null === current && (lastPendingUpdate = newState);
      queue.baseState = lastPendingUpdate;
      queue.firstBaseUpdate = firstPendingUpdate;
      queue.lastBaseUpdate = current;
      null === firstBaseUpdate && (queue.shared.lanes = 0);
      workInProgressRootSkippedLanes |= lastBaseUpdate;
      workInProgress$jscomp$0.lanes = lastBaseUpdate;
      workInProgress$jscomp$0.memoizedState = newState;
    }
  }
  function callCallback(callback, context) {
    if ("function" !== typeof callback)
      throw Error(formatProdErrorMessage(191, callback));
    callback.call(context);
  }
  function commitCallbacks(updateQueue, context) {
    var callbacks = updateQueue.callbacks;
    if (null !== callbacks)
      for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++)
        callCallback(callbacks[updateQueue], context);
  }
  var currentTreeHiddenStackCursor = createCursor(null), prevEntangledRenderLanesCursor = createCursor(0);
  function pushHiddenContext(fiber, context) {
    fiber = entangledRenderLanes;
    push(prevEntangledRenderLanesCursor, fiber);
    push(currentTreeHiddenStackCursor, context);
    entangledRenderLanes = fiber | context.baseLanes;
  }
  function reuseHiddenContextOnStack() {
    push(prevEntangledRenderLanesCursor, entangledRenderLanes);
    push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
  }
  function popHiddenContext() {
    entangledRenderLanes = prevEntangledRenderLanesCursor.current;
    pop(currentTreeHiddenStackCursor);
    pop(prevEntangledRenderLanesCursor);
  }
  var suspenseHandlerStackCursor = createCursor(null), shellBoundary = null;
  function pushPrimaryTreeSuspenseHandler(handler) {
    var current = handler.alternate;
    push(suspenseStackCursor, suspenseStackCursor.current & 1);
    push(suspenseHandlerStackCursor, handler);
    null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
  }
  function pushDehydratedActivitySuspenseHandler(fiber) {
    push(suspenseStackCursor, suspenseStackCursor.current);
    push(suspenseHandlerStackCursor, fiber);
    null === shellBoundary && (shellBoundary = fiber);
  }
  function pushOffscreenSuspenseHandler(fiber) {
    22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack();
  }
  function reuseSuspenseHandlerOnStack() {
    push(suspenseStackCursor, suspenseStackCursor.current);
    push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
  }
  function popSuspenseHandler(fiber) {
    pop(suspenseHandlerStackCursor);
    shellBoundary === fiber && (shellBoundary = null);
    pop(suspenseStackCursor);
  }
  var suspenseStackCursor = createCursor(0);
  function findFirstSuspended(row) {
    for (var node = row; null !== node; ) {
      if (13 === node.tag) {
        var state = node.memoizedState;
        if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state)))
          return node;
      } else if (19 === node.tag && ("forwards" === node.memoizedProps.revealOrder || "backwards" === node.memoizedProps.revealOrder || "unstable_legacy-backwards" === node.memoizedProps.revealOrder || "together" === node.memoizedProps.revealOrder)) {
        if (0 !== (node.flags & 128)) return node;
      } else if (null !== node.child) {
        node.child.return = node;
        node = node.child;
        continue;
      }
      if (node === row) break;
      for (; null === node.sibling; ) {
        if (null === node.return || node.return === row) return null;
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
    return null;
  }
  var renderLanes = 0, currentlyRenderingFiber = null, currentHook = null, workInProgressHook = null, didScheduleRenderPhaseUpdate = false, didScheduleRenderPhaseUpdateDuringThisPass = false, shouldDoubleInvokeUserFnsInHooksDEV = false, localIdCounter = 0, thenableIndexCounter = 0, thenableState = null, globalClientIdCounter = 0;
  function throwInvalidHookError() {
    throw Error(formatProdErrorMessage(321));
  }
  function areHookInputsEqual(nextDeps, prevDeps) {
    if (null === prevDeps) return false;
    for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++)
      if (!objectIs(nextDeps[i], prevDeps[i])) return false;
    return true;
  }
  function renderWithHooks(current, workInProgress2, Component, props, secondArg, nextRenderLanes) {
    renderLanes = nextRenderLanes;
    currentlyRenderingFiber = workInProgress2;
    workInProgress2.memoizedState = null;
    workInProgress2.updateQueue = null;
    workInProgress2.lanes = 0;
    ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
    shouldDoubleInvokeUserFnsInHooksDEV = false;
    nextRenderLanes = Component(props, secondArg);
    shouldDoubleInvokeUserFnsInHooksDEV = false;
    didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(
      workInProgress2,
      Component,
      props,
      secondArg
    ));
    finishRenderingHooks(current);
    return nextRenderLanes;
  }
  function finishRenderingHooks(current) {
    ReactSharedInternals.H = ContextOnlyDispatcher;
    var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
    renderLanes = 0;
    workInProgressHook = currentHook = currentlyRenderingFiber = null;
    didScheduleRenderPhaseUpdate = false;
    thenableIndexCounter = 0;
    thenableState = null;
    if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
    null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = true));
  }
  function renderWithHooksAgain(workInProgress2, Component, props, secondArg) {
    currentlyRenderingFiber = workInProgress2;
    var numberOfReRenders = 0;
    do {
      didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
      thenableIndexCounter = 0;
      didScheduleRenderPhaseUpdateDuringThisPass = false;
      if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
      numberOfReRenders += 1;
      workInProgressHook = currentHook = null;
      if (null != workInProgress2.updateQueue) {
        var children = workInProgress2.updateQueue;
        children.lastEffect = null;
        children.events = null;
        children.stores = null;
        null != children.memoCache && (children.memoCache.index = 0);
      }
      ReactSharedInternals.H = HooksDispatcherOnRerender;
      children = Component(props, secondArg);
    } while (didScheduleRenderPhaseUpdateDuringThisPass);
    return children;
  }
  function TransitionAwareHostComponent() {
    var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
    maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
    dispatcher = dispatcher.useState()[0];
    (null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
    return maybeThenable;
  }
  function checkDidRenderIdHook() {
    var didRenderIdHook = 0 !== localIdCounter;
    localIdCounter = 0;
    return didRenderIdHook;
  }
  function bailoutHooks(current, workInProgress2, lanes) {
    workInProgress2.updateQueue = current.updateQueue;
    workInProgress2.flags &= -2053;
    current.lanes &= ~lanes;
  }
  function resetHooksOnUnwind(workInProgress2) {
    if (didScheduleRenderPhaseUpdate) {
      for (workInProgress2 = workInProgress2.memoizedState; null !== workInProgress2; ) {
        var queue = workInProgress2.queue;
        null !== queue && (queue.pending = null);
        workInProgress2 = workInProgress2.next;
      }
      didScheduleRenderPhaseUpdate = false;
    }
    renderLanes = 0;
    workInProgressHook = currentHook = currentlyRenderingFiber = null;
    didScheduleRenderPhaseUpdateDuringThisPass = false;
    thenableIndexCounter = localIdCounter = 0;
    thenableState = null;
  }
  function mountWorkInProgressHook() {
    var hook = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
    return workInProgressHook;
  }
  function updateWorkInProgressHook() {
    if (null === currentHook) {
      var nextCurrentHook = currentlyRenderingFiber.alternate;
      nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
    } else nextCurrentHook = currentHook.next;
    var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
    if (null !== nextWorkInProgressHook)
      workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
    else {
      if (null === nextCurrentHook) {
        if (null === currentlyRenderingFiber.alternate)
          throw Error(formatProdErrorMessage(467));
        throw Error(formatProdErrorMessage(310));
      }
      currentHook = nextCurrentHook;
      nextCurrentHook = {
        memoizedState: currentHook.memoizedState,
        baseState: currentHook.baseState,
        baseQueue: currentHook.baseQueue,
        queue: currentHook.queue,
        next: null
      };
      null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
    }
    return workInProgressHook;
  }
  function createFunctionComponentUpdateQueue() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function useThenable(thenable) {
    var index2 = thenableIndexCounter;
    thenableIndexCounter += 1;
    null === thenableState && (thenableState = []);
    thenable = trackUsedThenable(thenableState, thenable, index2);
    index2 = currentlyRenderingFiber;
    null === (null === workInProgressHook ? index2.memoizedState : workInProgressHook.next) && (index2 = index2.alternate, ReactSharedInternals.H = null === index2 || null === index2.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
    return thenable;
  }
  function use(usable) {
    if (null !== usable && "object" === typeof usable) {
      if ("function" === typeof usable.then) return useThenable(usable);
      if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
    }
    throw Error(formatProdErrorMessage(438, String(usable)));
  }
  function useMemoCache(size) {
    var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
    null !== updateQueue && (memoCache = updateQueue.memoCache);
    if (null == memoCache) {
      var current = currentlyRenderingFiber.alternate;
      null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
        data: current.data.map(function(array) {
          return array.slice();
        }),
        index: 0
      })));
    }
    null == memoCache && (memoCache = { data: [], index: 0 });
    null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
    updateQueue.memoCache = memoCache;
    updateQueue = memoCache.data[memoCache.index];
    if (void 0 === updateQueue)
      for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++)
        updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
    memoCache.index++;
    return updateQueue;
  }
  function basicStateReducer(state, action) {
    return "function" === typeof action ? action(state) : action;
  }
  function updateReducer(reducer) {
    var hook = updateWorkInProgressHook();
    return updateReducerImpl(hook, currentHook, reducer);
  }
  function updateReducerImpl(hook, current, reducer) {
    var queue = hook.queue;
    if (null === queue) throw Error(formatProdErrorMessage(311));
    queue.lastRenderedReducer = reducer;
    var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
    if (null !== pendingQueue) {
      if (null !== baseQueue) {
        var baseFirst = baseQueue.next;
        baseQueue.next = pendingQueue.next;
        pendingQueue.next = baseFirst;
      }
      current.baseQueue = baseQueue = pendingQueue;
      queue.pending = null;
    }
    pendingQueue = hook.baseState;
    if (null === baseQueue) hook.memoizedState = pendingQueue;
    else {
      current = baseQueue.next;
      var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$60 = false;
      do {
        var updateLane = update.lane & -536870913;
        if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
          var revertLane = update.revertLane;
          if (0 === revertLane)
            null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: update.action,
              hasEagerState: update.hasEagerState,
              eagerState: update.eagerState,
              next: null
            }), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = true);
          else if ((renderLanes & revertLane) === revertLane) {
            update = update.next;
            revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = true);
            continue;
          } else
            updateLane = {
              lane: 0,
              revertLane: update.revertLane,
              gesture: null,
              action: update.action,
              hasEagerState: update.hasEagerState,
              eagerState: update.eagerState,
              next: null
            }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
          updateLane = update.action;
          shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
          pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
        } else
          revertLane = {
            lane: updateLane,
            revertLane: update.revertLane,
            gesture: update.gesture,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: null
          }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
        update = update.next;
      } while (null !== update && update !== current);
      null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
      if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = true, didReadFromEntangledAsyncAction$60 && (reducer = currentEntangledActionThenable, null !== reducer)))
        throw reducer;
      hook.memoizedState = pendingQueue;
      hook.baseState = baseFirst;
      hook.baseQueue = newBaseQueueLast;
      queue.lastRenderedState = pendingQueue;
    }
    null === baseQueue && (queue.lanes = 0);
    return [hook.memoizedState, queue.dispatch];
  }
  function rerenderReducer(reducer) {
    var hook = updateWorkInProgressHook(), queue = hook.queue;
    if (null === queue) throw Error(formatProdErrorMessage(311));
    queue.lastRenderedReducer = reducer;
    var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
    if (null !== lastRenderPhaseUpdate) {
      queue.pending = null;
      var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
      do
        newState = reducer(newState, update.action), update = update.next;
      while (update !== lastRenderPhaseUpdate);
      objectIs(newState, hook.memoizedState) || (didReceiveUpdate = true);
      hook.memoizedState = newState;
      null === hook.baseQueue && (hook.baseState = newState);
      queue.lastRenderedState = newState;
    }
    return [newState, dispatch];
  }
  function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
    var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
    if (isHydrating$jscomp$0) {
      if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
      getServerSnapshot = getServerSnapshot();
    } else getServerSnapshot = getSnapshot();
    var snapshotChanged = !objectIs(
      (currentHook || hook).memoizedState,
      getServerSnapshot
    );
    snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = true);
    hook = hook.queue;
    updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [
      subscribe
    ]);
    if (hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && workInProgressHook.memoizedState.tag & 1) {
      fiber.flags |= 2048;
      pushSimpleEffect(
        9,
        { destroy: void 0 },
        updateStoreInstance.bind(
          null,
          fiber,
          hook,
          getServerSnapshot,
          getSnapshot
        ),
        null
      );
      if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
      isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
    }
    return getServerSnapshot;
  }
  function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
    fiber.flags |= 16384;
    fiber = { getSnapshot, value: renderedSnapshot };
    getSnapshot = currentlyRenderingFiber.updateQueue;
    null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
  }
  function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
    inst.value = nextSnapshot;
    inst.getSnapshot = getSnapshot;
    checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
  }
  function subscribeToStore(fiber, inst, subscribe) {
    return subscribe(function() {
      checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
    });
  }
  function checkIfSnapshotChanged(inst) {
    var latestGetSnapshot = inst.getSnapshot;
    inst = inst.value;
    try {
      var nextValue = latestGetSnapshot();
      return !objectIs(inst, nextValue);
    } catch (error) {
      return true;
    }
  }
  function forceStoreRerender(fiber) {
    var root2 = enqueueConcurrentRenderForLane(fiber, 2);
    null !== root2 && scheduleUpdateOnFiber(root2, fiber, 2);
  }
  function mountStateImpl(initialState) {
    var hook = mountWorkInProgressHook();
    if ("function" === typeof initialState) {
      var initialStateInitializer = initialState;
      initialState = initialStateInitializer();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          initialStateInitializer();
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
    }
    hook.memoizedState = hook.baseState = initialState;
    hook.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: initialState
    };
    return hook;
  }
  function updateOptimisticImpl(hook, current, passthrough, reducer) {
    hook.baseState = passthrough;
    return updateReducerImpl(
      hook,
      currentHook,
      "function" === typeof reducer ? reducer : basicStateReducer
    );
  }
  function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
    if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
    fiber = actionQueue.action;
    if (null !== fiber) {
      var actionNode = {
        payload,
        action: fiber,
        next: null,
        isTransition: true,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(listener) {
          actionNode.listeners.push(listener);
        }
      };
      null !== ReactSharedInternals.T ? setPendingState(true) : actionNode.isTransition = false;
      setState(actionNode);
      setPendingState = actionQueue.pending;
      null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
    }
  }
  function runActionStateAction(actionQueue, node) {
    var action = node.action, payload = node.payload, prevState = actionQueue.state;
    if (node.isTransition) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        handleActionReturnValue(actionQueue, node, returnValue);
      } catch (error) {
        onActionError(actionQueue, node, error);
      } finally {
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    } else
      try {
        prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
      } catch (error$66) {
        onActionError(actionQueue, node, error$66);
      }
  }
  function handleActionReturnValue(actionQueue, node, returnValue) {
    null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(
      function(nextState) {
        onActionSuccess(actionQueue, node, nextState);
      },
      function(error) {
        return onActionError(actionQueue, node, error);
      }
    ) : onActionSuccess(actionQueue, node, returnValue);
  }
  function onActionSuccess(actionQueue, actionNode, nextState) {
    actionNode.status = "fulfilled";
    actionNode.value = nextState;
    notifyActionListeners(actionNode);
    actionQueue.state = nextState;
    actionNode = actionQueue.pending;
    null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
  }
  function onActionError(actionQueue, actionNode, error) {
    var last = actionQueue.pending;
    actionQueue.pending = null;
    if (null !== last) {
      last = last.next;
      do
        actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
      while (actionNode !== last);
    }
    actionQueue.action = null;
  }
  function notifyActionListeners(actionNode) {
    actionNode = actionNode.listeners;
    for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
  }
  function actionStateReducer(oldState, newState) {
    return newState;
  }
  function mountActionState(action, initialStateProp) {
    if (isHydrating) {
      var ssrFormState = workInProgressRoot.formState;
      if (null !== ssrFormState) {
        a: {
          var JSCompiler_inline_result = currentlyRenderingFiber;
          if (isHydrating) {
            if (nextHydratableInstance) {
              b: {
                var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
                for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType; ) {
                  if (!inRootOrSingleton) {
                    JSCompiler_inline_result$jscomp$0 = null;
                    break b;
                  }
                  JSCompiler_inline_result$jscomp$0 = getNextHydratable(
                    JSCompiler_inline_result$jscomp$0.nextSibling
                  );
                  if (null === JSCompiler_inline_result$jscomp$0) {
                    JSCompiler_inline_result$jscomp$0 = null;
                    break b;
                  }
                }
                inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
                JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
              }
              if (JSCompiler_inline_result$jscomp$0) {
                nextHydratableInstance = getNextHydratable(
                  JSCompiler_inline_result$jscomp$0.nextSibling
                );
                JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
                break a;
              }
            }
            throwOnHydrationMismatch(JSCompiler_inline_result);
          }
          JSCompiler_inline_result = false;
        }
        JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
      }
    }
    ssrFormState = mountWorkInProgressHook();
    ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
    JSCompiler_inline_result = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: actionStateReducer,
      lastRenderedState: initialStateProp
    };
    ssrFormState.queue = JSCompiler_inline_result;
    ssrFormState = dispatchSetState.bind(
      null,
      currentlyRenderingFiber,
      JSCompiler_inline_result
    );
    JSCompiler_inline_result.dispatch = ssrFormState;
    JSCompiler_inline_result = mountStateImpl(false);
    inRootOrSingleton = dispatchOptimisticSetState.bind(
      null,
      currentlyRenderingFiber,
      false,
      JSCompiler_inline_result.queue
    );
    JSCompiler_inline_result = mountWorkInProgressHook();
    JSCompiler_inline_result$jscomp$0 = {
      state: initialStateProp,
      dispatch: null,
      action,
      pending: null
    };
    JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
    ssrFormState = dispatchActionState.bind(
      null,
      currentlyRenderingFiber,
      JSCompiler_inline_result$jscomp$0,
      inRootOrSingleton,
      ssrFormState
    );
    JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
    JSCompiler_inline_result.memoizedState = action;
    return [initialStateProp, ssrFormState, false];
  }
  function updateActionState(action) {
    var stateHook = updateWorkInProgressHook();
    return updateActionStateImpl(stateHook, currentHook, action);
  }
  function updateActionStateImpl(stateHook, currentStateHook, action) {
    currentStateHook = updateReducerImpl(
      stateHook,
      currentStateHook,
      actionStateReducer
    )[0];
    stateHook = updateReducer(basicStateReducer)[0];
    if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then)
      try {
        var state = useThenable(currentStateHook);
      } catch (x) {
        if (x === SuspenseException) throw SuspenseActionException;
        throw x;
      }
    else state = currentStateHook;
    currentStateHook = updateWorkInProgressHook();
    var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
    action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(
      9,
      { destroy: void 0 },
      actionStateActionEffect.bind(null, actionQueue, action),
      null
    ));
    return [state, dispatch, stateHook];
  }
  function actionStateActionEffect(actionQueue, action) {
    actionQueue.action = action;
  }
  function rerenderActionState(action) {
    var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
    if (null !== currentStateHook)
      return updateActionStateImpl(stateHook, currentStateHook, action);
    updateWorkInProgressHook();
    stateHook = stateHook.memoizedState;
    currentStateHook = updateWorkInProgressHook();
    var dispatch = currentStateHook.queue.dispatch;
    currentStateHook.memoizedState = action;
    return [stateHook, dispatch, false];
  }
  function pushSimpleEffect(tag, inst, create, deps) {
    tag = { tag, create, deps, inst, next: null };
    inst = currentlyRenderingFiber.updateQueue;
    null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
    create = inst.lastEffect;
    null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
    return tag;
  }
  function updateRef() {
    return updateWorkInProgressHook().memoizedState;
  }
  function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
    var hook = mountWorkInProgressHook();
    currentlyRenderingFiber.flags |= fiberFlags;
    hook.memoizedState = pushSimpleEffect(
      1 | hookFlags,
      { destroy: void 0 },
      create,
      void 0 === deps ? null : deps
    );
  }
  function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
    var hook = updateWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    var inst = hook.memoizedState.inst;
    null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(
      1 | hookFlags,
      inst,
      create,
      deps
    ));
  }
  function mountEffect(create, deps) {
    mountEffectImpl(8390656, 8, create, deps);
  }
  function updateEffect(create, deps) {
    updateEffectImpl(2048, 8, create, deps);
  }
  function useEffectEventImpl(payload) {
    currentlyRenderingFiber.flags |= 4;
    var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
    if (null === componentUpdateQueue)
      componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
    else {
      var events = componentUpdateQueue.events;
      null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
    }
  }
  function updateEvent(callback) {
    var ref = updateWorkInProgressHook().memoizedState;
    useEffectEventImpl({ ref, nextImpl: callback });
    return function() {
      if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
      return ref.impl.apply(void 0, arguments);
    };
  }
  function updateInsertionEffect(create, deps) {
    return updateEffectImpl(4, 2, create, deps);
  }
  function updateLayoutEffect(create, deps) {
    return updateEffectImpl(4, 4, create, deps);
  }
  function imperativeHandleEffect(create, ref) {
    if ("function" === typeof ref) {
      create = create();
      var refCleanup = ref(create);
      return function() {
        "function" === typeof refCleanup ? refCleanup() : ref(null);
      };
    }
    if (null !== ref && void 0 !== ref)
      return create = create(), ref.current = create, function() {
        ref.current = null;
      };
  }
  function updateImperativeHandle(ref, create, deps) {
    deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
    updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
  }
  function mountDebugValue() {
  }
  function updateCallback(callback, deps) {
    var hook = updateWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    var prevState = hook.memoizedState;
    if (null !== deps && areHookInputsEqual(deps, prevState[1]))
      return prevState[0];
    hook.memoizedState = [callback, deps];
    return callback;
  }
  function updateMemo(nextCreate, deps) {
    var hook = updateWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    var prevState = hook.memoizedState;
    if (null !== deps && areHookInputsEqual(deps, prevState[1]))
      return prevState[0];
    prevState = nextCreate();
    if (shouldDoubleInvokeUserFnsInHooksDEV) {
      setIsStrictModeForDevtools(true);
      try {
        nextCreate();
      } finally {
        setIsStrictModeForDevtools(false);
      }
    }
    hook.memoizedState = [prevState, deps];
    return prevState;
  }
  function mountDeferredValueImpl(hook, value, initialValue) {
    if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
      return hook.memoizedState = value;
    hook.memoizedState = initialValue;
    hook = requestDeferredLane();
    currentlyRenderingFiber.lanes |= hook;
    workInProgressRootSkippedLanes |= hook;
    return initialValue;
  }
  function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
    if (objectIs(value, prevValue)) return value;
    if (null !== currentTreeHiddenStackCursor.current)
      return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = true), hook;
    if (0 === (renderLanes & 42) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
      return didReceiveUpdate = true, hook.memoizedState = value;
    hook = requestDeferredLane();
    currentlyRenderingFiber.lanes |= hook;
    workInProgressRootSkippedLanes |= hook;
    return prevValue;
  }
  function startTransition(fiber, queue, pendingState, finishedState, callback) {
    var previousPriority = ReactDOMSharedInternals.p;
    ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    dispatchOptimisticSetState(fiber, false, queue, pendingState);
    try {
      var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
      if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) {
        var thenableForFinishedState = chainThenableValue(
          returnValue,
          finishedState
        );
        dispatchSetStateInternal(
          fiber,
          queue,
          thenableForFinishedState,
          requestUpdateLane(fiber)
        );
      } else
        dispatchSetStateInternal(
          fiber,
          queue,
          finishedState,
          requestUpdateLane(fiber)
        );
    } catch (error) {
      dispatchSetStateInternal(
        fiber,
        queue,
        { then: function() {
        }, status: "rejected", reason: error },
        requestUpdateLane()
      );
    } finally {
      ReactDOMSharedInternals.p = previousPriority, null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
    }
  }
  function noop() {
  }
  function startHostTransition(formFiber, pendingState, action, formData) {
    if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
    var queue = ensureFormComponentIsStateful(formFiber).queue;
    startTransition(
      formFiber,
      queue,
      pendingState,
      sharedNotPendingObject,
      null === action ? noop : function() {
        requestFormReset$1(formFiber);
        return action(formData);
      }
    );
  }
  function ensureFormComponentIsStateful(formFiber) {
    var existingStateHook = formFiber.memoizedState;
    if (null !== existingStateHook) return existingStateHook;
    existingStateHook = {
      memoizedState: sharedNotPendingObject,
      baseState: sharedNotPendingObject,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: sharedNotPendingObject
      },
      next: null
    };
    var initialResetState = {};
    existingStateHook.next = {
      memoizedState: initialResetState,
      baseState: initialResetState,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: initialResetState
      },
      next: null
    };
    formFiber.memoizedState = existingStateHook;
    formFiber = formFiber.alternate;
    null !== formFiber && (formFiber.memoizedState = existingStateHook);
    return existingStateHook;
  }
  function requestFormReset$1(formFiber) {
    var stateHook = ensureFormComponentIsStateful(formFiber);
    null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
    dispatchSetStateInternal(
      formFiber,
      stateHook.next.queue,
      {},
      requestUpdateLane()
    );
  }
  function useHostTransitionStatus() {
    return readContext(HostTransitionContext);
  }
  function updateId() {
    return updateWorkInProgressHook().memoizedState;
  }
  function updateRefresh() {
    return updateWorkInProgressHook().memoizedState;
  }
  function refreshCache(fiber) {
    for (var provider = fiber.return; null !== provider; ) {
      switch (provider.tag) {
        case 24:
        case 3:
          var lane = requestUpdateLane();
          fiber = createUpdate(lane);
          var root$69 = enqueueUpdate(provider, fiber, lane);
          null !== root$69 && (scheduleUpdateOnFiber(root$69, provider, lane), entangleTransitions(root$69, provider, lane));
          provider = { cache: createCache() };
          fiber.payload = provider;
          return;
      }
      provider = provider.return;
    }
  }
  function dispatchReducerAction(fiber, queue, action) {
    var lane = requestUpdateLane();
    action = {
      lane,
      revertLane: 0,
      gesture: null,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
  }
  function dispatchSetState(fiber, queue, action) {
    var lane = requestUpdateLane();
    dispatchSetStateInternal(fiber, queue, action, lane);
  }
  function dispatchSetStateInternal(fiber, queue, action, lane) {
    var update = {
      lane,
      revertLane: 0,
      gesture: null,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
    else {
      var alternate = fiber.alternate;
      if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate))
        try {
          var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
          update.hasEagerState = true;
          update.eagerState = eagerState;
          if (objectIs(eagerState, currentState))
            return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), false;
        } catch (error) {
        } finally {
        }
      action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
      if (null !== action)
        return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), true;
    }
    return false;
  }
  function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
    action = {
      lane: 2,
      revertLane: requestTransitionLane(),
      gesture: null,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    if (isRenderPhaseUpdate(fiber)) {
      if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
    } else
      throwIfDuringRender = enqueueConcurrentHookUpdate(
        fiber,
        queue,
        action,
        2
      ), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
  }
  function isRenderPhaseUpdate(fiber) {
    var alternate = fiber.alternate;
    return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
  }
  function enqueueRenderPhaseUpdate(queue, update) {
    didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
    var pending = queue.pending;
    null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
    queue.pending = update;
  }
  function entangleTransitionUpdate(root2, queue, lane) {
    if (0 !== (lane & 4194048)) {
      var queueLanes = queue.lanes;
      queueLanes &= root2.pendingLanes;
      lane |= queueLanes;
      queue.lanes = lane;
      markRootEntangled(root2, lane);
    }
  }
  var ContextOnlyDispatcher = {
    readContext,
    use,
    useCallback: throwInvalidHookError,
    useContext: throwInvalidHookError,
    useEffect: throwInvalidHookError,
    useImperativeHandle: throwInvalidHookError,
    useLayoutEffect: throwInvalidHookError,
    useInsertionEffect: throwInvalidHookError,
    useMemo: throwInvalidHookError,
    useReducer: throwInvalidHookError,
    useRef: throwInvalidHookError,
    useState: throwInvalidHookError,
    useDebugValue: throwInvalidHookError,
    useDeferredValue: throwInvalidHookError,
    useTransition: throwInvalidHookError,
    useSyncExternalStore: throwInvalidHookError,
    useId: throwInvalidHookError,
    useHostTransitionStatus: throwInvalidHookError,
    useFormState: throwInvalidHookError,
    useActionState: throwInvalidHookError,
    useOptimistic: throwInvalidHookError,
    useMemoCache: throwInvalidHookError,
    useCacheRefresh: throwInvalidHookError
  };
  ContextOnlyDispatcher.useEffectEvent = throwInvalidHookError;
  var HooksDispatcherOnMount = {
    readContext,
    use,
    useCallback: function(callback, deps) {
      mountWorkInProgressHook().memoizedState = [
        callback,
        void 0 === deps ? null : deps
      ];
      return callback;
    },
    useContext: readContext,
    useEffect: mountEffect,
    useImperativeHandle: function(ref, create, deps) {
      deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
      mountEffectImpl(
        4194308,
        4,
        imperativeHandleEffect.bind(null, create, ref),
        deps
      );
    },
    useLayoutEffect: function(create, deps) {
      return mountEffectImpl(4194308, 4, create, deps);
    },
    useInsertionEffect: function(create, deps) {
      mountEffectImpl(4, 2, create, deps);
    },
    useMemo: function(nextCreate, deps) {
      var hook = mountWorkInProgressHook();
      deps = void 0 === deps ? null : deps;
      var nextValue = nextCreate();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          nextCreate();
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
      hook.memoizedState = [nextValue, deps];
      return nextValue;
    },
    useReducer: function(reducer, initialArg, init) {
      var hook = mountWorkInProgressHook();
      if (void 0 !== init) {
        var initialState = init(initialArg);
        if (shouldDoubleInvokeUserFnsInHooksDEV) {
          setIsStrictModeForDevtools(true);
          try {
            init(initialArg);
          } finally {
            setIsStrictModeForDevtools(false);
          }
        }
      } else initialState = initialArg;
      hook.memoizedState = hook.baseState = initialState;
      reducer = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: reducer,
        lastRenderedState: initialState
      };
      hook.queue = reducer;
      reducer = reducer.dispatch = dispatchReducerAction.bind(
        null,
        currentlyRenderingFiber,
        reducer
      );
      return [hook.memoizedState, reducer];
    },
    useRef: function(initialValue) {
      var hook = mountWorkInProgressHook();
      initialValue = { current: initialValue };
      return hook.memoizedState = initialValue;
    },
    useState: function(initialState) {
      initialState = mountStateImpl(initialState);
      var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
      queue.dispatch = dispatch;
      return [initialState.memoizedState, dispatch];
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = mountWorkInProgressHook();
      return mountDeferredValueImpl(hook, value, initialValue);
    },
    useTransition: function() {
      var stateHook = mountStateImpl(false);
      stateHook = startTransition.bind(
        null,
        currentlyRenderingFiber,
        stateHook.queue,
        true,
        false
      );
      mountWorkInProgressHook().memoizedState = stateHook;
      return [false, stateHook];
    },
    useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
      var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
      if (isHydrating) {
        if (void 0 === getServerSnapshot)
          throw Error(formatProdErrorMessage(407));
        getServerSnapshot = getServerSnapshot();
      } else {
        getServerSnapshot = getSnapshot();
        if (null === workInProgressRoot)
          throw Error(formatProdErrorMessage(349));
        0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
      }
      hook.memoizedState = getServerSnapshot;
      var inst = { value: getServerSnapshot, getSnapshot };
      hook.queue = inst;
      mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
        subscribe
      ]);
      fiber.flags |= 2048;
      pushSimpleEffect(
        9,
        { destroy: void 0 },
        updateStoreInstance.bind(
          null,
          fiber,
          inst,
          getServerSnapshot,
          getSnapshot
        ),
        null
      );
      return getServerSnapshot;
    },
    useId: function() {
      var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
      if (isHydrating) {
        var JSCompiler_inline_result = treeContextOverflow;
        var idWithLeadingBit = treeContextId;
        JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
        identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
        JSCompiler_inline_result = localIdCounter++;
        0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
        identifierPrefix += "_";
      } else
        JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
      return hook.memoizedState = identifierPrefix;
    },
    useHostTransitionStatus,
    useFormState: mountActionState,
    useActionState: mountActionState,
    useOptimistic: function(passthrough) {
      var hook = mountWorkInProgressHook();
      hook.memoizedState = hook.baseState = passthrough;
      var queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      hook.queue = queue;
      hook = dispatchOptimisticSetState.bind(
        null,
        currentlyRenderingFiber,
        true,
        queue
      );
      queue.dispatch = hook;
      return [passthrough, hook];
    },
    useMemoCache,
    useCacheRefresh: function() {
      return mountWorkInProgressHook().memoizedState = refreshCache.bind(
        null,
        currentlyRenderingFiber
      );
    },
    useEffectEvent: function(callback) {
      var hook = mountWorkInProgressHook(), ref = { impl: callback };
      hook.memoizedState = ref;
      return function() {
        if (0 !== (executionContext & 2))
          throw Error(formatProdErrorMessage(440));
        return ref.impl.apply(void 0, arguments);
      };
    }
  }, HooksDispatcherOnUpdate = {
    readContext,
    use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: updateReducer,
    useRef: updateRef,
    useState: function() {
      return updateReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = updateWorkInProgressHook();
      return updateDeferredValueImpl(
        hook,
        currentHook.memoizedState,
        value,
        initialValue
      );
    },
    useTransition: function() {
      var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
      return [
        "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus,
    useFormState: updateActionState,
    useActionState: updateActionState,
    useOptimistic: function(passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
    },
    useMemoCache,
    useCacheRefresh: updateRefresh
  };
  HooksDispatcherOnUpdate.useEffectEvent = updateEvent;
  var HooksDispatcherOnRerender = {
    readContext,
    use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: rerenderReducer,
    useRef: updateRef,
    useState: function() {
      return rerenderReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = updateWorkInProgressHook();
      return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(
        hook,
        currentHook.memoizedState,
        value,
        initialValue
      );
    },
    useTransition: function() {
      var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
      return [
        "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus,
    useFormState: rerenderActionState,
    useActionState: rerenderActionState,
    useOptimistic: function(passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      if (null !== currentHook)
        return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
      hook.baseState = passthrough;
      return [passthrough, hook.queue.dispatch];
    },
    useMemoCache,
    useCacheRefresh: updateRefresh
  };
  HooksDispatcherOnRerender.useEffectEvent = updateEvent;
  function applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, nextProps) {
    ctor = workInProgress2.memoizedState;
    getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
    getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
    workInProgress2.memoizedState = getDerivedStateFromProps;
    0 === workInProgress2.lanes && (workInProgress2.updateQueue.baseState = getDerivedStateFromProps);
  }
  var classComponentUpdater = {
    enqueueSetState: function(inst, payload, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.payload = payload;
      void 0 !== callback && null !== callback && (update.callback = callback);
      payload = enqueueUpdate(inst, update, lane);
      null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
    },
    enqueueReplaceState: function(inst, payload, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.tag = 1;
      update.payload = payload;
      void 0 !== callback && null !== callback && (update.callback = callback);
      payload = enqueueUpdate(inst, update, lane);
      null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
    },
    enqueueForceUpdate: function(inst, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.tag = 2;
      void 0 !== callback && null !== callback && (update.callback = callback);
      callback = enqueueUpdate(inst, update, lane);
      null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
    }
  };
  function checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) {
    workInProgress2 = workInProgress2.stateNode;
    return "function" === typeof workInProgress2.shouldComponentUpdate ? workInProgress2.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : true;
  }
  function callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext) {
    workInProgress2 = instance.state;
    "function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
    "function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
    instance.state !== workInProgress2 && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
  }
  function resolveClassComponentProps(Component, baseProps) {
    var newProps = baseProps;
    if ("ref" in baseProps) {
      newProps = {};
      for (var propName in baseProps)
        "ref" !== propName && (newProps[propName] = baseProps[propName]);
    }
    if (Component = Component.defaultProps) {
      newProps === baseProps && (newProps = assign({}, newProps));
      for (var propName$73 in Component)
        void 0 === newProps[propName$73] && (newProps[propName$73] = Component[propName$73]);
    }
    return newProps;
  }
  function defaultOnUncaughtError(error) {
    reportGlobalError(error);
  }
  function defaultOnCaughtError(error) {
    console.error(error);
  }
  function defaultOnRecoverableError(error) {
    reportGlobalError(error);
  }
  function logUncaughtError(root2, errorInfo) {
    try {
      var onUncaughtError = root2.onUncaughtError;
      onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
    } catch (e$74) {
      setTimeout(function() {
        throw e$74;
      });
    }
  }
  function logCaughtError(root2, boundary, errorInfo) {
    try {
      var onCaughtError = root2.onCaughtError;
      onCaughtError(errorInfo.value, {
        componentStack: errorInfo.stack,
        errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
      });
    } catch (e$75) {
      setTimeout(function() {
        throw e$75;
      });
    }
  }
  function createRootErrorUpdate(root2, errorInfo, lane) {
    lane = createUpdate(lane);
    lane.tag = 3;
    lane.payload = { element: null };
    lane.callback = function() {
      logUncaughtError(root2, errorInfo);
    };
    return lane;
  }
  function createClassErrorUpdate(lane) {
    lane = createUpdate(lane);
    lane.tag = 3;
    return lane;
  }
  function initializeClassErrorUpdate(update, root2, fiber, errorInfo) {
    var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
    if ("function" === typeof getDerivedStateFromError) {
      var error = errorInfo.value;
      update.payload = function() {
        return getDerivedStateFromError(error);
      };
      update.callback = function() {
        logCaughtError(root2, fiber, errorInfo);
      };
    }
    var inst = fiber.stateNode;
    null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
      logCaughtError(root2, fiber, errorInfo);
      "function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
      var stack = errorInfo.stack;
      this.componentDidCatch(errorInfo.value, {
        componentStack: null !== stack ? stack : ""
      });
    });
  }
  function throwException(root2, returnFiber, sourceFiber, value, rootRenderLanes) {
    sourceFiber.flags |= 32768;
    if (null !== value && "object" === typeof value && "function" === typeof value.then) {
      returnFiber = sourceFiber.alternate;
      null !== returnFiber && propagateParentContextChanges(
        returnFiber,
        sourceFiber,
        rootRenderLanes,
        true
      );
      sourceFiber = suspenseHandlerStackCursor.current;
      if (null !== sourceFiber) {
        switch (sourceFiber.tag) {
          case 31:
          case 13:
            return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root2, value, rootRenderLanes)), false;
          case 22:
            return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([value])
            }, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root2, value, rootRenderLanes)), false;
        }
        throw Error(formatProdErrorMessage(435, sourceFiber.tag));
      }
      attachPingListener(root2, value, rootRenderLanes);
      renderDidSuspendDelayIfPossible();
      return false;
    }
    if (isHydrating)
      return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root2 = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root2, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), {
        cause: value
      }), queueHydrationError(
        createCapturedValueAtFiber(returnFiber, sourceFiber)
      )), root2 = root2.current.alternate, root2.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root2.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(
        root2.stateNode,
        value,
        rootRenderLanes
      ), enqueueCapturedUpdate(root2, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), false;
    var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
    wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
    null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
    4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
    if (null === returnFiber) return true;
    value = createCapturedValueAtFiber(value, sourceFiber);
    sourceFiber = returnFiber;
    do {
      switch (sourceFiber.tag) {
        case 3:
          return sourceFiber.flags |= 65536, root2 = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root2, root2 = createRootErrorUpdate(sourceFiber.stateNode, value, root2), enqueueCapturedUpdate(sourceFiber, root2), false;
        case 1:
          if (returnFiber = sourceFiber.type, wrapperError = sourceFiber.stateNode, 0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError))))
            return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(
              rootRenderLanes,
              root2,
              sourceFiber,
              value
            ), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), false;
      }
      sourceFiber = sourceFiber.return;
    } while (null !== sourceFiber);
    return false;
  }
  var SelectiveHydrationException = Error(formatProdErrorMessage(461)), didReceiveUpdate = false;
  function reconcileChildren(current, workInProgress2, nextChildren, renderLanes2) {
    workInProgress2.child = null === current ? mountChildFibers(workInProgress2, null, nextChildren, renderLanes2) : reconcileChildFibers(
      workInProgress2,
      current.child,
      nextChildren,
      renderLanes2
    );
  }
  function updateForwardRef(current, workInProgress2, Component, nextProps, renderLanes2) {
    Component = Component.render;
    var ref = workInProgress2.ref;
    if ("ref" in nextProps) {
      var propsWithoutRef = {};
      for (var key in nextProps)
        "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
    } else propsWithoutRef = nextProps;
    prepareToReadContext(workInProgress2);
    nextProps = renderWithHooks(
      current,
      workInProgress2,
      Component,
      propsWithoutRef,
      ref,
      renderLanes2
    );
    key = checkDidRenderIdHook();
    if (null !== current && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && key && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    return workInProgress2.child;
  }
  function updateMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    if (null === current) {
      var type = Component.type;
      if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare)
        return workInProgress2.tag = 15, workInProgress2.type = type, updateSimpleMemoComponent(
          current,
          workInProgress2,
          type,
          nextProps,
          renderLanes2
        );
      current = createFiberFromTypeAndProps(
        Component.type,
        null,
        nextProps,
        workInProgress2,
        workInProgress2.mode,
        renderLanes2
      );
      current.ref = workInProgress2.ref;
      current.return = workInProgress2;
      return workInProgress2.child = current;
    }
    type = current.child;
    if (!checkScheduledUpdateOrContext(current, renderLanes2)) {
      var prevProps = type.memoizedProps;
      Component = Component.compare;
      Component = null !== Component ? Component : shallowEqual;
      if (Component(prevProps, nextProps) && current.ref === workInProgress2.ref)
        return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    }
    workInProgress2.flags |= 1;
    current = createWorkInProgress(type, nextProps);
    current.ref = workInProgress2.ref;
    current.return = workInProgress2;
    return workInProgress2.child = current;
  }
  function updateSimpleMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    if (null !== current) {
      var prevProps = current.memoizedProps;
      if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress2.ref)
        if (didReceiveUpdate = false, workInProgress2.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes2))
          0 !== (current.flags & 131072) && (didReceiveUpdate = true);
        else
          return workInProgress2.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    }
    return updateFunctionComponent(
      current,
      workInProgress2,
      Component,
      nextProps,
      renderLanes2
    );
  }
  function updateOffscreenComponent(current, workInProgress2, renderLanes2, nextProps) {
    var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
    null === current && null === workInProgress2.stateNode && (workInProgress2.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    });
    if ("hidden" === nextProps.mode) {
      if (0 !== (workInProgress2.flags & 128)) {
        prevState = null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2;
        if (null !== current) {
          nextProps = workInProgress2.child = current.child;
          for (nextChildren = 0; null !== nextProps; )
            nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
          nextProps = nextChildren & ~prevState;
        } else nextProps = 0, workInProgress2.child = null;
        return deferHiddenOffscreenComponent(
          current,
          workInProgress2,
          prevState,
          renderLanes2,
          nextProps
        );
      }
      if (0 !== (renderLanes2 & 536870912))
        workInProgress2.memoizedState = { baseLanes: 0, cachePool: null }, null !== current && pushTransition(
          workInProgress2,
          null !== prevState ? prevState.cachePool : null
        ), null !== prevState ? pushHiddenContext(workInProgress2, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress2);
      else
        return nextProps = workInProgress2.lanes = 536870912, deferHiddenOffscreenComponent(
          current,
          workInProgress2,
          null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2,
          renderLanes2,
          nextProps
        );
    } else
      null !== prevState ? (pushTransition(workInProgress2, prevState.cachePool), pushHiddenContext(workInProgress2, prevState), reuseSuspenseHandlerOnStack(), workInProgress2.memoizedState = null) : (null !== current && pushTransition(workInProgress2, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack());
    reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
    return workInProgress2.child;
  }
  function bailoutOffscreenComponent(current, workInProgress2) {
    null !== current && 22 === current.tag || null !== workInProgress2.stateNode || (workInProgress2.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    });
    return workInProgress2.sibling;
  }
  function deferHiddenOffscreenComponent(current, workInProgress2, nextBaseLanes, renderLanes2, remainingChildLanes) {
    var JSCompiler_inline_result = peekCacheFromPool();
    JSCompiler_inline_result = null === JSCompiler_inline_result ? null : { parent: CacheContext._currentValue, pool: JSCompiler_inline_result };
    workInProgress2.memoizedState = {
      baseLanes: nextBaseLanes,
      cachePool: JSCompiler_inline_result
    };
    null !== current && pushTransition(workInProgress2, null);
    reuseHiddenContextOnStack();
    pushOffscreenSuspenseHandler(workInProgress2);
    null !== current && propagateParentContextChanges(current, workInProgress2, renderLanes2, true);
    workInProgress2.childLanes = remainingChildLanes;
    return null;
  }
  function mountActivityChildren(workInProgress2, nextProps) {
    nextProps = mountWorkInProgressOffscreenFiber(
      { mode: nextProps.mode, children: nextProps.children },
      workInProgress2.mode
    );
    nextProps.ref = workInProgress2.ref;
    workInProgress2.child = nextProps;
    nextProps.return = workInProgress2;
    return nextProps;
  }
  function retryActivityComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
    reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
    current = mountActivityChildren(workInProgress2, workInProgress2.pendingProps);
    current.flags |= 2;
    popSuspenseHandler(workInProgress2);
    workInProgress2.memoizedState = null;
    return current;
  }
  function updateActivityComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, didSuspend = 0 !== (workInProgress2.flags & 128);
    workInProgress2.flags &= -129;
    if (null === current) {
      if (isHydrating) {
        if ("hidden" === nextProps.mode)
          return current = mountActivityChildren(workInProgress2, nextProps), workInProgress2.lanes = 536870912, bailoutOffscreenComponent(null, current);
        pushDehydratedActivitySuspenseHandler(workInProgress2);
        (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(
          current,
          rootOrSingletonContext
        ), current = null !== current && "&" === current.data ? current : null, null !== current && (workInProgress2.memoizedState = {
          dehydrated: current,
          treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
        if (null === current) throw throwOnHydrationMismatch(workInProgress2);
        workInProgress2.lanes = 536870912;
        return null;
      }
      return mountActivityChildren(workInProgress2, nextProps);
    }
    var prevState = current.memoizedState;
    if (null !== prevState) {
      var dehydrated = prevState.dehydrated;
      pushDehydratedActivitySuspenseHandler(workInProgress2);
      if (didSuspend)
        if (workInProgress2.flags & 256)
          workInProgress2.flags &= -257, workInProgress2 = retryActivityComponentWithoutHydrating(
            current,
            workInProgress2,
            renderLanes2
          );
        else if (null !== workInProgress2.memoizedState)
          workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null;
        else throw Error(formatProdErrorMessage(558));
      else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), didSuspend = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || didSuspend) {
        nextProps = workInProgressRoot;
        if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes2), 0 !== dehydrated && dehydrated !== prevState.retryLane))
          throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
        renderDidSuspendDelayIfPossible();
        workInProgress2 = retryActivityComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      } else
        current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && restoreSuspendedTreeContext(workInProgress2, current), workInProgress2 = mountActivityChildren(workInProgress2, nextProps), workInProgress2.flags |= 4096;
      return workInProgress2;
    }
    current = createWorkInProgress(current.child, {
      mode: nextProps.mode,
      children: nextProps.children
    });
    current.ref = workInProgress2.ref;
    workInProgress2.child = current;
    current.return = workInProgress2;
    return current;
  }
  function markRef(current, workInProgress2) {
    var ref = workInProgress2.ref;
    if (null === ref)
      null !== current && null !== current.ref && (workInProgress2.flags |= 4194816);
    else {
      if ("function" !== typeof ref && "object" !== typeof ref)
        throw Error(formatProdErrorMessage(284));
      if (null === current || current.ref !== ref)
        workInProgress2.flags |= 4194816;
    }
  }
  function updateFunctionComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    prepareToReadContext(workInProgress2);
    Component = renderWithHooks(
      current,
      workInProgress2,
      Component,
      nextProps,
      void 0,
      renderLanes2
    );
    nextProps = checkDidRenderIdHook();
    if (null !== current && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && nextProps && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, Component, renderLanes2);
    return workInProgress2.child;
  }
  function replayFunctionComponent(current, workInProgress2, nextProps, Component, secondArg, renderLanes2) {
    prepareToReadContext(workInProgress2);
    workInProgress2.updateQueue = null;
    nextProps = renderWithHooksAgain(
      workInProgress2,
      Component,
      nextProps,
      secondArg
    );
    finishRenderingHooks(current);
    Component = checkDidRenderIdHook();
    if (null !== current && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && Component && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    return workInProgress2.child;
  }
  function updateClassComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    prepareToReadContext(workInProgress2);
    if (null === workInProgress2.stateNode) {
      var context = emptyContextObject, contextType = Component.contextType;
      "object" === typeof contextType && null !== contextType && (context = readContext(contextType));
      context = new Component(nextProps, context);
      workInProgress2.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
      context.updater = classComponentUpdater;
      workInProgress2.stateNode = context;
      context._reactInternals = workInProgress2;
      context = workInProgress2.stateNode;
      context.props = nextProps;
      context.state = workInProgress2.memoizedState;
      context.refs = {};
      initializeUpdateQueue(workInProgress2);
      contextType = Component.contextType;
      context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
      context.state = workInProgress2.memoizedState;
      contextType = Component.getDerivedStateFromProps;
      "function" === typeof contextType && (applyDerivedStateFromProps(
        workInProgress2,
        Component,
        contextType,
        nextProps
      ), context.state = workInProgress2.memoizedState);
      "function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress2, nextProps, context, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress2.memoizedState);
      "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308);
      nextProps = true;
    } else if (null === current) {
      context = workInProgress2.stateNode;
      var unresolvedOldProps = workInProgress2.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
      context.props = oldProps;
      var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
      contextType = emptyContextObject;
      "object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
      var getDerivedStateFromProps = Component.getDerivedStateFromProps;
      contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
      unresolvedOldProps = workInProgress2.pendingProps !== unresolvedOldProps;
      contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(
        workInProgress2,
        context,
        nextProps,
        contextType
      );
      hasForceUpdate = false;
      var oldState = workInProgress2.memoizedState;
      context.state = oldState;
      processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
      suspendIfUpdateReadFromEntangledAsyncAction();
      oldContext = workInProgress2.memoizedState;
      unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(
        workInProgress2,
        Component,
        getDerivedStateFromProps,
        nextProps
      ), oldContext = workInProgress2.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(
        workInProgress2,
        Component,
        oldProps,
        nextProps,
        oldState,
        oldContext,
        contextType
      )) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), nextProps = false);
    } else {
      context = workInProgress2.stateNode;
      cloneUpdateQueue(current, workInProgress2);
      contextType = workInProgress2.memoizedProps;
      contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
      context.props = contextType$jscomp$0;
      getDerivedStateFromProps = workInProgress2.pendingProps;
      oldState = context.context;
      oldContext = Component.contextType;
      oldProps = emptyContextObject;
      "object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
      unresolvedOldProps = Component.getDerivedStateFromProps;
      (oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(
        workInProgress2,
        context,
        nextProps,
        oldProps
      );
      hasForceUpdate = false;
      oldState = workInProgress2.memoizedState;
      context.state = oldState;
      processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
      suspendIfUpdateReadFromEntangledAsyncAction();
      var newState = workInProgress2.memoizedState;
      contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(
        workInProgress2,
        Component,
        unresolvedOldProps,
        nextProps
      ), newState = workInProgress2.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(
        workInProgress2,
        Component,
        contextType$jscomp$0,
        nextProps,
        oldState,
        newState,
        oldProps
      ) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(
        nextProps,
        newState,
        oldProps
      )), "function" === typeof context.componentDidUpdate && (workInProgress2.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress2.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), nextProps = false);
    }
    context = nextProps;
    markRef(current, workInProgress2);
    nextProps = 0 !== (workInProgress2.flags & 128);
    context || nextProps ? (context = workInProgress2.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress2.flags |= 1, null !== current && nextProps ? (workInProgress2.child = reconcileChildFibers(
      workInProgress2,
      current.child,
      null,
      renderLanes2
    ), workInProgress2.child = reconcileChildFibers(
      workInProgress2,
      null,
      Component,
      renderLanes2
    )) : reconcileChildren(current, workInProgress2, Component, renderLanes2), workInProgress2.memoizedState = context.state, current = workInProgress2.child) : current = bailoutOnAlreadyFinishedWork(
      current,
      workInProgress2,
      renderLanes2
    );
    return current;
  }
  function mountHostRootWithoutHydrating(current, workInProgress2, nextChildren, renderLanes2) {
    resetHydrationState();
    workInProgress2.flags |= 256;
    reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
    return workInProgress2.child;
  }
  var SUSPENDED_MARKER = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function mountSuspenseOffscreenState(renderLanes2) {
    return { baseLanes: renderLanes2, cachePool: getSuspendedCache() };
  }
  function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes2) {
    current = null !== current ? current.childLanes & ~renderLanes2 : 0;
    primaryTreeDidDefer && (current |= workInProgressDeferredLane);
    return current;
  }
  function updateSuspenseComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, showFallback = false, didSuspend = 0 !== (workInProgress2.flags & 128), JSCompiler_temp;
    (JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? false : 0 !== (suspenseStackCursor.current & 2));
    JSCompiler_temp && (showFallback = true, workInProgress2.flags &= -129);
    JSCompiler_temp = 0 !== (workInProgress2.flags & 32);
    workInProgress2.flags &= -33;
    if (null === current) {
      if (isHydrating) {
        showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress2) : reuseSuspenseHandlerOnStack();
        (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(
          current,
          rootOrSingletonContext
        ), current = null !== current && "&" !== current.data ? current : null, null !== current && (workInProgress2.memoizedState = {
          dehydrated: current,
          treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
        if (null === current) throw throwOnHydrationMismatch(workInProgress2);
        isSuspenseInstanceFallback(current) ? workInProgress2.lanes = 32 : workInProgress2.lanes = 536870912;
        return null;
      }
      var nextPrimaryChildren = nextProps.children;
      nextProps = nextProps.fallback;
      if (showFallback)
        return reuseSuspenseHandlerOnStack(), showFallback = workInProgress2.mode, nextPrimaryChildren = mountWorkInProgressOffscreenFiber(
          { mode: "hidden", children: nextPrimaryChildren },
          showFallback
        ), nextProps = createFiberFromFragment(
          nextProps,
          showFallback,
          renderLanes2,
          null
        ), nextPrimaryChildren.return = workInProgress2, nextProps.return = workInProgress2, nextPrimaryChildren.sibling = nextProps, workInProgress2.child = nextPrimaryChildren, nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
          current,
          JSCompiler_temp,
          renderLanes2
        ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
      pushPrimaryTreeSuspenseHandler(workInProgress2);
      return mountSuspensePrimaryChildren(workInProgress2, nextPrimaryChildren);
    }
    var prevState = current.memoizedState;
    if (null !== prevState && (nextPrimaryChildren = prevState.dehydrated, null !== nextPrimaryChildren)) {
      if (didSuspend)
        workInProgress2.flags & 256 ? (pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags &= -257, workInProgress2 = retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        )) : null !== workInProgress2.memoizedState ? (reuseSuspenseHandlerOnStack(), workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null) : (reuseSuspenseHandlerOnStack(), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress2.mode, nextProps = mountWorkInProgressOffscreenFiber(
          { mode: "visible", children: nextProps.children },
          showFallback
        ), nextPrimaryChildren = createFiberFromFragment(
          nextPrimaryChildren,
          showFallback,
          renderLanes2,
          null
        ), nextPrimaryChildren.flags |= 2, nextProps.return = workInProgress2, nextPrimaryChildren.return = workInProgress2, nextProps.sibling = nextPrimaryChildren, workInProgress2.child = nextProps, reconcileChildFibers(
          workInProgress2,
          current.child,
          null,
          renderLanes2
        ), nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
          current,
          JSCompiler_temp,
          renderLanes2
        ), workInProgress2.memoizedState = SUSPENDED_MARKER, workInProgress2 = bailoutOffscreenComponent(null, nextProps));
      else if (pushPrimaryTreeSuspenseHandler(workInProgress2), isSuspenseInstanceFallback(nextPrimaryChildren)) {
        JSCompiler_temp = nextPrimaryChildren.nextSibling && nextPrimaryChildren.nextSibling.dataset;
        if (JSCompiler_temp) var digest = JSCompiler_temp.dgst;
        JSCompiler_temp = digest;
        nextProps = Error(formatProdErrorMessage(419));
        nextProps.stack = "";
        nextProps.digest = JSCompiler_temp;
        queueHydrationError({ value: nextProps, source: null, stack: null });
        workInProgress2 = retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      } else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), JSCompiler_temp = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || JSCompiler_temp) {
        JSCompiler_temp = workInProgressRoot;
        if (null !== JSCompiler_temp && (nextProps = getBumpedLaneForHydration(JSCompiler_temp, renderLanes2), 0 !== nextProps && nextProps !== prevState.retryLane))
          throw prevState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps), SelectiveHydrationException;
        isSuspenseInstancePending(nextPrimaryChildren) || renderDidSuspendDelayIfPossible();
        workInProgress2 = retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      } else
        isSuspenseInstancePending(nextPrimaryChildren) ? (workInProgress2.flags |= 192, workInProgress2.child = current.child, workInProgress2 = null) : (current = prevState.treeContext, nextHydratableInstance = getNextHydratable(
          nextPrimaryChildren.nextSibling
        ), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && restoreSuspendedTreeContext(workInProgress2, current), workInProgress2 = mountSuspensePrimaryChildren(
          workInProgress2,
          nextProps.children
        ), workInProgress2.flags |= 4096);
      return workInProgress2;
    }
    if (showFallback)
      return reuseSuspenseHandlerOnStack(), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress2.mode, prevState = current.child, digest = prevState.sibling, nextProps = createWorkInProgress(prevState, {
        mode: "hidden",
        children: nextProps.children
      }), nextProps.subtreeFlags = prevState.subtreeFlags & 65011712, null !== digest ? nextPrimaryChildren = createWorkInProgress(
        digest,
        nextPrimaryChildren
      ) : (nextPrimaryChildren = createFiberFromFragment(
        nextPrimaryChildren,
        showFallback,
        renderLanes2,
        null
      ), nextPrimaryChildren.flags |= 2), nextPrimaryChildren.return = workInProgress2, nextProps.return = workInProgress2, nextProps.sibling = nextPrimaryChildren, workInProgress2.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress2.child, nextPrimaryChildren = current.child.memoizedState, null === nextPrimaryChildren ? nextPrimaryChildren = mountSuspenseOffscreenState(renderLanes2) : (showFallback = nextPrimaryChildren.cachePool, null !== showFallback ? (prevState = CacheContext._currentValue, showFallback = showFallback.parent !== prevState ? { parent: prevState, pool: prevState } : showFallback) : showFallback = getSuspendedCache(), nextPrimaryChildren = {
        baseLanes: nextPrimaryChildren.baseLanes | renderLanes2,
        cachePool: showFallback
      }), nextProps.memoizedState = nextPrimaryChildren, nextProps.childLanes = getRemainingWorkInPrimaryTree(
        current,
        JSCompiler_temp,
        renderLanes2
      ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
    pushPrimaryTreeSuspenseHandler(workInProgress2);
    renderLanes2 = current.child;
    current = renderLanes2.sibling;
    renderLanes2 = createWorkInProgress(renderLanes2, {
      mode: "visible",
      children: nextProps.children
    });
    renderLanes2.return = workInProgress2;
    renderLanes2.sibling = null;
    null !== current && (JSCompiler_temp = workInProgress2.deletions, null === JSCompiler_temp ? (workInProgress2.deletions = [current], workInProgress2.flags |= 16) : JSCompiler_temp.push(current));
    workInProgress2.child = renderLanes2;
    workInProgress2.memoizedState = null;
    return renderLanes2;
  }
  function mountSuspensePrimaryChildren(workInProgress2, primaryChildren) {
    primaryChildren = mountWorkInProgressOffscreenFiber(
      { mode: "visible", children: primaryChildren },
      workInProgress2.mode
    );
    primaryChildren.return = workInProgress2;
    return workInProgress2.child = primaryChildren;
  }
  function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
    offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
    offscreenProps.lanes = 0;
    return offscreenProps;
  }
  function retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
    reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
    current = mountSuspensePrimaryChildren(
      workInProgress2,
      workInProgress2.pendingProps.children
    );
    current.flags |= 2;
    workInProgress2.memoizedState = null;
    return current;
  }
  function scheduleSuspenseWorkOnFiber(fiber, renderLanes2, propagationRoot) {
    fiber.lanes |= renderLanes2;
    var alternate = fiber.alternate;
    null !== alternate && (alternate.lanes |= renderLanes2);
    scheduleContextWorkOnParentPath(fiber.return, renderLanes2, propagationRoot);
  }
  function initSuspenseListRenderState(workInProgress2, isBackwards, tail, lastContentRow, tailMode, treeForkCount2) {
    var renderState = workInProgress2.memoizedState;
    null === renderState ? workInProgress2.memoizedState = {
      isBackwards,
      rendering: null,
      renderingStartTime: 0,
      last: lastContentRow,
      tail,
      tailMode,
      treeForkCount: treeForkCount2
    } : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount2);
  }
  function updateSuspenseListComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
    nextProps = nextProps.children;
    var suspenseContext = suspenseStackCursor.current, shouldForceFallback = 0 !== (suspenseContext & 2);
    shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress2.flags |= 128) : suspenseContext &= 1;
    push(suspenseStackCursor, suspenseContext);
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    nextProps = isHydrating ? treeForkCount : 0;
    if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128))
      a: for (current = workInProgress2.child; null !== current; ) {
        if (13 === current.tag)
          null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
        else if (19 === current.tag)
          scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
        else if (null !== current.child) {
          current.child.return = current;
          current = current.child;
          continue;
        }
        if (current === workInProgress2) break a;
        for (; null === current.sibling; ) {
          if (null === current.return || current.return === workInProgress2)
            break a;
          current = current.return;
        }
        current.sibling.return = current.return;
        current = current.sibling;
      }
    switch (revealOrder) {
      case "forwards":
        renderLanes2 = workInProgress2.child;
        for (revealOrder = null; null !== renderLanes2; )
          current = renderLanes2.alternate, null !== current && null === findFirstSuspended(current) && (revealOrder = renderLanes2), renderLanes2 = renderLanes2.sibling;
        renderLanes2 = revealOrder;
        null === renderLanes2 ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null);
        initSuspenseListRenderState(
          workInProgress2,
          false,
          revealOrder,
          renderLanes2,
          tailMode,
          nextProps
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        renderLanes2 = null;
        revealOrder = workInProgress2.child;
        for (workInProgress2.child = null; null !== revealOrder; ) {
          current = revealOrder.alternate;
          if (null !== current && null === findFirstSuspended(current)) {
            workInProgress2.child = revealOrder;
            break;
          }
          current = revealOrder.sibling;
          revealOrder.sibling = renderLanes2;
          renderLanes2 = revealOrder;
          revealOrder = current;
        }
        initSuspenseListRenderState(
          workInProgress2,
          true,
          renderLanes2,
          null,
          tailMode,
          nextProps
        );
        break;
      case "together":
        initSuspenseListRenderState(
          workInProgress2,
          false,
          null,
          null,
          void 0,
          nextProps
        );
        break;
      default:
        workInProgress2.memoizedState = null;
    }
    return workInProgress2.child;
  }
  function bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2) {
    null !== current && (workInProgress2.dependencies = current.dependencies);
    workInProgressRootSkippedLanes |= workInProgress2.lanes;
    if (0 === (renderLanes2 & workInProgress2.childLanes))
      if (null !== current) {
        if (propagateParentContextChanges(
          current,
          workInProgress2,
          renderLanes2,
          false
        ), 0 === (renderLanes2 & workInProgress2.childLanes))
          return null;
      } else return null;
    if (null !== current && workInProgress2.child !== current.child)
      throw Error(formatProdErrorMessage(153));
    if (null !== workInProgress2.child) {
      current = workInProgress2.child;
      renderLanes2 = createWorkInProgress(current, current.pendingProps);
      workInProgress2.child = renderLanes2;
      for (renderLanes2.return = workInProgress2; null !== current.sibling; )
        current = current.sibling, renderLanes2 = renderLanes2.sibling = createWorkInProgress(current, current.pendingProps), renderLanes2.return = workInProgress2;
      renderLanes2.sibling = null;
    }
    return workInProgress2.child;
  }
  function checkScheduledUpdateOrContext(current, renderLanes2) {
    if (0 !== (current.lanes & renderLanes2)) return true;
    current = current.dependencies;
    return null !== current && checkIfContextChanged(current) ? true : false;
  }
  function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress2, renderLanes2) {
    switch (workInProgress2.tag) {
      case 3:
        pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
        pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
        resetHydrationState();
        break;
      case 27:
      case 5:
        pushHostContext(workInProgress2);
        break;
      case 4:
        pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
        break;
      case 10:
        pushProvider(
          workInProgress2,
          workInProgress2.type,
          workInProgress2.memoizedProps.value
        );
        break;
      case 31:
        if (null !== workInProgress2.memoizedState)
          return workInProgress2.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress2), null;
        break;
      case 13:
        var state$102 = workInProgress2.memoizedState;
        if (null !== state$102) {
          if (null !== state$102.dehydrated)
            return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags |= 128, null;
          if (0 !== (renderLanes2 & workInProgress2.child.childLanes))
            return updateSuspenseComponent(current, workInProgress2, renderLanes2);
          pushPrimaryTreeSuspenseHandler(workInProgress2);
          current = bailoutOnAlreadyFinishedWork(
            current,
            workInProgress2,
            renderLanes2
          );
          return null !== current ? current.sibling : null;
        }
        pushPrimaryTreeSuspenseHandler(workInProgress2);
        break;
      case 19:
        var didSuspendBefore = 0 !== (current.flags & 128);
        state$102 = 0 !== (renderLanes2 & workInProgress2.childLanes);
        state$102 || (propagateParentContextChanges(
          current,
          workInProgress2,
          renderLanes2,
          false
        ), state$102 = 0 !== (renderLanes2 & workInProgress2.childLanes));
        if (didSuspendBefore) {
          if (state$102)
            return updateSuspenseListComponent(
              current,
              workInProgress2,
              renderLanes2
            );
          workInProgress2.flags |= 128;
        }
        didSuspendBefore = workInProgress2.memoizedState;
        null !== didSuspendBefore && (didSuspendBefore.rendering = null, didSuspendBefore.tail = null, didSuspendBefore.lastEffect = null);
        push(suspenseStackCursor, suspenseStackCursor.current);
        if (state$102) break;
        else return null;
      case 22:
        return workInProgress2.lanes = 0, updateOffscreenComponent(
          current,
          workInProgress2,
          renderLanes2,
          workInProgress2.pendingProps
        );
      case 24:
        pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
    }
    return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
  }
  function beginWork(current, workInProgress2, renderLanes2) {
    if (null !== current)
      if (current.memoizedProps !== workInProgress2.pendingProps)
        didReceiveUpdate = true;
      else {
        if (!checkScheduledUpdateOrContext(current, renderLanes2) && 0 === (workInProgress2.flags & 128))
          return didReceiveUpdate = false, attemptEarlyBailoutIfNoScheduledUpdate(
            current,
            workInProgress2,
            renderLanes2
          );
        didReceiveUpdate = 0 !== (current.flags & 131072) ? true : false;
      }
    else
      didReceiveUpdate = false, isHydrating && 0 !== (workInProgress2.flags & 1048576) && pushTreeId(workInProgress2, treeForkCount, workInProgress2.index);
    workInProgress2.lanes = 0;
    switch (workInProgress2.tag) {
      case 16:
        a: {
          var props = workInProgress2.pendingProps;
          current = resolveLazy(workInProgress2.elementType);
          workInProgress2.type = current;
          if ("function" === typeof current)
            shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress2.tag = 1, workInProgress2 = updateClassComponent(
              null,
              workInProgress2,
              current,
              props,
              renderLanes2
            )) : (workInProgress2.tag = 0, workInProgress2 = updateFunctionComponent(
              null,
              workInProgress2,
              current,
              props,
              renderLanes2
            ));
          else {
            if (void 0 !== current && null !== current) {
              var $$typeof = current.$$typeof;
              if ($$typeof === REACT_FORWARD_REF_TYPE) {
                workInProgress2.tag = 11;
                workInProgress2 = updateForwardRef(
                  null,
                  workInProgress2,
                  current,
                  props,
                  renderLanes2
                );
                break a;
              } else if ($$typeof === REACT_MEMO_TYPE) {
                workInProgress2.tag = 14;
                workInProgress2 = updateMemoComponent(
                  null,
                  workInProgress2,
                  current,
                  props,
                  renderLanes2
                );
                break a;
              }
            }
            workInProgress2 = getComponentNameFromType(current) || current;
            throw Error(formatProdErrorMessage(306, workInProgress2, ""));
          }
        }
        return workInProgress2;
      case 0:
        return updateFunctionComponent(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 1:
        return props = workInProgress2.type, $$typeof = resolveClassComponentProps(
          props,
          workInProgress2.pendingProps
        ), updateClassComponent(
          current,
          workInProgress2,
          props,
          $$typeof,
          renderLanes2
        );
      case 3:
        a: {
          pushHostContainer(
            workInProgress2,
            workInProgress2.stateNode.containerInfo
          );
          if (null === current) throw Error(formatProdErrorMessage(387));
          props = workInProgress2.pendingProps;
          var prevState = workInProgress2.memoizedState;
          $$typeof = prevState.element;
          cloneUpdateQueue(current, workInProgress2);
          processUpdateQueue(workInProgress2, props, null, renderLanes2);
          var nextState = workInProgress2.memoizedState;
          props = nextState.cache;
          pushProvider(workInProgress2, CacheContext, props);
          props !== prevState.cache && propagateContextChanges(
            workInProgress2,
            [CacheContext],
            renderLanes2,
            true
          );
          suspendIfUpdateReadFromEntangledAsyncAction();
          props = nextState.element;
          if (prevState.isDehydrated)
            if (prevState = {
              element: props,
              isDehydrated: false,
              cache: nextState.cache
            }, workInProgress2.updateQueue.baseState = prevState, workInProgress2.memoizedState = prevState, workInProgress2.flags & 256) {
              workInProgress2 = mountHostRootWithoutHydrating(
                current,
                workInProgress2,
                props,
                renderLanes2
              );
              break a;
            } else if (props !== $$typeof) {
              $$typeof = createCapturedValueAtFiber(
                Error(formatProdErrorMessage(424)),
                workInProgress2
              );
              queueHydrationError($$typeof);
              workInProgress2 = mountHostRootWithoutHydrating(
                current,
                workInProgress2,
                props,
                renderLanes2
              );
              break a;
            } else {
              current = workInProgress2.stateNode.containerInfo;
              switch (current.nodeType) {
                case 9:
                  current = current.body;
                  break;
                default:
                  current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
              }
              nextHydratableInstance = getNextHydratable(current.firstChild);
              hydrationParentFiber = workInProgress2;
              isHydrating = true;
              hydrationErrors = null;
              rootOrSingletonContext = true;
              renderLanes2 = mountChildFibers(
                workInProgress2,
                null,
                props,
                renderLanes2
              );
              for (workInProgress2.child = renderLanes2; renderLanes2; )
                renderLanes2.flags = renderLanes2.flags & -3 | 4096, renderLanes2 = renderLanes2.sibling;
            }
          else {
            resetHydrationState();
            if (props === $$typeof) {
              workInProgress2 = bailoutOnAlreadyFinishedWork(
                current,
                workInProgress2,
                renderLanes2
              );
              break a;
            }
            reconcileChildren(current, workInProgress2, props, renderLanes2);
          }
          workInProgress2 = workInProgress2.child;
        }
        return workInProgress2;
      case 26:
        return markRef(current, workInProgress2), null === current ? (renderLanes2 = getResource(
          workInProgress2.type,
          null,
          workInProgress2.pendingProps,
          null
        )) ? workInProgress2.memoizedState = renderLanes2 : isHydrating || (renderLanes2 = workInProgress2.type, current = workInProgress2.pendingProps, props = getOwnerDocumentFromRootContainer(
          rootInstanceStackCursor.current
        ).createElement(renderLanes2), props[internalInstanceKey] = workInProgress2, props[internalPropsKey] = current, setInitialProperties(props, renderLanes2, current), markNodeAsHoistable(props), workInProgress2.stateNode = props) : workInProgress2.memoizedState = getResource(
          workInProgress2.type,
          current.memoizedProps,
          workInProgress2.pendingProps,
          current.memoizedState
        ), null;
      case 27:
        return pushHostContext(workInProgress2), null === current && isHydrating && (props = workInProgress2.stateNode = resolveSingletonInstance(
          workInProgress2.type,
          workInProgress2.pendingProps,
          rootInstanceStackCursor.current
        ), hydrationParentFiber = workInProgress2, rootOrSingletonContext = true, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress2.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), markRef(current, workInProgress2), null === current && (workInProgress2.flags |= 4194304), workInProgress2.child;
      case 5:
        if (null === current && isHydrating) {
          if ($$typeof = props = nextHydratableInstance)
            props = canHydrateInstance(
              props,
              workInProgress2.type,
              workInProgress2.pendingProps,
              rootOrSingletonContext
            ), null !== props ? (workInProgress2.stateNode = props, hydrationParentFiber = workInProgress2, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = false, $$typeof = true) : $$typeof = false;
          $$typeof || throwOnHydrationMismatch(workInProgress2);
        }
        pushHostContext(workInProgress2);
        $$typeof = workInProgress2.type;
        prevState = workInProgress2.pendingProps;
        nextState = null !== current ? current.memoizedProps : null;
        props = prevState.children;
        shouldSetTextContent($$typeof, prevState) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress2.flags |= 32);
        null !== workInProgress2.memoizedState && ($$typeof = renderWithHooks(
          current,
          workInProgress2,
          TransitionAwareHostComponent,
          null,
          null,
          renderLanes2
        ), HostTransitionContext._currentValue = $$typeof);
        markRef(current, workInProgress2);
        reconcileChildren(current, workInProgress2, props, renderLanes2);
        return workInProgress2.child;
      case 6:
        if (null === current && isHydrating) {
          if (current = renderLanes2 = nextHydratableInstance)
            renderLanes2 = canHydrateTextInstance(
              renderLanes2,
              workInProgress2.pendingProps,
              rootOrSingletonContext
            ), null !== renderLanes2 ? (workInProgress2.stateNode = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, current = true) : current = false;
          current || throwOnHydrationMismatch(workInProgress2);
        }
        return null;
      case 13:
        return updateSuspenseComponent(current, workInProgress2, renderLanes2);
      case 4:
        return pushHostContainer(
          workInProgress2,
          workInProgress2.stateNode.containerInfo
        ), props = workInProgress2.pendingProps, null === current ? workInProgress2.child = reconcileChildFibers(
          workInProgress2,
          null,
          props,
          renderLanes2
        ) : reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
      case 11:
        return updateForwardRef(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 7:
        return reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps,
          renderLanes2
        ), workInProgress2.child;
      case 8:
        return reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), workInProgress2.child;
      case 12:
        return reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), workInProgress2.child;
      case 10:
        return props = workInProgress2.pendingProps, pushProvider(workInProgress2, workInProgress2.type, props.value), reconcileChildren(current, workInProgress2, props.children, renderLanes2), workInProgress2.child;
      case 9:
        return $$typeof = workInProgress2.type._context, props = workInProgress2.pendingProps.children, prepareToReadContext(workInProgress2), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress2.flags |= 1, reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
      case 14:
        return updateMemoComponent(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 15:
        return updateSimpleMemoComponent(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 19:
        return updateSuspenseListComponent(current, workInProgress2, renderLanes2);
      case 31:
        return updateActivityComponent(current, workInProgress2, renderLanes2);
      case 22:
        return updateOffscreenComponent(
          current,
          workInProgress2,
          renderLanes2,
          workInProgress2.pendingProps
        );
      case 24:
        return prepareToReadContext(workInProgress2), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes2), $$typeof = prevState), workInProgress2.memoizedState = { parent: props, cache: $$typeof }, initializeUpdateQueue(workInProgress2), pushProvider(workInProgress2, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes2) && (cloneUpdateQueue(current, workInProgress2), processUpdateQueue(workInProgress2, null, null, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress2.memoizedState, $$typeof.parent !== props ? ($$typeof = { parent: props, cache: props }, workInProgress2.memoizedState = $$typeof, 0 === workInProgress2.lanes && (workInProgress2.memoizedState = workInProgress2.updateQueue.baseState = $$typeof), pushProvider(workInProgress2, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress2, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(
          workInProgress2,
          [CacheContext],
          renderLanes2,
          true
        ))), reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), workInProgress2.child;
      case 29:
        throw workInProgress2.pendingProps;
    }
    throw Error(formatProdErrorMessage(156, workInProgress2.tag));
  }
  function markUpdate(workInProgress2) {
    workInProgress2.flags |= 4;
  }
  function preloadInstanceAndSuspendIfNeeded(workInProgress2, type, oldProps, newProps, renderLanes2) {
    if (type = 0 !== (workInProgress2.mode & 32)) type = false;
    if (type) {
      if (workInProgress2.flags |= 16777216, (renderLanes2 & 335544128) === renderLanes2)
        if (workInProgress2.stateNode.complete) workInProgress2.flags |= 8192;
        else if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
        else
          throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
    } else workInProgress2.flags &= -16777217;
  }
  function preloadResourceAndSuspendIfNeeded(workInProgress2, resource) {
    if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4))
      workInProgress2.flags &= -16777217;
    else if (workInProgress2.flags |= 16777216, !preloadResource(resource))
      if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
      else
        throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
  }
  function scheduleRetryEffect(workInProgress2, retryQueue) {
    null !== retryQueue && (workInProgress2.flags |= 4);
    workInProgress2.flags & 16384 && (retryQueue = 22 !== workInProgress2.tag ? claimNextRetryLane() : 536870912, workInProgress2.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
  }
  function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
    if (!isHydrating)
      switch (renderState.tailMode) {
        case "hidden":
          hasRenderedATailFallback = renderState.tail;
          for (var lastTailNode = null; null !== hasRenderedATailFallback; )
            null !== hasRenderedATailFallback.alternate && (lastTailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
          null === lastTailNode ? renderState.tail = null : lastTailNode.sibling = null;
          break;
        case "collapsed":
          lastTailNode = renderState.tail;
          for (var lastTailNode$106 = null; null !== lastTailNode; )
            null !== lastTailNode.alternate && (lastTailNode$106 = lastTailNode), lastTailNode = lastTailNode.sibling;
          null === lastTailNode$106 ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode$106.sibling = null;
      }
  }
  function bubbleProperties(completedWork) {
    var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
    if (didBailout)
      for (var child$107 = completedWork.child; null !== child$107; )
        newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags & 65011712, subtreeFlags |= child$107.flags & 65011712, child$107.return = completedWork, child$107 = child$107.sibling;
    else
      for (child$107 = completedWork.child; null !== child$107; )
        newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags, subtreeFlags |= child$107.flags, child$107.return = completedWork, child$107 = child$107.sibling;
    completedWork.subtreeFlags |= subtreeFlags;
    completedWork.childLanes = newChildLanes;
    return didBailout;
  }
  function completeWork(current, workInProgress2, renderLanes2) {
    var newProps = workInProgress2.pendingProps;
    popTreeContext(workInProgress2);
    switch (workInProgress2.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return bubbleProperties(workInProgress2), null;
      case 1:
        return bubbleProperties(workInProgress2), null;
      case 3:
        renderLanes2 = workInProgress2.stateNode;
        newProps = null;
        null !== current && (newProps = current.memoizedState.cache);
        workInProgress2.memoizedState.cache !== newProps && (workInProgress2.flags |= 2048);
        popProvider(CacheContext);
        popHostContainer();
        renderLanes2.pendingContext && (renderLanes2.context = renderLanes2.pendingContext, renderLanes2.pendingContext = null);
        if (null === current || null === current.child)
          popHydrationState(workInProgress2) ? markUpdate(workInProgress2) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress2.flags & 256) || (workInProgress2.flags |= 1024, upgradeHydrationErrorsToRecoverable());
        bubbleProperties(workInProgress2);
        return null;
      case 26:
        var type = workInProgress2.type, nextResource = workInProgress2.memoizedState;
        null === current ? (markUpdate(workInProgress2), null !== nextResource ? (bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, nextResource)) : (bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
          workInProgress2,
          type,
          null,
          newProps,
          renderLanes2
        ))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, nextResource)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
          workInProgress2,
          type,
          current,
          newProps,
          renderLanes2
        ));
        return null;
      case 27:
        popHostContext(workInProgress2);
        renderLanes2 = rootInstanceStackCursor.current;
        type = workInProgress2.type;
        if (null !== current && null != workInProgress2.stateNode)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if (!newProps) {
            if (null === workInProgress2.stateNode)
              throw Error(formatProdErrorMessage(166));
            bubbleProperties(workInProgress2);
            return null;
          }
          current = contextStackCursor.current;
          popHydrationState(workInProgress2) ? prepareToHydrateHostInstance(workInProgress2) : (current = resolveSingletonInstance(type, newProps, renderLanes2), workInProgress2.stateNode = current, markUpdate(workInProgress2));
        }
        bubbleProperties(workInProgress2);
        return null;
      case 5:
        popHostContext(workInProgress2);
        type = workInProgress2.type;
        if (null !== current && null != workInProgress2.stateNode)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if (!newProps) {
            if (null === workInProgress2.stateNode)
              throw Error(formatProdErrorMessage(166));
            bubbleProperties(workInProgress2);
            return null;
          }
          nextResource = contextStackCursor.current;
          if (popHydrationState(workInProgress2))
            prepareToHydrateHostInstance(workInProgress2);
          else {
            var ownerDocument = getOwnerDocumentFromRootContainer(
              rootInstanceStackCursor.current
            );
            switch (nextResource) {
              case 1:
                nextResource = ownerDocument.createElementNS(
                  "http://www.w3.org/2000/svg",
                  type
                );
                break;
              case 2:
                nextResource = ownerDocument.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  type
                );
                break;
              default:
                switch (type) {
                  case "svg":
                    nextResource = ownerDocument.createElementNS(
                      "http://www.w3.org/2000/svg",
                      type
                    );
                    break;
                  case "math":
                    nextResource = ownerDocument.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      type
                    );
                    break;
                  case "script":
                    nextResource = ownerDocument.createElement("div");
                    nextResource.innerHTML = "<script><\/script>";
                    nextResource = nextResource.removeChild(
                      nextResource.firstChild
                    );
                    break;
                  case "select":
                    nextResource = "string" === typeof newProps.is ? ownerDocument.createElement("select", {
                      is: newProps.is
                    }) : ownerDocument.createElement("select");
                    newProps.multiple ? nextResource.multiple = true : newProps.size && (nextResource.size = newProps.size);
                    break;
                  default:
                    nextResource = "string" === typeof newProps.is ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
                }
            }
            nextResource[internalInstanceKey] = workInProgress2;
            nextResource[internalPropsKey] = newProps;
            a: for (ownerDocument = workInProgress2.child; null !== ownerDocument; ) {
              if (5 === ownerDocument.tag || 6 === ownerDocument.tag)
                nextResource.appendChild(ownerDocument.stateNode);
              else if (4 !== ownerDocument.tag && 27 !== ownerDocument.tag && null !== ownerDocument.child) {
                ownerDocument.child.return = ownerDocument;
                ownerDocument = ownerDocument.child;
                continue;
              }
              if (ownerDocument === workInProgress2) break a;
              for (; null === ownerDocument.sibling; ) {
                if (null === ownerDocument.return || ownerDocument.return === workInProgress2)
                  break a;
                ownerDocument = ownerDocument.return;
              }
              ownerDocument.sibling.return = ownerDocument.return;
              ownerDocument = ownerDocument.sibling;
            }
            workInProgress2.stateNode = nextResource;
            a: switch (setInitialProperties(nextResource, type, newProps), type) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                newProps = !!newProps.autoFocus;
                break a;
              case "img":
                newProps = true;
                break a;
              default:
                newProps = false;
            }
            newProps && markUpdate(workInProgress2);
          }
        }
        bubbleProperties(workInProgress2);
        preloadInstanceAndSuspendIfNeeded(
          workInProgress2,
          workInProgress2.type,
          null === current ? null : current.memoizedProps,
          workInProgress2.pendingProps,
          renderLanes2
        );
        return null;
      case 6:
        if (current && null != workInProgress2.stateNode)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if ("string" !== typeof newProps && null === workInProgress2.stateNode)
            throw Error(formatProdErrorMessage(166));
          current = rootInstanceStackCursor.current;
          if (popHydrationState(workInProgress2)) {
            current = workInProgress2.stateNode;
            renderLanes2 = workInProgress2.memoizedProps;
            newProps = null;
            type = hydrationParentFiber;
            if (null !== type)
              switch (type.tag) {
                case 27:
                case 5:
                  newProps = type.memoizedProps;
              }
            current[internalInstanceKey] = workInProgress2;
            current = current.nodeValue === renderLanes2 || null !== newProps && true === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes2) ? true : false;
            current || throwOnHydrationMismatch(workInProgress2, true);
          } else
            current = getOwnerDocumentFromRootContainer(current).createTextNode(
              newProps
            ), current[internalInstanceKey] = workInProgress2, workInProgress2.stateNode = current;
        }
        bubbleProperties(workInProgress2);
        return null;
      case 31:
        renderLanes2 = workInProgress2.memoizedState;
        if (null === current || null !== current.memoizedState) {
          newProps = popHydrationState(workInProgress2);
          if (null !== renderLanes2) {
            if (null === current) {
              if (!newProps) throw Error(formatProdErrorMessage(318));
              current = workInProgress2.memoizedState;
              current = null !== current ? current.dehydrated : null;
              if (!current) throw Error(formatProdErrorMessage(557));
              current[internalInstanceKey] = workInProgress2;
            } else
              resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
            bubbleProperties(workInProgress2);
            current = false;
          } else
            renderLanes2 = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes2), current = true;
          if (!current) {
            if (workInProgress2.flags & 256)
              return popSuspenseHandler(workInProgress2), workInProgress2;
            popSuspenseHandler(workInProgress2);
            return null;
          }
          if (0 !== (workInProgress2.flags & 128))
            throw Error(formatProdErrorMessage(558));
        }
        bubbleProperties(workInProgress2);
        return null;
      case 13:
        newProps = workInProgress2.memoizedState;
        if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
          type = popHydrationState(workInProgress2);
          if (null !== newProps && null !== newProps.dehydrated) {
            if (null === current) {
              if (!type) throw Error(formatProdErrorMessage(318));
              type = workInProgress2.memoizedState;
              type = null !== type ? type.dehydrated : null;
              if (!type) throw Error(formatProdErrorMessage(317));
              type[internalInstanceKey] = workInProgress2;
            } else
              resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
            bubbleProperties(workInProgress2);
            type = false;
          } else
            type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = true;
          if (!type) {
            if (workInProgress2.flags & 256)
              return popSuspenseHandler(workInProgress2), workInProgress2;
            popSuspenseHandler(workInProgress2);
            return null;
          }
        }
        popSuspenseHandler(workInProgress2);
        if (0 !== (workInProgress2.flags & 128))
          return workInProgress2.lanes = renderLanes2, workInProgress2;
        renderLanes2 = null !== newProps;
        current = null !== current && null !== current.memoizedState;
        renderLanes2 && (newProps = workInProgress2.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
        renderLanes2 !== current && renderLanes2 && (workInProgress2.child.flags |= 8192);
        scheduleRetryEffect(workInProgress2, workInProgress2.updateQueue);
        bubbleProperties(workInProgress2);
        return null;
      case 4:
        return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress2.stateNode.containerInfo), bubbleProperties(workInProgress2), null;
      case 10:
        return popProvider(workInProgress2.type), bubbleProperties(workInProgress2), null;
      case 19:
        pop(suspenseStackCursor);
        newProps = workInProgress2.memoizedState;
        if (null === newProps) return bubbleProperties(workInProgress2), null;
        type = 0 !== (workInProgress2.flags & 128);
        nextResource = newProps.rendering;
        if (null === nextResource)
          if (type) cutOffTailIfNeeded(newProps, false);
          else {
            if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128))
              for (current = workInProgress2.child; null !== current; ) {
                nextResource = findFirstSuspended(current);
                if (null !== nextResource) {
                  workInProgress2.flags |= 128;
                  cutOffTailIfNeeded(newProps, false);
                  current = nextResource.updateQueue;
                  workInProgress2.updateQueue = current;
                  scheduleRetryEffect(workInProgress2, current);
                  workInProgress2.subtreeFlags = 0;
                  current = renderLanes2;
                  for (renderLanes2 = workInProgress2.child; null !== renderLanes2; )
                    resetWorkInProgress(renderLanes2, current), renderLanes2 = renderLanes2.sibling;
                  push(
                    suspenseStackCursor,
                    suspenseStackCursor.current & 1 | 2
                  );
                  isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount);
                  return workInProgress2.child;
                }
                current = current.sibling;
              }
            null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
          }
        else {
          if (!type)
            if (current = findFirstSuspended(nextResource), null !== current) {
              if (workInProgress2.flags |= 128, type = true, current = current.updateQueue, workInProgress2.updateQueue = current, scheduleRetryEffect(workInProgress2, current), cutOffTailIfNeeded(newProps, true), null === newProps.tail && "hidden" === newProps.tailMode && !nextResource.alternate && !isHydrating)
                return bubbleProperties(workInProgress2), null;
            } else
              2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes2 && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
          newProps.isBackwards ? (nextResource.sibling = workInProgress2.child, workInProgress2.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress2.child = nextResource, newProps.last = nextResource);
        }
        if (null !== newProps.tail)
          return current = newProps.tail, newProps.rendering = current, newProps.tail = current.sibling, newProps.renderingStartTime = now(), current.sibling = null, renderLanes2 = suspenseStackCursor.current, push(
            suspenseStackCursor,
            type ? renderLanes2 & 1 | 2 : renderLanes2 & 1
          ), isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount), current;
        bubbleProperties(workInProgress2);
        return null;
      case 22:
      case 23:
        return popSuspenseHandler(workInProgress2), popHiddenContext(), newProps = null !== workInProgress2.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress2.flags |= 8192) : newProps && (workInProgress2.flags |= 8192), newProps ? 0 !== (renderLanes2 & 536870912) && 0 === (workInProgress2.flags & 128) && (bubbleProperties(workInProgress2), workInProgress2.subtreeFlags & 6 && (workInProgress2.flags |= 8192)) : bubbleProperties(workInProgress2), renderLanes2 = workInProgress2.updateQueue, null !== renderLanes2 && scheduleRetryEffect(workInProgress2, renderLanes2.retryQueue), renderLanes2 = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes2 = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress2.memoizedState && null !== workInProgress2.memoizedState.cachePool && (newProps = workInProgress2.memoizedState.cachePool.pool), newProps !== renderLanes2 && (workInProgress2.flags |= 2048), null !== current && pop(resumedCache), null;
      case 24:
        return renderLanes2 = null, null !== current && (renderLanes2 = current.memoizedState.cache), workInProgress2.memoizedState.cache !== renderLanes2 && (workInProgress2.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress2), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(formatProdErrorMessage(156, workInProgress2.tag));
  }
  function unwindWork(current, workInProgress2) {
    popTreeContext(workInProgress2);
    switch (workInProgress2.tag) {
      case 1:
        return current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 3:
        return popProvider(CacheContext), popHostContainer(), current = workInProgress2.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 26:
      case 27:
      case 5:
        return popHostContext(workInProgress2), null;
      case 31:
        if (null !== workInProgress2.memoizedState) {
          popSuspenseHandler(workInProgress2);
          if (null === workInProgress2.alternate)
            throw Error(formatProdErrorMessage(340));
          resetHydrationState();
        }
        current = workInProgress2.flags;
        return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 13:
        popSuspenseHandler(workInProgress2);
        current = workInProgress2.memoizedState;
        if (null !== current && null !== current.dehydrated) {
          if (null === workInProgress2.alternate)
            throw Error(formatProdErrorMessage(340));
          resetHydrationState();
        }
        current = workInProgress2.flags;
        return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 19:
        return pop(suspenseStackCursor), null;
      case 4:
        return popHostContainer(), null;
      case 10:
        return popProvider(workInProgress2.type), null;
      case 22:
      case 23:
        return popSuspenseHandler(workInProgress2), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 24:
        return popProvider(CacheContext), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function unwindInterruptedWork(current, interruptedWork) {
    popTreeContext(interruptedWork);
    switch (interruptedWork.tag) {
      case 3:
        popProvider(CacheContext);
        popHostContainer();
        break;
      case 26:
      case 27:
      case 5:
        popHostContext(interruptedWork);
        break;
      case 4:
        popHostContainer();
        break;
      case 31:
        null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
        break;
      case 13:
        popSuspenseHandler(interruptedWork);
        break;
      case 19:
        pop(suspenseStackCursor);
        break;
      case 10:
        popProvider(interruptedWork.type);
        break;
      case 22:
      case 23:
        popSuspenseHandler(interruptedWork);
        popHiddenContext();
        null !== current && pop(resumedCache);
        break;
      case 24:
        popProvider(CacheContext);
    }
  }
  function commitHookEffectListMount(flags, finishedWork) {
    try {
      var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
      if (null !== lastEffect) {
        var firstEffect = lastEffect.next;
        updateQueue = firstEffect;
        do {
          if ((updateQueue.tag & flags) === flags) {
            lastEffect = void 0;
            var create = updateQueue.create, inst = updateQueue.inst;
            lastEffect = create();
            inst.destroy = lastEffect;
          }
          updateQueue = updateQueue.next;
        } while (updateQueue !== firstEffect);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
    try {
      var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
      if (null !== lastEffect) {
        var firstEffect = lastEffect.next;
        updateQueue = firstEffect;
        do {
          if ((updateQueue.tag & flags) === flags) {
            var inst = updateQueue.inst, destroy = inst.destroy;
            if (void 0 !== destroy) {
              inst.destroy = void 0;
              lastEffect = finishedWork;
              var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
              try {
                destroy_();
              } catch (error) {
                captureCommitPhaseError(
                  lastEffect,
                  nearestMountedAncestor,
                  error
                );
              }
            }
          }
          updateQueue = updateQueue.next;
        } while (updateQueue !== firstEffect);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitClassCallbacks(finishedWork) {
    var updateQueue = finishedWork.updateQueue;
    if (null !== updateQueue) {
      var instance = finishedWork.stateNode;
      try {
        commitCallbacks(updateQueue, instance);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
  }
  function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
    instance.props = resolveClassComponentProps(
      current.type,
      current.memoizedProps
    );
    instance.state = current.memoizedState;
    try {
      instance.componentWillUnmount();
    } catch (error) {
      captureCommitPhaseError(current, nearestMountedAncestor, error);
    }
  }
  function safelyAttachRef(current, nearestMountedAncestor) {
    try {
      var ref = current.ref;
      if (null !== ref) {
        switch (current.tag) {
          case 26:
          case 27:
          case 5:
            var instanceToUse = current.stateNode;
            break;
          case 30:
            instanceToUse = current.stateNode;
            break;
          default:
            instanceToUse = current.stateNode;
        }
        "function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
      }
    } catch (error) {
      captureCommitPhaseError(current, nearestMountedAncestor, error);
    }
  }
  function safelyDetachRef(current, nearestMountedAncestor) {
    var ref = current.ref, refCleanup = current.refCleanup;
    if (null !== ref)
      if ("function" === typeof refCleanup)
        try {
          refCleanup();
        } catch (error) {
          captureCommitPhaseError(current, nearestMountedAncestor, error);
        } finally {
          current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
        }
      else if ("function" === typeof ref)
        try {
          ref(null);
        } catch (error$140) {
          captureCommitPhaseError(current, nearestMountedAncestor, error$140);
        }
      else ref.current = null;
  }
  function commitHostMount(finishedWork) {
    var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
    try {
      a: switch (type) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          props.autoFocus && instance.focus();
          break a;
        case "img":
          props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitHostUpdate(finishedWork, newProps, oldProps) {
    try {
      var domElement = finishedWork.stateNode;
      updateProperties(domElement, finishedWork.type, oldProps, newProps);
      domElement[internalPropsKey] = newProps;
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function isHostParent(fiber) {
    return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
  }
  function getHostSibling(fiber) {
    a: for (; ; ) {
      for (; null === fiber.sibling; ) {
        if (null === fiber.return || isHostParent(fiber.return)) return null;
        fiber = fiber.return;
      }
      fiber.sibling.return = fiber.return;
      for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag; ) {
        if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
        if (fiber.flags & 2) continue a;
        if (null === fiber.child || 4 === fiber.tag) continue a;
        else fiber.child.return = fiber, fiber = fiber.child;
      }
      if (!(fiber.flags & 2)) return fiber.stateNode;
    }
  }
  function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
    var tag = node.tag;
    if (5 === tag || 6 === tag)
      node = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(node, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(node), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1));
    else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode, before = null), node = node.child, null !== node))
      for (insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling; null !== node; )
        insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;
  }
  function insertOrAppendPlacementNode(node, before, parent) {
    var tag = node.tag;
    if (5 === tag || 6 === tag)
      node = node.stateNode, before ? parent.insertBefore(node, before) : parent.appendChild(node);
    else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode), node = node.child, null !== node))
      for (insertOrAppendPlacementNode(node, before, parent), node = node.sibling; null !== node; )
        insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
  }
  function commitHostSingletonAcquisition(finishedWork) {
    var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
    try {
      for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length; )
        singleton.removeAttributeNode(attributes[0]);
      setInitialProperties(singleton, type, props);
      singleton[internalInstanceKey] = finishedWork;
      singleton[internalPropsKey] = props;
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  var offscreenSubtreeIsHidden = false, offscreenSubtreeWasHidden = false, needsFormReset = false, PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set, nextEffect = null;
  function commitBeforeMutationEffects(root2, firstChild) {
    root2 = root2.containerInfo;
    eventsEnabled = _enabled;
    root2 = getActiveElementDeep(root2);
    if (hasSelectionCapabilities(root2)) {
      if ("selectionStart" in root2)
        var JSCompiler_temp = {
          start: root2.selectionStart,
          end: root2.selectionEnd
        };
      else
        a: {
          JSCompiler_temp = (JSCompiler_temp = root2.ownerDocument) && JSCompiler_temp.defaultView || window;
          var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
          if (selection && 0 !== selection.rangeCount) {
            JSCompiler_temp = selection.anchorNode;
            var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
            selection = selection.focusOffset;
            try {
              JSCompiler_temp.nodeType, focusNode.nodeType;
            } catch (e$20) {
              JSCompiler_temp = null;
              break a;
            }
            var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root2, parentNode = null;
            b: for (; ; ) {
              for (var next; ; ) {
                node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
                node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
                3 === node.nodeType && (length += node.nodeValue.length);
                if (null === (next = node.firstChild)) break;
                parentNode = node;
                node = next;
              }
              for (; ; ) {
                if (node === root2) break b;
                parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
                parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
                if (null !== (next = node.nextSibling)) break;
                node = parentNode;
                parentNode = node.parentNode;
              }
              node = next;
            }
            JSCompiler_temp = -1 === start || -1 === end ? null : { start, end };
          } else JSCompiler_temp = null;
        }
      JSCompiler_temp = JSCompiler_temp || { start: 0, end: 0 };
    } else JSCompiler_temp = null;
    selectionInformation = { focusedElem: root2, selectionRange: JSCompiler_temp };
    _enabled = false;
    for (nextEffect = firstChild; null !== nextEffect; )
      if (firstChild = nextEffect, root2 = firstChild.child, 0 !== (firstChild.subtreeFlags & 1028) && null !== root2)
        root2.return = firstChild, nextEffect = root2;
      else
        for (; null !== nextEffect; ) {
          firstChild = nextEffect;
          focusNode = firstChild.alternate;
          root2 = firstChild.flags;
          switch (firstChild.tag) {
            case 0:
              if (0 !== (root2 & 4) && (root2 = firstChild.updateQueue, root2 = null !== root2 ? root2.events : null, null !== root2))
                for (JSCompiler_temp = 0; JSCompiler_temp < root2.length; JSCompiler_temp++)
                  anchorOffset = root2[JSCompiler_temp], anchorOffset.ref.impl = anchorOffset.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if (0 !== (root2 & 1024) && null !== focusNode) {
                root2 = void 0;
                JSCompiler_temp = firstChild;
                anchorOffset = focusNode.memoizedProps;
                focusNode = focusNode.memoizedState;
                selection = JSCompiler_temp.stateNode;
                try {
                  var resolvedPrevProps = resolveClassComponentProps(
                    JSCompiler_temp.type,
                    anchorOffset
                  );
                  root2 = selection.getSnapshotBeforeUpdate(
                    resolvedPrevProps,
                    focusNode
                  );
                  selection.__reactInternalSnapshotBeforeUpdate = root2;
                } catch (error) {
                  captureCommitPhaseError(
                    JSCompiler_temp,
                    JSCompiler_temp.return,
                    error
                  );
                }
              }
              break;
            case 3:
              if (0 !== (root2 & 1024)) {
                if (root2 = firstChild.stateNode.containerInfo, JSCompiler_temp = root2.nodeType, 9 === JSCompiler_temp)
                  clearContainerSparingly(root2);
                else if (1 === JSCompiler_temp)
                  switch (root2.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      clearContainerSparingly(root2);
                      break;
                    default:
                      root2.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if (0 !== (root2 & 1024)) throw Error(formatProdErrorMessage(163));
          }
          root2 = firstChild.sibling;
          if (null !== root2) {
            root2.return = firstChild.return;
            nextEffect = root2;
            break;
          }
          nextEffect = firstChild.return;
        }
  }
  function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
    var flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitHookEffectListMount(5, finishedWork);
        break;
      case 1:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        if (flags & 4)
          if (finishedRoot = finishedWork.stateNode, null === current)
            try {
              finishedRoot.componentDidMount();
            } catch (error) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error);
            }
          else {
            var prevProps = resolveClassComponentProps(
              finishedWork.type,
              current.memoizedProps
            );
            current = current.memoizedState;
            try {
              finishedRoot.componentDidUpdate(
                prevProps,
                current,
                finishedRoot.__reactInternalSnapshotBeforeUpdate
              );
            } catch (error$139) {
              captureCommitPhaseError(
                finishedWork,
                finishedWork.return,
                error$139
              );
            }
          }
        flags & 64 && commitClassCallbacks(finishedWork);
        flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 3:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
          current = null;
          if (null !== finishedWork.child)
            switch (finishedWork.child.tag) {
              case 27:
              case 5:
                current = finishedWork.child.stateNode;
                break;
              case 1:
                current = finishedWork.child.stateNode;
            }
          try {
            commitCallbacks(finishedRoot, current);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        break;
      case 27:
        null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
      case 26:
      case 5:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        null === current && flags & 4 && commitHostMount(finishedWork);
        flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 12:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        break;
      case 31:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
        break;
      case 13:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
        flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(
          null,
          finishedWork
        ), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
        break;
      case 22:
        flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
        if (!flags) {
          current = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
          prevProps = offscreenSubtreeIsHidden;
          var prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
          offscreenSubtreeIsHidden = flags;
          (offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden ? recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            0 !== (finishedWork.subtreeFlags & 8772)
          ) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          offscreenSubtreeIsHidden = prevProps;
          offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
        }
        break;
      case 30:
        break;
      default:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
    }
  }
  function detachFiberAfterEffects(fiber) {
    var alternate = fiber.alternate;
    null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
    fiber.child = null;
    fiber.deletions = null;
    fiber.sibling = null;
    5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
    fiber.stateNode = null;
    fiber.return = null;
    fiber.dependencies = null;
    fiber.memoizedProps = null;
    fiber.memoizedState = null;
    fiber.pendingProps = null;
    fiber.stateNode = null;
    fiber.updateQueue = null;
  }
  var hostParent = null, hostParentIsContainer = false;
  function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
    for (parent = parent.child; null !== parent; )
      commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
  }
  function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
    if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount)
      try {
        injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
      } catch (err) {
      }
    switch (deletedFiber.tag) {
      case 26:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
        break;
      case 27:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
        var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
        isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = false);
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        releaseSingletonInstance(deletedFiber.stateNode);
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        break;
      case 5:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
      case 6:
        prevHostParent = hostParent;
        prevHostParentIsContainer = hostParentIsContainer;
        hostParent = null;
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        if (null !== hostParent)
          if (hostParentIsContainer)
            try {
              (9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode);
            } catch (error) {
              captureCommitPhaseError(
                deletedFiber,
                nearestMountedAncestor,
                error
              );
            }
          else
            try {
              hostParent.removeChild(deletedFiber.stateNode);
            } catch (error) {
              captureCommitPhaseError(
                deletedFiber,
                nearestMountedAncestor,
                error
              );
            }
        break;
      case 18:
        null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(
          9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot,
          deletedFiber.stateNode
        ), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
        break;
      case 4:
        prevHostParent = hostParent;
        prevHostParentIsContainer = hostParentIsContainer;
        hostParent = deletedFiber.stateNode.containerInfo;
        hostParentIsContainer = true;
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
        offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        break;
      case 1:
        offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(
          deletedFiber,
          nearestMountedAncestor,
          prevHostParent
        ));
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        break;
      case 21:
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        break;
      case 22:
        offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        offscreenSubtreeWasHidden = prevHostParent;
        break;
      default:
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
    }
  }
  function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
    if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
      finishedRoot = finishedRoot.dehydrated;
      try {
        retryIfBlockedOn(finishedRoot);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
  }
  function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
    if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot))))
      try {
        retryIfBlockedOn(finishedRoot);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
  }
  function getRetryCache(finishedWork) {
    switch (finishedWork.tag) {
      case 31:
      case 13:
      case 19:
        var retryCache = finishedWork.stateNode;
        null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
        return retryCache;
      case 22:
        return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
      default:
        throw Error(formatProdErrorMessage(435, finishedWork.tag));
    }
  }
  function attachSuspenseRetryListeners(finishedWork, wakeables) {
    var retryCache = getRetryCache(finishedWork);
    wakeables.forEach(function(wakeable) {
      if (!retryCache.has(wakeable)) {
        retryCache.add(wakeable);
        var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
        wakeable.then(retry, retry);
      }
    });
  }
  function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
    var deletions = parentFiber.deletions;
    if (null !== deletions)
      for (var i = 0; i < deletions.length; i++) {
        var childToDelete = deletions[i], root2 = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
        a: for (; null !== parent; ) {
          switch (parent.tag) {
            case 27:
              if (isSingletonScope(parent.type)) {
                hostParent = parent.stateNode;
                hostParentIsContainer = false;
                break a;
              }
              break;
            case 5:
              hostParent = parent.stateNode;
              hostParentIsContainer = false;
              break a;
            case 3:
            case 4:
              hostParent = parent.stateNode.containerInfo;
              hostParentIsContainer = true;
              break a;
          }
          parent = parent.return;
        }
        if (null === hostParent) throw Error(formatProdErrorMessage(160));
        commitDeletionEffectsOnFiber(root2, returnFiber, childToDelete);
        hostParent = null;
        hostParentIsContainer = false;
        root2 = childToDelete.alternate;
        null !== root2 && (root2.return = null);
        childToDelete.return = null;
      }
    if (parentFiber.subtreeFlags & 13886)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitMutationEffectsOnFiber(parentFiber, root$jscomp$0), parentFiber = parentFiber.sibling;
  }
  var currentHoistableRoot = null;
  function commitMutationEffectsOnFiber(finishedWork, root2) {
    var current = finishedWork.alternate, flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
        break;
      case 1:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (flags = finishedWork.callbacks, null !== flags && (current = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === current ? flags : current.concat(flags))));
        break;
      case 26:
        var hoistableRoot = currentHoistableRoot;
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        if (flags & 4) {
          var currentResource = null !== current ? current.memoizedState : null;
          flags = finishedWork.memoizedState;
          if (null === current)
            if (null === flags)
              if (null === finishedWork.stateNode) {
                a: {
                  flags = finishedWork.type;
                  current = finishedWork.memoizedProps;
                  hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
                  b: switch (flags) {
                    case "title":
                      currentResource = hoistableRoot.getElementsByTagName("title")[0];
                      if (!currentResource || currentResource[internalHoistableMarker] || currentResource[internalInstanceKey] || "http://www.w3.org/2000/svg" === currentResource.namespaceURI || currentResource.hasAttribute("itemprop"))
                        currentResource = hoistableRoot.createElement(flags), hoistableRoot.head.insertBefore(
                          currentResource,
                          hoistableRoot.querySelector("head > title")
                        );
                      setInitialProperties(currentResource, flags, current);
                      currentResource[internalInstanceKey] = finishedWork;
                      markNodeAsHoistable(currentResource);
                      flags = currentResource;
                      break a;
                    case "link":
                      var maybeNodes = getHydratableHoistableCache(
                        "link",
                        "href",
                        hoistableRoot
                      ).get(flags + (current.href || ""));
                      if (maybeNodes) {
                        for (var i = 0; i < maybeNodes.length; i++)
                          if (currentResource = maybeNodes[i], currentResource.getAttribute("href") === (null == current.href || "" === current.href ? null : current.href) && currentResource.getAttribute("rel") === (null == current.rel ? null : current.rel) && currentResource.getAttribute("title") === (null == current.title ? null : current.title) && currentResource.getAttribute("crossorigin") === (null == current.crossOrigin ? null : current.crossOrigin)) {
                            maybeNodes.splice(i, 1);
                            break b;
                          }
                      }
                      currentResource = hoistableRoot.createElement(flags);
                      setInitialProperties(currentResource, flags, current);
                      hoistableRoot.head.appendChild(currentResource);
                      break;
                    case "meta":
                      if (maybeNodes = getHydratableHoistableCache(
                        "meta",
                        "content",
                        hoistableRoot
                      ).get(flags + (current.content || ""))) {
                        for (i = 0; i < maybeNodes.length; i++)
                          if (currentResource = maybeNodes[i], currentResource.getAttribute("content") === (null == current.content ? null : "" + current.content) && currentResource.getAttribute("name") === (null == current.name ? null : current.name) && currentResource.getAttribute("property") === (null == current.property ? null : current.property) && currentResource.getAttribute("http-equiv") === (null == current.httpEquiv ? null : current.httpEquiv) && currentResource.getAttribute("charset") === (null == current.charSet ? null : current.charSet)) {
                            maybeNodes.splice(i, 1);
                            break b;
                          }
                      }
                      currentResource = hoistableRoot.createElement(flags);
                      setInitialProperties(currentResource, flags, current);
                      hoistableRoot.head.appendChild(currentResource);
                      break;
                    default:
                      throw Error(formatProdErrorMessage(468, flags));
                  }
                  currentResource[internalInstanceKey] = finishedWork;
                  markNodeAsHoistable(currentResource);
                  flags = currentResource;
                }
                finishedWork.stateNode = flags;
              } else
                mountHoistable(
                  hoistableRoot,
                  finishedWork.type,
                  finishedWork.stateNode
                );
            else
              finishedWork.stateNode = acquireResource(
                hoistableRoot,
                flags,
                finishedWork.memoizedProps
              );
          else
            currentResource !== flags ? (null === currentResource ? null !== current.stateNode && (current = current.stateNode, current.parentNode.removeChild(current)) : currentResource.count--, null === flags ? mountHoistable(
              hoistableRoot,
              finishedWork.type,
              finishedWork.stateNode
            ) : acquireResource(
              hoistableRoot,
              flags,
              finishedWork.memoizedProps
            )) : null === flags && null !== finishedWork.stateNode && commitHostUpdate(
              finishedWork,
              finishedWork.memoizedProps,
              current.memoizedProps
            );
        }
        break;
      case 27:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        null !== current && flags & 4 && commitHostUpdate(
          finishedWork,
          finishedWork.memoizedProps,
          current.memoizedProps
        );
        break;
      case 5:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        if (finishedWork.flags & 32) {
          hoistableRoot = finishedWork.stateNode;
          try {
            setTextContent(hoistableRoot, "");
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        flags & 4 && null != finishedWork.stateNode && (hoistableRoot = finishedWork.memoizedProps, commitHostUpdate(
          finishedWork,
          hoistableRoot,
          null !== current ? current.memoizedProps : hoistableRoot
        ));
        flags & 1024 && (needsFormReset = true);
        break;
      case 6:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        if (flags & 4) {
          if (null === finishedWork.stateNode)
            throw Error(formatProdErrorMessage(162));
          flags = finishedWork.memoizedProps;
          current = finishedWork.stateNode;
          try {
            current.nodeValue = flags;
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        break;
      case 3:
        tagCaches = null;
        hoistableRoot = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(root2.containerInfo);
        recursivelyTraverseMutationEffects(root2, finishedWork);
        currentHoistableRoot = hoistableRoot;
        commitReconciliationEffects(finishedWork);
        if (flags & 4 && null !== current && current.memoizedState.isDehydrated)
          try {
            retryIfBlockedOn(root2.containerInfo);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        needsFormReset && (needsFormReset = false, recursivelyResetForms(finishedWork));
        break;
      case 4:
        flags = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(
          finishedWork.stateNode.containerInfo
        );
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        currentHoistableRoot = flags;
        break;
      case 12:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        break;
      case 31:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 13:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 22:
        hoistableRoot = null !== finishedWork.memoizedState;
        var wasHidden = null !== current && null !== current.memoizedState, prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || hoistableRoot;
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;
        recursivelyTraverseMutationEffects(root2, finishedWork);
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
        commitReconciliationEffects(finishedWork);
        if (flags & 8192)
          a: for (root2 = finishedWork.stateNode, root2._visibility = hoistableRoot ? root2._visibility & -2 : root2._visibility | 1, hoistableRoot && (null === current || wasHidden || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || recursivelyTraverseDisappearLayoutEffects(finishedWork)), current = null, root2 = finishedWork; ; ) {
            if (5 === root2.tag || 26 === root2.tag) {
              if (null === current) {
                wasHidden = current = root2;
                try {
                  if (currentResource = wasHidden.stateNode, hoistableRoot)
                    maybeNodes = currentResource.style, "function" === typeof maybeNodes.setProperty ? maybeNodes.setProperty("display", "none", "important") : maybeNodes.display = "none";
                  else {
                    i = wasHidden.stateNode;
                    var styleProp = wasHidden.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
                    i.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
                  }
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if (6 === root2.tag) {
              if (null === current) {
                wasHidden = root2;
                try {
                  wasHidden.stateNode.nodeValue = hoistableRoot ? "" : wasHidden.memoizedProps;
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if (18 === root2.tag) {
              if (null === current) {
                wasHidden = root2;
                try {
                  var instance = wasHidden.stateNode;
                  hoistableRoot ? hideOrUnhideDehydratedBoundary(instance, true) : hideOrUnhideDehydratedBoundary(wasHidden.stateNode, false);
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if ((22 !== root2.tag && 23 !== root2.tag || null === root2.memoizedState || root2 === finishedWork) && null !== root2.child) {
              root2.child.return = root2;
              root2 = root2.child;
              continue;
            }
            if (root2 === finishedWork) break a;
            for (; null === root2.sibling; ) {
              if (null === root2.return || root2.return === finishedWork) break a;
              current === root2 && (current = null);
              root2 = root2.return;
            }
            current === root2 && (current = null);
            root2.sibling.return = root2.return;
            root2 = root2.sibling;
          }
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (current = flags.retryQueue, null !== current && (flags.retryQueue = null, attachSuspenseRetryListeners(finishedWork, current))));
        break;
      case 19:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        recursivelyTraverseMutationEffects(root2, finishedWork), commitReconciliationEffects(finishedWork);
    }
  }
  function commitReconciliationEffects(finishedWork) {
    var flags = finishedWork.flags;
    if (flags & 2) {
      try {
        for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber; ) {
          if (isHostParent(parentFiber)) {
            hostParentFiber = parentFiber;
            break;
          }
          parentFiber = parentFiber.return;
        }
        if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
        switch (hostParentFiber.tag) {
          case 27:
            var parent = hostParentFiber.stateNode, before = getHostSibling(finishedWork);
            insertOrAppendPlacementNode(finishedWork, before, parent);
            break;
          case 5:
            var parent$141 = hostParentFiber.stateNode;
            hostParentFiber.flags & 32 && (setTextContent(parent$141, ""), hostParentFiber.flags &= -33);
            var before$142 = getHostSibling(finishedWork);
            insertOrAppendPlacementNode(finishedWork, before$142, parent$141);
            break;
          case 3:
          case 4:
            var parent$143 = hostParentFiber.stateNode.containerInfo, before$144 = getHostSibling(finishedWork);
            insertOrAppendPlacementNodeIntoContainer(
              finishedWork,
              before$144,
              parent$143
            );
            break;
          default:
            throw Error(formatProdErrorMessage(161));
        }
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
      finishedWork.flags &= -3;
    }
    flags & 4096 && (finishedWork.flags &= -4097);
  }
  function recursivelyResetForms(parentFiber) {
    if (parentFiber.subtreeFlags & 1024)
      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
        var fiber = parentFiber;
        recursivelyResetForms(fiber);
        5 === fiber.tag && fiber.flags & 1024 && fiber.stateNode.reset();
        parentFiber = parentFiber.sibling;
      }
  }
  function recursivelyTraverseLayoutEffects(root2, parentFiber) {
    if (parentFiber.subtreeFlags & 8772)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitLayoutEffectOnFiber(root2, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
  }
  function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var finishedWork = parentFiber;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 1:
          safelyDetachRef(finishedWork, finishedWork.return);
          var instance = finishedWork.stateNode;
          "function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(
            finishedWork,
            finishedWork.return,
            instance
          );
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 27:
          releaseSingletonInstance(finishedWork.stateNode);
        case 26:
        case 5:
          safelyDetachRef(finishedWork, finishedWork.return);
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 22:
          null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 30:
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        default:
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, includeWorkInProgressEffects) {
    includeWorkInProgressEffects = includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 8772);
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          commitHookEffectListMount(4, finishedWork);
          break;
        case 1:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          current = finishedWork;
          finishedRoot = current.stateNode;
          if ("function" === typeof finishedRoot.componentDidMount)
            try {
              finishedRoot.componentDidMount();
            } catch (error) {
              captureCommitPhaseError(current, current.return, error);
            }
          current = finishedWork;
          finishedRoot = current.updateQueue;
          if (null !== finishedRoot) {
            var instance = current.stateNode;
            try {
              var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
              if (null !== hiddenCallbacks)
                for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++)
                  callCallback(hiddenCallbacks[finishedRoot], instance);
            } catch (error) {
              captureCommitPhaseError(current, current.return, error);
            }
          }
          includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 27:
          commitHostSingletonAcquisition(finishedWork);
        case 26:
        case 5:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 12:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          break;
        case 31:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
          break;
        case 13:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
          break;
        case 22:
          null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 30:
          break;
        default:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function commitOffscreenPassiveMountEffects(current, finishedWork) {
    var previousCache = null;
    null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
    current = null;
    null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
    current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
  }
  function commitCachePassiveMountEffect(current, finishedWork) {
    current = null;
    null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
    finishedWork = finishedWork.memoizedState.cache;
    finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
  }
  function recursivelyTraversePassiveMountEffects(root2, parentFiber, committedLanes, committedTransitions) {
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitPassiveMountOnFiber(
          root2,
          parentFiber,
          committedLanes,
          committedTransitions
        ), parentFiber = parentFiber.sibling;
  }
  function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
    var flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        flags & 2048 && commitHookEffectListMount(9, finishedWork);
        break;
      case 1:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        break;
      case 3:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        flags & 2048 && (finishedRoot = null, null !== finishedWork.alternate && (finishedRoot = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== finishedRoot && (finishedWork.refCount++, null != finishedRoot && releaseCache(finishedRoot)));
        break;
      case 12:
        if (flags & 2048) {
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
          finishedRoot = finishedWork.stateNode;
          try {
            var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
            "function" === typeof onPostCommit && onPostCommit(
              id,
              null === finishedWork.alternate ? "mount" : "update",
              finishedRoot.passiveEffectDuration,
              -0
            );
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        } else
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
        break;
      case 31:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        break;
      case 13:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        break;
      case 23:
        break;
      case 22:
        _finishedWork$memoize2 = finishedWork.stateNode;
        id = finishedWork.alternate;
        null !== finishedWork.memoizedState ? _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        ) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        ) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          0 !== (finishedWork.subtreeFlags & 10256) || false
        ));
        flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
        break;
      case 24:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
        break;
      default:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
    }
  }
  function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
    includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || false);
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          );
          commitHookEffectListMount(8, finishedWork);
          break;
        case 23:
          break;
        case 22:
          var instance = finishedWork.stateNode;
          null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          ) : recursivelyTraverseAtomicPassiveEffects(
            finishedRoot,
            finishedWork
          ) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          ));
          includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(
            finishedWork.alternate,
            finishedWork
          );
          break;
        case 24:
          recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
          break;
        default:
          recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          );
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
        var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 22:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
            flags & 2048 && commitOffscreenPassiveMountEffects(
              finishedWork.alternate,
              finishedWork
            );
            break;
          case 24:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
            flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
            break;
          default:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
        }
        parentFiber = parentFiber.sibling;
      }
  }
  var suspenseyCommitFlag = 8192;
  function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
    if (parentFiber.subtreeFlags & suspenseyCommitFlag)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        accumulateSuspenseyCommitOnFiber(
          parentFiber,
          committedLanes,
          suspendedState
        ), parentFiber = parentFiber.sibling;
  }
  function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
    switch (fiber.tag) {
      case 26:
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
        fiber.flags & suspenseyCommitFlag && null !== fiber.memoizedState && suspendResource(
          suspendedState,
          currentHoistableRoot,
          fiber.memoizedState,
          fiber.memoizedProps
        );
        break;
      case 5:
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
        break;
      case 3:
      case 4:
        var previousHoistableRoot = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
        currentHoistableRoot = previousHoistableRoot;
        break;
      case 22:
        null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        ), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        ));
        break;
      default:
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
    }
  }
  function detachAlternateSiblings(parentFiber) {
    var previousFiber = parentFiber.alternate;
    if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
      previousFiber.child = null;
      do
        previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
      while (null !== parentFiber);
    }
  }
  function recursivelyTraversePassiveUnmountEffects(parentFiber) {
    var deletions = parentFiber.deletions;
    if (0 !== (parentFiber.flags & 16)) {
      if (null !== deletions)
        for (var i = 0; i < deletions.length; i++) {
          var childToDelete = deletions[i];
          nextEffect = childToDelete;
          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
            childToDelete,
            parentFiber
          );
        }
      detachAlternateSiblings(parentFiber);
    }
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
  }
  function commitPassiveUnmountOnFiber(finishedWork) {
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
        break;
      case 3:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      case 12:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      case 22:
        var instance = finishedWork.stateNode;
        null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      default:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
    }
  }
  function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
    var deletions = parentFiber.deletions;
    if (0 !== (parentFiber.flags & 16)) {
      if (null !== deletions)
        for (var i = 0; i < deletions.length; i++) {
          var childToDelete = deletions[i];
          nextEffect = childToDelete;
          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
            childToDelete,
            parentFiber
          );
        }
      detachAlternateSiblings(parentFiber);
    }
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      deletions = parentFiber;
      switch (deletions.tag) {
        case 0:
        case 11:
        case 15:
          commitHookEffectListUnmount(8, deletions, deletions.return);
          recursivelyTraverseDisconnectPassiveEffects(deletions);
          break;
        case 22:
          i = deletions.stateNode;
          i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
          break;
        default:
          recursivelyTraverseDisconnectPassiveEffects(deletions);
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
    for (; null !== nextEffect; ) {
      var fiber = nextEffect;
      switch (fiber.tag) {
        case 0:
        case 11:
        case 15:
          commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
          break;
        case 23:
        case 22:
          if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
            var cache = fiber.memoizedState.cachePool.pool;
            null != cache && cache.refCount++;
          }
          break;
        case 24:
          releaseCache(fiber.memoizedState.cache);
      }
      cache = fiber.child;
      if (null !== cache) cache.return = fiber, nextEffect = cache;
      else
        a: for (fiber = deletedSubtreeRoot; null !== nextEffect; ) {
          cache = nextEffect;
          var sibling = cache.sibling, returnFiber = cache.return;
          detachFiberAfterEffects(cache);
          if (cache === fiber) {
            nextEffect = null;
            break a;
          }
          if (null !== sibling) {
            sibling.return = returnFiber;
            nextEffect = sibling;
            break a;
          }
          nextEffect = returnFiber;
        }
    }
  }
  var DefaultAsyncDispatcher = {
    getCacheForType: function(resourceType) {
      var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
      void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
      return cacheForType;
    },
    cacheSignal: function() {
      return readContext(CacheContext).controller.signal;
    }
  }, PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map, executionContext = 0, workInProgressRoot = null, workInProgress = null, workInProgressRootRenderLanes = 0, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, workInProgressRootDidSkipSuspendedSiblings = false, workInProgressRootIsPrerendering = false, workInProgressRootDidAttachPingListener = false, entangledRenderLanes = 0, workInProgressRootExitStatus = 0, workInProgressRootSkippedLanes = 0, workInProgressRootInterleavedUpdatedLanes = 0, workInProgressRootPingedLanes = 0, workInProgressDeferredLane = 0, workInProgressSuspendedRetryLanes = 0, workInProgressRootConcurrentErrors = null, workInProgressRootRecoverableErrors = null, workInProgressRootDidIncludeRecursiveRenderUpdate = false, globalMostRecentFallbackTime = 0, globalMostRecentTransitionTime = 0, workInProgressRootRenderTargetTime = Infinity, workInProgressTransitions = null, legacyErrorBoundariesThatAlreadyFailed = null, pendingEffectsStatus = 0, pendingEffectsRoot = null, pendingFinishedWork = null, pendingEffectsLanes = 0, pendingEffectsRemainingLanes = 0, pendingPassiveTransitions = null, pendingRecoverableErrors = null, nestedUpdateCount = 0, rootWithNestedUpdates = null;
  function requestUpdateLane() {
    return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
  }
  function requestDeferredLane() {
    if (0 === workInProgressDeferredLane)
      if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
        var lane = nextTransitionDeferredLane;
        nextTransitionDeferredLane <<= 1;
        0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
        workInProgressDeferredLane = lane;
      } else workInProgressDeferredLane = 536870912;
    lane = suspenseHandlerStackCursor.current;
    null !== lane && (lane.flags |= 32);
    return workInProgressDeferredLane;
  }
  function scheduleUpdateOnFiber(root2, fiber, lane) {
    if (root2 === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root2.cancelPendingCommit)
      prepareFreshStack(root2, 0), markRootSuspended(
        root2,
        workInProgressRootRenderLanes,
        workInProgressDeferredLane,
        false
      );
    markRootUpdated$1(root2, lane);
    if (0 === (executionContext & 2) || root2 !== workInProgressRoot)
      root2 === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(
        root2,
        workInProgressRootRenderLanes,
        workInProgressDeferredLane,
        false
      )), ensureRootIsScheduled(root2);
  }
  function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
    if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
    var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, true), renderWasConcurrent = shouldTimeSlice;
    do {
      if (0 === exitStatus) {
        workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, false);
        break;
      } else {
        forceSync = root$jscomp$0.current.alternate;
        if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
          exitStatus = renderRootSync(root$jscomp$0, lanes, false);
          renderWasConcurrent = false;
          continue;
        }
        if (2 === exitStatus) {
          renderWasConcurrent = lanes;
          if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
            var JSCompiler_inline_result = 0;
          else
            JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
          if (0 !== JSCompiler_inline_result) {
            lanes = JSCompiler_inline_result;
            a: {
              var root2 = root$jscomp$0;
              exitStatus = workInProgressRootConcurrentErrors;
              var wasRootDehydrated = root2.current.memoizedState.isDehydrated;
              wasRootDehydrated && (prepareFreshStack(root2, JSCompiler_inline_result).flags |= 256);
              JSCompiler_inline_result = renderRootSync(
                root2,
                JSCompiler_inline_result,
                false
              );
              if (2 !== JSCompiler_inline_result) {
                if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
                  root2.errorRecoveryDisabledLanes |= renderWasConcurrent;
                  workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
                  exitStatus = 4;
                  break a;
                }
                renderWasConcurrent = workInProgressRootRecoverableErrors;
                workInProgressRootRecoverableErrors = exitStatus;
                null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(
                  workInProgressRootRecoverableErrors,
                  renderWasConcurrent
                ));
              }
              exitStatus = JSCompiler_inline_result;
            }
            renderWasConcurrent = false;
            if (2 !== exitStatus) continue;
          }
        }
        if (1 === exitStatus) {
          prepareFreshStack(root$jscomp$0, 0);
          markRootSuspended(root$jscomp$0, lanes, 0, true);
          break;
        }
        a: {
          shouldTimeSlice = root$jscomp$0;
          renderWasConcurrent = exitStatus;
          switch (renderWasConcurrent) {
            case 0:
            case 1:
              throw Error(formatProdErrorMessage(345));
            case 4:
              if ((lanes & 4194048) !== lanes) break;
            case 6:
              markRootSuspended(
                shouldTimeSlice,
                lanes,
                workInProgressDeferredLane,
                !workInProgressRootDidSkipSuspendedSiblings
              );
              break a;
            case 2:
              workInProgressRootRecoverableErrors = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(formatProdErrorMessage(329));
          }
          if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
            markRootSuspended(
              shouldTimeSlice,
              lanes,
              workInProgressDeferredLane,
              !workInProgressRootDidSkipSuspendedSiblings
            );
            if (0 !== getNextLanes(shouldTimeSlice, 0, true)) break a;
            pendingEffectsLanes = lanes;
            shouldTimeSlice.timeoutHandle = scheduleTimeout(
              commitRootWhenReady.bind(
                null,
                shouldTimeSlice,
                forceSync,
                workInProgressRootRecoverableErrors,
                workInProgressTransitions,
                workInProgressRootDidIncludeRecursiveRenderUpdate,
                lanes,
                workInProgressDeferredLane,
                workInProgressRootInterleavedUpdatedLanes,
                workInProgressSuspendedRetryLanes,
                workInProgressRootDidSkipSuspendedSiblings,
                renderWasConcurrent,
                "Throttled",
                -0,
                0
              ),
              exitStatus
            );
            break a;
          }
          commitRootWhenReady(
            shouldTimeSlice,
            forceSync,
            workInProgressRootRecoverableErrors,
            workInProgressTransitions,
            workInProgressRootDidIncludeRecursiveRenderUpdate,
            lanes,
            workInProgressDeferredLane,
            workInProgressRootInterleavedUpdatedLanes,
            workInProgressSuspendedRetryLanes,
            workInProgressRootDidSkipSuspendedSiblings,
            renderWasConcurrent,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (1);
    ensureRootIsScheduled(root$jscomp$0);
  }
  function commitRootWhenReady(root2, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
    root2.timeoutHandle = -1;
    suspendedCommitReason = finishedWork.subtreeFlags;
    if (suspendedCommitReason & 8192 || 16785408 === (suspendedCommitReason & 16785408)) {
      suspendedCommitReason = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: true,
        waitingForViewTransition: false,
        unsuspend: noop$1
      };
      accumulateSuspenseyCommitOnFiber(
        finishedWork,
        lanes,
        suspendedCommitReason
      );
      var timeoutOffset = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0;
      timeoutOffset = waitForCommitToBeReady(
        suspendedCommitReason,
        timeoutOffset
      );
      if (null !== timeoutOffset) {
        pendingEffectsLanes = lanes;
        root2.cancelPendingCommit = timeoutOffset(
          commitRoot.bind(
            null,
            root2,
            finishedWork,
            lanes,
            recoverableErrors,
            transitions,
            didIncludeRenderPhaseUpdate,
            spawnedLane,
            updatedLanes,
            suspendedRetryLanes,
            exitStatus,
            suspendedCommitReason,
            null,
            completedRenderStartTime,
            completedRenderEndTime
          )
        );
        markRootSuspended(root2, lanes, spawnedLane, !didSkipSuspendedSiblings);
        return;
      }
    }
    commitRoot(
      root2,
      finishedWork,
      lanes,
      recoverableErrors,
      transitions,
      didIncludeRenderPhaseUpdate,
      spawnedLane,
      updatedLanes,
      suspendedRetryLanes
    );
  }
  function isRenderConsistentWithExternalStores(finishedWork) {
    for (var node = finishedWork; ; ) {
      var tag = node.tag;
      if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag)))
        for (var i = 0; i < tag.length; i++) {
          var check = tag[i], getSnapshot = check.getSnapshot;
          check = check.value;
          try {
            if (!objectIs(getSnapshot(), check)) return false;
          } catch (error) {
            return false;
          }
        }
      tag = node.child;
      if (node.subtreeFlags & 16384 && null !== tag)
        tag.return = node, node = tag;
      else {
        if (node === finishedWork) break;
        for (; null === node.sibling; ) {
          if (null === node.return || node.return === finishedWork) return true;
          node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
      }
    }
    return true;
  }
  function markRootSuspended(root2, suspendedLanes, spawnedLane, didAttemptEntireTree) {
    suspendedLanes &= ~workInProgressRootPingedLanes;
    suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
    root2.suspendedLanes |= suspendedLanes;
    root2.pingedLanes &= ~suspendedLanes;
    didAttemptEntireTree && (root2.warmLanes |= suspendedLanes);
    didAttemptEntireTree = root2.expirationTimes;
    for (var lanes = suspendedLanes; 0 < lanes; ) {
      var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
      didAttemptEntireTree[index$6] = -1;
      lanes &= ~lane;
    }
    0 !== spawnedLane && markSpawnedDeferredLane(root2, spawnedLane, suspendedLanes);
  }
  function flushSyncWork$1() {
    return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0), false) : true;
  }
  function resetWorkInProgressStack() {
    if (null !== workInProgress) {
      if (0 === workInProgressSuspendedReason)
        var interruptedWork = workInProgress.return;
      else
        interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
      for (; null !== interruptedWork; )
        unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
      workInProgress = null;
    }
  }
  function prepareFreshStack(root2, lanes) {
    var timeoutHandle = root2.timeoutHandle;
    -1 !== timeoutHandle && (root2.timeoutHandle = -1, cancelTimeout(timeoutHandle));
    timeoutHandle = root2.cancelPendingCommit;
    null !== timeoutHandle && (root2.cancelPendingCommit = null, timeoutHandle());
    pendingEffectsLanes = 0;
    resetWorkInProgressStack();
    workInProgressRoot = root2;
    workInProgress = timeoutHandle = createWorkInProgress(root2.current, null);
    workInProgressRootRenderLanes = lanes;
    workInProgressSuspendedReason = 0;
    workInProgressThrownValue = null;
    workInProgressRootDidSkipSuspendedSiblings = false;
    workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root2, lanes);
    workInProgressRootDidAttachPingListener = false;
    workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
    workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
    workInProgressRootDidIncludeRecursiveRenderUpdate = false;
    0 !== (lanes & 8) && (lanes |= lanes & 32);
    var allEntangledLanes = root2.entangledLanes;
    if (0 !== allEntangledLanes)
      for (root2 = root2.entanglements, allEntangledLanes &= lanes; 0 < allEntangledLanes; ) {
        var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
        lanes |= root2[index$4];
        allEntangledLanes &= ~lane;
      }
    entangledRenderLanes = lanes;
    finishQueueingConcurrentUpdates();
    return timeoutHandle;
  }
  function handleThrow(root2, thrownValue) {
    currentlyRenderingFiber = null;
    ReactSharedInternals.H = ContextOnlyDispatcher;
    thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
    workInProgressThrownValue = thrownValue;
    null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(
      root2,
      createCapturedValueAtFiber(thrownValue, root2.current)
    ));
  }
  function shouldRemainOnPreviousScreen() {
    var handler = suspenseHandlerStackCursor.current;
    return null === handler ? true : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? true : false : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : false;
  }
  function pushDispatcher() {
    var prevDispatcher = ReactSharedInternals.H;
    ReactSharedInternals.H = ContextOnlyDispatcher;
    return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
  }
  function pushAsyncDispatcher() {
    var prevAsyncDispatcher = ReactSharedInternals.A;
    ReactSharedInternals.A = DefaultAsyncDispatcher;
    return prevAsyncDispatcher;
  }
  function renderDidSuspendDelayIfPossible() {
    workInProgressRootExitStatus = 4;
    workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = true);
    0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(
      workInProgressRoot,
      workInProgressRootRenderLanes,
      workInProgressDeferredLane,
      false
    );
  }
  function renderRootSync(root2, lanes, shouldYieldForPrerendering) {
    var prevExecutionContext = executionContext;
    executionContext |= 2;
    var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
    if (workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes)
      workInProgressTransitions = null, prepareFreshStack(root2, lanes);
    lanes = false;
    var exitStatus = workInProgressRootExitStatus;
    a: do
      try {
        if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
          var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
          switch (workInProgressSuspendedReason) {
            case 8:
              resetWorkInProgressStack();
              exitStatus = 6;
              break a;
            case 3:
            case 2:
            case 9:
            case 6:
              null === suspenseHandlerStackCursor.current && (lanes = true);
              var reason = workInProgressSuspendedReason;
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
              if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
                exitStatus = 0;
                break a;
              }
              break;
            default:
              reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
          }
        }
        workLoopSync();
        exitStatus = workInProgressRootExitStatus;
        break;
      } catch (thrownValue$165) {
        handleThrow(root2, thrownValue$165);
      }
    while (1);
    lanes && root2.shellSuspendCounter++;
    lastContextDependency = currentlyRenderingFiber$1 = null;
    executionContext = prevExecutionContext;
    ReactSharedInternals.H = prevDispatcher;
    ReactSharedInternals.A = prevAsyncDispatcher;
    null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
    return exitStatus;
  }
  function workLoopSync() {
    for (; null !== workInProgress; ) performUnitOfWork(workInProgress);
  }
  function renderRootConcurrent(root2, lanes) {
    var prevExecutionContext = executionContext;
    executionContext |= 2;
    var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
    workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root2, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(
      root2,
      lanes
    );
    a: do
      try {
        if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
          lanes = workInProgress;
          var thrownValue = workInProgressThrownValue;
          b: switch (workInProgressSuspendedReason) {
            case 1:
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root2, lanes, thrownValue, 1);
              break;
            case 2:
            case 9:
              if (isThenableResolved(thrownValue)) {
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                replaySuspendedUnitOfWork(lanes);
                break;
              }
              lanes = function() {
                2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root2 || (workInProgressSuspendedReason = 7);
                ensureRootIsScheduled(root2);
              };
              thrownValue.then(lanes, lanes);
              break a;
            case 3:
              workInProgressSuspendedReason = 7;
              break a;
            case 4:
              workInProgressSuspendedReason = 5;
              break a;
            case 7:
              isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, lanes, thrownValue, 7));
              break;
            case 5:
              var resource = null;
              switch (workInProgress.tag) {
                case 26:
                  resource = workInProgress.memoizedState;
                case 5:
                case 27:
                  var hostFiber = workInProgress;
                  if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
                    workInProgressSuspendedReason = 0;
                    workInProgressThrownValue = null;
                    var sibling = hostFiber.sibling;
                    if (null !== sibling) workInProgress = sibling;
                    else {
                      var returnFiber = hostFiber.return;
                      null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
                    }
                    break b;
                  }
              }
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root2, lanes, thrownValue, 5);
              break;
            case 6:
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root2, lanes, thrownValue, 6);
              break;
            case 8:
              resetWorkInProgressStack();
              workInProgressRootExitStatus = 6;
              break a;
            default:
              throw Error(formatProdErrorMessage(462));
          }
        }
        workLoopConcurrentByScheduler();
        break;
      } catch (thrownValue$167) {
        handleThrow(root2, thrownValue$167);
      }
    while (1);
    lastContextDependency = currentlyRenderingFiber$1 = null;
    ReactSharedInternals.H = prevDispatcher;
    ReactSharedInternals.A = prevAsyncDispatcher;
    executionContext = prevExecutionContext;
    if (null !== workInProgress) return 0;
    workInProgressRoot = null;
    workInProgressRootRenderLanes = 0;
    finishQueueingConcurrentUpdates();
    return workInProgressRootExitStatus;
  }
  function workLoopConcurrentByScheduler() {
    for (; null !== workInProgress && !shouldYield(); )
      performUnitOfWork(workInProgress);
  }
  function performUnitOfWork(unitOfWork) {
    var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
  }
  function replaySuspendedUnitOfWork(unitOfWork) {
    var next = unitOfWork;
    var current = next.alternate;
    switch (next.tag) {
      case 15:
      case 0:
        next = replayFunctionComponent(
          current,
          next,
          next.pendingProps,
          next.type,
          void 0,
          workInProgressRootRenderLanes
        );
        break;
      case 11:
        next = replayFunctionComponent(
          current,
          next,
          next.pendingProps,
          next.type.render,
          next.ref,
          workInProgressRootRenderLanes
        );
        break;
      case 5:
        resetHooksOnUnwind(next);
      default:
        unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
    }
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
  }
  function throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, suspendedReason) {
    lastContextDependency = currentlyRenderingFiber$1 = null;
    resetHooksOnUnwind(unitOfWork);
    thenableState$1 = null;
    thenableIndexCounter$1 = 0;
    var returnFiber = unitOfWork.return;
    try {
      if (throwException(
        root2,
        returnFiber,
        unitOfWork,
        thrownValue,
        workInProgressRootRenderLanes
      )) {
        workInProgressRootExitStatus = 1;
        logUncaughtError(
          root2,
          createCapturedValueAtFiber(thrownValue, root2.current)
        );
        workInProgress = null;
        return;
      }
    } catch (error) {
      if (null !== returnFiber) throw workInProgress = returnFiber, error;
      workInProgressRootExitStatus = 1;
      logUncaughtError(
        root2,
        createCapturedValueAtFiber(thrownValue, root2.current)
      );
      workInProgress = null;
      return;
    }
    if (unitOfWork.flags & 32768) {
      if (isHydrating || 1 === suspendedReason) root2 = true;
      else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912))
        root2 = false;
      else if (workInProgressRootDidSkipSuspendedSiblings = root2 = true, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason)
        suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
      unwindUnitOfWork(unitOfWork, root2);
    } else completeUnitOfWork(unitOfWork);
  }
  function completeUnitOfWork(unitOfWork) {
    var completedWork = unitOfWork;
    do {
      if (0 !== (completedWork.flags & 32768)) {
        unwindUnitOfWork(
          completedWork,
          workInProgressRootDidSkipSuspendedSiblings
        );
        return;
      }
      unitOfWork = completedWork.return;
      var next = completeWork(
        completedWork.alternate,
        completedWork,
        entangledRenderLanes
      );
      if (null !== next) {
        workInProgress = next;
        return;
      }
      completedWork = completedWork.sibling;
      if (null !== completedWork) {
        workInProgress = completedWork;
        return;
      }
      workInProgress = completedWork = unitOfWork;
    } while (null !== completedWork);
    0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
  }
  function unwindUnitOfWork(unitOfWork, skipSiblings) {
    do {
      var next = unwindWork(unitOfWork.alternate, unitOfWork);
      if (null !== next) {
        next.flags &= 32767;
        workInProgress = next;
        return;
      }
      next = unitOfWork.return;
      null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
      if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
        workInProgress = unitOfWork;
        return;
      }
      workInProgress = unitOfWork = next;
    } while (null !== unitOfWork);
    workInProgressRootExitStatus = 6;
    workInProgress = null;
  }
  function commitRoot(root2, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes) {
    root2.cancelPendingCommit = null;
    do
      flushPendingEffects();
    while (0 !== pendingEffectsStatus);
    if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
    if (null !== finishedWork) {
      if (finishedWork === root2.current) throw Error(formatProdErrorMessage(177));
      didIncludeRenderPhaseUpdate = finishedWork.lanes | finishedWork.childLanes;
      didIncludeRenderPhaseUpdate |= concurrentlyUpdatedLanes;
      markRootFinished(
        root2,
        lanes,
        didIncludeRenderPhaseUpdate,
        spawnedLane,
        updatedLanes,
        suspendedRetryLanes
      );
      root2 === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
      pendingFinishedWork = finishedWork;
      pendingEffectsRoot = root2;
      pendingEffectsLanes = lanes;
      pendingEffectsRemainingLanes = didIncludeRenderPhaseUpdate;
      pendingPassiveTransitions = transitions;
      pendingRecoverableErrors = recoverableErrors;
      0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? (root2.callbackNode = null, root2.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
        flushPassiveEffects();
        return null;
      })) : (root2.callbackNode = null, root2.callbackPriority = 0);
      recoverableErrors = 0 !== (finishedWork.flags & 13878);
      if (0 !== (finishedWork.subtreeFlags & 13878) || recoverableErrors) {
        recoverableErrors = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        transitions = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        spawnedLane = executionContext;
        executionContext |= 4;
        try {
          commitBeforeMutationEffects(root2, finishedWork, lanes);
        } finally {
          executionContext = spawnedLane, ReactDOMSharedInternals.p = transitions, ReactSharedInternals.T = recoverableErrors;
        }
      }
      pendingEffectsStatus = 1;
      flushMutationEffects();
      flushLayoutEffects();
      flushSpawnedWork();
    }
  }
  function flushMutationEffects() {
    if (1 === pendingEffectsStatus) {
      pendingEffectsStatus = 0;
      var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
      if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
        rootMutationHasEffect = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        var prevExecutionContext = executionContext;
        executionContext |= 4;
        try {
          commitMutationEffectsOnFiber(finishedWork, root2);
          var priorSelectionInformation = selectionInformation, curFocusedElem = getActiveElementDeep(root2.containerInfo), priorFocusedElem = priorSelectionInformation.focusedElem, priorSelectionRange = priorSelectionInformation.selectionRange;
          if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(
            priorFocusedElem.ownerDocument.documentElement,
            priorFocusedElem
          )) {
            if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
              var start = priorSelectionRange.start, end = priorSelectionRange.end;
              void 0 === end && (end = start);
              if ("selectionStart" in priorFocusedElem)
                priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(
                  end,
                  priorFocusedElem.value.length
                );
              else {
                var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
                if (win.getSelection) {
                  var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
                  !selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
                  var startMarker = getNodeForCharacterOffset(
                    priorFocusedElem,
                    start$jscomp$0
                  ), endMarker = getNodeForCharacterOffset(
                    priorFocusedElem,
                    end$jscomp$0
                  );
                  if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
                    var range = doc.createRange();
                    range.setStart(startMarker.node, startMarker.offset);
                    selection.removeAllRanges();
                    start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
                  }
                }
              }
            }
            doc = [];
            for (selection = priorFocusedElem; selection = selection.parentNode; )
              1 === selection.nodeType && doc.push({
                element: selection,
                left: selection.scrollLeft,
                top: selection.scrollTop
              });
            "function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
            for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
              var info = doc[priorFocusedElem];
              info.element.scrollLeft = info.left;
              info.element.scrollTop = info.top;
            }
          }
          _enabled = !!eventsEnabled;
          selectionInformation = eventsEnabled = null;
        } finally {
          executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
        }
      }
      root2.current = finishedWork;
      pendingEffectsStatus = 2;
    }
  }
  function flushLayoutEffects() {
    if (2 === pendingEffectsStatus) {
      pendingEffectsStatus = 0;
      var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
      if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
        rootHasLayoutEffect = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        var prevExecutionContext = executionContext;
        executionContext |= 4;
        try {
          commitLayoutEffectOnFiber(root2, finishedWork.alternate, finishedWork);
        } finally {
          executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
        }
      }
      pendingEffectsStatus = 3;
    }
  }
  function flushSpawnedWork() {
    if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
      pendingEffectsStatus = 0;
      requestPaint();
      var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors;
      0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root2, root2.pendingLanes));
      var remainingLanes = root2.pendingLanes;
      0 === remainingLanes && (legacyErrorBoundariesThatAlreadyFailed = null);
      lanesToEventPriority(lanes);
      finishedWork = finishedWork.stateNode;
      if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot)
        try {
          injectedHook.onCommitFiberRoot(
            rendererID,
            finishedWork,
            void 0,
            128 === (finishedWork.current.flags & 128)
          );
        } catch (err) {
        }
      if (null !== recoverableErrors) {
        finishedWork = ReactSharedInternals.T;
        remainingLanes = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        ReactSharedInternals.T = null;
        try {
          for (var onRecoverableError = root2.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
            var recoverableError = recoverableErrors[i];
            onRecoverableError(recoverableError.value, {
              componentStack: recoverableError.stack
            });
          }
        } finally {
          ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = remainingLanes;
        }
      }
      0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
      ensureRootIsScheduled(root2);
      remainingLanes = root2.pendingLanes;
      0 !== (lanes & 261930) && 0 !== (remainingLanes & 42) ? root2 === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root2) : nestedUpdateCount = 0;
      flushSyncWorkAcrossRoots_impl(0);
    }
  }
  function releaseRootPooledCache(root2, remainingLanes) {
    0 === (root2.pooledCacheLanes &= remainingLanes) && (remainingLanes = root2.pooledCache, null != remainingLanes && (root2.pooledCache = null, releaseCache(remainingLanes)));
  }
  function flushPendingEffects() {
    flushMutationEffects();
    flushLayoutEffects();
    flushSpawnedWork();
    return flushPassiveEffects();
  }
  function flushPassiveEffects() {
    if (5 !== pendingEffectsStatus) return false;
    var root2 = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
    pendingEffectsRemainingLanes = 0;
    var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
      ReactSharedInternals.T = null;
      renderPriority = pendingPassiveTransitions;
      pendingPassiveTransitions = null;
      var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
      pendingEffectsStatus = 0;
      pendingFinishedWork = pendingEffectsRoot = null;
      pendingEffectsLanes = 0;
      if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
      var prevExecutionContext = executionContext;
      executionContext |= 4;
      commitPassiveUnmountOnFiber(root$jscomp$0.current);
      commitPassiveMountOnFiber(
        root$jscomp$0,
        root$jscomp$0.current,
        lanes,
        renderPriority
      );
      executionContext = prevExecutionContext;
      flushSyncWorkAcrossRoots_impl(0, false);
      if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot)
        try {
          injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
        } catch (err) {
        }
      return true;
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root2, remainingLanes);
    }
  }
  function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
    sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
    sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
    rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
    null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
  }
  function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
    if (3 === sourceFiber.tag)
      captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
    else
      for (; null !== nearestMountedAncestor; ) {
        if (3 === nearestMountedAncestor.tag) {
          captureCommitPhaseErrorOnRoot(
            nearestMountedAncestor,
            sourceFiber,
            error
          );
          break;
        } else if (1 === nearestMountedAncestor.tag) {
          var instance = nearestMountedAncestor.stateNode;
          if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
            sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
            error = createClassErrorUpdate(2);
            instance = enqueueUpdate(nearestMountedAncestor, error, 2);
            null !== instance && (initializeClassErrorUpdate(
              error,
              instance,
              nearestMountedAncestor,
              sourceFiber
            ), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
            break;
          }
        }
        nearestMountedAncestor = nearestMountedAncestor.return;
      }
  }
  function attachPingListener(root2, wakeable, lanes) {
    var pingCache = root2.pingCache;
    if (null === pingCache) {
      pingCache = root2.pingCache = new PossiblyWeakMap();
      var threadIDs = /* @__PURE__ */ new Set();
      pingCache.set(wakeable, threadIDs);
    } else
      threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
    threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = true, threadIDs.add(lanes), root2 = pingSuspendedRoot.bind(null, root2, wakeable, lanes), wakeable.then(root2, root2));
  }
  function pingSuspendedRoot(root2, wakeable, pingedLanes) {
    var pingCache = root2.pingCache;
    null !== pingCache && pingCache.delete(wakeable);
    root2.pingedLanes |= root2.suspendedLanes & pingedLanes;
    root2.warmLanes &= ~pingedLanes;
    workInProgressRoot === root2 && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) && prepareFreshStack(root2, 0) : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
    ensureRootIsScheduled(root2);
  }
  function retryTimedOutBoundary(boundaryFiber, retryLane) {
    0 === retryLane && (retryLane = claimNextRetryLane());
    boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
    null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
  }
  function retryDehydratedSuspenseBoundary(boundaryFiber) {
    var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
    null !== suspenseState && (retryLane = suspenseState.retryLane);
    retryTimedOutBoundary(boundaryFiber, retryLane);
  }
  function resolveRetryWakeable(boundaryFiber, wakeable) {
    var retryLane = 0;
    switch (boundaryFiber.tag) {
      case 31:
      case 13:
        var retryCache = boundaryFiber.stateNode;
        var suspenseState = boundaryFiber.memoizedState;
        null !== suspenseState && (retryLane = suspenseState.retryLane);
        break;
      case 19:
        retryCache = boundaryFiber.stateNode;
        break;
      case 22:
        retryCache = boundaryFiber.stateNode._retryCache;
        break;
      default:
        throw Error(formatProdErrorMessage(314));
    }
    null !== retryCache && retryCache.delete(wakeable);
    retryTimedOutBoundary(boundaryFiber, retryLane);
  }
  function scheduleCallback$1(priorityLevel, callback) {
    return scheduleCallback$3(priorityLevel, callback);
  }
  var firstScheduledRoot = null, lastScheduledRoot = null, didScheduleMicrotask = false, mightHavePendingSyncWork = false, isFlushingWork = false, currentEventTransitionLane = 0;
  function ensureRootIsScheduled(root2) {
    root2 !== lastScheduledRoot && null === root2.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root2 : lastScheduledRoot = lastScheduledRoot.next = root2);
    mightHavePendingSyncWork = true;
    didScheduleMicrotask || (didScheduleMicrotask = true, scheduleImmediateRootScheduleTask());
  }
  function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
    if (!isFlushingWork && mightHavePendingSyncWork) {
      isFlushingWork = true;
      do {
        var didPerformSomeWork = false;
        for (var root$170 = firstScheduledRoot; null !== root$170; ) {
          if (0 !== syncTransitionLanes) {
            var pendingLanes = root$170.pendingLanes;
            if (0 === pendingLanes) var JSCompiler_inline_result = 0;
            else {
              var suspendedLanes = root$170.suspendedLanes, pingedLanes = root$170.pingedLanes;
              JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
              JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
              JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
            }
            0 !== JSCompiler_inline_result && (didPerformSomeWork = true, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
          } else
            JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(
              root$170,
              root$170 === workInProgressRoot ? JSCompiler_inline_result : 0,
              null !== root$170.cancelPendingCommit || -1 !== root$170.timeoutHandle
            ), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$170, JSCompiler_inline_result) || (didPerformSomeWork = true, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
          root$170 = root$170.next;
        }
      } while (didPerformSomeWork);
      isFlushingWork = false;
    }
  }
  function processRootScheduleInImmediateTask() {
    processRootScheduleInMicrotask();
  }
  function processRootScheduleInMicrotask() {
    mightHavePendingSyncWork = didScheduleMicrotask = false;
    var syncTransitionLanes = 0;
    0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
    for (var currentTime = now(), prev = null, root2 = firstScheduledRoot; null !== root2; ) {
      var next = root2.next, nextLanes = scheduleTaskForRootDuringMicrotask(root2, currentTime);
      if (0 === nextLanes)
        root2.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
      else if (prev = root2, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3))
        mightHavePendingSyncWork = true;
      root2 = next;
    }
    0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes);
    0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
  }
  function scheduleTaskForRootDuringMicrotask(root2, currentTime) {
    for (var suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes, expirationTimes = root2.expirationTimes, lanes = root2.pendingLanes & -62914561; 0 < lanes; ) {
      var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
      if (-1 === expirationTime) {
        if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes))
          expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
      } else expirationTime <= currentTime && (root2.expiredLanes |= lane);
      lanes &= ~lane;
    }
    currentTime = workInProgressRoot;
    suspendedLanes = workInProgressRootRenderLanes;
    suspendedLanes = getNextLanes(
      root2,
      root2 === currentTime ? suspendedLanes : 0,
      null !== root2.cancelPendingCommit || -1 !== root2.timeoutHandle
    );
    pingedLanes = root2.callbackNode;
    if (0 === suspendedLanes || root2 === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root2.cancelPendingCommit)
      return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root2.callbackNode = null, root2.callbackPriority = 0;
    if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root2, suspendedLanes)) {
      currentTime = suspendedLanes & -suspendedLanes;
      if (currentTime === root2.callbackPriority) return currentTime;
      null !== pingedLanes && cancelCallback$1(pingedLanes);
      switch (lanesToEventPriority(suspendedLanes)) {
        case 2:
        case 8:
          suspendedLanes = UserBlockingPriority;
          break;
        case 32:
          suspendedLanes = NormalPriority$1;
          break;
        case 268435456:
          suspendedLanes = IdlePriority;
          break;
        default:
          suspendedLanes = NormalPriority$1;
      }
      pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root2);
      suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
      root2.callbackPriority = currentTime;
      root2.callbackNode = suspendedLanes;
      return currentTime;
    }
    null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
    root2.callbackPriority = 2;
    root2.callbackNode = null;
    return 2;
  }
  function performWorkOnRootViaSchedulerTask(root2, didTimeout) {
    if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus)
      return root2.callbackNode = null, root2.callbackPriority = 0, null;
    var originalCallbackNode = root2.callbackNode;
    if (flushPendingEffects() && root2.callbackNode !== originalCallbackNode)
      return null;
    var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
    workInProgressRootRenderLanes$jscomp$0 = getNextLanes(
      root2,
      root2 === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0,
      null !== root2.cancelPendingCommit || -1 !== root2.timeoutHandle
    );
    if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
    performWorkOnRoot(root2, workInProgressRootRenderLanes$jscomp$0, didTimeout);
    scheduleTaskForRootDuringMicrotask(root2, now());
    return null != root2.callbackNode && root2.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root2) : null;
  }
  function performSyncWorkOnRoot(root2, lanes) {
    if (flushPendingEffects()) return null;
    performWorkOnRoot(root2, lanes, true);
  }
  function scheduleImmediateRootScheduleTask() {
    scheduleMicrotask(function() {
      0 !== (executionContext & 6) ? scheduleCallback$3(
        ImmediatePriority,
        processRootScheduleInImmediateTask
      ) : processRootScheduleInMicrotask();
    });
  }
  function requestTransitionLane() {
    if (0 === currentEventTransitionLane) {
      var actionScopeLane = currentEntangledLane;
      0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
      currentEventTransitionLane = actionScopeLane;
    }
    return currentEventTransitionLane;
  }
  function coerceFormActionProp(actionProp) {
    return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL("" + actionProp);
  }
  function createFormDataWithSubmitter(form, submitter) {
    var temp = submitter.ownerDocument.createElement("input");
    temp.name = submitter.name;
    temp.value = submitter.value;
    form.id && temp.setAttribute("form", form.id);
    submitter.parentNode.insertBefore(temp, submitter);
    form = new FormData(form);
    temp.parentNode.removeChild(temp);
    return form;
  }
  function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
    if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
      var action = coerceFormActionProp(
        (nativeEventTarget[internalPropsKey] || null).action
      ), submitter = nativeEvent.submitter;
      submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
      var event = new SyntheticEvent(
        "action",
        "action",
        null,
        nativeEvent,
        nativeEventTarget
      );
      dispatchQueue.push({
        event,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (nativeEvent.defaultPrevented) {
                if (0 !== currentEventTransitionLane) {
                  var formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget);
                  startHostTransition(
                    maybeTargetInst,
                    {
                      pending: true,
                      data: formData,
                      method: nativeEventTarget.method,
                      action
                    },
                    null,
                    formData
                  );
                }
              } else
                "function" === typeof action && (event.preventDefault(), formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget), startHostTransition(
                  maybeTargetInst,
                  {
                    pending: true,
                    data: formData,
                    method: nativeEventTarget.method,
                    action
                  },
                  action,
                  formData
                ));
            },
            currentTarget: nativeEventTarget
          }
        ]
      });
    }
  }
  for (var i$jscomp$inline_1577 = 0; i$jscomp$inline_1577 < simpleEventPluginEvents.length; i$jscomp$inline_1577++) {
    var eventName$jscomp$inline_1578 = simpleEventPluginEvents[i$jscomp$inline_1577], domEventName$jscomp$inline_1579 = eventName$jscomp$inline_1578.toLowerCase(), capitalizedEvent$jscomp$inline_1580 = eventName$jscomp$inline_1578[0].toUpperCase() + eventName$jscomp$inline_1578.slice(1);
    registerSimpleEvent(
      domEventName$jscomp$inline_1579,
      "on" + capitalizedEvent$jscomp$inline_1580
    );
  }
  registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
  registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
  registerSimpleEvent(ANIMATION_START, "onAnimationStart");
  registerSimpleEvent("dblclick", "onDoubleClick");
  registerSimpleEvent("focusin", "onFocus");
  registerSimpleEvent("focusout", "onBlur");
  registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
  registerSimpleEvent(TRANSITION_START, "onTransitionStart");
  registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
  registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
  registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
  registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
  registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
  registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
  registerTwoPhaseEvent(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  );
  registerTwoPhaseEvent(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  );
  registerTwoPhaseEvent("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]);
  registerTwoPhaseEvent(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  );
  registerTwoPhaseEvent(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  );
  registerTwoPhaseEvent(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), nonDelegatedEvents = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes)
  );
  function processDispatchQueue(dispatchQueue, eventSystemFlags) {
    eventSystemFlags = 0 !== (eventSystemFlags & 4);
    for (var i = 0; i < dispatchQueue.length; i++) {
      var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
      _dispatchQueue$i = _dispatchQueue$i.listeners;
      a: {
        var previousInstance = void 0;
        if (eventSystemFlags)
          for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
            var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
            _dispatchListeners$i = _dispatchListeners$i.listener;
            if (instance !== previousInstance && event.isPropagationStopped())
              break a;
            previousInstance = _dispatchListeners$i;
            event.currentTarget = currentTarget;
            try {
              previousInstance(event);
            } catch (error) {
              reportGlobalError(error);
            }
            event.currentTarget = null;
            previousInstance = instance;
          }
        else
          for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
            _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
            instance = _dispatchListeners$i.instance;
            currentTarget = _dispatchListeners$i.currentTarget;
            _dispatchListeners$i = _dispatchListeners$i.listener;
            if (instance !== previousInstance && event.isPropagationStopped())
              break a;
            previousInstance = _dispatchListeners$i;
            event.currentTarget = currentTarget;
            try {
              previousInstance(event);
            } catch (error) {
              reportGlobalError(error);
            }
            event.currentTarget = null;
            previousInstance = instance;
          }
      }
    }
  }
  function listenToNonDelegatedEvent(domEventName, targetElement) {
    var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
    void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
    var listenerSetKey = domEventName + "__bubble";
    JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, false), JSCompiler_inline_result.add(listenerSetKey));
  }
  function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
    var eventSystemFlags = 0;
    isCapturePhaseListener && (eventSystemFlags |= 4);
    addTrappedEventListener(
      target,
      domEventName,
      eventSystemFlags,
      isCapturePhaseListener
    );
  }
  var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
  function listenToAllSupportedEvents(rootContainerElement) {
    if (!rootContainerElement[listeningMarker]) {
      rootContainerElement[listeningMarker] = true;
      allNativeEvents.forEach(function(domEventName) {
        "selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, false, rootContainerElement), listenToNativeEvent(domEventName, true, rootContainerElement));
      });
      var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
      null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = true, listenToNativeEvent("selectionchange", false, ownerDocument));
    }
  }
  function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
    switch (getEventPriority(domEventName)) {
      case 2:
        var listenerWrapper = dispatchDiscreteEvent;
        break;
      case 8:
        listenerWrapper = dispatchContinuousEvent;
        break;
      default:
        listenerWrapper = dispatchEvent;
    }
    eventSystemFlags = listenerWrapper.bind(
      null,
      domEventName,
      eventSystemFlags,
      targetContainer
    );
    listenerWrapper = void 0;
    !passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = true);
    isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
      capture: true,
      passive: listenerWrapper
    }) : targetContainer.addEventListener(domEventName, eventSystemFlags, true) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
      passive: listenerWrapper
    }) : targetContainer.addEventListener(domEventName, eventSystemFlags, false);
  }
  function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
    var ancestorInst = targetInst$jscomp$0;
    if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0)
      a: for (; ; ) {
        if (null === targetInst$jscomp$0) return;
        var nodeTag = targetInst$jscomp$0.tag;
        if (3 === nodeTag || 4 === nodeTag) {
          var container = targetInst$jscomp$0.stateNode.containerInfo;
          if (container === targetContainer) break;
          if (4 === nodeTag)
            for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag; ) {
              var grandTag = nodeTag.tag;
              if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer)
                return;
              nodeTag = nodeTag.return;
            }
          for (; null !== container; ) {
            nodeTag = getClosestInstanceFromNode(container);
            if (null === nodeTag) return;
            grandTag = nodeTag.tag;
            if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
              targetInst$jscomp$0 = ancestorInst = nodeTag;
              continue a;
            }
            container = container.parentNode;
          }
        }
        targetInst$jscomp$0 = targetInst$jscomp$0.return;
      }
    batchedUpdates$1(function() {
      var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
      a: {
        var reactName = topLevelEventsToReactNames.get(domEventName);
        if (void 0 !== reactName) {
          var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
          switch (domEventName) {
            case "keypress":
              if (0 === getEventCharCode(nativeEvent)) break a;
            case "keydown":
            case "keyup":
              SyntheticEventCtor = SyntheticKeyboardEvent;
              break;
            case "focusin":
              reactEventType = "focus";
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "focusout":
              reactEventType = "blur";
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "beforeblur":
            case "afterblur":
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "click":
              if (2 === nativeEvent.button) break a;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              SyntheticEventCtor = SyntheticMouseEvent;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              SyntheticEventCtor = SyntheticDragEvent;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              SyntheticEventCtor = SyntheticTouchEvent;
              break;
            case ANIMATION_END:
            case ANIMATION_ITERATION:
            case ANIMATION_START:
              SyntheticEventCtor = SyntheticAnimationEvent;
              break;
            case TRANSITION_END:
              SyntheticEventCtor = SyntheticTransitionEvent;
              break;
            case "scroll":
            case "scrollend":
              SyntheticEventCtor = SyntheticUIEvent;
              break;
            case "wheel":
              SyntheticEventCtor = SyntheticWheelEvent;
              break;
            case "copy":
            case "cut":
            case "paste":
              SyntheticEventCtor = SyntheticClipboardEvent;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              SyntheticEventCtor = SyntheticPointerEvent;
              break;
            case "toggle":
            case "beforetoggle":
              SyntheticEventCtor = SyntheticToggleEvent;
          }
          var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
          inCapturePhase = [];
          for (var instance = targetInst, lastHostComponent; null !== instance; ) {
            var _instance = instance;
            lastHostComponent = _instance.stateNode;
            _instance = _instance.tag;
            5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(
              createDispatchListener(instance, _instance, lastHostComponent)
            ));
            if (accumulateTargetOnly) break;
            instance = instance.return;
          }
          0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(
            reactName,
            reactEventType,
            null,
            nativeEvent,
            nativeEventTarget
          ), dispatchQueue.push({ event: reactName, listeners: inCapturePhase }));
        }
      }
      if (0 === (eventSystemFlags & 7)) {
        a: {
          reactName = "mouseover" === domEventName || "pointerover" === domEventName;
          SyntheticEventCtor = "mouseout" === domEventName || "pointerout" === domEventName;
          if (reactName && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey]))
            break a;
          if (SyntheticEventCtor || reactName) {
            reactName = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (reactName = nativeEventTarget.ownerDocument) ? reactName.defaultView || reactName.parentWindow : window;
            if (SyntheticEventCtor) {
              if (reactEventType = nativeEvent.relatedTarget || nativeEvent.toElement, SyntheticEventCtor = targetInst, reactEventType = reactEventType ? getClosestInstanceFromNode(reactEventType) : null, null !== reactEventType && (accumulateTargetOnly = getNearestMountedFiber(reactEventType), inCapturePhase = reactEventType.tag, reactEventType !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase))
                reactEventType = null;
            } else SyntheticEventCtor = null, reactEventType = targetInst;
            if (SyntheticEventCtor !== reactEventType) {
              inCapturePhase = SyntheticMouseEvent;
              _instance = "onMouseLeave";
              reactEventName = "onMouseEnter";
              instance = "mouse";
              if ("pointerout" === domEventName || "pointerover" === domEventName)
                inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
              accumulateTargetOnly = null == SyntheticEventCtor ? reactName : getNodeFromInstance(SyntheticEventCtor);
              lastHostComponent = null == reactEventType ? reactName : getNodeFromInstance(reactEventType);
              reactName = new inCapturePhase(
                _instance,
                instance + "leave",
                SyntheticEventCtor,
                nativeEvent,
                nativeEventTarget
              );
              reactName.target = accumulateTargetOnly;
              reactName.relatedTarget = lastHostComponent;
              _instance = null;
              getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(
                reactEventName,
                instance + "enter",
                reactEventType,
                nativeEvent,
                nativeEventTarget
              ), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
              accumulateTargetOnly = _instance;
              if (SyntheticEventCtor && reactEventType)
                b: {
                  inCapturePhase = getParent;
                  reactEventName = SyntheticEventCtor;
                  instance = reactEventType;
                  lastHostComponent = 0;
                  for (_instance = reactEventName; _instance; _instance = inCapturePhase(_instance))
                    lastHostComponent++;
                  _instance = 0;
                  for (var tempB = instance; tempB; tempB = inCapturePhase(tempB))
                    _instance++;
                  for (; 0 < lastHostComponent - _instance; )
                    reactEventName = inCapturePhase(reactEventName), lastHostComponent--;
                  for (; 0 < _instance - lastHostComponent; )
                    instance = inCapturePhase(instance), _instance--;
                  for (; lastHostComponent--; ) {
                    if (reactEventName === instance || null !== instance && reactEventName === instance.alternate) {
                      inCapturePhase = reactEventName;
                      break b;
                    }
                    reactEventName = inCapturePhase(reactEventName);
                    instance = inCapturePhase(instance);
                  }
                  inCapturePhase = null;
                }
              else inCapturePhase = null;
              null !== SyntheticEventCtor && accumulateEnterLeaveListenersForEvent(
                dispatchQueue,
                reactName,
                SyntheticEventCtor,
                inCapturePhase,
                false
              );
              null !== reactEventType && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(
                dispatchQueue,
                accumulateTargetOnly,
                reactEventType,
                inCapturePhase,
                true
              );
            }
          }
        }
        a: {
          reactName = targetInst ? getNodeFromInstance(targetInst) : window;
          SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
          if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type)
            var getTargetInstFunc = getTargetInstForChangeEvent;
          else if (isTextInputElement(reactName))
            if (isInputEventSupported)
              getTargetInstFunc = getTargetInstForInputOrChangeEvent;
            else {
              getTargetInstFunc = getTargetInstForInputEventPolyfill;
              var handleEventFunc = handleEventsForInputEventPolyfill;
            }
          else
            SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
          if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
            createAndAccumulateChangeEvent(
              dispatchQueue,
              getTargetInstFunc,
              nativeEvent,
              nativeEventTarget
            );
            break a;
          }
          handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
          "focusout" === domEventName && targetInst && "number" === reactName.type && null != targetInst.memoizedProps.value && setDefaultValue(reactName, "number", reactName.value);
        }
        handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
        switch (domEventName) {
          case "focusin":
            if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable)
              activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
            break;
          case "focusout":
            lastSelection = activeElementInst = activeElement = null;
            break;
          case "mousedown":
            mouseDown = true;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            mouseDown = false;
            constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
            break;
          case "selectionchange":
            if (skipSelectionChangeEvent) break;
          case "keydown":
          case "keyup":
            constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
        }
        var fallbackData;
        if (canUseCompositionEvent)
          b: {
            switch (domEventName) {
              case "compositionstart":
                var eventType = "onCompositionStart";
                break b;
              case "compositionend":
                eventType = "onCompositionEnd";
                break b;
              case "compositionupdate":
                eventType = "onCompositionUpdate";
                break b;
            }
            eventType = void 0;
          }
        else
          isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
        eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = "value" in root ? root.value : root.textContent, isComposing = true)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(
          eventType,
          domEventName,
          null,
          nativeEvent,
          nativeEventTarget
        ), dispatchQueue.push({ event: eventType, listeners: handleEventFunc }), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
        if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent))
          eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent(
            "onBeforeInput",
            "beforeinput",
            null,
            nativeEvent,
            nativeEventTarget
          ), dispatchQueue.push({
            event: handleEventFunc,
            listeners: eventType
          }), handleEventFunc.data = fallbackData);
        extractEvents$1(
          dispatchQueue,
          domEventName,
          targetInst,
          nativeEvent,
          nativeEventTarget
        );
      }
      processDispatchQueue(dispatchQueue, eventSystemFlags);
    });
  }
  function createDispatchListener(instance, listener, currentTarget) {
    return {
      instance,
      listener,
      currentTarget
    };
  }
  function accumulateTwoPhaseListeners(targetFiber, reactName) {
    for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber; ) {
      var _instance2 = targetFiber, stateNode = _instance2.stateNode;
      _instance2 = _instance2.tag;
      5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(
        createDispatchListener(targetFiber, _instance2, stateNode)
      ), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(
        createDispatchListener(targetFiber, _instance2, stateNode)
      ));
      if (3 === targetFiber.tag) return listeners;
      targetFiber = targetFiber.return;
    }
    return [];
  }
  function getParent(inst) {
    if (null === inst) return null;
    do
      inst = inst.return;
    while (inst && 5 !== inst.tag && 27 !== inst.tag);
    return inst ? inst : null;
  }
  function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
    for (var registrationName = event._reactName, listeners = []; null !== target && target !== common; ) {
      var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
      _instance3 = _instance3.tag;
      if (null !== alternate && alternate === common) break;
      5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(
        createDispatchListener(target, stateNode, alternate)
      )) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(
        createDispatchListener(target, stateNode, alternate)
      )));
      target = target.return;
    }
    0 !== listeners.length && dispatchQueue.push({ event, listeners });
  }
  var NORMALIZE_NEWLINES_REGEX = /\r\n?/g, NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
  function normalizeMarkupForTextOrAttribute(markup) {
    return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
  }
  function checkForUnmatchedText(serverText, clientText) {
    clientText = normalizeMarkupForTextOrAttribute(clientText);
    return normalizeMarkupForTextOrAttribute(serverText) === clientText ? true : false;
  }
  function setProp(domElement, tag, key, value, props, prevValue) {
    switch (key) {
      case "children":
        "string" === typeof value ? "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && "body" !== tag && setTextContent(domElement, "" + value);
        break;
      case "className":
        setValueForKnownAttribute(domElement, "class", value);
        break;
      case "tabIndex":
        setValueForKnownAttribute(domElement, "tabindex", value);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        setValueForKnownAttribute(domElement, key, value);
        break;
      case "style":
        setValueForStyles(domElement, value, prevValue);
        break;
      case "data":
        if ("object" !== tag) {
          setValueForKnownAttribute(domElement, "data", value);
          break;
        }
      case "src":
      case "href":
        if ("" === value && ("a" !== tag || "href" !== key)) {
          domElement.removeAttribute(key);
          break;
        }
        if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
          domElement.removeAttribute(key);
          break;
        }
        value = sanitizeURL("" + value);
        domElement.setAttribute(key, value);
        break;
      case "action":
      case "formAction":
        if ("function" === typeof value) {
          domElement.setAttribute(
            key,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(
            domElement,
            tag,
            "formEncType",
            props.formEncType,
            props,
            null
          ), setProp(
            domElement,
            tag,
            "formMethod",
            props.formMethod,
            props,
            null
          ), setProp(
            domElement,
            tag,
            "formTarget",
            props.formTarget,
            props,
            null
          )) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
        if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
          domElement.removeAttribute(key);
          break;
        }
        value = sanitizeURL("" + value);
        domElement.setAttribute(key, value);
        break;
      case "onClick":
        null != value && (domElement.onclick = noop$1);
        break;
      case "onScroll":
        null != value && listenToNonDelegatedEvent("scroll", domElement);
        break;
      case "onScrollEnd":
        null != value && listenToNonDelegatedEvent("scrollend", domElement);
        break;
      case "dangerouslySetInnerHTML":
        if (null != value) {
          if ("object" !== typeof value || !("__html" in value))
            throw Error(formatProdErrorMessage(61));
          key = value.__html;
          if (null != key) {
            if (null != props.children) throw Error(formatProdErrorMessage(60));
            domElement.innerHTML = key;
          }
        }
        break;
      case "multiple":
        domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
        break;
      case "muted":
        domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
          domElement.removeAttribute("xlink:href");
          break;
        }
        key = sanitizeURL("" + value);
        domElement.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          key
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "" + value) : domElement.removeAttribute(key);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
        break;
      case "capture":
      case "download":
        true === value ? domElement.setAttribute(key, "") : false !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
        break;
      case "rowSpan":
      case "start":
        null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
        break;
      case "popover":
        listenToNonDelegatedEvent("beforetoggle", domElement);
        listenToNonDelegatedEvent("toggle", domElement);
        setValueForAttribute(domElement, "popover", value);
        break;
      case "xlinkActuate":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          value
        );
        break;
      case "xlinkArcrole":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          value
        );
        break;
      case "xlinkRole":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          value
        );
        break;
      case "xlinkShow":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          value
        );
        break;
      case "xlinkTitle":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          value
        );
        break;
      case "xlinkType":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          value
        );
        break;
      case "xmlBase":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          value
        );
        break;
      case "xmlLang":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          value
        );
        break;
      case "xmlSpace":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          value
        );
        break;
      case "is":
        setValueForAttribute(domElement, "is", value);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1])
          key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
    }
  }
  function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
    switch (key) {
      case "style":
        setValueForStyles(domElement, value, prevValue);
        break;
      case "dangerouslySetInnerHTML":
        if (null != value) {
          if ("object" !== typeof value || !("__html" in value))
            throw Error(formatProdErrorMessage(61));
          key = value.__html;
          if (null != key) {
            if (null != props.children) throw Error(formatProdErrorMessage(60));
            domElement.innerHTML = key;
          }
        }
        break;
      case "children":
        "string" === typeof value ? setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && setTextContent(domElement, "" + value);
        break;
      case "onScroll":
        null != value && listenToNonDelegatedEvent("scroll", domElement);
        break;
      case "onScrollEnd":
        null != value && listenToNonDelegatedEvent("scrollend", domElement);
        break;
      case "onClick":
        null != value && (domElement.onclick = noop$1);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!registrationNameDependencies.hasOwnProperty(key))
          a: {
            if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), tag = key.slice(2, props ? key.length - 7 : void 0), prevValue = domElement[internalPropsKey] || null, prevValue = null != prevValue ? prevValue[key] : null, "function" === typeof prevValue && domElement.removeEventListener(tag, prevValue, props), "function" === typeof value)) {
              "function" !== typeof prevValue && null !== prevValue && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
              domElement.addEventListener(tag, value, props);
              break a;
            }
            key in domElement ? domElement[key] = value : true === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
          }
    }
  }
  function setInitialProperties(domElement, tag, props) {
    switch (tag) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        listenToNonDelegatedEvent("error", domElement);
        listenToNonDelegatedEvent("load", domElement);
        var hasSrc = false, hasSrcSet = false, propKey;
        for (propKey in props)
          if (props.hasOwnProperty(propKey)) {
            var propValue = props[propKey];
            if (null != propValue)
              switch (propKey) {
                case "src":
                  hasSrc = true;
                  break;
                case "srcSet":
                  hasSrcSet = true;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(formatProdErrorMessage(137, tag));
                default:
                  setProp(domElement, tag, propKey, propValue, props, null);
              }
          }
        hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
        hasSrc && setProp(domElement, tag, "src", props.src, props, null);
        return;
      case "input":
        listenToNonDelegatedEvent("invalid", domElement);
        var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
        for (hasSrc in props)
          if (props.hasOwnProperty(hasSrc)) {
            var propValue$184 = props[hasSrc];
            if (null != propValue$184)
              switch (hasSrc) {
                case "name":
                  hasSrcSet = propValue$184;
                  break;
                case "type":
                  propValue = propValue$184;
                  break;
                case "checked":
                  checked = propValue$184;
                  break;
                case "defaultChecked":
                  defaultChecked = propValue$184;
                  break;
                case "value":
                  propKey = propValue$184;
                  break;
                case "defaultValue":
                  defaultValue = propValue$184;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (null != propValue$184)
                    throw Error(formatProdErrorMessage(137, tag));
                  break;
                default:
                  setProp(domElement, tag, hasSrc, propValue$184, props, null);
              }
          }
        initInput(
          domElement,
          propKey,
          defaultValue,
          checked,
          defaultChecked,
          propValue,
          hasSrcSet,
          false
        );
        return;
      case "select":
        listenToNonDelegatedEvent("invalid", domElement);
        hasSrc = propValue = propKey = null;
        for (hasSrcSet in props)
          if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue))
            switch (hasSrcSet) {
              case "value":
                propKey = defaultValue;
                break;
              case "defaultValue":
                propValue = defaultValue;
                break;
              case "multiple":
                hasSrc = defaultValue;
              default:
                setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
            }
        tag = propKey;
        props = propValue;
        domElement.multiple = !!hasSrc;
        null != tag ? updateOptions(domElement, !!hasSrc, tag, false) : null != props && updateOptions(domElement, !!hasSrc, props, true);
        return;
      case "textarea":
        listenToNonDelegatedEvent("invalid", domElement);
        propKey = hasSrcSet = hasSrc = null;
        for (propValue in props)
          if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue))
            switch (propValue) {
              case "value":
                hasSrc = defaultValue;
                break;
              case "defaultValue":
                hasSrcSet = defaultValue;
                break;
              case "children":
                propKey = defaultValue;
                break;
              case "dangerouslySetInnerHTML":
                if (null != defaultValue) throw Error(formatProdErrorMessage(91));
                break;
              default:
                setProp(domElement, tag, propValue, defaultValue, props, null);
            }
        initTextarea(domElement, hasSrc, hasSrcSet, propKey);
        return;
      case "option":
        for (checked in props)
          if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc))
            switch (checked) {
              case "selected":
                domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
                break;
              default:
                setProp(domElement, tag, checked, hasSrc, props, null);
            }
        return;
      case "dialog":
        listenToNonDelegatedEvent("beforetoggle", domElement);
        listenToNonDelegatedEvent("toggle", domElement);
        listenToNonDelegatedEvent("cancel", domElement);
        listenToNonDelegatedEvent("close", domElement);
        break;
      case "iframe":
      case "object":
        listenToNonDelegatedEvent("load", domElement);
        break;
      case "video":
      case "audio":
        for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++)
          listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
        break;
      case "image":
        listenToNonDelegatedEvent("error", domElement);
        listenToNonDelegatedEvent("load", domElement);
        break;
      case "details":
        listenToNonDelegatedEvent("toggle", domElement);
        break;
      case "embed":
      case "source":
      case "link":
        listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (defaultChecked in props)
          if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc))
            switch (defaultChecked) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(137, tag));
              default:
                setProp(domElement, tag, defaultChecked, hasSrc, props, null);
            }
        return;
      default:
        if (isCustomElement(tag)) {
          for (propValue$184 in props)
            props.hasOwnProperty(propValue$184) && (hasSrc = props[propValue$184], void 0 !== hasSrc && setPropOnCustomElement(
              domElement,
              tag,
              propValue$184,
              hasSrc,
              props,
              void 0
            ));
          return;
        }
    }
    for (defaultValue in props)
      props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
  }
  function updateProperties(domElement, tag, lastProps, nextProps) {
    switch (tag) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
        for (propKey in lastProps) {
          var lastProp = lastProps[propKey];
          if (lastProps.hasOwnProperty(propKey) && null != lastProp)
            switch (propKey) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                lastDefaultValue = lastProp;
              default:
                nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
            }
        }
        for (var propKey$201 in nextProps) {
          var propKey = nextProps[propKey$201];
          lastProp = lastProps[propKey$201];
          if (nextProps.hasOwnProperty(propKey$201) && (null != propKey || null != lastProp))
            switch (propKey$201) {
              case "type":
                type = propKey;
                break;
              case "name":
                name = propKey;
                break;
              case "checked":
                checked = propKey;
                break;
              case "defaultChecked":
                defaultChecked = propKey;
                break;
              case "value":
                value = propKey;
                break;
              case "defaultValue":
                defaultValue = propKey;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (null != propKey)
                  throw Error(formatProdErrorMessage(137, tag));
                break;
              default:
                propKey !== lastProp && setProp(
                  domElement,
                  tag,
                  propKey$201,
                  propKey,
                  nextProps,
                  lastProp
                );
            }
        }
        updateInput(
          domElement,
          value,
          defaultValue,
          lastDefaultValue,
          checked,
          defaultChecked,
          type,
          name
        );
        return;
      case "select":
        propKey = value = defaultValue = propKey$201 = null;
        for (type in lastProps)
          if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue)
            switch (type) {
              case "value":
                break;
              case "multiple":
                propKey = lastDefaultValue;
              default:
                nextProps.hasOwnProperty(type) || setProp(
                  domElement,
                  tag,
                  type,
                  null,
                  nextProps,
                  lastDefaultValue
                );
            }
        for (name in nextProps)
          if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue))
            switch (name) {
              case "value":
                propKey$201 = type;
                break;
              case "defaultValue":
                defaultValue = type;
                break;
              case "multiple":
                value = type;
              default:
                type !== lastDefaultValue && setProp(
                  domElement,
                  tag,
                  name,
                  type,
                  nextProps,
                  lastDefaultValue
                );
            }
        tag = defaultValue;
        lastProps = value;
        nextProps = propKey;
        null != propKey$201 ? updateOptions(domElement, !!lastProps, propKey$201, false) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, true) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", false));
        return;
      case "textarea":
        propKey = propKey$201 = null;
        for (defaultValue in lastProps)
          if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue))
            switch (defaultValue) {
              case "value":
                break;
              case "children":
                break;
              default:
                setProp(domElement, tag, defaultValue, null, nextProps, name);
            }
        for (value in nextProps)
          if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type))
            switch (value) {
              case "value":
                propKey$201 = name;
                break;
              case "defaultValue":
                propKey = name;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (null != name) throw Error(formatProdErrorMessage(91));
                break;
              default:
                name !== type && setProp(domElement, tag, value, name, nextProps, type);
            }
        updateTextarea(domElement, propKey$201, propKey);
        return;
      case "option":
        for (var propKey$217 in lastProps)
          if (propKey$201 = lastProps[propKey$217], lastProps.hasOwnProperty(propKey$217) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$217))
            switch (propKey$217) {
              case "selected":
                domElement.selected = false;
                break;
              default:
                setProp(
                  domElement,
                  tag,
                  propKey$217,
                  null,
                  nextProps,
                  propKey$201
                );
            }
        for (lastDefaultValue in nextProps)
          if (propKey$201 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$201 !== propKey && (null != propKey$201 || null != propKey))
            switch (lastDefaultValue) {
              case "selected":
                domElement.selected = propKey$201 && "function" !== typeof propKey$201 && "symbol" !== typeof propKey$201;
                break;
              default:
                setProp(
                  domElement,
                  tag,
                  lastDefaultValue,
                  propKey$201,
                  nextProps,
                  propKey
                );
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var propKey$222 in lastProps)
          propKey$201 = lastProps[propKey$222], lastProps.hasOwnProperty(propKey$222) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$222) && setProp(domElement, tag, propKey$222, null, nextProps, propKey$201);
        for (checked in nextProps)
          if (propKey$201 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$201 !== propKey && (null != propKey$201 || null != propKey))
            switch (checked) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (null != propKey$201)
                  throw Error(formatProdErrorMessage(137, tag));
                break;
              default:
                setProp(
                  domElement,
                  tag,
                  checked,
                  propKey$201,
                  nextProps,
                  propKey
                );
            }
        return;
      default:
        if (isCustomElement(tag)) {
          for (var propKey$227 in lastProps)
            propKey$201 = lastProps[propKey$227], lastProps.hasOwnProperty(propKey$227) && void 0 !== propKey$201 && !nextProps.hasOwnProperty(propKey$227) && setPropOnCustomElement(
              domElement,
              tag,
              propKey$227,
              void 0,
              nextProps,
              propKey$201
            );
          for (defaultChecked in nextProps)
            propKey$201 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$201 === propKey || void 0 === propKey$201 && void 0 === propKey || setPropOnCustomElement(
              domElement,
              tag,
              defaultChecked,
              propKey$201,
              nextProps,
              propKey
            );
          return;
        }
    }
    for (var propKey$232 in lastProps)
      propKey$201 = lastProps[propKey$232], lastProps.hasOwnProperty(propKey$232) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$232) && setProp(domElement, tag, propKey$232, null, nextProps, propKey$201);
    for (lastProp in nextProps)
      propKey$201 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$201 === propKey || null == propKey$201 && null == propKey || setProp(domElement, tag, lastProp, propKey$201, nextProps, propKey);
  }
  function isLikelyStaticResource(initiatorType) {
    switch (initiatorType) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return true;
      default:
        return false;
    }
  }
  function estimateBandwidth() {
    if ("function" === typeof performance.getEntriesByType) {
      for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0; i < resourceEntries.length; i++) {
        var entry = resourceEntries[i], transferSize = entry.transferSize, initiatorType = entry.initiatorType, duration = entry.duration;
        if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
          initiatorType = 0;
          duration = entry.responseEnd;
          for (i += 1; i < resourceEntries.length; i++) {
            var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
            if (overlapStartTime > duration) break;
            var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
            overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
          }
          --i;
          bits += 8 * (transferSize + initiatorType) / (entry.duration / 1e3);
          count++;
          if (10 < count) break;
        }
      }
      if (0 < count) return bits / count / 1e6;
    }
    return navigator.connection && (count = navigator.connection.downlink, "number" === typeof count) ? count : 5;
  }
  var eventsEnabled = null, selectionInformation = null;
  function getOwnerDocumentFromRootContainer(rootContainerElement) {
    return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
  }
  function getOwnHostContext(namespaceURI) {
    switch (namespaceURI) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function getChildHostContextProd(parentNamespace, type) {
    if (0 === parentNamespace)
      switch (type) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
  }
  function shouldSetTextContent(type, props) {
    return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
  }
  var currentPopstateTransitionEvent = null;
  function shouldAttemptEagerTransition() {
    var event = window.event;
    if (event && "popstate" === event.type) {
      if (event === currentPopstateTransitionEvent) return false;
      currentPopstateTransitionEvent = event;
      return true;
    }
    currentPopstateTransitionEvent = null;
    return false;
  }
  var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0, cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0, localPromise = "function" === typeof Promise ? Promise : void 0, scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
    return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
  } : scheduleTimeout;
  function handleErrorInNextTick(error) {
    setTimeout(function() {
      throw error;
    });
  }
  function isSingletonScope(type) {
    return "head" === type;
  }
  function clearHydrationBoundary(parentInstance, hydrationInstance) {
    var node = hydrationInstance, depth = 0;
    do {
      var nextNode = node.nextSibling;
      parentInstance.removeChild(node);
      if (nextNode && 8 === nextNode.nodeType)
        if (node = nextNode.data, "/$" === node || "/&" === node) {
          if (0 === depth) {
            parentInstance.removeChild(nextNode);
            retryIfBlockedOn(hydrationInstance);
            return;
          }
          depth--;
        } else if ("$" === node || "$?" === node || "$~" === node || "$!" === node || "&" === node)
          depth++;
        else if ("html" === node)
          releaseSingletonInstance(parentInstance.ownerDocument.documentElement);
        else if ("head" === node) {
          node = parentInstance.ownerDocument.head;
          releaseSingletonInstance(node);
          for (var node$jscomp$0 = node.firstChild; node$jscomp$0; ) {
            var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
            node$jscomp$0[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node$jscomp$0.rel.toLowerCase() || node.removeChild(node$jscomp$0);
            node$jscomp$0 = nextNode$jscomp$0;
          }
        } else
          "body" === node && releaseSingletonInstance(parentInstance.ownerDocument.body);
      node = nextNode;
    } while (node);
    retryIfBlockedOn(hydrationInstance);
  }
  function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
    var node = suspenseInstance;
    suspenseInstance = 0;
    do {
      var nextNode = node.nextSibling;
      1 === node.nodeType ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", "" === node.getAttribute("style") && node.removeAttribute("style")) : 3 === node.nodeType && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
      if (nextNode && 8 === nextNode.nodeType)
        if (node = nextNode.data, "/$" === node)
          if (0 === suspenseInstance) break;
          else suspenseInstance--;
        else
          "$" !== node && "$?" !== node && "$~" !== node && "$!" !== node || suspenseInstance++;
      node = nextNode;
    } while (node);
  }
  function clearContainerSparingly(container) {
    var nextNode = container.firstChild;
    nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
    for (; nextNode; ) {
      var node = nextNode;
      nextNode = nextNode.nextSibling;
      switch (node.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          clearContainerSparingly(node);
          detachDeletedInstance(node);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if ("stylesheet" === node.rel.toLowerCase()) continue;
      }
      container.removeChild(node);
    }
  }
  function canHydrateInstance(instance, type, props, inRootOrSingleton) {
    for (; 1 === instance.nodeType; ) {
      var anyProps = props;
      if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
        if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type))
          break;
      } else if (!inRootOrSingleton)
        if ("input" === type && "hidden" === instance.type) {
          var name = null == anyProps.name ? null : "" + anyProps.name;
          if ("hidden" === anyProps.type && instance.getAttribute("name") === name)
            return instance;
        } else return instance;
      else if (!instance[internalHoistableMarker])
        switch (type) {
          case "meta":
            if (!instance.hasAttribute("itemprop")) break;
            return instance;
          case "link":
            name = instance.getAttribute("rel");
            if ("stylesheet" === name && instance.hasAttribute("data-precedence"))
              break;
            else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title))
              break;
            return instance;
          case "style":
            if (instance.hasAttribute("data-precedence")) break;
            return instance;
          case "script":
            name = instance.getAttribute("src");
            if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop"))
              break;
            return instance;
          default:
            return instance;
        }
      instance = getNextHydratable(instance.nextSibling);
      if (null === instance) break;
    }
    return null;
  }
  function canHydrateTextInstance(instance, text, inRootOrSingleton) {
    if ("" === text) return null;
    for (; 3 !== instance.nodeType; ) {
      if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
        return null;
      instance = getNextHydratable(instance.nextSibling);
      if (null === instance) return null;
    }
    return instance;
  }
  function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
    for (; 8 !== instance.nodeType; ) {
      if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
        return null;
      instance = getNextHydratable(instance.nextSibling);
      if (null === instance) return null;
    }
    return instance;
  }
  function isSuspenseInstancePending(instance) {
    return "$?" === instance.data || "$~" === instance.data;
  }
  function isSuspenseInstanceFallback(instance) {
    return "$!" === instance.data || "$?" === instance.data && "loading" !== instance.ownerDocument.readyState;
  }
  function registerSuspenseInstanceRetry(instance, callback) {
    var ownerDocument = instance.ownerDocument;
    if ("$~" === instance.data) instance._reactRetry = callback;
    else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState)
      callback();
    else {
      var listener = function() {
        callback();
        ownerDocument.removeEventListener("DOMContentLoaded", listener);
      };
      ownerDocument.addEventListener("DOMContentLoaded", listener);
      instance._reactRetry = listener;
    }
  }
  function getNextHydratable(node) {
    for (; null != node; node = node.nextSibling) {
      var nodeType = node.nodeType;
      if (1 === nodeType || 3 === nodeType) break;
      if (8 === nodeType) {
        nodeType = node.data;
        if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "$~" === nodeType || "&" === nodeType || "F!" === nodeType || "F" === nodeType)
          break;
        if ("/$" === nodeType || "/&" === nodeType) return null;
      }
    }
    return node;
  }
  var previousHydratableOnEnteringScopedSingleton = null;
  function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
    hydrationInstance = hydrationInstance.nextSibling;
    for (var depth = 0; hydrationInstance; ) {
      if (8 === hydrationInstance.nodeType) {
        var data = hydrationInstance.data;
        if ("/$" === data || "/&" === data) {
          if (0 === depth)
            return getNextHydratable(hydrationInstance.nextSibling);
          depth--;
        } else
          "$" !== data && "$!" !== data && "$?" !== data && "$~" !== data && "&" !== data || depth++;
      }
      hydrationInstance = hydrationInstance.nextSibling;
    }
    return null;
  }
  function getParentHydrationBoundary(targetInstance) {
    targetInstance = targetInstance.previousSibling;
    for (var depth = 0; targetInstance; ) {
      if (8 === targetInstance.nodeType) {
        var data = targetInstance.data;
        if ("$" === data || "$!" === data || "$?" === data || "$~" === data || "&" === data) {
          if (0 === depth) return targetInstance;
          depth--;
        } else "/$" !== data && "/&" !== data || depth++;
      }
      targetInstance = targetInstance.previousSibling;
    }
    return null;
  }
  function resolveSingletonInstance(type, props, rootContainerInstance) {
    props = getOwnerDocumentFromRootContainer(rootContainerInstance);
    switch (type) {
      case "html":
        type = props.documentElement;
        if (!type) throw Error(formatProdErrorMessage(452));
        return type;
      case "head":
        type = props.head;
        if (!type) throw Error(formatProdErrorMessage(453));
        return type;
      case "body":
        type = props.body;
        if (!type) throw Error(formatProdErrorMessage(454));
        return type;
      default:
        throw Error(formatProdErrorMessage(451));
    }
  }
  function releaseSingletonInstance(instance) {
    for (var attributes = instance.attributes; attributes.length; )
      instance.removeAttributeNode(attributes[0]);
    detachDeletedInstance(instance);
  }
  var preloadPropsMap = /* @__PURE__ */ new Map(), preconnectsSet = /* @__PURE__ */ new Set();
  function getHoistableRoot(container) {
    return "function" === typeof container.getRootNode ? container.getRootNode() : 9 === container.nodeType ? container : container.ownerDocument;
  }
  var previousDispatcher = ReactDOMSharedInternals.d;
  ReactDOMSharedInternals.d = {
    f: flushSyncWork,
    r: requestFormReset,
    D: prefetchDNS,
    C: preconnect,
    L: preload,
    m: preloadModule,
    X: preinitScript,
    S: preinitStyle,
    M: preinitModuleScript
  };
  function flushSyncWork() {
    var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
    return previousWasRendering || wasRendering;
  }
  function requestFormReset(form) {
    var formInst = getInstanceFromNode(form);
    null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
  }
  var globalDocument = "undefined" === typeof document ? null : document;
  function preconnectAs(rel, href, crossOrigin) {
    var ownerDocument = globalDocument;
    if (ownerDocument && "string" === typeof href && href) {
      var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
      limitedEscapedHref = 'link[rel="' + rel + '"][href="' + limitedEscapedHref + '"]';
      "string" === typeof crossOrigin && (limitedEscapedHref += '[crossorigin="' + crossOrigin + '"]');
      preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = { rel, crossOrigin, href }, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
    }
  }
  function prefetchDNS(href) {
    previousDispatcher.D(href);
    preconnectAs("dns-prefetch", href, null);
  }
  function preconnect(href, crossOrigin) {
    previousDispatcher.C(href, crossOrigin);
    preconnectAs("preconnect", href, crossOrigin);
  }
  function preload(href, as, options2) {
    previousDispatcher.L(href, as, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href && as) {
      var preloadSelector = 'link[rel="preload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"]';
      "image" === as ? options2 && options2.imageSrcSet ? (preloadSelector += '[imagesrcset="' + escapeSelectorAttributeValueInsideDoubleQuotes(
        options2.imageSrcSet
      ) + '"]', "string" === typeof options2.imageSizes && (preloadSelector += '[imagesizes="' + escapeSelectorAttributeValueInsideDoubleQuotes(
        options2.imageSizes
      ) + '"]')) : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]' : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]';
      var key = preloadSelector;
      switch (as) {
        case "style":
          key = getStyleKey(href);
          break;
        case "script":
          key = getScriptKey(href);
      }
      preloadPropsMap.has(key) || (href = assign(
        {
          rel: "preload",
          href: "image" === as && options2 && options2.imageSrcSet ? void 0 : href,
          as
        },
        options2
      ), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key)) || (as = ownerDocument.createElement("link"), setInitialProperties(as, "link", href), markNodeAsHoistable(as), ownerDocument.head.appendChild(as)));
    }
  }
  function preloadModule(href, options2) {
    previousDispatcher.m(href, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href) {
      var as = options2 && "string" === typeof options2.as ? options2.as : "script", preloadSelector = 'link[rel="modulepreload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"][href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]', key = preloadSelector;
      switch (as) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          key = getScriptKey(href);
      }
      if (!preloadPropsMap.has(key) && (href = assign({ rel: "modulepreload", href }, options2), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
        switch (as) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (ownerDocument.querySelector(getScriptSelectorFromKey(key)))
              return;
        }
        as = ownerDocument.createElement("link");
        setInitialProperties(as, "link", href);
        markNodeAsHoistable(as);
        ownerDocument.head.appendChild(as);
      }
    }
  }
  function preinitStyle(href, precedence, options2) {
    previousDispatcher.S(href, precedence, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href) {
      var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
      precedence = precedence || "default";
      var resource = styles.get(key);
      if (!resource) {
        var state = { loading: 0, preload: null };
        if (resource = ownerDocument.querySelector(
          getStylesheetSelectorFromKey(key)
        ))
          state.loading = 5;
        else {
          href = assign(
            { rel: "stylesheet", href, "data-precedence": precedence },
            options2
          );
          (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options2);
          var link = resource = ownerDocument.createElement("link");
          markNodeAsHoistable(link);
          setInitialProperties(link, "link", href);
          link._p = new Promise(function(resolve, reject) {
            link.onload = resolve;
            link.onerror = reject;
          });
          link.addEventListener("load", function() {
            state.loading |= 1;
          });
          link.addEventListener("error", function() {
            state.loading |= 2;
          });
          state.loading |= 4;
          insertStylesheet(resource, precedence, ownerDocument);
        }
        resource = {
          type: "stylesheet",
          instance: resource,
          count: 1,
          state
        };
        styles.set(key, resource);
      }
    }
  }
  function preinitScript(src, options2) {
    previousDispatcher.X(src, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && src) {
      var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
      resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
        type: "script",
        instance: resource,
        count: 1,
        state: null
      }, scripts.set(key, resource));
    }
  }
  function preinitModuleScript(src, options2) {
    previousDispatcher.M(src, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && src) {
      var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
      resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true, type: "module" }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
        type: "script",
        instance: resource,
        count: 1,
        state: null
      }, scripts.set(key, resource));
    }
  }
  function getResource(type, currentProps, pendingProps, currentResource) {
    var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
    if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
    switch (type) {
      case "meta":
      case "title":
        return null;
      case "style":
        return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (currentProps = getStyleKey(pendingProps.href), pendingProps = getResourcesFromRoot(
          JSCompiler_inline_result
        ).hoistableStyles, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
          type = getStyleKey(pendingProps.href);
          var styles$243 = getResourcesFromRoot(
            JSCompiler_inline_result
          ).hoistableStyles, resource$244 = styles$243.get(type);
          resource$244 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$244 = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, styles$243.set(type, resource$244), (styles$243 = JSCompiler_inline_result.querySelector(
            getStylesheetSelectorFromKey(type)
          )) && !styles$243._p && (resource$244.instance = styles$243, resource$244.state.loading = 5), preloadPropsMap.has(type) || (pendingProps = {
            rel: "preload",
            as: "style",
            href: pendingProps.href,
            crossOrigin: pendingProps.crossOrigin,
            integrity: pendingProps.integrity,
            media: pendingProps.media,
            hrefLang: pendingProps.hrefLang,
            referrerPolicy: pendingProps.referrerPolicy
          }, preloadPropsMap.set(type, pendingProps), styles$243 || preloadStylesheet(
            JSCompiler_inline_result,
            type,
            pendingProps,
            resource$244.state
          )));
          if (currentProps && null === currentResource)
            throw Error(formatProdErrorMessage(528, ""));
          return resource$244;
        }
        if (currentProps && null !== currentResource)
          throw Error(formatProdErrorMessage(529, ""));
        return null;
      case "script":
        return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (currentProps = getScriptKey(pendingProps), pendingProps = getResourcesFromRoot(
          JSCompiler_inline_result
        ).hoistableScripts, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(formatProdErrorMessage(444, type));
    }
  }
  function getStyleKey(href) {
    return 'href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"';
  }
  function getStylesheetSelectorFromKey(key) {
    return 'link[rel="stylesheet"][' + key + "]";
  }
  function stylesheetPropsFromRawProps(rawProps) {
    return assign({}, rawProps, {
      "data-precedence": rawProps.precedence,
      precedence: null
    });
  }
  function preloadStylesheet(ownerDocument, key, preloadProps, state) {
    ownerDocument.querySelector('link[rel="preload"][as="style"][' + key + "]") ? state.loading = 1 : (key = ownerDocument.createElement("link"), state.preload = key, key.addEventListener("load", function() {
      return state.loading |= 1;
    }), key.addEventListener("error", function() {
      return state.loading |= 2;
    }), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key));
  }
  function getScriptKey(src) {
    return '[src="' + escapeSelectorAttributeValueInsideDoubleQuotes(src) + '"]';
  }
  function getScriptSelectorFromKey(key) {
    return "script[async]" + key;
  }
  function acquireResource(hoistableRoot, resource, props) {
    resource.count++;
    if (null === resource.instance)
      switch (resource.type) {
        case "style":
          var instance = hoistableRoot.querySelector(
            'style[data-href~="' + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + '"]'
          );
          if (instance)
            return resource.instance = instance, markNodeAsHoistable(instance), instance;
          var styleProps = assign({}, props, {
            "data-href": props.href,
            "data-precedence": props.precedence,
            href: null,
            precedence: null
          });
          instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement(
            "style"
          );
          markNodeAsHoistable(instance);
          setInitialProperties(instance, "style", styleProps);
          insertStylesheet(instance, props.precedence, hoistableRoot);
          return resource.instance = instance;
        case "stylesheet":
          styleProps = getStyleKey(props.href);
          var instance$249 = hoistableRoot.querySelector(
            getStylesheetSelectorFromKey(styleProps)
          );
          if (instance$249)
            return resource.state.loading |= 4, resource.instance = instance$249, markNodeAsHoistable(instance$249), instance$249;
          instance = stylesheetPropsFromRawProps(props);
          (styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
          instance$249 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
          markNodeAsHoistable(instance$249);
          var linkInstance = instance$249;
          linkInstance._p = new Promise(function(resolve, reject) {
            linkInstance.onload = resolve;
            linkInstance.onerror = reject;
          });
          setInitialProperties(instance$249, "link", instance);
          resource.state.loading |= 4;
          insertStylesheet(instance$249, props.precedence, hoistableRoot);
          return resource.instance = instance$249;
        case "script":
          instance$249 = getScriptKey(props.src);
          if (styleProps = hoistableRoot.querySelector(
            getScriptSelectorFromKey(instance$249)
          ))
            return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
          instance = props;
          if (styleProps = preloadPropsMap.get(instance$249))
            instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
          hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
          styleProps = hoistableRoot.createElement("script");
          markNodeAsHoistable(styleProps);
          setInitialProperties(styleProps, "link", instance);
          hoistableRoot.head.appendChild(styleProps);
          return resource.instance = styleProps;
        case "void":
          return null;
        default:
          throw Error(formatProdErrorMessage(443, resource.type));
      }
    else
      "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
    return resource.instance;
  }
  function insertStylesheet(instance, precedence, root2) {
    for (var nodes = root2.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.dataset.precedence === precedence) prior = node;
      else if (prior !== last) break;
    }
    prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root2.nodeType ? root2.head : root2, precedence.insertBefore(instance, precedence.firstChild));
  }
  function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
    null == stylesheetProps.crossOrigin && (stylesheetProps.crossOrigin = preloadProps.crossOrigin);
    null == stylesheetProps.referrerPolicy && (stylesheetProps.referrerPolicy = preloadProps.referrerPolicy);
    null == stylesheetProps.title && (stylesheetProps.title = preloadProps.title);
  }
  function adoptPreloadPropsForScript(scriptProps, preloadProps) {
    null == scriptProps.crossOrigin && (scriptProps.crossOrigin = preloadProps.crossOrigin);
    null == scriptProps.referrerPolicy && (scriptProps.referrerPolicy = preloadProps.referrerPolicy);
    null == scriptProps.integrity && (scriptProps.integrity = preloadProps.integrity);
  }
  var tagCaches = null;
  function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
    if (null === tagCaches) {
      var cache = /* @__PURE__ */ new Map();
      var caches = tagCaches = /* @__PURE__ */ new Map();
      caches.set(ownerDocument, cache);
    } else
      caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
    if (cache.has(type)) return cache;
    cache.set(type, null);
    ownerDocument = ownerDocument.getElementsByTagName(type);
    for (caches = 0; caches < ownerDocument.length; caches++) {
      var node = ownerDocument[caches];
      if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
        var nodeKey = node.getAttribute(keyAttribute) || "";
        nodeKey = type + nodeKey;
        var existing = cache.get(nodeKey);
        existing ? existing.push(node) : cache.set(nodeKey, [node]);
      }
    }
    return cache;
  }
  function mountHoistable(hoistableRoot, type, instance) {
    hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
    hoistableRoot.head.insertBefore(
      instance,
      "title" === type ? hoistableRoot.querySelector("head > title") : null
    );
  }
  function isHostHoistableType(type, props, hostContext) {
    if (1 === hostContext || null != props.itemProp) return false;
    switch (type) {
      case "meta":
      case "title":
        return true;
      case "style":
        if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href)
          break;
        return true;
      case "link":
        if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError)
          break;
        switch (props.rel) {
          case "stylesheet":
            return type = props.disabled, "string" === typeof props.precedence && null == type;
          default:
            return true;
        }
      case "script":
        if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src)
          return true;
    }
    return false;
  }
  function preloadResource(resource) {
    return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? false : true;
  }
  function suspendResource(state, hoistableRoot, resource, props) {
    if ("stylesheet" === resource.type && ("string" !== typeof props.media || false !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
      if (null === resource.instance) {
        var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(
          getStylesheetSelectorFromKey(key)
        );
        if (instance) {
          hoistableRoot = instance._p;
          null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
          resource.state.loading |= 4;
          resource.instance = instance;
          markNodeAsHoistable(instance);
          return;
        }
        instance = hoistableRoot.ownerDocument || hoistableRoot;
        props = stylesheetPropsFromRawProps(props);
        (key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
        instance = instance.createElement("link");
        markNodeAsHoistable(instance);
        var linkInstance = instance;
        linkInstance._p = new Promise(function(resolve, reject) {
          linkInstance.onload = resolve;
          linkInstance.onerror = reject;
        });
        setInitialProperties(instance, "link", props);
        resource.instance = instance;
      }
      null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
      state.stylesheets.set(resource, hoistableRoot);
      (hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
    }
  }
  var estimatedBytesWithinLimit = 0;
  function waitForCommitToBeReady(state, timeoutOffset) {
    state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
    return 0 < state.count || 0 < state.imgCount ? function(commit) {
      var stylesheetTimer = setTimeout(function() {
        state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
        if (state.unsuspend) {
          var unsuspend = state.unsuspend;
          state.unsuspend = null;
          unsuspend();
        }
      }, 6e4 + timeoutOffset);
      0 < state.imgBytes && 0 === estimatedBytesWithinLimit && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
      var imgTimer = setTimeout(
        function() {
          state.waitingForImages = false;
          if (0 === state.count && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
            var unsuspend = state.unsuspend;
            state.unsuspend = null;
            unsuspend();
          }
        },
        (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset
      );
      state.unsuspend = commit;
      return function() {
        state.unsuspend = null;
        clearTimeout(stylesheetTimer);
        clearTimeout(imgTimer);
      };
    } : null;
  }
  function onUnsuspend() {
    this.count--;
    if (0 === this.count && (0 === this.imgCount || !this.waitingForImages)) {
      if (this.stylesheets) insertSuspendedStylesheets(this, this.stylesheets);
      else if (this.unsuspend) {
        var unsuspend = this.unsuspend;
        this.unsuspend = null;
        unsuspend();
      }
    }
  }
  var precedencesByRoot = null;
  function insertSuspendedStylesheets(state, resources) {
    state.stylesheets = null;
    null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
  }
  function insertStylesheetIntoRoot(root2, resource) {
    if (!(resource.state.loading & 4)) {
      var precedences = precedencesByRoot.get(root2);
      if (precedences) var last = precedences.get(null);
      else {
        precedences = /* @__PURE__ */ new Map();
        precedencesByRoot.set(root2, precedences);
        for (var nodes = root2.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media"))
            precedences.set(node.dataset.precedence, node), last = node;
        }
        last && precedences.set(null, last);
      }
      nodes = resource.instance;
      node = nodes.getAttribute("data-precedence");
      i = precedences.get(node) || last;
      i === last && precedences.set(null, nodes);
      precedences.set(node, nodes);
      this.count++;
      last = onUnsuspend.bind(this);
      nodes.addEventListener("load", last);
      nodes.addEventListener("error", last);
      i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root2 = 9 === root2.nodeType ? root2.head : root2, root2.insertBefore(nodes, root2.firstChild));
      resource.state.loading |= 4;
    }
  }
  var HostTransitionContext = {
    $$typeof: REACT_CONTEXT_TYPE,
    Provider: null,
    Consumer: null,
    _currentValue: sharedNotPendingObject,
    _currentValue2: sharedNotPendingObject,
    _threadCount: 0
  };
  function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
    this.tag = 1;
    this.containerInfo = containerInfo;
    this.pingCache = this.current = this.pendingChildren = null;
    this.timeoutHandle = -1;
    this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
    this.callbackPriority = 0;
    this.expirationTimes = createLaneMap(-1);
    this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
    this.entanglements = createLaneMap(0);
    this.hiddenUpdates = createLaneMap(null);
    this.identifierPrefix = identifierPrefix;
    this.onUncaughtError = onUncaughtError;
    this.onCaughtError = onCaughtError;
    this.onRecoverableError = onRecoverableError;
    this.pooledCache = null;
    this.pooledCacheLanes = 0;
    this.formState = formState;
    this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
    containerInfo = new FiberRootNode(
      containerInfo,
      tag,
      hydrate,
      identifierPrefix,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      onDefaultTransitionIndicator,
      formState
    );
    tag = 1;
    true === isStrictMode && (tag |= 24);
    isStrictMode = createFiberImplClass(3, null, null, tag);
    containerInfo.current = isStrictMode;
    isStrictMode.stateNode = containerInfo;
    tag = createCache();
    tag.refCount++;
    containerInfo.pooledCache = tag;
    tag.refCount++;
    isStrictMode.memoizedState = {
      element: initialChildren,
      isDehydrated: hydrate,
      cache: tag
    };
    initializeUpdateQueue(isStrictMode);
    return containerInfo;
  }
  function getContextForSubtree(parentComponent) {
    if (!parentComponent) return emptyContextObject;
    parentComponent = emptyContextObject;
    return parentComponent;
  }
  function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
    parentComponent = getContextForSubtree(parentComponent);
    null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
    container = createUpdate(lane);
    container.payload = { element };
    callback = void 0 === callback ? null : callback;
    null !== callback && (container.callback = callback);
    element = enqueueUpdate(rootFiber, container, lane);
    null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
  }
  function markRetryLaneImpl(fiber, retryLane) {
    fiber = fiber.memoizedState;
    if (null !== fiber && null !== fiber.dehydrated) {
      var a = fiber.retryLane;
      fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
    }
  }
  function markRetryLaneIfNotHydrated(fiber, retryLane) {
    markRetryLaneImpl(fiber, retryLane);
    (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
  }
  function attemptContinuousHydration(fiber) {
    if (13 === fiber.tag || 31 === fiber.tag) {
      var root2 = enqueueConcurrentRenderForLane(fiber, 67108864);
      null !== root2 && scheduleUpdateOnFiber(root2, fiber, 67108864);
      markRetryLaneIfNotHydrated(fiber, 67108864);
    }
  }
  function attemptHydrationAtCurrentPriority(fiber) {
    if (13 === fiber.tag || 31 === fiber.tag) {
      var lane = requestUpdateLane();
      lane = getBumpedLaneForHydrationByLane(lane);
      var root2 = enqueueConcurrentRenderForLane(fiber, lane);
      null !== root2 && scheduleUpdateOnFiber(root2, fiber, lane);
      markRetryLaneIfNotHydrated(fiber, lane);
    }
  }
  var _enabled = true;
  function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    var prevTransition = ReactSharedInternals.T;
    ReactSharedInternals.T = null;
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
    }
  }
  function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    var prevTransition = ReactSharedInternals.T;
    ReactSharedInternals.T = null;
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
    }
  }
  function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    if (_enabled) {
      var blockedOn = findInstanceBlockingEvent(nativeEvent);
      if (null === blockedOn)
        dispatchEventForPluginEventSystem(
          domEventName,
          eventSystemFlags,
          nativeEvent,
          return_targetInst,
          targetContainer
        ), clearIfContinuousEvent(domEventName, nativeEvent);
      else if (queueIfContinuousEvent(
        blockedOn,
        domEventName,
        eventSystemFlags,
        targetContainer,
        nativeEvent
      ))
        nativeEvent.stopPropagation();
      else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
        for (; null !== blockedOn; ) {
          var fiber = getInstanceFromNode(blockedOn);
          if (null !== fiber)
            switch (fiber.tag) {
              case 3:
                fiber = fiber.stateNode;
                if (fiber.current.memoizedState.isDehydrated) {
                  var lanes = getHighestPriorityLanes(fiber.pendingLanes);
                  if (0 !== lanes) {
                    var root2 = fiber;
                    root2.pendingLanes |= 2;
                    for (root2.entangledLanes |= 2; lanes; ) {
                      var lane = 1 << 31 - clz32(lanes);
                      root2.entanglements[1] |= lane;
                      lanes &= ~lane;
                    }
                    ensureRootIsScheduled(fiber);
                    0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0));
                  }
                }
                break;
              case 31:
              case 13:
                root2 = enqueueConcurrentRenderForLane(fiber, 2), null !== root2 && scheduleUpdateOnFiber(root2, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
            }
          fiber = findInstanceBlockingEvent(nativeEvent);
          null === fiber && dispatchEventForPluginEventSystem(
            domEventName,
            eventSystemFlags,
            nativeEvent,
            return_targetInst,
            targetContainer
          );
          if (fiber === blockedOn) break;
          blockedOn = fiber;
        }
        null !== blockedOn && nativeEvent.stopPropagation();
      } else
        dispatchEventForPluginEventSystem(
          domEventName,
          eventSystemFlags,
          nativeEvent,
          null,
          targetContainer
        );
    }
  }
  function findInstanceBlockingEvent(nativeEvent) {
    nativeEvent = getEventTarget(nativeEvent);
    return findInstanceBlockingTarget(nativeEvent);
  }
  var return_targetInst = null;
  function findInstanceBlockingTarget(targetNode) {
    return_targetInst = null;
    targetNode = getClosestInstanceFromNode(targetNode);
    if (null !== targetNode) {
      var nearestMounted = getNearestMountedFiber(targetNode);
      if (null === nearestMounted) targetNode = null;
      else {
        var tag = nearestMounted.tag;
        if (13 === tag) {
          targetNode = getSuspenseInstanceFromFiber(nearestMounted);
          if (null !== targetNode) return targetNode;
          targetNode = null;
        } else if (31 === tag) {
          targetNode = getActivityInstanceFromFiber(nearestMounted);
          if (null !== targetNode) return targetNode;
          targetNode = null;
        } else if (3 === tag) {
          if (nearestMounted.stateNode.current.memoizedState.isDehydrated)
            return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
          targetNode = null;
        } else nearestMounted !== targetNode && (targetNode = null);
      }
    }
    return_targetInst = targetNode;
    return null;
  }
  function getEventPriority(domEventName) {
    switch (domEventName) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (getCurrentPriorityLevel()) {
          case ImmediatePriority:
            return 2;
          case UserBlockingPriority:
            return 8;
          case NormalPriority$1:
          case LowPriority:
            return 32;
          case IdlePriority:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var hasScheduledReplayAttempt = false, queuedFocus = null, queuedDrag = null, queuedMouse = null, queuedPointers = /* @__PURE__ */ new Map(), queuedPointerCaptures = /* @__PURE__ */ new Map(), queuedExplicitHydrationTargets = [], discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function clearIfContinuousEvent(domEventName, nativeEvent) {
    switch (domEventName) {
      case "focusin":
      case "focusout":
        queuedFocus = null;
        break;
      case "dragenter":
      case "dragleave":
        queuedDrag = null;
        break;
      case "mouseover":
      case "mouseout":
        queuedMouse = null;
        break;
      case "pointerover":
      case "pointerout":
        queuedPointers.delete(nativeEvent.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        queuedPointerCaptures.delete(nativeEvent.pointerId);
    }
  }
  function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent)
      return existingQueuedEvent = {
        blockedOn,
        domEventName,
        eventSystemFlags,
        nativeEvent,
        targetContainers: [targetContainer]
      }, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
    existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
    blockedOn = existingQueuedEvent.targetContainers;
    null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
    return existingQueuedEvent;
  }
  function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    switch (domEventName) {
      case "focusin":
        return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedFocus,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        ), true;
      case "dragenter":
        return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedDrag,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        ), true;
      case "mouseover":
        return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedMouse,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        ), true;
      case "pointerover":
        var pointerId = nativeEvent.pointerId;
        queuedPointers.set(
          pointerId,
          accumulateOrCreateContinuousQueuedReplayableEvent(
            queuedPointers.get(pointerId) || null,
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          )
        );
        return true;
      case "gotpointercapture":
        return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(
          pointerId,
          accumulateOrCreateContinuousQueuedReplayableEvent(
            queuedPointerCaptures.get(pointerId) || null,
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          )
        ), true;
    }
    return false;
  }
  function attemptExplicitHydrationTarget(queuedTarget) {
    var targetInst = getClosestInstanceFromNode(queuedTarget.target);
    if (null !== targetInst) {
      var nearestMounted = getNearestMountedFiber(targetInst);
      if (null !== nearestMounted) {
        if (targetInst = nearestMounted.tag, 13 === targetInst) {
          if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
            queuedTarget.blockedOn = targetInst;
            runWithPriority(queuedTarget.priority, function() {
              attemptHydrationAtCurrentPriority(nearestMounted);
            });
            return;
          }
        } else if (31 === targetInst) {
          if (targetInst = getActivityInstanceFromFiber(nearestMounted), null !== targetInst) {
            queuedTarget.blockedOn = targetInst;
            runWithPriority(queuedTarget.priority, function() {
              attemptHydrationAtCurrentPriority(nearestMounted);
            });
            return;
          }
        } else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
          queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
          return;
        }
      }
    }
    queuedTarget.blockedOn = null;
  }
  function attemptReplayContinuousQueuedEvent(queuedEvent) {
    if (null !== queuedEvent.blockedOn) return false;
    for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length; ) {
      var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
      if (null === nextBlockedOn) {
        nextBlockedOn = queuedEvent.nativeEvent;
        var nativeEventClone = new nextBlockedOn.constructor(
          nextBlockedOn.type,
          nextBlockedOn
        );
        currentReplayingEvent = nativeEventClone;
        nextBlockedOn.target.dispatchEvent(nativeEventClone);
        currentReplayingEvent = null;
      } else
        return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, false;
      targetContainers.shift();
    }
    return true;
  }
  function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
    attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
  }
  function replayUnblockedEvents() {
    hasScheduledReplayAttempt = false;
    null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
    null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
    null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
    queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
    queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
  }
  function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
    queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = true, Scheduler.unstable_scheduleCallback(
      Scheduler.unstable_NormalPriority,
      replayUnblockedEvents
    )));
  }
  var lastScheduledReplayQueue = null;
  function scheduleReplayQueueIfNeeded(formReplayingQueue) {
    lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(
      Scheduler.unstable_NormalPriority,
      function() {
        lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
        for (var i = 0; i < formReplayingQueue.length; i += 3) {
          var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
          if ("function" !== typeof submitterOrAction)
            if (null === findInstanceBlockingTarget(submitterOrAction || form))
              continue;
            else break;
          var formInst = getInstanceFromNode(form);
          null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(
            formInst,
            {
              pending: true,
              data: formData,
              method: form.method,
              action: submitterOrAction
            },
            submitterOrAction,
            formData
          ));
        }
      }
    ));
  }
  function retryIfBlockedOn(unblocked) {
    function unblock(queuedEvent) {
      return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
    }
    null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
    null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
    null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
    queuedPointers.forEach(unblock);
    queuedPointerCaptures.forEach(unblock);
    for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
      var queuedTarget = queuedExplicitHydrationTargets[i];
      queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
    }
    for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn); )
      attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
    i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
    if (null != i)
      for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
        var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
        if ("function" === typeof submitterOrAction)
          formProps || scheduleReplayQueueIfNeeded(i);
        else if (formProps) {
          var action = null;
          if (submitterOrAction && submitterOrAction.hasAttribute("formAction"))
            if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null)
              action = formProps.formAction;
            else {
              if (null !== findInstanceBlockingTarget(form)) continue;
            }
          else action = formProps.action;
          "function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
          scheduleReplayQueueIfNeeded(i);
        }
      }
  }
  function defaultOnDefaultTransitionIndicator() {
    function handleNavigate(event) {
      event.canIntercept && "react-transition" === event.info && event.intercept({
        handler: function() {
          return new Promise(function(resolve) {
            return pendingResolve = resolve;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function handleNavigateComplete() {
      null !== pendingResolve && (pendingResolve(), pendingResolve = null);
      isCancelled || setTimeout(startFakeNavigation, 20);
    }
    function startFakeNavigation() {
      if (!isCancelled && !navigation.transition) {
        var currentEntry = navigation.currentEntry;
        currentEntry && null != currentEntry.url && navigation.navigate(currentEntry.url, {
          state: currentEntry.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if ("object" === typeof navigation) {
      var isCancelled = false, pendingResolve = null;
      navigation.addEventListener("navigate", handleNavigate);
      navigation.addEventListener("navigatesuccess", handleNavigateComplete);
      navigation.addEventListener("navigateerror", handleNavigateComplete);
      setTimeout(startFakeNavigation, 100);
      return function() {
        isCancelled = true;
        navigation.removeEventListener("navigate", handleNavigate);
        navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
        navigation.removeEventListener("navigateerror", handleNavigateComplete);
        null !== pendingResolve && (pendingResolve(), pendingResolve = null);
      };
    }
  }
  function ReactDOMRoot(internalRoot) {
    this._internalRoot = internalRoot;
  }
  ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
    var root2 = this._internalRoot;
    if (null === root2) throw Error(formatProdErrorMessage(409));
    var current = root2.current, lane = requestUpdateLane();
    updateContainerImpl(current, lane, children, root2, null, null);
  };
  ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
    var root2 = this._internalRoot;
    if (null !== root2) {
      this._internalRoot = null;
      var container = root2.containerInfo;
      updateContainerImpl(root2.current, 2, null, root2, null, null);
      flushSyncWork$1();
      container[internalContainerInstanceKey] = null;
    }
  };
  function ReactDOMHydrationRoot(internalRoot) {
    this._internalRoot = internalRoot;
  }
  ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
    if (target) {
      var updatePriority = resolveUpdatePriority();
      target = { blockedOn: null, target, priority: updatePriority };
      for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++) ;
      queuedExplicitHydrationTargets.splice(i, 0, target);
      0 === i && attemptExplicitHydrationTarget(target);
    }
  };
  var isomorphicReactPackageVersion$jscomp$inline_1840 = React2.version;
  if ("19.2.0" !== isomorphicReactPackageVersion$jscomp$inline_1840)
    throw Error(
      formatProdErrorMessage(
        527,
        isomorphicReactPackageVersion$jscomp$inline_1840,
        "19.2.0"
      )
    );
  ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
    var fiber = componentOrElement._reactInternals;
    if (void 0 === fiber) {
      if ("function" === typeof componentOrElement.render)
        throw Error(formatProdErrorMessage(188));
      componentOrElement = Object.keys(componentOrElement).join(",");
      throw Error(formatProdErrorMessage(268, componentOrElement));
    }
    componentOrElement = findCurrentFiberUsingSlowPath(fiber);
    componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
    componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
    return componentOrElement;
  };
  var internals$jscomp$inline_2347 = {
    bundleType: 0,
    version: "19.2.0",
    rendererPackageName: "react-dom",
    currentDispatcherRef: ReactSharedInternals,
    reconcilerVersion: "19.2.0"
  };
  if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
    var hook$jscomp$inline_2348 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook$jscomp$inline_2348.isDisabled && hook$jscomp$inline_2348.supportsFiber)
      try {
        rendererID = hook$jscomp$inline_2348.inject(
          internals$jscomp$inline_2347
        ), injectedHook = hook$jscomp$inline_2348;
      } catch (err) {
      }
  }
  reactDomClient_production.createRoot = function(container, options2) {
    if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
    var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
    null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError && (onRecoverableError = options2.onRecoverableError));
    options2 = createFiberRoot(
      container,
      1,
      false,
      null,
      null,
      isStrictMode,
      identifierPrefix,
      null,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      defaultOnDefaultTransitionIndicator
    );
    container[internalContainerInstanceKey] = options2.current;
    listenToAllSupportedEvents(container);
    return new ReactDOMRoot(options2);
  };
  reactDomClient_production.hydrateRoot = function(container, initialChildren, options2) {
    if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
    var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, formState = null;
    null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError && (onRecoverableError = options2.onRecoverableError), void 0 !== options2.formState && (formState = options2.formState));
    initialChildren = createFiberRoot(
      container,
      1,
      true,
      initialChildren,
      null != options2 ? options2 : null,
      isStrictMode,
      identifierPrefix,
      formState,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      defaultOnDefaultTransitionIndicator
    );
    initialChildren.context = getContextForSubtree(null);
    options2 = initialChildren.current;
    isStrictMode = requestUpdateLane();
    isStrictMode = getBumpedLaneForHydrationByLane(isStrictMode);
    identifierPrefix = createUpdate(isStrictMode);
    identifierPrefix.callback = null;
    enqueueUpdate(options2, identifierPrefix, isStrictMode);
    options2 = isStrictMode;
    initialChildren.current.lanes = options2;
    markRootUpdated$1(initialChildren, options2);
    ensureRootIsScheduled(initialChildren);
    container[internalContainerInstanceKey] = initialChildren.current;
    listenToAllSupportedEvents(container);
    return new ReactDOMHydrationRoot(initialChildren);
  };
  reactDomClient_production.version = "19.2.0";
  return reactDomClient_production;
}
var hasRequiredClient;
function requireClient() {
  if (hasRequiredClient) return client.exports;
  hasRequiredClient = 1;
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  {
    checkDCE();
    client.exports = requireReactDomClient_production();
  }
  return client.exports;
}
var clientExports = requireClient();
function createSharedState(initialValue) {
  let state = initialValue;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (next) => {
    const prevState = state;
    if (typeof next === "function") {
      const updater = next;
      state = updater(state);
    } else {
      state = next;
    }
    if (state === prevState) return;
    for (const listener of listeners) {
      listener(state);
    }
  };
  const useSharedState = () => {
    const [localState, setLocalState] = reactExports.useState(state);
    reactExports.useEffect(() => {
      listeners.add(setLocalState);
      setLocalState(state);
      return () => {
        listeners.delete(setLocalState);
      };
    }, []);
    return [localState, setState];
  };
  return useSharedState;
}
const ccw = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_301_13)'%3e%3cpath%20d='M1.21931%202.13826C1.89274%202.13826%202.43862%202.68416%202.43862%203.35757V5.31611C3.165%204.05176%204.17638%202.97141%205.40345%202.15761C6.94433%201.13569%208.73971%200.59552%2010.5955%200.59552C11.8646%200.59552%2013.0964%200.844329%2014.2566%201.33507C15.3766%201.80879%2016.3822%202.48673%2017.2455%203.35002C18.1088%204.21332%2018.7867%205.21896%2019.2605%206.33898C19.7512%207.4992%2020%208.73096%2020%2010C20%2011.2691%2019.7512%2012.5008%2019.2604%2013.661C18.7867%2014.7811%2018.1088%2015.7867%2017.2455%2016.65C16.3822%2017.5133%2015.3765%2018.1912%2014.2565%2018.6649C13.0963%2019.1557%2011.8646%2019.4045%2010.5955%2019.4045C9.51175%2019.4045%208.44882%2019.2214%207.43621%2018.8603C6.45763%2018.5114%205.54814%2018.0045%204.73299%2017.354C3.92588%2016.7098%203.23407%2015.9431%202.67677%2015.0752C2.10908%2014.191%201.69688%2013.226%201.45174%2012.2071C1.29421%2011.5524%201.69719%2010.8939%202.35194%2010.7363C3.00672%2010.5788%203.66515%2010.9819%203.82269%2011.6366C4.18195%2013.1297%205.04546%2014.4833%206.2542%2015.448C6.85805%2015.9299%207.53129%2016.3052%208.25526%2016.5633C9.00427%2016.8304%209.79164%2016.9659%2010.5955%2016.9659C12.4561%2016.9659%2014.2055%2016.2413%2015.5211%2014.9256C16.8368%2013.6099%2017.5614%2011.8606%2017.5614%209.99995C17.5614%208.13933%2016.8368%206.39%2015.5211%205.07433C14.2054%203.75866%2012.4561%203.03407%2010.5955%203.03407C9.22063%203.03407%207.89133%203.43372%206.75126%204.18981C5.76887%204.84137%204.97311%205.72282%204.42863%206.75724H5.77625C6.44968%206.75724%206.99556%207.30314%206.99556%207.97655C6.99556%208.64993%206.44968%209.19586%205.77625%209.19586H1.21931C0.545879%209.19586%201.06012e-07%208.64993%201.06012e-07%207.97655V3.35757C1.06012e-07%202.68416%200.545926%202.13826%201.21931%202.13826Z'%20fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_301_13'%3e%3crect%20width='20'%20height='20'%20fill='white'%20transform='matrix(-1%200%200%201%2020%200)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const cw = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_301_6)'%3e%3cpath%20d='M18.7807%202.13826C18.1073%202.13826%2017.5614%202.68416%2017.5614%203.35757V5.31611C16.835%204.05176%2015.8236%202.97141%2014.5966%202.15761C13.0557%201.13569%2011.2603%200.59552%209.40448%200.59552C8.13537%200.59552%206.90364%200.844329%205.74344%201.33507C4.62339%201.80879%203.6178%202.48673%202.75448%203.35002C1.89121%204.21332%201.21327%205.21896%200.739529%206.33898C0.248832%207.4992%200%208.73096%200%2010C0%2011.2691%200.248832%2012.5008%200.739552%2013.661C1.21327%2014.7811%201.89123%2015.7867%202.75452%2016.65C3.61782%2017.5133%204.62346%2018.1912%205.74346%2018.6649C6.90366%2019.1557%208.1354%2019.4045%209.4045%2019.4045C10.4882%2019.4045%2011.5512%2019.2214%2012.5638%2018.8603C13.5424%2018.5114%2014.4519%2018.0045%2015.267%2017.354C16.0741%2016.7098%2016.7659%2015.9431%2017.3232%2015.0752C17.8909%2014.191%2018.3031%2013.226%2018.5483%2012.2071C18.7058%2011.5524%2018.3028%2010.8939%2017.6481%2010.7363C16.9933%2010.5788%2016.3348%2010.9819%2016.1773%2011.6366C15.818%2013.1297%2014.9545%2014.4833%2013.7458%2015.448C13.142%2015.9299%2012.4687%2016.3052%2011.7447%2016.5633C10.9957%2016.8304%2010.2084%2016.9659%209.4045%2016.9659C7.54386%2016.9659%205.79453%2016.2413%204.47888%2014.9256C3.16321%2013.6099%202.43862%2011.8606%202.43862%209.99995C2.43862%208.13933%203.16319%206.39%204.47888%205.07433C5.79458%203.75866%207.54386%203.03407%209.4045%203.03407C10.7794%203.03407%2012.1087%203.43372%2013.2487%204.18981C14.2311%204.84137%2015.0269%205.72282%2015.5714%206.75724H14.2237C13.5503%206.75724%2013.0044%207.30314%2013.0044%207.97655C13.0044%208.64993%2013.5503%209.19586%2014.2237%209.19586H18.7807C19.4541%209.19586%2020%208.64993%2020%207.97655V3.35757C20%202.68416%2019.4541%202.13826%2018.7807%202.13826Z'%20fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_301_6'%3e%3crect%20width='20'%20height='20'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const cwccw = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M5.453%209.24096C6.08872%209.24096%206.60408%208.72561%206.60408%208.08988C6.60408%207.45416%206.08872%206.93881%205.453%206.93881H4.17772C4.62934%206.08515%205.26881%205.32864%206.04444%204.7442C7.19062%203.8805%208.55757%203.424%209.99747%203.424C10.7563%203.424%2011.4997%203.55184%2012.2067%203.80398C12.8902%204.04768%2013.5258%204.40195%2014.0958%204.85692C15.2369%205.76761%2016.0521%207.04543%2016.3913%208.45505C16.5182%208.98264%2016.9897%209.33712%2017.5095%209.33708C17.5985%209.33708%2017.6892%209.32662%2017.7797%209.30487C18.3977%209.15615%2018.7783%208.53453%2018.6295%207.91646C18.398%206.95455%2018.0089%206.0436%2017.473%205.20886C16.9469%204.38947%2016.2938%203.66568%2015.5319%203.05758C14.7623%202.44341%2013.9038%201.96498%2012.9799%201.63556C12.024%201.29468%2011.0205%201.12183%209.99745%201.12183C9.01765%201.12183%208.05448%201.28065%207.13454%201.59385C6.24507%201.89671%205.41216%202.33804%204.659%202.90558C3.91471%203.46642%203.26565%204.13722%202.72991%204.89937C2.57683%205.11713%202.4344%205.3411%202.30213%205.57039V3.72931C2.30213%203.09358%201.78677%202.57823%201.15105%202.57823C0.515331%202.57823%200%203.09361%200%203.72933V8.08991C0%208.72563%200.515353%209.24098%201.15107%209.24098L5.453%209.24096Z'%20fill='white'/%3e%3cpath%20d='M18.8489%2010.7591H14.5469C13.9112%2010.7591%2013.3959%2011.2745%2013.3959%2011.9102C13.3959%2012.5459%2013.9112%2013.0613%2014.5469%2013.0613H15.8192C15.3052%2014.0378%2014.554%2014.87%2013.6265%2015.485C12.551%2016.1983%2011.2971%2016.5756%2010.0001%2016.5761C9.24206%2016.5758%208.49954%2016.448%207.7932%2016.1961C7.10975%2015.9524%206.47418%2015.5982%205.9041%2015.1432C4.76302%2014.2325%203.94782%2012.9547%203.60866%2011.5451C3.45996%2010.927%202.83838%2010.5465%202.22024%2010.6952C1.60217%2010.8439%201.22168%2011.4656%201.3704%2012.0836C1.60184%2013.0455%201.99095%2013.9565%202.52691%2014.7912C3.05301%2015.6106%203.7061%2016.3344%204.46804%2016.9425C5.23757%2017.5567%206.09617%2018.0351%207.01999%2018.3645C7.97323%2018.7044%208.97368%2018.8772%209.99379%2018.8781C9.99502%2018.8781%209.99618%2018.8782%209.99743%2018.8782C9.99835%2018.8782%209.99925%2018.8782%2010.0002%2018.8782C10.001%2018.8782%2010.0017%2018.8782%2010.0025%2018.8782C10.0034%2018.8782%2010.0044%2018.8782%2010.0053%2018.8782C11.7545%2018.8767%2013.4465%2018.3669%2014.8989%2017.4036C16.0573%2016.6354%2017.0121%2015.6154%2017.6978%2014.4218V16.2708C17.6978%2016.9065%2018.2132%2017.4219%2018.8489%2017.4219C19.4846%2017.4219%2020%2016.9065%2020%2016.2708V11.9102C20%2011.2745%2019.4846%2010.7591%2018.8489%2010.7591Z'%20fill='white'/%3e%3c/svg%3e";
const fwd = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_304_10)'%3e%3cpath%20d='M16.1753%208.37015L16.8962%209.09093L0.909059%209.09093C0.406998%209.09093%20-3.20384e-05%209.49796%20-3.20384e-05%2010C-3.20384e-05%2010.5021%200.406998%2010.9091%200.909059%2010.9091L16.8962%2010.9091L16.1753%2011.63C15.9978%2011.8075%2015.909%2012.0401%2015.909%2012.2728C15.909%2012.5054%2015.9977%2012.7381%2016.1753%2012.9156C16.5303%2013.2706%2017.1059%2013.2706%2017.4609%2012.9156L19.7337%2010.6429C20.0887%2010.2879%2020.0887%209.71227%2019.7337%209.35724L17.4609%207.08451C17.1059%206.72948%2016.5303%206.72948%2016.1753%207.08451C15.8203%207.43948%2015.8203%208.01512%2016.1753%208.37015Z'%20fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_304_10'%3e%3crect%20width='20'%20height='20'%20fill='white'%20transform='matrix(0%201%20-1%200%2020%200)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const rev = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_304_8)'%3e%3cpath%20d='M3.8247%2011.6299L3.10385%2010.9091L19.0909%2010.9091C19.593%2010.9091%2020%2010.502%2020%209.99997C20%209.49791%2019.593%209.09088%2019.0909%209.09088H3.10385L3.8247%208.37004C4.00221%208.19252%204.091%207.95985%204.091%207.72725C4.091%207.49458%204.00227%207.26191%203.8247%207.0844C3.46967%206.72937%202.89409%206.72937%202.53906%207.0844L0.266334%209.35713C-0.0886965%209.7121%20-0.0886965%2010.2877%200.266334%2010.6428L2.53906%2012.9155C2.89409%2013.2705%203.46967%2013.2705%203.8247%2012.9155C4.17973%2012.5605%204.17973%2011.9849%203.8247%2011.6299Z'%20fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_304_8'%3e%3crect%20width='20'%20height='20'%20fill='white'%20transform='matrix(0%20-1%201%200%200%2020)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const fwdrev = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_296_2)'%3e%3cpath%20d='M20%204.96211C20%204.32319%2019.4821%203.80524%2018.8431%203.80524L3.96293%203.80524L4.88155%202.87553C5.10433%202.65007%205.2155%202.35622%205.2155%202.06246C5.2155%201.76408%205.10076%201.46578%204.87173%201.2395C4.41724%200.790433%203.68478%200.794817%203.23571%201.2493L0.334011%204.18602C0.119979%204.40263%206.10352e-05%204.6948%206.10352e-05%204.99911C6.10352e-05%205.0014%206.10352e-05%205.00376%208.30708e-05%205.00603C0.00193407%205.31283%200.125554%205.60637%200.343839%205.82201L3.24109%208.68473C3.69557%209.13379%204.42804%209.12941%204.8771%208.67492C5.32621%208.22041%205.3218%207.48795%204.8673%207.03888L3.93629%206.11896L18.8432%206.11896C19.4821%206.11898%2020%205.60104%2020%204.96211Z'%20fill='white'/%3e%3cpath%20d='M6.10352e-05%2013.0379C6.10352e-05%2013.6768%200.518009%2014.1948%201.15693%2014.1948H16.0638L15.1328%2015.1147C14.6783%2015.5637%2014.6739%2016.2962%2015.123%2016.7507C15.5721%2017.2052%2016.3045%2017.2096%2016.759%2016.7605L19.6562%2013.8978C19.8745%2013.6822%2019.9982%2013.3887%2020%2013.0819C20%2013.0796%2020%2013.0772%2020%2013.0749C20%2012.7706%2019.8801%2012.4784%2019.6661%2012.2618L16.7643%209.32506C16.3153%208.87057%2015.5828%208.86619%2015.1283%209.31525C14.6738%209.76431%2014.6694%2010.4968%2015.1185%2010.9513L16.0371%2011.881H1.15693C0.518009%2011.881%206.10352e-05%2012.399%206.10352e-05%2013.0379Z'%20fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_296_2'%3e%3crect%20width='20'%20height='20'%20fill='white'%20transform='matrix(0%20-1%201%200%200%2020)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const leftswing = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_304_13)'%3e%3cpath%20d='M4.07922%205.1606C4.07856%205.1458%204.07717%205.13101%204.07723%205.11621C4.07723%205.09343%204.07882%205.07091%204.08047%205.04838C4.08113%205.03907%204.08113%205.02969%204.08199%205.02038C4.0841%204.99911%204.08767%204.97824%204.0911%204.95731C4.09289%204.94634%204.09408%204.93538%204.09619%204.92455C4.09976%204.90665%204.10458%204.88921%204.10913%204.87164C4.11263%204.85777%204.11574%204.84377%204.11983%204.82997C4.12406%204.8161%204.12941%204.80262%204.13417%204.78895C4.14018%204.77198%204.14579%204.75487%204.15273%204.73816C4.15695%204.72779%204.16224%204.71795%204.16679%204.70778C4.17558%204.68863%204.1841%204.66941%204.19407%204.65072C4.19869%204.64207%204.20418%204.63394%204.20906%204.62536C4.22003%204.6062%204.23086%204.58698%204.24328%204.56842C4.25279%204.55416%204.26355%204.54081%204.27372%204.52708C4.28257%204.51519%204.29063%204.50297%204.30008%204.49141C4.32101%204.46565%204.34334%204.44108%204.36691%204.41751C4.36705%204.41737%204.36718%204.41718%204.36731%204.41704L8.49411%200.290115C8.88094%20-0.0967864%209.50826%20-0.0967864%209.89516%200.290115C10.2821%200.676951%2010.2821%201.30426%209.89516%201.69116L7.57494%204.01138C11.5239%204.39829%2014.9318%207.32145%2015.7449%2011.4091C16.0577%2012.9821%2015.952%2014.5806%2015.4725%2016.0609C15.4651%2016.0839%2015.4583%2016.1071%2015.4506%2016.13C15.0105%2017.4531%2014.2702%2018.6791%2013.2607%2019.7043C13.2201%2019.7456%2013.1764%2019.7814%2013.131%2019.814C12.9592%2019.9372%2012.7573%2020%2012.5547%2020C12.5233%2020%2012.4919%2019.9985%2012.4607%2019.9955C12.2419%2019.9748%2012.0284%2019.8815%2011.8596%2019.7152C11.4697%2019.3313%2011.4648%2018.7041%2011.8488%2018.3142C12.0868%2018.0725%2012.3051%2017.8161%2012.5043%2017.5482C13.7222%2015.9108%2014.2054%2013.8261%2013.8015%2011.7957C13.1595%208.56828%2010.4545%206.26285%207.3303%205.97892L9.89522%208.54391C10.2821%208.93081%2010.2821%209.55805%209.89522%209.94495C9.70177%2010.1384%209.44822%2010.2352%209.19467%2010.2352C8.94111%2010.2352%208.68756%2010.1385%208.49417%209.94495L4.3722%205.82291C4.37075%205.82146%204.36923%205.81988%204.36777%205.81842L4.36731%205.81803C4.36645%205.81717%204.36579%205.81624%204.36493%205.81539C4.34261%205.793%204.32141%205.76955%204.30133%205.74505C4.29552%205.73804%204.29063%205.73058%204.28508%205.72345C4.27075%205.70502%204.25655%205.68653%204.24354%205.66704C4.23594%205.65568%204.22947%205.64386%204.2224%205.63224C4.21276%205.61639%204.20286%205.6008%204.19407%205.58435C4.18582%205.5689%204.17875%205.55298%204.17142%205.53726C4.16514%205.52392%204.15854%205.51091%204.15286%205.49724C4.1444%205.4769%204.13747%205.45616%204.1304%205.43542C4.12703%205.42551%204.12314%205.41593%204.1201%205.40583C4.11164%205.37802%204.10484%205.34989%204.0989%205.32162C4.0981%205.31799%204.09692%205.31455%204.09619%205.31085C4.09612%205.31059%204.09612%205.31026%204.09606%205.31C4.08965%205.2775%204.08476%205.24481%204.08166%205.21198C4.08001%205.19468%204.08001%205.17764%204.07922%205.1606Z'%20fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_304_13'%3e%3crect%20width='20'%20height='20'%20fill='white'%20transform='matrix(-1%200%200%201%2020%200)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
const rightswing = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_304_6)'%3e%3cpath%20d='M15.9208%205.1606C15.9214%205.1458%2015.9228%205.13101%2015.9228%205.11621C15.9228%205.09343%2015.9212%205.07091%2015.9195%205.04838C15.9189%205.03907%2015.9189%205.02969%2015.918%205.02038C15.9159%204.99911%2015.9123%204.97824%2015.9089%204.95731C15.9071%204.94634%2015.9059%204.93538%2015.9038%204.92455C15.9002%204.90665%2015.8954%204.88921%2015.8909%204.87164C15.8874%204.85777%2015.8843%204.84377%2015.8802%204.82997C15.8759%204.8161%2015.8706%204.80262%2015.8658%204.78895C15.8598%204.77198%2015.8542%204.75487%2015.8473%204.73816C15.843%204.72779%2015.8378%204.71795%2015.8332%204.70778C15.8244%204.68863%2015.8159%204.66941%2015.8059%204.65072C15.8013%204.64207%2015.7958%204.63394%2015.7909%204.62536C15.78%204.6062%2015.7691%204.58698%2015.7567%204.56842C15.7472%204.55416%2015.7364%204.54081%2015.7263%204.52708C15.7174%204.51519%2015.7094%204.50297%2015.6999%204.49141C15.679%204.46565%2015.6567%204.44108%2015.6331%204.41751C15.633%204.41737%2015.6328%204.41718%2015.6327%204.41704L11.5059%200.290115C11.1191%20-0.0967864%2010.4917%20-0.0967864%2010.1048%200.290115C9.71794%200.676951%209.71794%201.30426%2010.1048%201.69116L12.4251%204.01138C8.47607%204.39829%205.06819%207.32145%204.25509%2011.4091C3.94229%2012.9821%204.04796%2014.5806%204.52753%2016.0609C4.53493%2016.0839%204.54173%2016.1071%204.54939%2016.13C4.98946%2017.4531%205.72984%2018.6791%206.7393%2019.7043C6.77985%2019.7456%206.82358%2019.7814%206.86902%2019.814C7.04081%2019.9372%207.24271%2020%207.44534%2020C7.47671%2020%207.50809%2019.9985%207.53933%2019.9955C7.75814%2019.9748%207.9716%2019.8815%208.14042%2019.7152C8.53029%2019.3313%208.53518%2018.7041%208.15125%2018.3142C7.91322%2018.0725%207.69493%2017.8161%207.49567%2017.5482C6.27777%2015.9108%205.79464%2013.8261%206.19851%2011.7957C6.84049%208.56828%209.54549%206.26285%2012.6697%205.97892L10.1048%208.54391C9.71788%208.93081%209.71788%209.55805%2010.1048%209.94495C10.2982%2010.1384%2010.5518%2010.2352%2010.8053%2010.2352C11.0589%2010.2352%2011.3124%2010.1385%2011.5058%209.94495L15.6278%205.82291C15.6293%205.82146%2015.6308%205.81988%2015.6322%205.81842L15.6327%205.81803C15.6335%205.81717%2015.6342%205.81624%2015.6351%205.81539C15.6574%205.793%2015.6786%205.76955%2015.6987%205.74505C15.7045%205.73804%2015.7094%205.73058%2015.7149%205.72345C15.7292%205.70502%2015.7434%205.68653%2015.7565%205.66704C15.7641%205.65568%2015.7705%205.64386%2015.7776%205.63224C15.7872%205.61639%2015.7971%205.6008%2015.8059%205.58435C15.8142%205.5689%2015.8213%205.55298%2015.8286%205.53726C15.8349%205.52392%2015.8415%205.51091%2015.8471%205.49724C15.8556%205.4769%2015.8625%205.45616%2015.8696%205.43542C15.873%205.42551%2015.8769%205.41593%2015.8799%205.40583C15.8884%205.37802%2015.8952%205.34989%2015.9011%205.32162C15.9019%205.31799%2015.9031%205.31455%2015.9038%205.31085C15.9039%205.31059%2015.9039%205.31026%2015.9039%205.31C15.9103%205.2775%2015.9152%205.24481%2015.9183%205.21198C15.92%205.19468%2015.92%205.17764%2015.9208%205.1606Z'%20fill='white'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_304_6'%3e%3crect%20width='20'%20height='20'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";
function createStore(initial) {
  let state = initial;
  const listeners = /* @__PURE__ */ new Set();
  const getState = () => state;
  const setState = (next) => {
    const resolved = typeof next === "function" ? next(state) : next;
    if (Object.is(resolved, state)) return;
    state = resolved;
    for (const l of listeners) l();
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const useStore = () => reactExports.useSyncExternalStore(subscribe, getState, getState);
  const useSelector = (selector, isEqual = Object.is) => {
    const lastRef = reactExports.useRef({ has: false, value: void 0 });
    const getSnap = () => {
      const nextVal = selector(getState());
      if (lastRef.current.has && isEqual(lastRef.current.value, nextVal)) {
        return lastRef.current.value;
      }
      lastRef.current.has = true;
      lastRef.current.value = nextVal;
      return nextVal;
    };
    return reactExports.useSyncExternalStore(subscribe, getSnap, getSnap);
  };
  return { getState, setState, subscribe, useStore, useSelector };
}
function createObjectStore(initial) {
  const store = createStore(initial);
  const merge = (patch) => {
    store.setState((prev) => {
      const p = typeof patch === "function" ? patch(prev) : patch;
      return { ...prev, ...p };
    });
  };
  return { ...store, merge };
}
const FIELD_REAL_DIMENSIONS = { x: -72, y: 72, w: 145.2756, h: 145.2756 };
const FIELD_IMG_DIMENSIONS = { x: 0, y: 0, w: 575, h: 575 };
function vector2Subtract(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}
function calculateHeading(currentPos, desiredPos) {
  const dPos = vector2Subtract(desiredPos, currentPos);
  return toDeg(Math.atan2(dPos.x, dPos.y));
}
function rotatePoint(point, angle) {
  const s = Math.sin(toRad(angle));
  const c = Math.cos(toRad(angle));
  const x = point.x;
  const y = point.y;
  const xr = x * c - y * s;
  const yr = x * s + y * c;
  return { x: xr, y: yr };
}
function normalizeDeg(angle) {
  return (angle % 360 + 360) % 360;
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function toRad(degrees) {
  return degrees * Math.PI / 180;
}
function toDeg(radians) {
  return radians * 180 / Math.PI;
}
function toInch(position, field, img) {
  const sx = field.w / img.w;
  const sy = field.h / img.h;
  const dx = field.x + sx * (position.x - img.x);
  const dy = field.y + sy * (img.y - position.y);
  return { x: dx, y: dy };
}
function toPX(position, field, img) {
  const sx = img.w / field.w;
  const sy = img.h / field.h;
  const dx = img.x + sx * (position.x - field.x);
  const dy = -img.y + sy * (position.y - field.y);
  return { x: dx, y: -dy };
}
function makeId(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
function trimZeros(s) {
  return s.replace(/\.0+$/u, "").replace(/(\.\d*?[1-9])0+$/u, "$1");
}
function interpolatePoses(currentPose, previousPose, percent) {
  const x1 = previousPose.x;
  const x2 = currentPose.x;
  const y1 = previousPose.y;
  const y2 = currentPose.y;
  if (x1 === null || x2 === null || y1 === null || y2 === null) return null;
  if (percent < 0 && percent > 1) return null;
  if (x1 === x2) {
    return { x: x1, y: y1 + (y2 - y1) * percent };
  }
  const x = x1 + (x2 - x1) * percent;
  const slope = (y2 - y1) / (x2 - x1);
  const y = y1 + (x - x1) * slope;
  return { x, y };
}
const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);
function mergeDeep(base, patch) {
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return patch === void 0 ? base : patch;
  }
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const patchValue = patch[key];
    const baseValue = base[key];
    if (isPlainObject(patchValue) && isPlainObject(baseValue)) {
      out[key] = mergeDeep(baseValue, patchValue);
    } else {
      out[key] = patchValue;
    }
  }
  return out;
}
function deepEqual(a, b) {
  const seen = /* @__PURE__ */ new WeakMap();
  const eq = (x, y) => {
    if (Object.is(x, y)) return true;
    if (typeof x !== typeof y) return false;
    if (x == null || y == null) return false;
    const tx = typeof x;
    if (tx !== "object" && tx !== "function") return false;
    const ox = x;
    const oy = y;
    let ys = seen.get(ox);
    if (!ys) {
      ys = /* @__PURE__ */ new WeakSet();
      seen.set(ox, ys);
    } else if (ys.has(oy)) {
      return true;
    }
    ys.add(oy);
    if (x instanceof Date && y instanceof Date) return x.getTime() === y.getTime();
    if (x instanceof RegExp && y instanceof RegExp) return x.toString() === y.toString();
    if (x instanceof Map && y instanceof Map) {
      if (x.size !== y.size) return false;
      for (const [kx, vx] of x) {
        if (!y.has(kx)) return false;
        if (!eq(vx, y.get(kx))) return false;
      }
      return true;
    }
    if (x instanceof Set && y instanceof Set) {
      if (x.size !== y.size) return false;
      const yArr = Array.from(y);
      outer: for (const xv of x) {
        for (let i = 0; i < yArr.length; i++) {
          if (eq(xv, yArr[i])) {
            yArr.splice(i, 1);
            continue outer;
          }
        }
        return false;
      }
      return true;
    }
    if (Array.isArray(x) || Array.isArray(y)) {
      if (!Array.isArray(x) || !Array.isArray(y)) return false;
      if (x.length !== y.length) return false;
      for (let i = 0; i < x.length; i++) {
        if (!eq(x[i], y[i])) return false;
      }
      return true;
    }
    if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false;
    const xKeys = Reflect.ownKeys(x);
    const yKeys = Reflect.ownKeys(y);
    if (xKeys.length !== yKeys.length) return false;
    for (const k of xKeys) {
      if (!yKeys.includes(k)) return false;
    }
    for (const k of xKeys) {
      if (!eq(x[k], y[k])) return false;
    }
    return true;
  };
  return eq(a, b);
}
const saved$5 = localStorage.getItem("appState");
const initialData$5 = saved$5 ? JSON.parse(saved$5) : DEFAULT_FORMAT;
const MAX_UNDO_HISTORY = 50;
const undoHistory = createStore([initialData$5]);
const redoHistory = createStore([]);
function AddToUndoHistory(snapshot) {
  console.log(snapshot);
  const current = undoHistory.getState();
  const previousState = current[current.length - 1] || {};
  const fullState = mergeDeep(previousState, snapshot);
  let newHistory = [...current, fullState];
  while (newHistory.length > MAX_UNDO_HISTORY) {
    newHistory = newHistory.slice(1);
  }
  undoHistory.setState(newHistory);
  redoHistory.setState([]);
}
const createDrivePIDGroup$1 = (format, path, setPath, segmentId, segmentKind, driveConstants, headingConstants) => {
  const onDriveChange = (partial) => updatePathConstants(setPath, segmentId, { drive: partial });
  const onHeadingChange = (partial) => updatePathConstants(setPath, segmentId, { heading: partial });
  const setDefaultDrive = (partial) => {
    updateDefaultConstants(format, segmentKind, { drive: partial });
  };
  const setDefaultHeading = (partial) => {
    updateDefaultConstants(format, segmentKind, { heading: partial });
  };
  const currentDefaults = getDefaultConstants(format, segmentKind);
  return [
    {
      header: "Exit Conditions",
      values: driveConstants,
      fields: [
        { key: "settleError", units: "in", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", units: "ms", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", units: "ms", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", units: "volt", label: "Min Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } }
      ],
      onChange: onDriveChange,
      setDefault: setDefaultDrive,
      defaults: currentDefaults?.drive ?? {}
    },
    {
      header: "Drive Constants",
      values: driveConstants,
      fields: [
        { key: "maxSpeed", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "starti", units: "in", label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
        ...segmentKind === "poseDrive" ? [
          { key: "lead", label: "Lead", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
          { key: "setback", label: "Setback", units: "in", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 1 } }
        ] : []
      ],
      onChange: onDriveChange,
      setDefault: setDefaultDrive,
      defaults: currentDefaults?.drive ?? {}
    },
    {
      header: "Heading Constants",
      values: headingConstants,
      fields: [
        { key: "maxSpeed", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "starti", units: "deg", label: "Starti", input: { bounds: [0, 360], stepSize: 1, roundTo: 2 } }
      ],
      onChange: onHeadingChange,
      setDefault: setDefaultHeading,
      defaults: currentDefaults?.heading ?? {}
    }
  ];
};
const createTurnPIDGroup$1 = (format, setPath, segmentId, segmentKind, turnConstants, isSwing = false) => {
  const slot = isSwing ? "swing" : "turn";
  const onChange = (partial) => updatePathConstants(setPath, segmentId, { [slot]: partial });
  const setDefault = (partial) => {
    updateDefaultConstants(format, segmentKind, { [slot]: partial });
  };
  const currentDefaults = getDefaultConstants(format, segmentKind);
  const specificDefaults = isSwing ? currentDefaults?.swing : currentDefaults?.turn;
  return [
    {
      header: "Exit Conditions",
      values: turnConstants,
      fields: [
        { key: "settleError", label: "Settle Error", units: "deg", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", label: "Settle Time", units: "ms", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", label: "Timeout", units: "ms", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", label: "Min Speed", units: "volt", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } }
      ],
      onChange,
      setDefault,
      defaults: specificDefaults ?? {}
    },
    {
      header: isSwing ? "Swing Constants" : "Turn Constants",
      values: turnConstants,
      fields: [
        { key: "maxSpeed", units: "volt", label: "Max Speed", input: { bounds: [0, 12], stepSize: 1, roundTo: 1 } },
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 3 } },
        { key: "starti", label: "Starti", units: "deg", input: { bounds: [0, 360], stepSize: 1, roundTo: 2 } }
      ],
      onChange,
      setDefault,
      defaults: specificDefaults ?? {}
    }
  ];
};
const getDirectionState = (path, segmentId, field, slot) => {
  const segment = path.segments.find((s) => s.id === segmentId);
  return segment?.constants?.[slot]?.[field] ?? null;
};
const createTurnDirectionGroup = (path, setPath, segmentId, slot) => {
  return {
    imageKeys: [
      { src: cw, key: "clockwise" },
      { src: ccw, key: "counterclockwise" },
      { src: cwccw, key: null }
    ],
    onKeyChange: (key) => {
      updatePathConstants(setPath, segmentId, { [slot]: { turnDirection: key } });
    },
    value: getDirectionState(path, segmentId, "turnDirection", slot)
  };
};
const createDriveDirectionGroup = (path, setPath, segmentId, slot) => {
  return {
    imageKeys: [
      { src: fwd, key: "forward" },
      { src: rev, key: "reverse" },
      { src: fwdrev, key: null }
    ],
    onKeyChange: (key) => {
      updatePathConstants(setPath, segmentId, { [slot]: { driveDirection: key } });
    },
    value: getDirectionState(path, segmentId, "driveDirection", slot)
  };
};
const createSwingDirectionGroup = (path, setPath, segmentId, slot) => {
  return {
    imageKeys: [
      { src: rightswing, key: "right" },
      { src: leftswing, key: "left" }
    ],
    onKeyChange: (key) => {
      updatePathConstants(setPath, segmentId, { [slot]: { swingDirection: key } });
    },
    value: getDirectionState(path, segmentId, "swingDirection", slot)
  };
};
function getMikLibDirectionConfig(path, setPath, segmentId) {
  const s = path.segments.find((c) => c.id === segmentId);
  if (s === void 0) return [];
  switch (s.kind) {
    case "pointDrive":
    case "poseDrive":
      return [
        createDriveDirectionGroup(path, setPath, segmentId, "drive")
      ];
    case "pointTurn":
    case "angleTurn":
      return [
        createTurnDirectionGroup(path, setPath, segmentId, "turn")
      ];
    case "angleSwing":
    case "pointSwing":
      return [
        createSwingDirectionGroup(path, setPath, segmentId, "swing"),
        createTurnDirectionGroup(path, setPath, segmentId, "swing")
      ];
  }
}
function getmikLibConstantsConfig(format, path, setPath, segmentId) {
  const s = path.segments.find((c) => c.id === segmentId);
  if (s === void 0) return [];
  switch (s.kind) {
    case "pointDrive":
    case "poseDrive":
      return createDrivePIDGroup$1(format, path, setPath, segmentId, s.kind, s.constants.drive, s.constants.heading);
    case "pointTurn":
    case "angleTurn":
      return createTurnPIDGroup$1(format, setPath, segmentId, s.kind, s.constants.turn, false);
    case "angleSwing":
    case "pointSwing":
      return createTurnPIDGroup$1(format, setPath, segmentId, s.kind, s.constants.swing, true);
  }
}
const cloneKRev = (c) => ({ ...c });
function createRevConstants(values = {}) {
  return {
    maxSpeed: values.maxSpeed ?? null,
    kCorrection: values.kCorrection ?? null,
    maxError: values.maxError ?? null,
    stopHarshThreshold: values.stopHarshThreshold ?? null,
    stopCoastThreshold: values.stopCoastThreshold ?? null,
    stopCoastPower: values.stopCoastPower ?? null,
    stopTimeout: values.stopTimeout ?? null,
    brakeTime: values.brakeTime ?? null,
    dropEarly: values.dropEarly ?? null,
    lead: values.lead ?? null
  };
}
const kPilon = createRevConstants({
  maxSpeed: 1,
  kCorrection: 2,
  maxError: 0.5,
  stopHarshThreshold: 60,
  stopCoastThreshold: 200,
  stopCoastPower: 0.25,
  brakeTime: 250,
  dropEarly: 0
});
const kTurn = createRevConstants({
  maxSpeed: 0.75,
  stopHarshThreshold: 60,
  stopCoastThreshold: 200,
  stopCoastPower: 0.25,
  brakeTime: 100,
  dropEarly: 0
});
const kLootAt = createRevConstants({
  maxSpeed: 0.75,
  stopHarshThreshold: 60,
  stopCoastThreshold: 200,
  stopCoastPower: 0.25,
  brakeTime: 100,
  dropEarly: 0
});
const kBoomerang = createRevConstants({
  maxSpeed: 0.75,
  kCorrection: 2,
  maxError: 0.5,
  stopHarshThreshold: 60,
  stopCoastThreshold: 200,
  stopCoastPower: 0.25,
  brakeTime: 250,
  dropEarly: 0,
  lead: 0.4
});
const kMikLibSpeed = 12;
function getUnequalPIDConstants(correctPIDConstants, differentPIDConstants) {
  const out = {};
  const a = correctPIDConstants;
  const b = differentPIDConstants;
  if (a.maxSpeed !== b.maxSpeed) out.maxSpeed = b.maxSpeed;
  if (a.minSpeed !== b.minSpeed) out.minSpeed = b.minSpeed;
  if (a.kp !== b.kp) out.kp = b.kp;
  if (a.ki !== b.ki) out.ki = b.ki;
  if (a.kd !== b.kd) out.kd = b.kd;
  if (a.starti !== b.starti) out.starti = b.starti;
  if (a.settleTime !== b.settleTime) out.settleTime = b.settleTime;
  if (a.settleError !== b.settleError) out.settleError = b.settleError;
  if (a.timeout !== b.timeout) out.timeout = b.timeout;
  if (a.lead !== b.lead) out.lead = b.lead;
  if (a.setback !== b.setback) out.setback = b.setback;
  if (a.swingDirection !== b.swingDirection) out.swingDirection = b.swingDirection;
  if (a.turnDirection !== b.turnDirection) out.turnDirection = b.turnDirection;
  if (a.driveDirection !== b.driveDirection) out.driveDirection = b.driveDirection;
  return out;
}
const clonePID = (c) => ({ ...c });
function createPIDConstants(values = {}) {
  return {
    maxSpeed: values.maxSpeed ?? null,
    minSpeed: values.minSpeed ?? null,
    kp: values.kp ?? null,
    ki: values.ki ?? null,
    kd: values.kd ?? null,
    starti: values.starti ?? null,
    settleTime: values.settleTime ?? null,
    settleError: values.settleError ?? null,
    timeout: values.timeout ?? null,
    lead: values.lead ?? null,
    setback: values.setback ?? null,
    swingDirection: values.swingDirection ?? null,
    turnDirection: values.turnDirection ?? null,
    driveDirection: values.driveDirection ?? null
  };
}
const kMikAngleTurn = createPIDConstants({
  maxSpeed: 12,
  minSpeed: 0,
  kp: 0.4,
  ki: 0.03,
  kd: 3,
  starti: 15,
  settleTime: 300,
  settleError: 1,
  timeout: 3e3
});
const kMikPointTurn = createPIDConstants({
  maxSpeed: 12,
  minSpeed: 0,
  kp: 0.4,
  ki: 0.03,
  kd: 3,
  starti: 15,
  settleTime: 300,
  settleError: 1,
  timeout: 3e3
});
const kMikPointDrive = createPIDConstants({
  maxSpeed: 8,
  minSpeed: 0,
  kp: 1.5,
  ki: 0,
  kd: 10,
  starti: 0,
  settleTime: 300,
  settleError: 3,
  timeout: 5e3
});
const kMikPointDriveHeading = createPIDConstants({
  maxSpeed: 10,
  kp: 0.4,
  ki: 0,
  kd: 3,
  starti: 0
});
const kMikBoomerang = createPIDConstants({
  maxSpeed: 8,
  minSpeed: 0,
  kp: 1.5,
  ki: 0,
  kd: 10,
  starti: 0,
  settleTime: 300,
  settleError: 3,
  timeout: 5e3,
  lead: 0.5,
  setback: 1
});
const kMikBoomerangHeading = createPIDConstants({
  maxSpeed: 10,
  kp: 0.4,
  ki: 0,
  kd: 3,
  starti: 0
});
const kMikAngleSwing = createPIDConstants({
  maxSpeed: 12,
  minSpeed: 0,
  kp: 0.3,
  ki: 1e-3,
  kd: 2,
  starti: 15,
  settleError: 1,
  settleTime: 300,
  timeout: 3e3,
  swingDirection: "left"
});
const kMikPointSwing = createPIDConstants({
  maxSpeed: 12,
  minSpeed: 0,
  kp: 0.3,
  ki: 1e-3,
  kd: 2,
  starti: 15,
  settleError: 1,
  settleTime: 300,
  timeout: 3e3,
  swingDirection: "left"
});
const createDrivePIDGroup = (format, setPath, segmentId, segmentKind, driveConstants) => {
  const onDriveChange = (partial) => updatePathConstants(setPath, segmentId, { drive: partial });
  const setDefaultDrive = (partial) => {
    updateDefaultConstants(format, segmentKind, { drive: partial });
  };
  const currentDefaults = getDefaultConstants(format, segmentKind);
  return [
    {
      header: segmentKind === "poseDrive" ? "Boomerang Constants" : "Pilons Constants",
      values: driveConstants,
      fields: [
        { key: "maxSpeed", units: "percent", label: "Max Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
        { key: "kCorrection", label: "kCorrection", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 1 } },
        { key: "maxError", units: "in", label: "Max Error", input: { bounds: [0, 100], stepSize: 0.25, roundTo: 2 } },
        ...segmentKind === "poseDrive" ? [
          { key: "lead", label: "Lead", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } }
        ] : []
      ],
      onChange: onDriveChange,
      setDefault: setDefaultDrive,
      defaults: currentDefaults?.drive ?? {}
    },
    {
      header: "Stop Constants",
      values: driveConstants,
      fields: [
        { key: "stopCoastPower", units: "percent", label: "Coast Power", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
        { key: "stopCoastThreshold", units: "ms", label: "Coast Thresh", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "stopHarshThreshold", units: "ms", label: "Harsh Thresh", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "brakeTime", units: "ms", label: "Brake Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "dropEarly", units: "in", label: "Drop Early", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 1 } }
      ],
      onChange: onDriveChange,
      setDefault: setDefaultDrive,
      defaults: currentDefaults?.drive ?? {}
    }
  ];
};
const createTurnPIDGroup = (format, setPath, segmentId, segmentKind, turnConstants) => {
  const onChange = (partial) => updatePathConstants(setPath, segmentId, { turn: partial });
  const setDefault = (partial) => {
    updateDefaultConstants(format, segmentKind, { turn: partial });
  };
  const currentDefaults = getDefaultConstants(format, segmentKind);
  return [
    {
      header: segmentKind === "angleTurn" ? "Turn Constants" : "Look At Constants",
      values: turnConstants,
      fields: [
        { key: "maxSpeed", units: "percent", label: "Max Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
        { key: "stopCoastPower", units: "percent", label: "Coast Power", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
        { key: "stopCoastThreshold", label: "kCoast", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "stopHarshThreshold", label: "kHarsh", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "brakeTime", units: "ms", label: "Brake Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        ...segmentKind === "pointTurn" ? [
          { key: "dropEarly", units: "deg", label: "Drop Early", input: { bounds: [0, 9999], stepSize: 5, roundTo: 1 } }
        ] : []
      ],
      onChange,
      setDefault,
      defaults: currentDefaults?.turn ?? {}
    }
  ];
};
function getRevConstantsConfig(format, path, setPath, segmentId) {
  const s = path.segments.find((c) => c.id === segmentId);
  if (s === void 0) return [];
  switch (s.kind) {
    case "pointDrive":
    case "poseDrive":
      return createDrivePIDGroup(format, setPath, segmentId, s.kind, s.constants.drive);
    case "pointTurn":
    case "angleTurn":
      return createTurnPIDGroup(format, setPath, segmentId, s.kind, s.constants.turn);
    case "angleSwing":
    case "pointSwing":
      return createTurnPIDGroup(format, setPath, segmentId, s.kind, s.constants.turn);
  }
}
const INITIAL_DEFAULTS = {
  mikLib: {
    pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
    poseDrive: { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
    pointTurn: { turn: clonePID(kMikPointTurn) },
    angleTurn: { turn: clonePID(kMikAngleTurn) },
    angleSwing: { swing: clonePID(kMikAngleSwing) },
    pointSwing: { swing: clonePID(kMikPointSwing) }
  },
  ReveilLib: {
    pointDrive: { drive: cloneKRev(kPilon) },
    poseDrive: { drive: cloneKRev(kBoomerang) },
    pointTurn: { turn: cloneKRev(kLootAt) },
    angleTurn: { turn: cloneKRev(kTurn) },
    angleSwing: { turn: cloneKRev(kTurn) },
    pointSwing: { turn: cloneKRev(kTurn) }
  },
  "JAR-Template": {
    pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
    poseDrive: { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
    pointTurn: { turn: clonePID(kMikPointTurn) },
    angleTurn: { turn: clonePID(kMikAngleTurn) },
    angleSwing: { swing: clonePID(kMikAngleSwing) },
    pointSwing: { swing: clonePID(kMikPointSwing) }
  },
  LemLib: {
    pointDrive: { drive: clonePID(kMikPointDrive), heading: clonePID(kMikPointDriveHeading) },
    poseDrive: { drive: clonePID(kMikBoomerang), heading: clonePID(kMikBoomerangHeading) },
    pointTurn: { turn: clonePID(kMikPointTurn) },
    angleTurn: { turn: clonePID(kMikAngleTurn) },
    angleSwing: { swing: clonePID(kMikAngleSwing) },
    pointSwing: { swing: clonePID(kMikPointSwing) }
  }
};
const globalDefaultsStore = createObjectStore(INITIAL_DEFAULTS);
function updateDefaultConstants(format, kind, patch) {
  globalDefaultsStore.setState((prev) => {
    const currentFormatDefaults = prev[format];
    const currentSegmentDefaults = currentFormatDefaults[kind];
    const mergedSegment = { ...currentSegmentDefaults };
    const keys = Object.keys(patch);
    for (const key of keys) {
      const patchValue = patch[key];
      const existingValue = mergedSegment[key];
      if (typeof patchValue === "object" && patchValue !== null && typeof existingValue === "object" && existingValue !== null) {
        mergedSegment[key] = { ...existingValue, ...patchValue };
      } else {
        mergedSegment[key] = patchValue;
      }
    }
    return {
      ...prev,
      [format]: {
        ...prev[format],
        [kind]: mergedSegment
      }
    };
  });
}
function updatePathConstants(setPath, segmentId, partial) {
  setPath((prev) => ({
    ...prev,
    segments: prev.segments.map((s) => {
      if (s.id !== segmentId) return s;
      const key = Object.keys(partial)[0];
      if (key && typeof partial[key] === "object" && !Array.isArray(partial[key])) {
        return {
          ...s,
          constants: {
            ...s.constants,
            [key]: {
              ...s.constants[key],
              ...partial[key]
            }
          }
        };
      }
      return {
        ...s,
        constants: {
          ...s.constants,
          ...partial
        }
      };
    })
  }));
}
function getDefaultConstants(format, kind) {
  const state = globalDefaultsStore.getState();
  const constant = state[format][kind];
  if (!constant) return constant;
  const deepClone = (obj) => {
    if ("drive" in obj && "heading" in obj) {
      return { drive: clonePID(obj.drive), heading: clonePID(obj.heading) };
    }
    if ("turn" in obj) {
      return { turn: clonePID(obj.turn) };
    }
    if ("swing" in obj) {
      return { swing: clonePID(obj.swing) };
    }
    return { ...obj };
  };
  return deepClone(constant);
}
function getFormatConstantsConfig(format, path, setPath, segmentId) {
  switch (format) {
    case "mikLib":
      return getmikLibConstantsConfig(format, path, setPath, segmentId);
    case "ReveilLib":
      return getRevConstantsConfig(format, path, setPath, segmentId);
  }
  return [];
}
function getFormatDirectionConfig(format, path, setPath, segmentId) {
  switch (format) {
    case "mikLib":
      return getMikLibDirectionConfig(path, setPath, segmentId);
  }
  return [];
}
function getFormatPathName(format) {
  switch (format) {
    case "mikLib":
      return "mikLib Path";
    case "ReveilLib":
      return "ReveilLib Path";
    case "JAR-Template":
      return "JAR-Template Path";
    case "LemLib":
      return "LemLib Path";
  }
}
function getFormatSpeed(format) {
  switch (format) {
    case "mikLib":
      return 12;
    case "ReveilLib":
      return 1;
    case "JAR-Template":
      return 12;
    case "LemLib":
      return 127;
  }
}
const defaultRobotConstants = {
  width: 14,
  height: 14,
  speed: 6,
  accel: 15
};
const robotConstantsStore = createObjectStore(defaultRobotConstants);
class Robot {
  width;
  height;
  maxSpeed;
  trackWidth;
  x = 0;
  y = 0;
  angle = 0;
  vL = 0;
  vR = 0;
  maxAccel;
  maxDecel;
  constructor(startX, startY, startAngle, width, height, maxSpeed, trackWidth, maxAccel, maxDecel) {
    this.x = startX;
    this.y = startY;
    this.angle = startAngle;
    this.width = width;
    this.height = height;
    this.maxSpeed = maxSpeed;
    this.trackWidth = trackWidth;
    this.maxAccel = maxAccel;
    this.maxDecel = maxDecel;
  }
  setX(x) {
    this.x = x;
  }
  setY(y) {
    this.y = y;
  }
  setAngle(angle) {
    this.angle = normalizeDeg(angle);
  }
  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }
  getAngle() {
    return this.angle;
  }
  // Returns Velocity in in/s
  getXVelocity() {
    const vL_in = this.vL * 12;
    const vR_in = this.vR * 12;
    const v_in = (vR_in + vL_in) / 2;
    const θ = toRad(this.getAngle());
    const forwardX = Math.sin(θ);
    return v_in * forwardX;
  }
  // Returns Velocity in in/s
  getYVelocity() {
    const vL_in = this.vL * 12;
    const vR_in = this.vR * 12;
    const v_in = (vR_in + vL_in) / 2;
    const θ = toRad(this.getAngle());
    const forwardY = Math.cos(θ);
    return v_in * forwardY;
  }
  moveTowards(current, target, dt) {
    const diff = target - current;
    const signFlip = current !== 0 && target !== 0 && Math.sign(current) !== Math.sign(target);
    const isAccel = !signFlip && Math.abs(target) > Math.abs(current);
    const maxDelta = (isAccel ? this.maxAccel : this.maxDecel) * dt;
    if (Math.abs(diff) <= maxDelta) return target;
    return current + Math.sign(diff) * maxDelta;
  }
  // Returns angular velocity in degrees per second
  getAngularVelocity() {
    const vL_in = this.vL * 12;
    const vR_in = this.vR * 12;
    const b_in = this.trackWidth;
    if (b_in === 0) return 0;
    const omegaRad = (vR_in - vL_in) / b_in;
    return toDeg(omegaRad);
  }
  tankDrive(leftCmd, rightCmd, dt) {
    const b_in = this.trackWidth;
    const v_max_ft = this.maxSpeed;
    const left = clamp(leftCmd, -1, 1);
    const right = clamp(rightCmd, -1, 1);
    const targetVL_ft = left * v_max_ft;
    const targetVR_ft = right * v_max_ft;
    this.vL = this.moveTowards(this.vL, targetVL_ft, dt);
    this.vR = this.moveTowards(this.vR, targetVR_ft, dt);
    const vL_in = this.vL * 12;
    const vR_in = this.vR * 12;
    const v_in = (vR_in + vL_in) / 2;
    const ω = (vL_in - vR_in) / b_in;
    const θdeg = this.getAngle();
    const θ = toRad(θdeg);
    const forwardX = Math.sin(θ);
    const forwardY = Math.cos(θ);
    const xNew = this.getX() + v_in * forwardX * dt;
    const yNew = this.getY() + v_in * forwardY * dt;
    const θNew = θ + ω * dt;
    let θdegNew = toDeg(θNew);
    θdegNew = normalizeDeg(θdegNew);
    this.setX(xNew);
    this.setY(yNew);
    this.setAngle(θdegNew);
  }
  stop() {
    this.vL = 0;
    this.vR = 0;
  }
  setPose(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    return true;
  }
}
const DEFAULT_FORMAT = {
  format: "mikLib",
  field: "v5-match",
  defaults: INITIAL_DEFAULTS["mikLib"],
  path: { segments: [], name: "" },
  robot: defaultRobotConstants,
  commands: []
};
const saved$4 = localStorage.getItem("appState");
const initialData$4 = saved$4 ? JSON.parse(saved$4) : DEFAULT_FORMAT;
const useFileFormat = createSharedState(initialData$4);
const saved$3 = localStorage.getItem("appState");
const initialData$3 = saved$3 ? JSON.parse(saved$3) : DEFAULT_FORMAT;
const usePath = createSharedState(initialData$3.path);
const eyeOpen = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='white'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M12%205C8.24261%205%205.43602%207.4404%203.76737%209.43934C2.51521%2010.9394%202.51521%2013.0606%203.76737%2014.5607C5.43602%2016.5596%208.24261%2019%2012%2019C15.7574%2019%2018.564%2016.5596%2020.2326%2014.5607C21.4848%2013.0606%2021.4848%2010.9394%2020.2326%209.43934C18.564%207.4404%2015.7574%205%2012%205Z'%20stroke='%23ffffffff'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='M12%2015C13.6569%2015%2015%2013.6569%2015%2012C15%2010.3431%2013.6569%209%2012%209C10.3431%209%209%2010.3431%209%2012C9%2013.6569%2010.3431%2015%2012%2015Z'%20stroke='%233C3B3B'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e";
const eyeClosed = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M9.76404%205.29519C10.4664%205.10724%2011.2123%205%2012%205C15.7574%205%2018.564%207.4404%2020.2326%209.43934C21.4848%2010.9394%2021.4846%2013.0609%2020.2324%2014.5609C20.0406%2014.7907%2019.8337%2015.0264%2019.612%2015.2635M12.5%209.04148C13.7563%209.25224%2014.7478%2010.2437%2014.9585%2011.5M3%203L21%2021M11.5%2014.9585C10.4158%2014.7766%209.52884%2014.0132%209.17072%2013M4.34914%208.77822C4.14213%209.00124%203.94821%209.22274%203.76762%209.43907C2.51542%2010.9391%202.51523%2013.0606%203.76739%2014.5607C5.43604%2016.5596%208.24263%2019%2012%2019C12.8021%2019%2013.5608%2018.8888%2014.2744%2018.6944'%20stroke='%23ffffffff'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e";
const lockClose = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M13%2015C13%2015.5523%2012.5523%2016%2012%2016C11.4477%2016%2011%2015.5523%2011%2015C11%2014.4477%2011.4477%2014%2012%2014C12.5523%2014%2013%2014.4477%2013%2015Z'%20stroke='%23FFFFFF'%20stroke-width='2'/%3e%3cpath%20d='M15%209C16.8856%209%2017.8284%209%2018.4142%209.58579C19%2010.1716%2019%2011.1144%2019%2013L19%2015L19%2017C19%2018.8856%2019%2019.8284%2018.4142%2020.4142C17.8284%2021%2016.8856%2021%2015%2021L12%2021L9%2021C7.11438%2021%206.17157%2021%205.58579%2020.4142C5%2019.8284%205%2018.8856%205%2017L5%2015L5%2013C5%2011.1144%205%2010.1716%205.58579%209.58579C6.17157%209%207.11438%209%209%209L12%209L15%209Z'%20stroke='%23FFFFFF'%20stroke-width='2'%20stroke-linejoin='round'/%3e%3cpath%20d='M9%209V5C9%203.89543%209.89543%203%2011%203H13C14.1046%203%2015%203.89543%2015%205V9'%20stroke='%23FFFFFF'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e";
const lockOpen = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M13%2015C13%2015.5523%2012.5523%2016%2012%2016C11.4477%2016%2011%2015.5523%2011%2015C11%2014.4477%2011.4477%2014%2012%2014C12.5523%2014%2013%2014.4477%2013%2015Z'%20stroke='%23FFFFFF'%20stroke-width='2'/%3e%3cpath%20d='M15%209C16.8856%209%2017.8284%209%2018.4142%209.58579C19%2010.1716%2019%2011.1144%2019%2013L19%2015L19%2017C19%2018.8856%2019%2019.8284%2018.4142%2020.4142C17.8284%2021%2016.8856%2021%2015%2021L12%2021L9%2021C7.11438%2021%206.17157%2021%205.58579%2020.4142C5%2019.8284%205%2018.8856%205%2017L5%2015L5%2013C5%2011.1144%205%2010.1716%205.58579%209.58579C6.17157%209%207.11438%209%209%209L12%209L15%209Z'%20stroke='%23FFFFFF'%20stroke-width='2'%20stroke-linejoin='round'/%3e%3cpath%20d='M9%209V5C9%203.89543%209.89543%203%2011%203H13.0625C14.1326%203%2015%203.86745%2015%204.9375V4.9375V5'%20stroke='%23FFFFFF'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e";
const downArrow = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='100px'%20height='100px'%20viewBox='5%2010%2014%205'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M6%2010L12%2015L18%2010'%20stroke='%23FFFFFF'%20stroke-width='2.5'/%3e%3c/svg%3e";
function Slider({
  sliderWidth,
  sliderHeight,
  sliderColor = "--color-lightgray",
  knobWidth,
  knobHeight,
  knobColor = "--color-verylightgray",
  value,
  setValue,
  onChangeStart,
  OnChangeEnd
}) {
  const trackRef = reactExports.useRef(null);
  const handleMove = (clientX) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    let newValue = (clientX - rect.left) / rect.width * 100;
    newValue = clamp(newValue, 0, 100);
    setValue?.(newValue);
  };
  const startDrag = (evt) => {
    onChangeStart?.();
    evt.preventDefault();
    const move = (evt2) => {
      handleMove(evt2.clientX);
    };
    const stop2 = () => {
      OnChangeEnd?.(value);
      window.removeEventListener("mouseup", stop2);
      window.removeEventListener("mousemove", move);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop2);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "rounded-sm relative bg-amber-50",
      style: {
        backgroundColor: `var(${sliderColor})`,
        width: `${sliderWidth}px`,
        height: `${sliderHeight}px`
      },
      ref: trackRef,
      onMouseDown: startDrag,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute top-[50%] rounded-full cursor-grab",
          style: {
            backgroundColor: `var(${knobColor})`,
            width: `${knobWidth}px`,
            height: `${knobHeight}px`,
            left: `${value}%`,
            transform: "translate(-50%, -50%)"
          }
        }
      )
    }
  );
}
const saved$2 = localStorage.getItem("appState");
const initialData$2 = saved$2 ? JSON.parse(saved$2) : DEFAULT_FORMAT;
const useCommand = createSharedState(initialData$2.commands);
function createCommand(name, percent = 0) {
  return {
    name,
    percent,
    id: makeId(10)
  };
}
function createDropDownItem(name) {
  return {
    name,
    id: makeId(10)
  };
}
function Dropdown({
  height,
  width,
  defaultText,
  noneText,
  items,
  setSelectedItem
}) {
  const [isOpen, setOpen] = reactExports.useState(false);
  const [selectedId, setSelectedId] = reactExports.useState("");
  const menuRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  reactExports.useEffect(() => {
    handleSelectedItem(selectedId, isOpen);
  }, [items]);
  const handleToggleMenu = () => {
    setOpen((prev) => !prev);
  };
  const handleSelectedItem = (id, open) => {
    setSelectedId(id);
    const command = items.find((c) => c.id === id);
    setOpen(open);
    if (!command) {
      setSelectedItem(createDropDownItem(""));
      return;
    }
    setSelectedItem(command);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: menuRef, className: `relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: handleToggleMenu,
        className: `
                    ${isOpen ? "bg-medgray_hover" : "bg-medlightgray"}
                    flex
                    justify-between
                    pl-2
                    pr-2
                    hover:bg-medgray_hover
                    items-center
                    rounded-sm 
                    cursor-pointer
                `,
        style: {
          width: `${width}px`,
          height: `${height}px`
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-left", children: items.find((c) => c.id === selectedId) === void 0 ? defaultText : items.find((c) => c.id === selectedId)?.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              className: `rotate-${isOpen ? 180 : 0} w-[10px] h-[10px]`,
              style: {
                width: `${height / 2.5}px`,
                height: `${height / 2.5}px`
              },
              src: downArrow
            }
          )
        ]
      }
    ),
    isOpen && items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute z-50 shadow-xs mt-1 shadow-black left-0 top-full\r\n                    rounded-sm bg-medgray_hover min-h-2",
        style: { width: `${width}px` },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col mt-2 pl-2 pr-2 mb-2 gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col max-h-40 overflow-y-auto", children: [
          items.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleSelectedItem(c.id, true),
              className: "flex hover:bg-blackgrayhover pl-2 rounded-sm cursor-pointer",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: c.name })
            },
            c.id
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleSelectedItem("", false),
              className: "flex hover:bg-blackgrayhover mt-1 pl-2 rounded-sm cursor-pointer text-lightgray",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: noneText })
            }
          )
        ] }) })
      }
    )
  ] });
}
function CommandList({
  setCommand
}) {
  const [value, setValue] = reactExports.useState(0);
  const [commands] = useCommand();
  const [item, setItem] = reactExports.useState({ name: "", id: makeId(10) });
  reactExports.useEffect(() => {
    if (item.name === "") return;
    setCommand((prev) => ({
      ...prev,
      percent: item.name === "" ? 0 : value,
      name: item.name
    }));
  }, [item, value, commands.length]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dropdown,
      {
        width: 180,
        height: 30,
        items: commands,
        setSelectedItem: setItem,
        defaultText: "Add Command...",
        noneText: "No Command..."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Slider,
      {
        sliderWidth: 150,
        sliderHeight: 5,
        knobHeight: 16,
        knobWidth: 16,
        value,
        setValue
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      value.toFixed(0),
      "%"
    ] })
  ] });
}
function NumberInput({
  fontSize,
  width,
  height,
  value,
  setValue,
  addToHistory,
  bounds,
  units = "",
  stepSize = 1,
  roundTo = 2
}) {
  const [edit, setEdit] = reactExports.useState(null);
  const displayRef = reactExports.useRef("");
  const [isHovering, setIsHovering] = reactExports.useState(false);
  const labelRef = reactExports.useRef(null);
  const [labelW, setLabelW] = reactExports.useState(0);
  const inputRef = reactExports.useRef(null);
  displayRef.current = edit !== null ? edit : displayRef.current;
  const resetValue = () => {
    const val = value;
    const num = val === null ? "" : trimZeros(val.toFixed(roundTo));
    displayRef.current = num;
    setEdit(num);
  };
  reactExports.useEffect(() => {
    resetValue();
  }, [value]);
  const timerRef = reactExports.useRef(null);
  const prevClampedNum = reactExports.useRef(value);
  const addToHistoryCheck = (value2) => {
    if (prevClampedNum.current !== value2 && value2 !== null) {
      addToHistory?.(value2);
    }
    prevClampedNum.current = value2;
  };
  const stepInput = reactExports.useCallback(
    (stepDirection) => {
      if (value === null) return;
      const next = stepDirection === 1 ? value + stepSize : value - stepSize;
      const clamped = clamp(next, bounds[0], bounds[1]);
      if (clamped === void 0) return;
      setValue(clamped);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        addToHistoryCheck(clamped);
      }, 400);
    },
    [value, stepSize, bounds, setValue]
  );
  reactExports.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (!isHovering) return;
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      if (e.deltaY < 0) stepInput(1);
      else if (e.deltaY > 0) stepInput(-1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isHovering, stepInput]);
  const executeValue = () => {
    if (edit === null) return;
    if (edit === "") {
      setValue(null);
      return;
    }
    if (!isFinite(Number(edit))) {
      resetValue();
      return;
    }
    const num = parseFloat(edit);
    const clampNum = clamp(num, bounds[0], bounds[1]);
    if (clampNum === void 0) return;
    setValue(clampNum);
    addToHistoryCheck(clampNum);
    displayRef.current = trimZeros(clampNum.toFixed(roundTo));
  };
  const handleChange = (evt) => {
    setEdit(evt.target.value);
  };
  const handleKeyDown = (evt) => {
    if (evt.key === "Enter") {
      executeValue();
      evt.currentTarget.blur();
    }
    if (evt.key === "ArrowUp") stepInput(1);
    if (evt.key === "ArrowDown") stepInput(-1);
  };
  const handleBlur = (evt) => {
    executeValue();
    evt.currentTarget.blur();
  };
  const stroke = 2;
  const radius = 6;
  reactExports.useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    const update = () => setLabelW(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [units]);
  const notchWidth = units !== "" ? labelW + 2 : 0;
  const notchRight = 6;
  function buildNotchedRoundedRectPath(W, H) {
    const sw = stroke;
    const ox = sw / 2;
    const oy = sw / 2;
    const w = Math.max(0, W - sw);
    const h = Math.max(0, H - sw);
    const r = Math.min(radius, w / 2, h / 2);
    const left = ox;
    const top = oy;
    const right = ox + w;
    const bottom = oy + h;
    let gapEnd = w - notchRight;
    let gapStart = gapEnd - notchWidth;
    const minX = r;
    const maxX = w - r;
    gapStart = Math.max(minX, Math.min(gapStart, maxX));
    gapEnd = Math.max(minX, Math.min(gapEnd, maxX));
    return [
      `M ${left + gapEnd} ${top}`,
      `L ${right - r} ${top}`,
      `A ${r} ${r} 0 0 1 ${right} ${top + r}`,
      `L ${right} ${bottom - r}`,
      `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
      `L ${left + r} ${bottom}`,
      `A ${r} ${r} 0 0 1 ${left} ${bottom - r}`,
      `L ${left} ${top + r}`,
      `A ${r} ${r} 0 0 1 ${left + r} ${top}`,
      `L ${left + gapStart} ${top}`
    ].join(" ");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: inputRef,
        className: "bg-blackgray rounded-lg text-center text-white outline-none",
        style: { fontSize: `${fontSize}px`, width: `${width}px`, height: `${height}px` },
        type: "text",
        value: displayRef.current,
        onChange: handleChange,
        onMouseEnter: () => setIsHovering(true),
        onMouseLeave: () => {
          setIsHovering(false);
          executeValue();
        },
        onKeyDown: handleKeyDown,
        onBlur: handleBlur
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        "aria-hidden": true,
        className: "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: buildNotchedRoundedRectPath(width, height),
            fill: "none",
            className: "stroke-lightgray",
            strokeWidth: stroke,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        ref: labelRef,
        className: "\r\n          text-[10px] pointer-events-none select-none\r\n          absolute -top-1 right-4\r\n          translate-x-2 -translate-y-1/3\r\n          text-lightgray leading-none\r\n          px-1 py-0.5 z-10\r\n        ",
        children: units
      }
    )
  ] });
}
function ConstantRow({
  label,
  value,
  labelColor = "text-white",
  units = "",
  onChange,
  input
}) {
  const [path] = usePath();
  const undoRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (undoRef.current) {
      AddToUndoHistory({ path });
      undoRef.current = false;
    }
  }, [path]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-row items-center \r\n            justify-between h-[30px] pr-2 pl-2 gap-1",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `w-[100px] ${labelColor}`, children: [
          label,
          " "
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NumberInput,
          {
            width: 55,
            height: 30,
            fontSize: 16,
            value,
            setValue: onChange,
            units,
            bounds: input?.bounds ?? [0, 100],
            stepSize: input?.stepSize ?? 1,
            roundTo: input?.roundTo ?? 5,
            addToHistory: () => {
              undoRef.current = true;
            }
          }
        )
      ]
    }
  );
}
function ConstantsList({
  header,
  values,
  fields,
  onChange,
  onSetDefault,
  onReset,
  isOpenGlobal,
  defaults
}) {
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setOpen(isOpenGlobal);
  }, [isOpenGlobal]);
  const isDirty = !deepEqual(values, defaults);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `
                flex items-center w-[410px] h-[35px] rounded-lg justify-between
                ${isDirty ? "bg-medlightgray " : ""}
                relative
            `,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex pl-2 gap-2 items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "cursor-pointer", onClick: () => setOpen(!open), children: !open ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[12px] h-[12px] rotate-270", src: downArrow }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[12px] h-[12px]", src: downArrow }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: header })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex pr-5 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: `
                    bg-medgray hover:bg-medgray_hover px-2 rounded-sm
                    transition-all duration-100 active:scale-[0.995] active:bg-medgray_hover/70
                    ${!isDirty ? "opacity-40 cursor-not-allowed hover:bg-medlightgray" : "cursor-pointer"}
                `,
                onClick: () => {
                  if (!isDirty) return;
                  onSetDefault(values);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-verylightgray", children: "Set Default" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: `
                    bg-medgray hover:bg-medgray_hover px-2 rounded-sm
                    transition-all duration-100 active:scale-[0.995] active:bg-medgray_hover/70
                    ${!isDirty ? "opacity-40 cursor-not-allowed hover:bg-medlightgray" : "cursor-pointer"}
                `,
                onClick: () => {
                  if (!isDirty) return;
                  onReset();
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-verylightgray", children: "Reset" })
              }
            )
          ] })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid grid-cols-2 min-w-0 pl-5 gap-2 mt-2 w-[400px]", children: fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConstantRow,
      {
        label: f.label,
        value: values[f.key],
        input: f.input,
        units: f.units,
        onChange: (v) => onChange({ [f.key]: v }),
        labelColor: deepEqual(values[f.key], defaults[f.key]) ? "text-white" : "text-white/50"
      },
      String(f.key)
    )) }) })
  ] });
}
function CycleImageButton({
  imageKeys,
  value,
  onKeyChange
}) {
  const keyToIdx = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    imageKeys.forEach((k, i) => m.set(k.key, i));
    return m;
  }, [imageKeys]);
  const idx = keyToIdx.get(value) ?? 0;
  const current = imageKeys[idx];
  const handleNextCycle = () => {
    const nextIdx = (idx + 1) % imageKeys.length;
    onKeyChange(imageKeys[nextIdx].key);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      className: "flex items-center w-[20px] h-[20px] cursor-pointer",
      onClick: handleNextCycle,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: current.src, alt: "", draggable: false })
    }
  );
}
const saved$1 = localStorage.getItem("appState");
const initialData$1 = saved$1 ? JSON.parse(saved$1) : DEFAULT_FORMAT;
const formatStore = createStore(initialData$1.format);
function useFormat() {
  const format = reactExports.useSyncExternalStore(
    formatStore.subscribe,
    formatStore.getState,
    formatStore.getState
  );
  return [format, formatStore.setState];
}
function MotionList({
  name,
  speedScale,
  field,
  directionField,
  segmentId,
  isOpenGlobal,
  start = false,
  draggable = false,
  onDragStart,
  onDragEnd,
  onDragEnter,
  draggingIds = [],
  shrink = false
}) {
  const [path, setPath] = usePath();
  const segment = path.segments.find((s) => s.id === segmentId);
  const selected = path.segments.find((c) => c.id === segmentId)?.selected;
  const [isEyeOpen, setEyeOpen] = reactExports.useState(true);
  const [isLocked, setLocked] = reactExports.useState(false);
  const [isOpen, setOpen] = reactExports.useState(false);
  const [command, setCommand] = reactExports.useState(createCommand(""));
  const [format] = useFormat();
  const pathRef = reactExports.useRef(path);
  pathRef.current = path;
  const normalSelect = () => {
    setPath((prev) => ({
      ...prev,
      segments: prev.segments.map(
        (segment2) => segment2.id === segmentId ? { ...segment2, selected: true } : { ...segment2, selected: false }
      )
    }));
  };
  const crtlSelect = () => {
    setPath((prev) => {
      const willSelect = !prev.segments.find((s) => s.id === segmentId)?.selected;
      if (willSelect) {
        return {
          ...prev,
          segments: prev.segments.map((s) => {
            if (s.id === segmentId) {
              return { ...s, selected: true };
            }
            if (s.kind === "group" || s.groupId !== void 0) {
              return { ...s, selected: false };
            }
            return s;
          })
        };
      }
      return {
        ...prev,
        segments: prev.segments.map(
          (s) => s.id === segmentId ? { ...s, selected: false } : s
        )
      };
    });
  };
  const shiftSelect = () => {
    setPath((prev) => {
      const segments = prev.segments;
      const clickedIdx = segments.findIndex((s) => s.id === segmentId);
      if (clickedIdx === -1) return prev;
      let anchorIdx = -1;
      for (let i = segments.length - 1; i >= 0; i--) {
        if (segments[i].selected && segments[i].kind !== "group") {
          anchorIdx = i;
          break;
        }
      }
      if (anchorIdx === -1) anchorIdx = clickedIdx;
      const start2 = Math.min(anchorIdx, clickedIdx);
      const end = Math.max(anchorIdx, clickedIdx);
      return {
        ...prev,
        // Select segments in range, but exclude groups and deselect all groups
        segments: segments.map((s, i) => ({
          ...s,
          selected: s.kind === "group" ? false : i >= start2 && i <= end
        }))
      };
    });
  };
  const handleOnClick = (evt) => {
    if (evt.button === 0 && evt.ctrlKey) {
      crtlSelect();
      return;
    }
    if (evt.button === 0 && evt.shiftKey) {
      shiftSelect();
      return;
    }
    if (evt.button === 0) {
      normalSelect();
      return;
    }
  };
  const StartHover = () => {
    setPath((prev) => ({
      ...prev,
      segments: prev.segments.map(
        (segment2) => segment2.id === segmentId ? { ...segment2, hovered: true } : { ...segment2, hovered: false }
      )
    }));
  };
  const EndHover = () => {
    setPath((prev) => ({
      ...prev,
      segments: prev.segments.map(
        (segment2) => segment2.id === segmentId ? { ...segment2, hovered: false } : { ...segment2, hovered: false }
      )
    }));
  };
  reactExports.useEffect(() => {
    setOpen(isOpenGlobal);
  }, [isOpenGlobal]);
  reactExports.useEffect(() => {
    setPath((prev) => ({
      ...prev,
      segments: prev.segments.map(
        (segment2) => segment2.id === segmentId ? { ...segment2, command } : { ...segment2 }
      )
    }));
  }, [command, segmentId, setPath]);
  const toggleSegment = (patch) => {
    setPath((prev) => {
      const next = {
        ...prev,
        segments: prev.segments.map((s) => s.id === segmentId ? patch(s) : s)
      };
      AddToUndoHistory({ path: next });
      return next;
    });
  };
  const handleEyeOnClick = () => {
    toggleSegment((s) => ({ ...s, visible: !s.visible }));
  };
  const handleLockOnClick = () => {
    toggleSegment((s) => ({ ...s, locked: !s.locked }));
  };
  reactExports.useEffect(() => {
    setEyeOpen(segment.visible);
  }, [segment.visible]);
  reactExports.useEffect(() => {
    setLocked(segment.locked);
  }, [segment.locked]);
  const getValuesFromKeys = (keys, obj) => {
    return keys.reduce((acc, key) => {
      if (key in (obj ?? {})) {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  };
  const updateUndoRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (updateUndoRef.current) {
      AddToUndoHistory({ path });
      updateUndoRef.current = false;
    }
  }, [path]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col gap-2 mt-[1px]`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        draggable,
        onDragStart: (e) => {
          if (e.dataTransfer) {
            e.dataTransfer.setData("text/plain", segmentId);
            e.dataTransfer.effectAllowed = "move";
            const emptyImg = new Image();
            emptyImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
          }
          if (onDragStart) onDragStart(e);
        },
        onDragEnd: (e) => {
          if (onDragEnd) onDragEnd(e);
        },
        onDragEnter: () => {
          if (onDragEnter) onDragEnter();
        },
        onClick: handleOnClick,
        onMouseEnter: StartHover,
        onMouseLeave: EndHover,
        style: { width: `${!shrink ? 450 : 400}px` },
        className: `${selected ? "bg-medlightgray" : ""}
                flex flex-row justify-start items-center
                h-[35px] gap-[12px]
                bg-medgray
                hover:brightness-92
                rounded-lg pl-4 pr-4
                transition-all duration-100
                active:scale-[0.995]
                ${isOpen && !selected ? "border-2 border-medlightgray" : "border-2 border-transparent"}
                ${draggingIds.includes(segmentId) ? "opacity-10" : ""}
            `,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "cursor-pointer shrink-0",
              onClick: () => setOpen(!isOpen),
              children: !isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[15px] h-[15px] rotate-270", src: downArrow }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[15px] h-[15px]", src: downArrow })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "cursor-pointer shrink-0", onClick: handleEyeOnClick, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[20px] h-[20px]", src: isEyeOpen ? eyeOpen : eyeClosed }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "cursor-pointer shrink-0", onClick: handleLockOnClick, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[20px] h-[20px]", src: isLocked ? lockClose : lockOpen }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-[50px] items-center shrink-0 text-left truncate", children: name }),
          !start ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Slider,
            {
              sliderWidth: !shrink ? 210 : 160,
              sliderHeight: 5,
              knobHeight: 16,
              knobWidth: 16,
              value: (field[0]?.values?.["maxSpeed"] ?? 0) / speedScale * 100,
              setValue: (v) => field[0]?.onChange({ maxSpeed: v / 100 * speedScale }),
              OnChangeEnd: (sliderValue) => {
                const currentPath = pathRef.current;
                const realValue = sliderValue / 100 * speedScale;
                AddToUndoHistory({
                  path: {
                    ...currentPath,
                    segments: currentPath.segments.map(
                      (s) => s.id === segmentId ? { ...s, constants: { ...s.constants, maxSpeed: realValue } } : s
                    )
                  }
                });
              }
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[230px]" }),
          !start && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 shrink-0 text-left tabular-nums pl-1", children: (field[0]?.values?.["maxSpeed"] ?? 0).toFixed(speedScale > 9.9 ? speedScale > 99.9 ? 0 : 1 : 2) }),
          directionField.length !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-max flex flex-row items-center justify-end gap-2.5 pl-[12px]", children: directionField.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            CycleImageButton,
            {
              imageKeys: f.imageKeys,
              onKeyChange: (key) => {
                updateUndoRef.current = true;
                f.onKeyChange(key);
              },
              value: f.value
            },
            i
          )) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `relative flex flex-col ml-9 gap-2 transition-all ${isOpen ? "block" : "hidden"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-[-16px] top-0 h-full w-[4px] rounded-full bg-medlightgray" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandList, { command, setCommand }),
          field.map((f) => {
            const fieldKeys = f.fields.map((m) => m.key);
            const relevantValues = getValuesFromKeys(fieldKeys, f.values);
            const relevantDefaults = getValuesFromKeys(fieldKeys, f.defaults);
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              ConstantsList,
              {
                header: f.header,
                fields: f.fields,
                values: relevantValues,
                isOpenGlobal,
                onChange: f.onChange,
                onReset: () => {
                  AddToUndoHistory({ path });
                  f.onChange(relevantDefaults);
                },
                onSetDefault: (constants) => {
                  f.setDefault(constants);
                  AddToUndoHistory({
                    defaults: structuredClone(globalDefaultsStore.getState()[format])
                  });
                },
                defaults: relevantDefaults
              },
              f.header
            );
          })
        ]
      }
    )
  ] });
}
const usePathVisibility = createSharedState(false);
const plus = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='%23FFFFFF'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M13%203C13%202.44772%2012.5523%202%2012%202C11.4477%202%2011%202.44772%2011%203V11H3C2.44772%2011%202%2011.4477%202%2012C2%2012.5523%202.44772%2013%203%2013H11V21C11%2021.5523%2011.4477%2022%2012%2022C12.5523%2022%2013%2021.5523%2013%2021V13H21C21.5523%2013%2022%2012.5523%2022%2012C22%2011.4477%2021.5523%2011%2021%2011H13V3Z'%20stroke='%23ffffff'%20stroke-width='2'%20fill='%23ffffff'/%3e%3c/svg%3e";
function createSegmentGroup() {
  return {
    id: makeId(10),
    groupId: makeId(10),
    disabled: false,
    selected: false,
    hovered: false,
    locked: false,
    visible: true,
    constants: "Group",
    pose: { x: null, y: null, angle: null },
    kind: "group"
  };
}
function createPointDriveSegment(format, position) {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    disabled: false,
    visible: true,
    pose: { x: position.x, y: position.y, angle: null },
    command: createCommand(""),
    format,
    kind: "pointDrive",
    constants: getDefaultConstants(format, "pointDrive")
  };
}
function createPoseDriveSegment(format, pose) {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    disabled: false,
    locked: false,
    visible: true,
    pose,
    command: createCommand(""),
    format,
    kind: "poseDrive",
    constants: getDefaultConstants(format, "poseDrive")
  };
}
function createPointTurnSegment(format, pose) {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    disabled: false,
    visible: true,
    pose,
    command: createCommand(""),
    format,
    kind: "pointTurn",
    constants: getDefaultConstants(format, "pointTurn")
  };
}
function createAngleTurnSegment(format, heading) {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    disabled: false,
    visible: true,
    command: createCommand(""),
    pose: { x: null, y: null, angle: heading },
    format,
    kind: "angleTurn",
    constants: getDefaultConstants(format, "angleTurn")
  };
}
function createAngleSwingSegment(format, heading) {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    disabled: false,
    visible: true,
    command: createCommand(""),
    pose: { x: null, y: null, angle: heading },
    format,
    kind: "angleSwing",
    constants: getDefaultConstants(format, "angleSwing")
  };
}
function createPointSwingSegment(format, pose) {
  return {
    id: makeId(10),
    selected: false,
    hovered: false,
    locked: false,
    disabled: false,
    visible: true,
    command: createCommand(""),
    pose,
    format,
    kind: "pointSwing",
    constants: getDefaultConstants(format, "pointSwing")
  };
}
function angle_error(error, direction) {
  if (direction === null) return reduce_negative_180_to_180(error);
  switch (direction) {
    case "clockwise":
      return error < 0 ? error + 360 : error;
    case "counterclockwise":
      return error > 0 ? error - 360 : error;
  }
}
function reduce_negative_180_to_180(angle) {
  while (!(angle >= -180 && angle < 180)) {
    if (angle < -180) {
      angle += 360;
    }
    if (angle >= 180) {
      angle -= 360;
    }
  }
  return angle;
}
function reduce_negative_90_to_90(angle) {
  while (!(angle >= -90 && angle < 90)) {
    if (angle < -90) {
      angle += 180;
    }
    if (angle >= 90) {
      angle -= 180;
    }
  }
  return angle;
}
function is_line_settled(desired_X, desired_Y, desired_angle_deg, current_X, current_Y) {
  return (desired_Y - current_Y) * Math.cos(toRad(desired_angle_deg)) <= -(desired_X - current_X) * Math.sin(toRad(desired_angle_deg));
}
function left_voltage_scaling(drive_output, heading_output) {
  const ratio = Math.max(Math.abs(drive_output + heading_output), Math.abs(drive_output - heading_output)) / 12;
  if (ratio > 1) {
    return (drive_output + heading_output) / ratio;
  }
  return drive_output + heading_output;
}
function right_voltage_scaling(drive_output, heading_output) {
  const ratio = Math.max(Math.abs(drive_output + heading_output), Math.abs(drive_output - heading_output)) / 12;
  if (ratio > 1) {
    return (drive_output - heading_output) / ratio;
  }
  return drive_output - heading_output;
}
function clamp_min_voltage(drive_output, drive_min_voltage) {
  if (drive_output < 0 && drive_output > -drive_min_voltage) {
    return -drive_min_voltage;
  }
  if (drive_output > 0 && drive_output < drive_min_voltage) {
    return drive_min_voltage;
  }
  return drive_output;
}
let pointStartHeading = null;
let pointPrevLineSettled = null;
function driveToPoint(robot, dt, x, y, drivePID, headingPID) {
  const dx = x - robot.getX();
  const dy = y - robot.getY();
  const headingToPoint = toDeg(Math.atan2(dx, dy));
  if (pointStartHeading === null) {
    pointStartHeading = toDeg(Math.atan2(dx, dy));
    pointPrevLineSettled = is_line_settled(x, y, pointStartHeading, robot.getX(), robot.getY());
  }
  if (drivePID.isSettled()) {
    drivePID.reset();
    headingPID.reset();
    pointStartHeading = null;
    pointPrevLineSettled = null;
    return true;
  }
  const line_settled = is_line_settled(x, y, pointStartHeading, robot.getX(), robot.getY());
  if (line_settled && !pointPrevLineSettled) {
    drivePID.reset();
    headingPID.reset();
    pointStartHeading = null;
    pointPrevLineSettled = null;
    return true;
  }
  pointPrevLineSettled = line_settled;
  const drive_error = Math.hypot(dx, dy);
  let desiredHeading = headingToPoint;
  let driveSign = 1;
  if (drivePID.driveDirection === "reverse") {
    desiredHeading = reduce_negative_180_to_180(headingToPoint + 180);
    driveSign = -1;
  }
  let heading_error = reduce_negative_180_to_180(desiredHeading - robot.getAngle());
  let drive_output = drivePID.compute(drive_error);
  let heading_scale_factor = Math.cos(toRad(heading_error));
  if (drivePID.driveDirection !== null) heading_scale_factor = Math.max(0, heading_scale_factor);
  drive_output *= heading_scale_factor * driveSign;
  if (drivePID.driveDirection === null) heading_error = reduce_negative_90_to_90(heading_error);
  let heading_output = headingPID.compute(heading_error);
  if (drive_error < drivePID.settleError) heading_output = 0;
  drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * drivePID.maxSpeed, Math.abs(heading_scale_factor) * drivePID.maxSpeed);
  heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);
  drive_output = clamp_min_voltage(drive_output, drivePID.minSpeed);
  robot.tankDrive(left_voltage_scaling(drive_output, heading_output) / kMikLibSpeed, right_voltage_scaling(drive_output, heading_output) / kMikLibSpeed, dt);
  return false;
}
let posePrevLineSettled = null;
let poseInitCenterLineSide = null;
let poseCrossedCenterLine = false;
function resetDriveToPose(drivePID, headingPID) {
  drivePID.reset();
  headingPID.reset();
  posePrevLineSettled = null;
  poseInitCenterLineSide = null;
  poseCrossedCenterLine = false;
}
function driveToPose(robot, dt, x, y, angle, drivePID, headingPID) {
  if (posePrevLineSettled === null || poseInitCenterLineSide === null) {
    posePrevLineSettled = is_line_settled(x, y, angle, robot.getX(), robot.getY());
    poseInitCenterLineSide = is_line_settled(x, y, angle + 90, robot.getX(), robot.getY());
    poseCrossedCenterLine = false;
  }
  if (drivePID.isSettled()) {
    resetDriveToPose(drivePID, headingPID);
    return true;
  }
  const pose_line_settled = is_line_settled(x, y, angle, robot.getX(), robot.getY());
  if (pose_line_settled && !posePrevLineSettled) {
    resetDriveToPose(drivePID, headingPID);
    return true;
  }
  posePrevLineSettled = pose_line_settled;
  const centerSide = is_line_settled(x, y, angle + 90, robot.getX(), robot.getY());
  poseCrossedCenterLine ||= centerSide !== poseInitCenterLineSide;
  const target_distance = Math.hypot(x - robot.getX(), y - robot.getY());
  const carrot_X = x - Math.sin(toRad(angle)) * (drivePID.lead * target_distance + drivePID.setback);
  const carrot_Y = y - Math.cos(toRad(angle)) * (drivePID.lead * target_distance + drivePID.setback);
  let drive_error = Math.hypot(carrot_X - robot.getX(), carrot_Y - robot.getY());
  let heading_error = reduce_negative_180_to_180(
    toDeg(Math.atan2(carrot_X - robot.getX(), carrot_Y - robot.getY())) - robot.getAngle()
  );
  let driveSign = 1;
  if (drive_error < drivePID.settleError || poseCrossedCenterLine || drive_error < drivePID.setback) {
    heading_error = reduce_negative_180_to_180(angle - robot.getAngle());
    drive_error = target_distance;
  }
  if (drivePID.driveDirection === "reverse") {
    heading_error = reduce_negative_180_to_180(heading_error + 180);
    driveSign = -1;
  }
  let drive_output = drivePID.compute(drive_error);
  let heading_scale_factor = Math.cos(toRad(heading_error));
  if (drivePID.driveDirection !== null) heading_scale_factor = Math.max(0, heading_scale_factor);
  drive_output *= heading_scale_factor * driveSign;
  if (drivePID.driveDirection === null) heading_error = reduce_negative_90_to_90(heading_error);
  const heading_output = headingPID.compute(heading_error);
  const clamped_drive_output = clamp(
    drive_output,
    -Math.abs(heading_scale_factor) * drivePID.maxSpeed,
    Math.abs(heading_scale_factor) * drivePID.maxSpeed
  );
  const clamped_heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);
  const final_drive_output = clamp_min_voltage(clamped_drive_output, drivePID.minSpeed);
  robot.tankDrive(
    left_voltage_scaling(final_drive_output, clamped_heading_output) / kMikLibSpeed,
    right_voltage_scaling(final_drive_output, clamped_heading_output) / kMikLibSpeed,
    dt
  );
  return false;
}
let crossed$2 = false;
let prevError$2 = null;
let prevRawError$2 = null;
function resetSwingToAngle(swingPID) {
  crossed$2 = false;
  prevError$2 = null;
  prevRawError$2 = null;
  swingPID.reset();
}
function swingToAngle(robot, dt, angle, swingPID) {
  const rawError = angle_error(angle - robot.getAngle(), null);
  let error = angle_error(angle - robot.getAngle(), swingPID.turnDirection);
  if (prevError$2 === null || prevRawError$2 === null) {
    prevError$2 = error;
    prevRawError$2 = rawError;
  }
  if (Math.sign(rawError) != Math.sign(prevRawError$2)) {
    crossed$2 = true;
  }
  prevRawError$2 = rawError;
  if (crossed$2) {
    error = rawError;
  } else {
    error = angle_error(angle - robot.getAngle(), swingPID.turnDirection);
  }
  if (swingPID.minSpeed != 0 && crossed$2 && Math.sign(error) != Math.sign(prevError$2)) {
    resetSwingToAngle(swingPID);
    return true;
  }
  prevError$2 = error;
  let output = swingPID.compute(error);
  if (swingPID.isSettled()) {
    resetSwingToAngle(swingPID);
    return true;
  }
  output = clamp(output, -swingPID.maxSpeed, swingPID.maxSpeed);
  output = clamp_min_voltage(output, swingPID.minSpeed);
  if (swingPID.swingDirection === "left") {
    robot.tankDrive(output / kMikLibSpeed, 0, dt);
  } else {
    robot.tankDrive(0, -output / kMikLibSpeed, dt);
  }
  return false;
}
let initialAngle = null;
function swingToPoint(robot, dt, x, y, offset, swingPID) {
  if (initialAngle === null) {
    initialAngle = reduce_negative_180_to_180(
      toDeg(Math.atan2(
        x - robot.getX(),
        y - robot.getY()
      )) + offset
    );
  }
  const out = swingToAngle(robot, dt, initialAngle, swingPID);
  if (out) {
    initialAngle = null;
    return true;
  }
  return false;
}
let crossed$1 = false;
let prevError$1 = null;
let prevRawError$1 = null;
function resetTurnToAngle(turnPID) {
  crossed$1 = false;
  prevError$1 = null;
  prevRawError$1 = null;
  turnPID.reset();
}
function turnToAngle(robot, dt, angle, turnPID) {
  const rawError = angle_error(angle - robot.getAngle(), null);
  let error = angle_error(angle - robot.getAngle(), turnPID.turnDirection);
  if (prevError$1 === null || prevRawError$1 === null) {
    prevError$1 = error;
    prevRawError$1 = rawError;
  }
  if (Math.sign(rawError) != Math.sign(prevRawError$1)) {
    crossed$1 = true;
  }
  prevRawError$1 = rawError;
  if (crossed$1) {
    error = rawError;
  } else {
    error = angle_error(angle - robot.getAngle(), turnPID.turnDirection);
  }
  if (turnPID.minSpeed != 0 && crossed$1 && Math.sign(error) != Math.sign(prevError$1)) {
    resetTurnToAngle(turnPID);
    return true;
  }
  prevError$1 = error;
  let output = turnPID.compute(error);
  if (turnPID.isSettled()) {
    resetTurnToAngle(turnPID);
    return true;
  }
  output = clamp(output, -turnPID.maxSpeed, turnPID.maxSpeed);
  output = clamp_min_voltage(output, turnPID.minSpeed);
  robot.tankDrive(output / kMikLibSpeed, -output / kMikLibSpeed, dt);
  return false;
}
let crossed = false;
let prevError = null;
let prevRawError = null;
function resetTurnToPoint(turnPID) {
  crossed = false;
  prevError = null;
  prevRawError = null;
  turnPID.reset();
}
function turnToPoint(robot, dt, x, y, offset, turnPID) {
  const targetAngle = toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) + offset;
  const rawError = angle_error(targetAngle - robot.getAngle(), null);
  let error = angle_error(targetAngle - robot.getAngle(), turnPID.turnDirection);
  if (prevError === null || prevRawError === null) {
    prevError = error;
    prevRawError = rawError;
  }
  if (Math.sign(rawError) != Math.sign(prevRawError)) {
    crossed = true;
  }
  prevRawError = rawError;
  if (crossed) {
    error = rawError;
  } else {
    error = angle_error(targetAngle - robot.getAngle(), turnPID.turnDirection);
  }
  if (turnPID.minSpeed != 0 && crossed && Math.sign(error) != Math.sign(prevError)) {
    resetTurnToPoint(turnPID);
    return true;
  }
  prevError = error;
  let output = turnPID.compute(error);
  if (turnPID.isSettled()) {
    resetTurnToPoint(turnPID);
    return true;
  }
  output = clamp(output, -turnPID.maxSpeed, turnPID.maxSpeed);
  output = clamp_min_voltage(output, turnPID.minSpeed);
  robot.tankDrive(output / kMikLibSpeed, -output / kMikLibSpeed, dt);
  return false;
}
class PID {
  kp;
  ki;
  kd;
  starti;
  settleTime;
  settleError;
  timeout;
  maxSpeed = 1;
  minSpeed = 0;
  lead = 0;
  setback = 0;
  swingDirection;
  turnDirection;
  driveDirection;
  acculatedError = 0;
  previousError = 0;
  timeSpentSettled = 0;
  timeSpentRunning = 0;
  constructor(kPID) {
    this.kp = kPID.kp ? kPID.kp : 0;
    this.ki = kPID.ki ? kPID.ki : 0;
    this.kd = kPID.kd ? kPID.kd : 0;
    this.starti = kPID.starti ? kPID.starti : 0;
    this.settleTime = kPID.settleTime ? kPID.settleTime : 0;
    this.settleError = kPID.settleError ? kPID.settleError : 0;
    this.timeout = kPID.timeout ? kPID.timeout : 0;
    this.maxSpeed = kPID.maxSpeed ? kPID.maxSpeed : 0;
    this.minSpeed = kPID.minSpeed ? kPID.minSpeed : 0;
    this.lead = kPID.lead ? kPID.lead : 0;
    this.setback = kPID.setback ? kPID.setback : 0;
    this.swingDirection = kPID.swingDirection;
    this.turnDirection = kPID.turnDirection;
    this.driveDirection = kPID.driveDirection;
  }
  update(kPID) {
    this.kp = kPID.kp ? kPID.kp : 0;
    this.ki = kPID.ki ? kPID.ki : 0;
    this.kd = kPID.kd ? kPID.kd : 0;
    this.starti = kPID.starti ? kPID.starti : 0;
    this.settleTime = kPID.settleTime ? kPID.settleTime : 0;
    this.settleError = kPID.settleError ? kPID.settleError : 0;
    this.timeout = kPID.timeout ? kPID.timeout : 0;
    this.maxSpeed = kPID.maxSpeed ? kPID.maxSpeed : 0;
    this.minSpeed = kPID.minSpeed ? kPID.minSpeed : 0;
    this.lead = kPID.lead ? kPID.lead : 0;
    this.setback = kPID.setback ? kPID.setback : 0;
    this.swingDirection = kPID.swingDirection;
    this.turnDirection = kPID.turnDirection;
    this.driveDirection = kPID.driveDirection;
  }
  compute(error) {
    if (Math.abs(error) < this.starti) {
      this.acculatedError += error;
    }
    if (error > 0 && this.previousError < 0 || error < 0 && this.previousError > 0) {
      this.acculatedError = 0;
    }
    const output = this.kp * error + this.ki * this.acculatedError + this.kd * (error - this.previousError);
    this.previousError = error;
    if (Math.abs(error) < this.settleError) {
      this.timeSpentSettled += 1 / 60 * 1e3;
    } else {
      this.timeSpentSettled = 0;
    }
    this.timeSpentRunning += 1 / 60 * 1e3;
    return output;
  }
  isSettled() {
    if (this.timeSpentRunning > this.timeout && this.timeout != 0) {
      return true;
    }
    if (this.timeSpentSettled > this.settleTime) {
      return true;
    }
    return false;
  }
  reset() {
    this.previousError = 0;
    this.acculatedError = 0;
    this.timeSpentRunning = 0;
    this.timeSpentSettled = 0;
  }
}
const getBackwardsSnapPose = (path, idx) => {
  const controls = path.segments;
  for (let i = idx; i >= 0; i--) {
    const c = controls[i];
    if (c.pose.x !== null && c.pose.y !== null) {
      return c.pose;
    }
  }
  return null;
};
const getBackwardsSnapIdx = (path, idx) => {
  const controls = path.segments;
  for (let i = idx; i >= 0; i--) {
    const c = controls[i];
    if (c.pose.x !== null && c.pose.y !== null) {
      return i;
    }
  }
  return null;
};
function getForwardSnapPose(path, idx) {
  const controls = path.segments;
  for (let i = idx; i < controls.length; i++) {
    const c = controls[i];
    if (c.pose.x !== null && c.pose.y !== null) {
      return c.pose;
    }
  }
  return null;
}
function mikLibToSim(path) {
  const pointTurnPID = new PID(getDefaultConstants("mikLib", "pointTurn").turn);
  const angleTurnPID = new PID(getDefaultConstants("mikLib", "angleTurn").turn);
  const pointDrivePID = new PID(getDefaultConstants("mikLib", "pointDrive").drive);
  const pointHeadingPID = new PID(getDefaultConstants("mikLib", "pointDrive").heading);
  const poseDrivePID = new PID(getDefaultConstants("mikLib", "poseDrive").drive);
  const poseHeadingPID = new PID(getDefaultConstants("mikLib", "poseDrive").heading);
  const pointSwingPID = new PID(getDefaultConstants("mikLib", "pointSwing").swing);
  const angleSwingPID = new PID(getDefaultConstants("mikLib", "angleSwing").swing);
  const auton = [];
  for (let idx = 0; idx < path.segments.length; idx++) {
    const control = path.segments[idx];
    const x = control.pose.x ?? 0;
    const y = control.pose.y ?? 0;
    const angle = control.pose.angle ?? 0;
    if (idx === 0) {
      auton.push(
        (robot, dt) => {
          return robot.setPose(x, y, angle);
        }
      );
      continue;
    }
    if (control.kind === "pointDrive") {
      const { drive, heading } = control.constants;
      auton.push(
        (robot, dt) => {
          pointDrivePID.update(drive);
          pointHeadingPID.update(heading);
          return driveToPoint(robot, dt, x, y, pointDrivePID, pointHeadingPID);
        }
      );
    }
    if (control.kind === "poseDrive") {
      const { drive, heading } = control.constants;
      auton.push(
        (robot, dt) => {
          poseDrivePID.update(drive);
          poseHeadingPID.update(heading);
          return driveToPose(robot, dt, x, y, angle, poseDrivePID, poseHeadingPID);
        }
      );
    }
    if (control.kind === "pointTurn") {
      const previousPos = getBackwardsSnapPose(path, idx - 1);
      const turnToPos = getForwardSnapPose(path, idx);
      const pos = turnToPos ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 } : previousPos ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 } : { x: 0, y: 5 };
      const { turn } = control.constants;
      auton.push(
        (robot, dt) => {
          pointTurnPID.update(turn);
          return turnToPoint(robot, dt, pos.x, pos.y, angle, pointTurnPID);
        }
      );
    }
    if (control.kind === "angleTurn") {
      const { turn } = control.constants;
      auton.push(
        (robot, dt) => {
          angleTurnPID.update(turn);
          return turnToAngle(robot, dt, angle, angleTurnPID);
        }
      );
    }
    if (control.kind === "pointSwing") {
      const previousPos = getBackwardsSnapPose(path, idx - 1);
      const turnToPos = getForwardSnapPose(path, idx);
      const pos = turnToPos ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 } : previousPos ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 } : { x: 0, y: 5 };
      const { swing } = control.constants;
      auton.push(
        (robot, dt) => {
          pointSwingPID.update(swing);
          return swingToPoint(robot, dt, pos.x, pos.y, angle, pointSwingPID);
        }
      );
    }
    if (control.kind === "angleSwing") {
      const { swing } = control.constants;
      auton.push(
        (robot, dt) => {
          angleSwingPID.update(swing);
          return swingToAngle(robot, dt, angle, angleSwingPID);
        }
      );
    }
  }
  return auton;
}
const roundOff$1 = (val, digits) => {
  if (val === null || val === void 0 || typeof val === "string") return "";
  return trimZeros(val.toFixed(digits));
};
const keyToMikLibConstant = (key, value, constantType) => {
  if (constantType === "Drive") {
    switch (key) {
      case "kp":
        return `.drive_k.p = ${roundOff$1(value, 3)}`;
      case "ki":
        return `.drive_k.i = ${roundOff$1(value, 5)}`;
      case "kd":
        return `.drive_k.d = ${roundOff$1(value, 3)}`;
      case "starti":
        return `.drive_k.starti = ${roundOff$1(value, 2)}`;
      case "maxSpeed":
        return `.max_voltage = ${roundOff$1(value, 1)}`;
      case "driveDirection":
        return value === null ? "" : `.drive_direction = mik::${value === "forward" ? "fwd" : "rev"}`;
    }
  } else if (constantType === "Heading") {
    switch (key) {
      case "kp":
        return `.heading_k.p = ${roundOff$1(value, 3)}`;
      case "ki":
        return `.heading_k.i = ${roundOff$1(value, 5)}`;
      case "kd":
        return `.heading_k.d = ${roundOff$1(value, 3)}`;
      case "starti":
        return `.heading_k.starti = ${roundOff$1(value, 2)}`;
      case "maxSpeed":
        return `.heading_max_voltage = ${roundOff$1(value, 1)}`;
    }
  } else if (constantType === "Turn") {
    switch (key) {
      case "kp":
        return `.k.p = ${roundOff$1(value, 3)}`;
      case "ki":
        return `.k.i = ${roundOff$1(value, 5)}`;
      case "kd":
        return `.k.d = ${roundOff$1(value, 3)}`;
      case "starti":
        return `.k.starti = ${roundOff$1(value, 2)}`;
      case "maxSpeed":
        return `.max_voltage = ${roundOff$1(value, 1)}`;
      case "turnDirection":
        return value === null ? "" : `.turn_direction = mik::${value === "clockwise" ? "cw" : "ccw"}`;
    }
  }
  switch (key) {
    case "minSpeed":
      return `.min_voltage = ${roundOff$1(value, 1)}`;
    case "settleTime":
      return `.settle_time = ${roundOff$1(value, 0)}`;
    case "settleError":
      return `.settle_error = ${roundOff$1(value, 2)}`;
    case "timeout":
      return `.timeout = ${roundOff$1(value, 0)}`;
    case "lead":
      return `.lead = ${roundOff$1(value, 2)}`;
    case "setback":
      return `.setback = ${roundOff$1(value, 2)}`;
  }
  return "";
};
function mikLibToString(path, selected = false) {
  let pathString = "";
  for (let idx = 0; idx < path.segments.length; idx++) {
    const control = path.segments[idx];
    if (selected && !control.selected) continue;
    const kind = control.kind;
    const x = roundOff$1(control.pose.x, 2);
    const y = roundOff$1(control.pose.y, 2);
    const angle = roundOff$1(control.pose.angle, 2);
    const commandName = control.command.name;
    const commandPercent = roundOff$1(control.command.percent, 0);
    if (idx === 0) {
      pathString += `    chassis.set_coordinates(${x}, ${y}, ${angle});`;
      continue;
    }
    if (kind === "angleTurn") {
      const constants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).turn, control.constants.turn);
      const constantsList = [];
      for (const k of Object.keys(constants)) {
        const c = keyToMikLibConstant(k, constants[k], "Turn");
        if (c !== "") constantsList.push(c);
      }
      if (commandName !== "") {
        constantsList.push(`.callback = [](){ ${commandName} }`);
        if (Number(commandPercent) !== 0) constantsList.push(`.callback_after_percent = ${commandPercent}`);
      }
      const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");
      pathString += constantsList.length === 0 ? `
    chassis.turn_to_angle(${angle});` : constantsList.length === 1 ? `
    chassis.turn_to_angle(${angle}, { ${constantsList[0]} });` : `
    chassis.turn_to_angle(${angle}, {
${formattedConstants}
    });`;
    }
    if (kind === "pointTurn") {
      const constants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).turn, control.constants.turn);
      const constantsList = [];
      if (Number(angle) !== 0) constantsList.push(`.angle_offset = ${angle}`);
      for (const k of Object.keys(constants)) {
        const c = keyToMikLibConstant(k, constants[k], "Turn");
        if (c !== "") constantsList.push(c);
      }
      const previousPos = getBackwardsSnapPose(path, idx - 1);
      const turnToPos = getForwardSnapPose(path, idx);
      const pos = turnToPos ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 } : previousPos ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 } : { x: 0, y: 5 };
      const turnX = roundOff$1(pos.x, 2);
      const turnY = roundOff$1(pos.y, 2);
      if (commandName !== "") {
        constantsList.push(`.callback = [](){ ${commandName} }`);
        if (Number(commandPercent) !== 0) constantsList.push(`.callback_after_percent = ${commandPercent}`);
      }
      const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");
      pathString += constantsList.length === 0 ? `
    chassis.turn_to_point(${turnX}, ${turnY});` : constantsList.length === 1 ? `
    chassis.turn_to_point(${turnX}, ${turnY}, { ${constantsList[0]} });` : `
    chassis.turn_to_point(${turnX}, ${turnY}, {
${formattedConstants}
    });`;
    }
    if (kind === "angleSwing") {
      const constants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).swing, control.constants.swing);
      const constantsList = [];
      for (const k of Object.keys(constants)) {
        const c = keyToMikLibConstant(k, constants[k], "Turn");
        if (c !== "") constantsList.push(c);
      }
      if (commandName !== "") {
        constantsList.push(`.callback = [](){ ${commandName} }`);
        if (Number(commandPercent) !== 0) constantsList.push(`.callback_after_percent = ${commandPercent}`);
      }
      const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");
      const direction = control.constants.swing.swingDirection;
      pathString += constantsList.length === 0 ? `
    chassis.${direction}_swing_to_angle(${angle});` : constantsList.length === 1 ? `
    chassis.${direction}_swing_to_angle(${angle}, { ${constantsList[0]} });` : `
    chassis.${direction}_swing_to_angle(${angle}, {
${formattedConstants}
    });`;
    }
    if (kind === "pointSwing") {
      const constants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).swing, control.constants.swing);
      const constantsList = [];
      if (Number(angle) !== 0) constantsList.push(`.angle_offset = ${angle}`);
      for (const k of Object.keys(constants)) {
        const c = keyToMikLibConstant(k, constants[k], "Turn");
        if (c !== "") constantsList.push(c);
      }
      const previousPos = getBackwardsSnapPose(path, idx - 1);
      const turnToPos = getForwardSnapPose(path, idx);
      const pos = turnToPos ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 } : previousPos ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 } : { x: 0, y: 5 };
      const turnX = roundOff$1(pos.x, 2);
      const turnY = roundOff$1(pos.y, 2);
      if (commandName !== "") {
        constantsList.push(`.callback = [](){ ${commandName} }`);
        if (Number(commandPercent) !== 0) constantsList.push(`.callback_after_percent = ${commandPercent}`);
      }
      const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");
      const direction = control.constants.swing.swingDirection;
      pathString += constantsList.length === 0 ? `
    chassis.${direction}_swing_to_point(${turnX}, ${turnY});` : constantsList.length === 1 ? `
    chassis.${direction}_swing_to_point(${turnX}, ${turnY}, { ${constantsList[0]} });` : `
    chassis.${direction}_swing_to_point(${turnX}, ${turnY}, {
${formattedConstants}
    });`;
    }
    if (kind === "pointDrive") {
      const driveConstants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).drive, control.constants.drive);
      const headingConstants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).heading, control.constants.heading);
      const constantsList = [];
      for (const k of Object.keys(driveConstants)) {
        const driveC = keyToMikLibConstant(k, driveConstants[k], "Drive");
        if (driveC !== "") constantsList.push(driveC);
      }
      for (const k of Object.keys(headingConstants)) {
        const headingC = keyToMikLibConstant(k, headingConstants[k], "Heading");
        if (headingC !== "") constantsList.push(headingC);
      }
      if (commandName !== "") {
        constantsList.push(`.callback = [](){ ${commandName} }`);
        if (Number(commandPercent) !== 0) constantsList.push(`.callback_after_percent = ${commandPercent}`);
      }
      const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");
      pathString += constantsList.length === 0 ? `
    chassis.drive_to_point(${x}, ${y});` : constantsList.length === 1 ? `
    chassis.drive_to_point(${x}, ${y}, { ${constantsList[0]} });` : `
    chassis.drive_to_point(${x}, ${y}, {
${formattedConstants}
    });`;
    }
    if (kind === "poseDrive") {
      const driveConstants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).drive, control.constants.drive);
      const headingConstants = getUnequalPIDConstants(getDefaultConstants("mikLib", kind).heading, control.constants.heading);
      const constantsList = [];
      for (const k of Object.keys(driveConstants)) {
        const driveC = keyToMikLibConstant(k, driveConstants[k], "Drive");
        if (driveC !== "") constantsList.push(driveC);
      }
      for (const k of Object.keys(headingConstants)) {
        const headingC = keyToMikLibConstant(k, headingConstants[k], "Heading");
        if (headingC !== "") constantsList.push(headingC);
      }
      if (commandName !== "") {
        constantsList.push(`.callback = [](){ ${commandName} }`);
        if (Number(commandPercent) !== 0) constantsList.push(`.callback_after_percent = ${commandPercent}`);
      }
      const formattedConstants = constantsList.map((c) => `        ${c}`).join(",\n");
      pathString += constantsList.length === 0 ? `
    chassis.drive_to_pose(${x}, ${y}, ${angle});` : constantsList.length === 1 ? `
    chassis.drive_to_pose(${x}, ${y}, ${angle}, { ${constantsList[0]} });` : `
    chassis.drive_to_pose(${x}, ${y}, ${angle}, {
${formattedConstants}
    });`;
    }
  }
  if (selected) pathString = pathString.startsWith("\n") ? pathString.slice(1) : pathString;
  return pathString;
}
const SIM_CONSTANTS = {
  seconds: 99,
  dt: 1 / 60
  // Sim is run at 60 hertz
};
const computedPathStore = createStore({
  totalTime: 0,
  trajectory: [],
  endTrajectory: [],
  segmentTrajectorys: []
});
function precomputePath(robot, auton) {
  const simLengthSeconds = SIM_CONSTANTS.seconds;
  let autoIdx = 0;
  const trajectory = [];
  const endTrajectory = [];
  const segmentTrajectory = [];
  const segmentTrajectorys = [];
  const dt = SIM_CONSTANTS.dt;
  let t = 0;
  let safetyIter = 0;
  const maxIter = 60 * simLengthSeconds;
  while (safetyIter < maxIter) {
    if (autoIdx < auton.length) {
      const done = auton[autoIdx](robot, dt);
      if (done) {
        endTrajectory.push({
          x: robot.getX(),
          y: robot.getY(),
          angle: robot.getAngle()
        });
        segmentTrajectorys.push([...segmentTrajectory]);
        segmentTrajectory.length = 0;
        autoIdx++;
      }
    }
    if (autoIdx >= auton.length) {
      if (robot.getXVelocity() === 0 && robot.getYVelocity() === 0) break;
      robot.tankDrive(0, 0, dt);
    }
    segmentTrajectory.push({
      t,
      x: robot.getX(),
      y: robot.getY(),
      angle: robot.getAngle()
    });
    trajectory.push({
      t,
      x: robot.getX(),
      y: robot.getY(),
      angle: robot.getAngle()
    });
    t += dt;
    safetyIter++;
  }
  return { totalTime: t, trajectory, endTrajectory, segmentTrajectorys };
}
function getConstantMotionPower(power, startState, targetState) {
  const theta = toRad(startState.angle ?? 0);
  const xFacing = Math.cos(theta);
  const yFacing = Math.sin(theta);
  const dx = (targetState.x ?? 0) - (startState.x ?? 0);
  const dy = (targetState.y ?? 0) - (startState.y ?? 0);
  const initialLongitudinalDistance = xFacing * dx + yFacing * dy;
  const opower = initialLongitudinalDistance < 0 ? -Math.abs(power) : Math.abs(power);
  return [opower, opower];
}
function to_relative(currentPose, referencePose) {
  const x_shift = (currentPose.x ?? 0) - (referencePose.x ?? 0);
  const y_shift = (currentPose.y ?? 0) - (referencePose.y ?? 0);
  const psi = toRad(referencePose.angle ?? 0);
  return {
    x: x_shift * Math.cos(psi) + y_shift * Math.sin(psi),
    y: x_shift * -Math.sin(psi) + y_shift * Math.cos(psi),
    angle: (currentPose.angle ?? 0) - (referencePose.angle ?? 0)
  };
}
const toRevCoordinate = (x, y) => {
  return rotatePoint({ x, y: -y }, 90);
};
const toRevVelocity = (xVel, yVel) => ({ xVel: yVel, yVel: xVel });
const wrapDeg180 = (deg) => {
  return deg - 360 * Math.floor((deg + 180) / 360);
};
const copysign1 = (v) => {
  if (v === 0) return Object.is(v, -0) ? -1 : 1;
  return Math.sign(v);
};
const dist = (ax, ay, bx, by) => {
  return Math.hypot(ax - bx, ay - by);
};
class PilonsCorrection {
  kCorrection;
  maxError;
  constructor(kCorrection, maxError) {
    this.kCorrection = kCorrection;
    this.maxError = maxError;
  }
  nearSemicircleDeg(angleDeg, referenceDeg) {
    return Math.round((referenceDeg - angleDeg) / 180) * 180 + angleDeg;
  }
  applyCorrection(currentState, targetState, startState, powers) {
    const posCurrent = {
      x: currentState.x,
      y: currentState.y,
      angle: currentState.angle
    };
    const dy = (targetState.y ?? 0) - (startState.y ?? 0);
    const dx = (targetState.x ?? 0) - (startState.x ?? 0);
    const posFinal = {
      x: targetState.x,
      y: targetState.y,
      angle: toDeg(Math.atan2(dy, dx))
    };
    posFinal.angle = this.nearSemicircleDeg(
      posFinal.angle ?? 0,
      startState.angle ?? 0
    );
    const error = to_relative(posCurrent, posFinal);
    let errorAngleDeg = -(error.angle ?? 0) + toDeg(Math.atan2(error.y ?? 0, error.x ?? 0));
    errorAngleDeg = this.nearSemicircleDeg(errorAngleDeg, 0);
    const thetaRad = toRad(error.angle ?? 0);
    const lineErr = (error.y ?? 0) + (error.x ?? 0) * Math.tan(thetaRad);
    let correction2 = Math.abs(lineErr) > Math.abs(this.maxError) ? this.kCorrection * toRad(errorAngleDeg) : 0;
    if (powers[0] < 0) correction2 = -correction2;
    if (correction2 > 0) return [powers[0], powers[1] * Math.exp(-correction2)];
    if (correction2 < 0) return [powers[0] * Math.exp(correction2), powers[1]];
    return powers;
  }
}
class SimpleStop {
  harshThreshold;
  coastThreshold;
  coastPower;
  timeout = null;
  stopLastState = "GO";
  timeElsapsed = 0;
  constructor(harshThreshold, coastThreshold, coastPower, timeout = null) {
    this.harshThreshold = harshThreshold;
    this.coastThreshold = coastThreshold;
    this.coastPower = Math.abs(coastPower);
    this.timeout = timeout;
  }
  getCoastPower() {
    return this.coastPower;
  }
  reset() {
    this.timeElsapsed = 0;
    this.stopLastState = "GO";
  }
  getStopState(currentState, targetState, startState, dropEarly, dt) {
    if (this.timeout !== null && this.timeout > 0) {
      this.timeElsapsed += dt / 1e3;
      if (this.timeElsapsed > this.timeout) return "EXIT";
    }
    const xv = currentState.xVel ?? 0;
    const yv = currentState.yVel ?? 0;
    const longitudinalSpeed = Math.sqrt(xv * xv + yv * yv);
    const posCurrent = {
      x: currentState.x,
      y: currentState.y,
      angle: currentState.angle
    };
    const posFinal = {
      x: targetState.x,
      y: targetState.y,
      angle: toDeg(
        Math.atan2(
          (targetState.y ?? 0) - (startState.y ?? 0),
          (targetState.x ?? 0) - (startState.x ?? 0)
        )
      )
    };
    const error = to_relative(posCurrent, posFinal);
    const longitudinalDistance = -(error.x ?? 0) - dropEarly;
    if (longitudinalDistance < 0) {
      this.stopLastState = "BRAKE";
      return this.harshThreshold > 1 ? "BRAKE" : "EXIT";
    }
    if (longitudinalSpeed * (this.harshThreshold / 1e3) > longitudinalDistance || this.stopLastState === "BRAKE") {
      this.stopLastState = "BRAKE";
      return "BRAKE";
    }
    if (longitudinalSpeed * (this.coastThreshold / 1e3) > longitudinalDistance || this.stopLastState === "COAST") {
      this.stopLastState = "COAST";
      return "COAST";
    }
    return "GO";
  }
}
let boomerangStartPoint = null;
let boomerangDirection = 1;
let boomerangClose = false;
let boomerangFrozenCarrot = null;
let boomerangLastStatus = "DRIVE";
let stop$1 = null;
let correction = null;
let brakeElapsed$1 = null;
function cleanupBoomerangSegment() {
  boomerangLastStatus = "DRIVE";
  boomerangDirection = 1;
  boomerangClose = false;
  boomerangStartPoint = null;
  brakeElapsed$1 = null;
  stop$1?.reset();
  stop$1 = null;
}
function boomerangSegment(robot, dt, x, y, angle, constants) {
  const dropEarly = constants.dropEarly ?? 0;
  const speed = constants.maxSpeed ?? 0;
  const lead = constants.lead ?? 0;
  const revTargetPos = toRevCoordinate(x, y);
  x = revTargetPos.x;
  y = revTargetPos.y;
  const revRobotPos = toRevCoordinate(robot.getX(), robot.getY());
  if (stop$1 === null || correction === null) {
    stop$1 = new SimpleStop(constants.stopHarshThreshold ?? 0, constants.stopCoastThreshold ?? 0, constants.stopCoastPower ?? 0, constants.stopTimeout);
    correction = new PilonsCorrection(constants.kCorrection ?? 0, constants.maxError ?? 0);
  }
  if (boomerangStartPoint === null) {
    boomerangStartPoint = { x: robot.getX(), y: robot.getY(), angle: robot.getAngle() };
    const theta0 = toRad(boomerangStartPoint.angle ?? 0);
    const xi_facing = Math.cos(theta0);
    const yi_facing = Math.sin(theta0);
    const initialLongitudinal = xi_facing * (x - (boomerangStartPoint.x ?? 0)) + yi_facing * (y - (boomerangStartPoint.y ?? 0));
    if (initialLongitudinal < 0) boomerangDirection = -1;
  }
  const startPoint = { ...boomerangStartPoint };
  const currentState = {
    x: revRobotPos.x,
    y: revRobotPos.y,
    angle: robot.getAngle(),
    xVel: robot.getXVelocity(),
    yVel: robot.getYVelocity()
  };
  const currentPose = { x: revRobotPos.x, y: revRobotPos.y, angle: robot.getAngle() };
  const targetPoint = { x, y, angle };
  const currentD = dist(currentPose.x ?? 0, currentPose.y ?? 0, x, y);
  let newState;
  if (boomerangClose) {
    newState = stop$1.getStopState(
      currentState,
      targetPoint,
      boomerangFrozenCarrot ?? currentPose,
      dropEarly,
      dt
    );
  } else {
    newState = "GO";
    if (Math.abs(currentD) < 7.5) {
      boomerangClose = true;
      boomerangFrozenCarrot = { ...currentPose };
    }
  }
  const th = toRad(angle);
  const carrotX = x - boomerangDirection * lead * currentD * Math.cos(th);
  const carrotY = y - boomerangDirection * lead * currentD * Math.sin(th);
  const carrotPoint = { x: carrotX, y: carrotY, angle: 0 };
  if (boomerangLastStatus == "EXIT" || newState == "EXIT") {
    robot.tankDrive(0, 0, dt);
    cleanupBoomerangSegment();
    return true;
  }
  if (boomerangLastStatus === "BRAKE" || newState === "BRAKE") {
    if (brakeElapsed$1 === null) brakeElapsed$1 = 0;
    brakeElapsed$1 += dt;
    robot.tankDrive(0, 0, dt);
    boomerangLastStatus = "BRAKE";
    if (brakeElapsed$1 * 1e3 >= (constants.brakeTime ?? 0)) {
      cleanupBoomerangSegment();
      brakeElapsed$1 = null;
      return true;
    }
    return false;
  }
  const pows = getConstantMotionPower(speed, startPoint, carrotPoint);
  if (newState == "COAST") {
    let power = stop$1.getCoastPower();
    const left = pows[0];
    const right = pows[1];
    if (left + right < 0) power *= -1;
    boomerangLastStatus = "DRIVE";
    robot.tankDrive(power, power, dt);
    return false;
  }
  const correctedPows = correction.applyCorrection(currentState, carrotPoint, startPoint, pows);
  boomerangLastStatus = "DRIVE";
  robot.tankDrive(correctedPows[0], correctedPows[1], dt);
  return false;
}
function cleanupTurnSegment() {
  turnSegmentValues = void 0;
}
const initTurnSegment = (startAngle, angleGoal) => {
  const startDeg = wrapDeg180(startAngle);
  const goalDeg = wrapDeg180(angleGoal);
  const angleDiff = goalDeg - startAngle;
  const targetRelO = wrapDeg180(angleDiff);
  const leftDir = targetRelO < 0 ? -1 : 1;
  const rightDir = targetRelO < 0 ? 1 : -1;
  return {
    angleGoal: goalDeg,
    startAngle: startDeg,
    targetRelativeOriginal: targetRelO,
    leftDirection: leftDir,
    rightDirection: rightDir,
    brakeElapsed: null,
    status: "FULLPOWER"
  };
};
let turnSegmentValues;
function turnSegment(robot, dt, angle, constants) {
  if (!turnSegmentValues) turnSegmentValues = initTurnSegment(robot.getAngle(), angle);
  const t = turnSegmentValues;
  const theta = wrapDeg180(robot.getAngle());
  const angleDiff = t.angleGoal - theta;
  const targetRel = wrapDeg180(angleDiff);
  if (Math.abs(t.targetRelativeOriginal) < 5) {
    robot.tankDrive(0, 0, dt);
    cleanupTurnSegment();
    return true;
  }
  if (copysign1(targetRel) !== copysign1(t.targetRelativeOriginal)) {
    robot.tankDrive(0, 0, dt);
    cleanupTurnSegment();
    return true;
  }
  const angVel = Math.abs(robot.getAngularVelocity());
  const coastCoeffSec = (constants.stopCoastThreshold ?? 0) / 1e3;
  const harshCoeffSec = (constants.stopHarshThreshold ?? 0) / 1e3;
  if (Math.abs(targetRel) <= Math.abs(angVel * coastCoeffSec) && t.status !== "BRAKE" && t.status !== "COAST") {
    t.status = "COAST";
  }
  if (Math.abs(targetRel) < Math.abs(angVel * harshCoeffSec) && t.status !== "BRAKE") {
    t.status = "BRAKE";
  }
  switch (t.status) {
    case "COAST": {
      const coastPower = constants.stopCoastPower ?? 0;
      robot.tankDrive(t.leftDirection * coastPower, t.rightDirection * coastPower, dt);
      return false;
    }
    case "BRAKE": {
      const brakeTime = constants.brakeTime ?? 0;
      if (t.brakeElapsed === null) {
        t.brakeElapsed = 0;
      } else if (t.brakeElapsed * 1e3 > brakeTime || angVel <= 0.25) {
        robot.tankDrive(0, 0, dt);
        turnSegmentValues = void 0;
        return true;
      }
      t.brakeElapsed += dt;
      robot.tankDrive(0, 0, dt);
      return false;
    }
    case "FULLPOWER":
    default: {
      const speed = constants.maxSpeed ?? 0;
      robot.tankDrive(speed * t.leftDirection, speed * t.rightDirection, dt);
      return false;
    }
  }
}
let lookAtAngle = null;
function cleanUplookAt() {
  lookAtAngle = null;
}
function lookAt(robot, dt, x, y, offset, constants) {
  if (lookAtAngle === null) {
    const computedAngle = wrapDeg180(toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) + offset);
    const angle1 = wrapDeg180(computedAngle - (constants.dropEarly ?? 0));
    const angle2 = wrapDeg180(computedAngle + (constants.dropEarly ?? 0));
    const offset1 = angle1 - robot.getAngle();
    const offset2 = angle2 - robot.getAngle();
    lookAtAngle = Math.abs(offset1) < Math.abs(offset2) ? angle1 : angle2;
  }
  const state = turnSegment(robot, dt, lookAtAngle, constants);
  if (state) {
    cleanUplookAt();
    return true;
  }
  return false;
}
let pilonsSegmentStartPoint = null;
let pilonsSegmentLastStatus = "DRIVE";
let stop = null;
let brakeElapsed = null;
function cleanupPilonsSegment() {
  pilonsSegmentLastStatus = "DRIVE";
  pilonsSegmentStartPoint = null;
  brakeElapsed = null;
  stop?.reset();
  stop = null;
}
function pilonsSegment(robot, dt, x, y, constants) {
  const revCoords = toRevCoordinate(x, y);
  x = revCoords.x;
  y = revCoords.y;
  const dropEarly = constants.dropEarly ?? 0;
  const speed = constants.maxSpeed ?? 0;
  const correction2 = new PilonsCorrection(constants.kCorrection ?? 0, constants.maxError ?? 0);
  if (stop === null) {
    stop = new SimpleStop(constants.stopHarshThreshold ?? 0, constants.stopCoastThreshold ?? 0, constants.stopCoastPower ?? 0, constants.stopTimeout);
  }
  if (pilonsSegmentStartPoint === null) {
    const revRobotPos2 = toRevCoordinate(robot.getX(), robot.getY());
    pilonsSegmentStartPoint = { x: revRobotPos2.x, y: revRobotPos2.y, angle: wrapDeg180(robot.getAngle()) };
  }
  const revRobotPos = toRevCoordinate(robot.getX(), robot.getY());
  const revRobotVel = toRevVelocity(robot.getXVelocity(), robot.getYVelocity());
  const currentState = { x: revRobotPos.x, y: revRobotPos.y, angle: wrapDeg180(robot.getAngle()), xVel: revRobotVel.xVel, yVel: revRobotVel.yVel };
  const targetPoint = { x, y, angle: 0 };
  const startPoint = { ...pilonsSegmentStartPoint };
  const newState = stop.getStopState(currentState, targetPoint, startPoint, dropEarly, dt);
  if (pilonsSegmentLastStatus == "EXIT" || newState == "EXIT") {
    robot.tankDrive(0, 0, dt);
    cleanupPilonsSegment();
    return true;
  }
  if (pilonsSegmentLastStatus === "BRAKE" || newState === "BRAKE") {
    if (brakeElapsed === null) brakeElapsed = 0;
    brakeElapsed += dt;
    robot.tankDrive(0, 0, dt);
    pilonsSegmentLastStatus = "BRAKE";
    if (brakeElapsed * 1e3 >= (constants.brakeTime ?? 0)) {
      cleanupPilonsSegment();
      return true;
    }
    return false;
  }
  const pows = getConstantMotionPower(speed, startPoint, targetPoint);
  if (newState == "COAST") {
    let power = stop.getCoastPower();
    const left = pows[0];
    const right = pows[1];
    if (left + right < 0) power *= -1;
    pilonsSegmentLastStatus = "DRIVE";
    robot.tankDrive(power, power, dt);
    return false;
  }
  const correctedPows = correction2.applyCorrection(currentState, targetPoint, startPoint, pows);
  pilonsSegmentLastStatus = "DRIVE";
  robot.tankDrive(correctedPows[0], correctedPows[1], dt);
  return false;
}
SIM_CONSTANTS.seconds = 99;
function reveilLibToSim(path) {
  const auton = [];
  for (let idx = 0; idx < path.segments.length; idx++) {
    const control = path.segments[idx];
    const x = control.pose.x ?? 0;
    const y = control.pose.y ?? 0;
    const angle = control.pose.angle ?? 0;
    if (idx === 0) {
      auton.push(
        (robot, dt) => {
          return robot.setPose(x, y, angle);
        }
      );
      continue;
    }
    if (control.kind === "pointDrive") {
      const kPilon2 = cloneKRev(control.constants.drive);
      cleanupPilonsSegment();
      let started = false;
      auton.push(
        (robot, dt) => {
          if (!started) {
            DEBUG_printSegmentStart(idx, control.kind);
            started = true;
          }
          const output = pilonsSegment(robot, dt, x, y, kPilon2);
          if (output) {
            DEBUG_printSegmentEnd(idx, control.kind);
          }
          return output;
        }
      );
    }
    if (control.kind === "poseDrive") {
      const kBoomerang2 = cloneKRev(control.constants.drive);
      cleanupBoomerangSegment();
      let started = false;
      auton.push(
        (robot, dt) => {
          if (!started) {
            DEBUG_printSegmentStart(idx, control.kind);
            started = true;
          }
          const output = boomerangSegment(robot, dt, x, y, angle, kBoomerang2);
          if (output) {
            DEBUG_printSegmentEnd(idx, control.kind);
          }
          return output;
        }
      );
    }
    if (control.kind === "pointTurn" || control.kind === "pointSwing") {
      const previousPos = getBackwardsSnapPose(path, idx - 1);
      const turnToPos = getForwardSnapPose(path, idx);
      const pos = turnToPos ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 } : previousPos ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 } : { x: 0, y: 5 };
      const kLook = cloneKRev(control.constants.turn);
      cleanUplookAt();
      let started = false;
      auton.push(
        (robot, dt) => {
          if (!started) {
            DEBUG_printSegmentStart(idx, control.kind);
            started = true;
          }
          const output = lookAt(robot, dt, pos.x, pos.y, angle ?? 0, kLook);
          if (output) {
            DEBUG_printSegmentEnd(idx, control.kind);
          }
          return output;
        }
      );
    }
    if (control.kind === "angleTurn" || control.kind === "angleSwing") {
      const kTurn2 = cloneKRev(control.constants.turn);
      cleanupTurnSegment();
      let started = false;
      auton.push(
        (robot, dt) => {
          if (!started) {
            DEBUG_printSegmentStart(idx, control.kind);
            started = true;
          }
          const output = turnSegment(robot, dt, angle, kTurn2);
          if (output) {
            DEBUG_printSegmentEnd(idx, control.kind);
          }
          return output;
        }
      );
    }
  }
  return auton;
}
function DEBUG_printSegmentStart(idx, kind) {
  return;
}
function DEBUG_printSegmentEnd(idx, kind) {
  return;
}
const roundOff = (val, digits) => {
  if (val === null || val === void 0 || typeof val === "string") return "";
  return trimZeros(val.toFixed(digits));
};
function reveilLibToString(path, selected = false) {
  let pathString = "";
  let startWrapper = false;
  for (let idx = 0; idx < path.segments.length; idx++) {
    const control = path.segments[idx];
    if (selected && !control.selected) continue;
    const kind = control.kind;
    const revCoords = toRevCoordinate(control.pose.x ?? 0, control.pose.y ?? 0);
    const x = roundOff(revCoords.x, 2);
    const y = roundOff(revCoords.y, 2);
    const angle = roundOff(control.pose.angle, 2);
    if (idx === 0) {
      pathString += `  odom->set_position({${x}_in, ${y}_in, ${angle}_deg});`;
      continue;
    }
    if (control.groupId !== void 0 && !startWrapper) {
      pathString += `
  reckless->go({`;
      startWrapper = true;
    }
    if (control.groupId === void 0) {
      pathString += `
  reckless->go({`;
    }
    if (kind === "angleTurn" || kind === "angleSwing") {
      const k = control.constants.turn;
      pathString += `
    &TurnSegment(
      ${roundOff(k.maxSpeed, 2)}, ${roundOff(k.stopCoastPower, 2)},
      ${angle}_deg,
      ${roundOff((k.stopHarshThreshold ?? 0) / 1e3, 3)}, ${roundOff((k.stopCoastThreshold ?? 0) / 1e3, 2)}, ${roundOff(k.brakeTime, 2)}_ms
    ),`;
    }
    if (kind === "pointTurn" || kind === "pointSwing") {
      const k = control.constants.turn;
      const previousPos = getBackwardsSnapPose(path, idx - 1);
      const turnToPos = getForwardSnapPose(path, idx);
      const pos = turnToPos ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 } : previousPos ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 } : { x: 0, y: 5 };
      const turnX = roundOff(pos.x, 2);
      const turnY = roundOff(pos.y, 2);
      pathString += `
    &LookAt(
      ${roundOff(k.maxSpeed, 2)}, ${roundOff(k.stopCoastPower, 2)},
      {${turnX}_in, ${turnY}_in}, ${roundOff(angle, 2)}_deg, ${roundOff(k.dropEarly, 2)}_deg,
      ${roundOff((k.stopHarshThreshold ?? 0) / 1e3, 3)}, ${roundOff((k.stopCoastThreshold ?? 0) / 1e3, 2)}, ${roundOff(k.brakeTime, 2)}_ms
    ),`;
    }
    if (kind === "pointDrive") {
      const k = control.constants.drive;
      pathString += `
    &PilonsSegment(
      &ConstantMotion(${roundOff(k.maxSpeed, 2)}),
      &PilonsCorrection(${roundOff(k.kCorrection, 1)}, ${roundOff(k.maxError, 2)}_in),
      &SimpleStop(${roundOff(k.stopHarshThreshold, 0)}_ms, ${roundOff(k.stopCoastThreshold, 0)}_ms, ${roundOff(k.stopCoastPower, 2)}),
      {${x}_in, ${y}_in}, ${roundOff(k.dropEarly, 2)}_in
    ),`;
    }
    if (kind === "poseDrive") {
      const k = control.constants.drive;
      pathString += `
    &BoomerangSegment(
      &ConstantMotion(${roundOff(k.maxSpeed, 2)}),
      &PilonsCorrection(${roundOff(k.kCorrection, 1)}, ${roundOff(k.maxError, 2)}_in),
      &SimpleStop(${roundOff(k.stopHarshThreshold, 0)}_ms, ${roundOff(k.stopCoastThreshold, 0)}_ms, ${roundOff(k.stopCoastPower, 2)}),
      ${roundOff(k.lead, 2)},
      {${x}_in, ${y}_in, ${angle}_deg}, ${roundOff(k.dropEarly, 2)}_in
    ),`;
    }
    if (startWrapper && path.segments[idx + 1]?.groupId !== control.groupId) {
      pathString += `
  });`;
      startWrapper = false;
    }
    if (control.groupId === void 0) {
      pathString += `
  });`;
    }
  }
  if (selected) pathString = pathString.startsWith("\n") ? pathString.slice(1) : pathString;
  return pathString;
}
function convertPathToSim(path, format) {
  if (format === "mikLib") {
    return mikLibToSim(path);
  }
  if (format === "ReveilLib") {
    const out = reveilLibToSim(path);
    return out;
  }
  const emptyAuton = [];
  return emptyAuton;
}
function convertPathToString(path, format, selected = false) {
  if (format === "mikLib") {
    return mikLibToString(path, selected);
  }
  if (format === "ReveilLib") {
    return reveilLibToString(path, selected);
  }
}
function pointerToSvg(evt, svg) {
  const ctm = svg.getScreenCTM();
  if (ctm) {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  return {
    x: vb.x + (evt.clientX - rect.left) * (vb.width / rect.width),
    y: vb.y + (evt.clientY - rect.top) * (vb.height / rect.height)
  };
}
function getPressedPositionInch(evt, svg, img) {
  if (!svg) return { x: 0, y: 0 };
  const posSvg = pointerToSvg(evt, svg);
  return toInch(posSvg, FIELD_REAL_DIMENSIONS, img);
}
const getPreciseSegmentLines = (idx, img) => {
  const points = [];
  const segPts = computedPathStore.getState().segmentTrajectorys[idx];
  if (segPts === void 0) return null;
  for (const rawPt of segPts) {
    const point = toPX({ x: rawPt.x, y: rawPt.y }, FIELD_REAL_DIMENSIONS, img);
    points.push(`${point.x},${point.y}`);
  }
  return points.join(" ");
};
const getSegmentLines = (idx, path, img, precise = false) => {
  if (idx <= 0) return null;
  if (precise) {
    return getPreciseSegmentLines(idx, img);
  }
  const m = path.segments[idx];
  if (m.pose.x === null || m.pose.y === null) return null;
  const startPose = getBackwardsSnapPose(path, idx - 1);
  if (startPose === null || startPose.x === null || startPose.y === null) return null;
  const pStart = toPX({ x: startPose.x, y: startPose.y }, FIELD_REAL_DIMENSIONS, img);
  const pEnd = toPX({ x: m.pose.x, y: m.pose.y }, FIELD_REAL_DIMENSIONS, img);
  if (m.kind === "pointDrive") {
    return `${pStart.x},${pStart.y} ${pEnd.x},${pEnd.y}`;
  }
  if (m.constants?.drive === void 0) return "";
  const lead = m.constants.drive.lead ?? 0;
  if (m.kind !== "poseDrive") return "";
  const ΘEnd = m.pose.angle ?? 0;
  const h = Math.sqrt(
    (pStart.x - pEnd.x) * (pStart.x - pEnd.x) + (pStart.y - pEnd.y) * (pStart.y - pEnd.y)
  );
  const x1 = pEnd.x - h * Math.sin(toRad(ΘEnd)) * lead;
  const y1 = pEnd.y + h * Math.cos(toRad(ΘEnd)) * lead;
  const boomerangPts = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * ((1 - t) * pStart.x + t * x1) + t * ((1 - t) * x1 + t * pEnd.x);
    const y = (1 - t) * ((1 - t) * pStart.y + t * y1) + t * ((1 - t) * y1 + t * pEnd.y);
    boomerangPts.push(`${x},${y}`);
  }
  return boomerangPts.join(" ");
};
function FieldMacros() {
  const MIN_FIELD_X = -999;
  const MIN_FIELD_Y = -999;
  const MAX_FIELD_X = 999;
  const MAX_FIELD_Y = 999;
  function moveControl(evt, setPath) {
    const BASE_POS_STEP = 0.25;
    const FAST_POS_STEP = 1;
    const posStep = evt.shiftKey ? FAST_POS_STEP : BASE_POS_STEP;
    let xScale = 0;
    let yScale = 0;
    if (evt.key === "ArrowUp") yScale = posStep;
    if (evt.key === "ArrowDown") yScale = -posStep;
    if (evt.key === "ArrowLeft") xScale = -posStep;
    if (evt.key === "ArrowRight") xScale = posStep;
    if (xScale === 0 && yScale === 0) return;
    evt.preventDefault();
    setPath((prev) => {
      const newSegments = prev.segments.map(
        (c) => c.selected ? {
          ...c,
          pose: {
            ...c.pose,
            x: c.pose.x !== null ? clamp(
              c.pose.x + xScale,
              MIN_FIELD_X,
              MAX_FIELD_X
            ) : c.pose.x,
            y: c.pose.y !== null ? clamp(
              c.pose.y + yScale,
              MIN_FIELD_Y,
              MAX_FIELD_Y
            ) : c.pose.y
          }
        } : c
      );
      AddToUndoHistory({ path: { ...prev, segments: newSegments } });
      return {
        ...prev,
        segments: newSegments
      };
    });
    setPath((prev) => ({
      ...prev
    }));
  }
  let bigAccum = 0;
  let smallAccum = 0;
  let bigLocked = false;
  let bigIdleTimer = null;
  function moveHeading(evt, setPath) {
    const BASE_STEP = 90;
    const SMALL_STEP = 5;
    const BIG_TICK_PX = 10;
    const SMALL_TICK_PX = 20;
    const BIG_IDLE_MS = 50;
    if (!evt.shiftKey) return;
    evt.preventDefault();
    let dy = evt.deltaY;
    if (evt.deltaMode === 1) dy *= 16;
    if (evt.deltaMode === 2) dy *= 800;
    if (dy === 0) return;
    const apply = (degDelta) => {
      setPath((prev) => {
        const newSegments = prev.segments.map(
          (c) => c.selected ? {
            ...c,
            pose: {
              ...c.pose,
              angle: c.pose.angle !== null ? normalizeDeg(c.pose.angle + degDelta) : c.pose.angle
            }
          } : c
        );
        AddToUndoHistory({ path: { ...prev, segments: newSegments } });
        return {
          ...prev,
          segments: newSegments
        };
      });
    };
    if (evt.ctrlKey) {
      smallAccum += dy;
      if (Math.abs(smallAccum) < SMALL_TICK_PX) return;
      const dir2 = smallAccum < 0 ? 1 : -1;
      smallAccum = 0;
      apply(dir2 * SMALL_STEP);
      return;
    }
    if (bigIdleTimer) clearTimeout(bigIdleTimer);
    bigIdleTimer = setTimeout(() => {
      bigLocked = false;
      bigAccum = 0;
    }, BIG_IDLE_MS);
    if (bigLocked) return;
    bigAccum += dy;
    if (Math.abs(bigAccum) < BIG_TICK_PX) return;
    const dir = bigAccum < 0 ? 1 : -1;
    bigAccum = 0;
    bigLocked = true;
    apply(dir * BASE_STEP);
  }
  function unselectPath(evt, setPath) {
    if (evt.key === "Escape") {
      setPath((prev) => {
        const newSegments = prev.segments.map((c) => ({
          ...c,
          selected: false
        }));
        return {
          ...prev,
          segments: newSegments
        };
      });
    }
  }
  function selectPath(evt, setPath) {
    if (!evt.shiftKey && evt.ctrlKey && evt.key.toLowerCase() === "a") {
      evt.preventDefault();
      setPath((prev) => {
        const newSegments = prev.segments.map((c) => ({
          ...c,
          selected: true
        }));
        return {
          ...prev,
          segments: newSegments
        };
      });
    }
  }
  function selectInversePath(evt, setPath) {
    if (evt.shiftKey && evt.ctrlKey && evt.key.toLowerCase() === "a") {
      evt.preventDefault();
      setPath((prev) => {
        const newSegments = prev.segments.map((c) => ({
          ...c,
          selected: !c.selected
        }));
        return {
          ...prev,
          segments: newSegments
        };
      });
    }
  }
  function deleteControl(evt, setPath) {
    if (evt.key === "Backspace" || evt.key === "Delete") {
      setPath((prev) => {
        const allSelected = prev.segments.length > 0 && prev.segments.every((s) => s.selected);
        const newSegments = prev.segments.filter((c, i) => {
          if (c.locked) return true;
          if (!c.selected) return true;
          if (i === 0 && prev.segments.length > 1 && !allSelected) return true;
          return false;
        });
        if (newSegments.length !== prev.segments.length) {
          AddToUndoHistory({ path: { ...prev, segments: newSegments } });
        }
        return {
          ...prev,
          segments: newSegments
        };
      });
    }
  }
  function performUndo(setFileFormat) {
    const undoState = undoHistory.getState();
    if (undoState.length <= 1) return;
    setFileFormat((current) => {
      const popped = undoState[undoState.length - 1];
      undoHistory.setState(undoState.slice(0, -1));
      redoHistory.setState([...redoHistory.getState(), popped]);
      const previousSnapshot = undoState[undoState.length - 2];
      return mergeDeep(current, previousSnapshot);
    });
  }
  function performRedo(setFileFormat) {
    const redoState = redoHistory.getState();
    if (redoState.length === 0) return;
    setFileFormat((current) => {
      const nextSnapshot = redoState[redoState.length - 1];
      redoHistory.setState(redoState.slice(0, -1));
      undoHistory.setState([...undoHistory.getState(), nextSnapshot]);
      return mergeDeep(current, nextSnapshot);
    });
  }
  function undo(evt, setFileFormat) {
    if (evt.ctrlKey) {
      const key = evt.key.toLowerCase();
      if (key === "z" && !evt.shiftKey) {
        evt.preventDefault();
        performUndo(setFileFormat);
      } else if (key === "z" && evt.shiftKey || key === "y") {
        evt.preventDefault();
        performRedo(setFileFormat);
      }
    }
  }
  const copy = (evt, path, setClipboard) => {
    if (evt.key.toLowerCase() === "c" && evt.ctrlKey) {
      const segments = path.segments.filter((s) => s.selected);
      if (segments === void 0) return;
      setClipboard(structuredClone(segments));
    }
  };
  const cut = (evt, path, setClipboard, setPath) => {
    if (evt.key.toLowerCase() === "x" && evt.ctrlKey) {
      const segments = path.segments.filter((s) => s.selected);
      if (segments === void 0) return;
      setClipboard(structuredClone(segments));
      const del = new KeyboardEvent("keydown", { key: "Delete" });
      deleteControl(del, setPath);
    }
  };
  const paste = (evt, setPath, clipboard) => {
    if (evt.key.toLowerCase() === "v" && evt.ctrlKey) {
      setPath((prev) => {
        let selectedIndex = prev.segments.findIndex((c) => c.selected);
        selectedIndex = selectedIndex === -1 ? selectedIndex = prev.segments.length : selectedIndex + 1;
        const oldSegments = prev.segments;
        const groupIdMap = /* @__PURE__ */ new Map();
        clipboard.forEach((s) => {
          if (s.groupId && !groupIdMap.has(s.groupId)) {
            groupIdMap.set(s.groupId, makeId(10));
          }
        });
        const newSegments = clipboard.map((s) => {
          const cloned = structuredClone(s);
          if (cloned.groupId) {
            cloned.groupId = groupIdMap.get(cloned.groupId);
          }
          return {
            ...cloned,
            id: makeId(10),
            selected: !s.locked,
            hovered: false,
            command: s.command ? { ...s.command, id: makeId(10) } : s.command
          };
        });
        const inserted = [
          ...oldSegments.slice(0, selectedIndex),
          ...newSegments,
          ...oldSegments.slice(selectedIndex)
        ];
        const pastedSet = new Set(newSegments);
        const controls = inserted.map(
          (s) => pastedSet.has(s) ? s : { ...s, selected: false }
        );
        AddToUndoHistory({ path: { ...prev, segments: inserted } });
        return {
          ...prev,
          segments: controls
        };
      });
    }
  };
  const addSegment = (segment, setPath) => {
    setPath((prev) => {
      let selectedIndex = prev.segments.findIndex((c) => c.selected);
      selectedIndex = selectedIndex === -1 ? selectedIndex = prev.segments.length : selectedIndex + 1;
      const selectedSegment = prev.segments.find((c) => c.selected);
      if (selectedSegment !== void 0 && selectedSegment.groupId !== void 0) {
        segment.groupId = selectedSegment.groupId;
      }
      const oldControls = prev.segments;
      const newControl = { ...segment, selected: !segment.locked };
      const inserted = selectedIndex >= 0 ? [
        ...oldControls.slice(0, selectedIndex),
        newControl,
        ...oldControls.slice(selectedIndex)
      ] : [...oldControls, newControl];
      const controls = inserted.map(
        (c) => c === newControl ? c : { ...c, selected: false }
      );
      AddToUndoHistory({ path: { ...prev, segments: controls } });
      return {
        ...prev,
        segments: controls
      };
    });
  };
  const fieldZoomKeyboard = (evt, setImg) => {
    const ZOOM_STEP = 200;
    let dir = 0;
    if (!evt.ctrlKey) return;
    if (evt.key === "=") dir = 1;
    if (evt.key === "-") dir = -1;
    if (evt.key === "0") {
      setImg(FIELD_IMG_DIMENSIONS);
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    setImg((prev) => {
      const aspectRatio = prev.w / prev.h;
      const newW = Math.max(100, prev.w + ZOOM_STEP * dir);
      const newH = newW / aspectRatio;
      return {
        ...prev,
        w: clamp(newW, 0, FIELD_IMG_DIMENSIONS.w * 3),
        h: clamp(newH, 0, FIELD_IMG_DIMENSIONS.h * 3)
      };
    });
  };
  const fieldZoomWheel = (evt, setImg, svgRef) => {
    if (evt.shiftKey || !evt.ctrlKey || svgRef.current === null) return;
    evt.preventDefault();
    evt.stopPropagation();
    const cursorPos = pointerToSvg(evt, svgRef.current);
    const zoomSpeed = 1;
    const delta = -evt.deltaY * zoomSpeed;
    setImg((prev) => {
      const aspectRatio = prev.w / prev.h;
      const newW = Math.max(100, prev.w + delta);
      const newH = newW / aspectRatio;
      const fx = (cursorPos.x - prev.x) / prev.w;
      const fy = (cursorPos.y - prev.y) / prev.h;
      const newX = clamp(cursorPos.x - fx * newW, -9999, 9999);
      const newY = clamp(cursorPos.y - fy * newH, -9999, 9999);
      const maxWidth = FIELD_IMG_DIMENSIONS.w * 3;
      const maxHeight = FIELD_IMG_DIMENSIONS.w * 3;
      if (newW >= maxWidth || newH >= maxHeight) return prev;
      return {
        x: newX,
        y: newY,
        w: newW,
        h: newH
      };
    });
  };
  const fieldPanWheel = (evt, setImg) => {
    if (evt.shiftKey || evt.ctrlKey) return;
    evt.preventDefault();
    const panSpeed = 1;
    const dx = -evt.deltaX * panSpeed;
    const dy = -evt.deltaY * panSpeed;
    setImg((prev) => ({
      ...prev,
      x: clamp(prev.x + dx, -9999, 9999),
      y: clamp(prev.y + dy, -9999, 9999)
    }));
  };
  const addAngleTurnSegment = (format, setPath) => {
    const control = createAngleTurnSegment(format, 0);
    addSegment(control, setPath);
  };
  const addPointTurnSegment = (format, setPath) => {
    const control = createPointTurnSegment(format, { x: null, y: null, angle: 0 });
    addSegment(control, setPath);
  };
  const addPoseDriveSegment = (format, position, setPath) => {
    const control = createPoseDriveSegment(format, position);
    addSegment(control, setPath);
  };
  const addPointDriveSegment = (format, position, setPath) => {
    const control = createPointDriveSegment(format, position);
    addSegment(control, setPath);
  };
  const addPointSwingSegment = (format, setPath) => {
    const control = createPointSwingSegment(format, { x: null, y: null, angle: 0 });
    addSegment(control, setPath);
  };
  const addAngleSwingSegment = (format, setPath) => {
    const control = createAngleSwingSegment(format, 0);
    addSegment(control, setPath);
  };
  const addSegmentGroup = (setPath) => {
    const control = createSegmentGroup();
    addSegment(control, setPath);
  };
  const copySelectedPath = (evt, path, format, trigger) => {
    if (evt.key.toLowerCase() === "c" && evt.ctrlKey && !evt.shiftKey) {
      trigger();
      evt.preventDefault();
      const out = convertPathToString(path, format, true);
      navigator.clipboard.writeText(out ?? "");
    }
  };
  const copyAllPath = (evt, path, format, trigger) => {
    if (evt.key.toLowerCase() === "c" && evt.shiftKey && evt.ctrlKey) {
      trigger();
      evt.preventDefault();
      const out = convertPathToString(path, format, false);
      navigator.clipboard.writeText(out ?? "");
    }
  };
  return {
    moveControl,
    unselectPath,
    selectPath,
    selectInversePath,
    deleteControl,
    moveHeading,
    undo,
    cut,
    copy,
    paste,
    copyAllPath,
    fieldZoomKeyboard,
    fieldZoomWheel,
    fieldPanWheel,
    copySelectedPath,
    addPointDriveSegment,
    addPointTurnSegment,
    addPoseDriveSegment,
    addAngleTurnSegment,
    addAngleSwingSegment,
    addPointSwingSegment,
    addSegmentGroup
  };
}
function AddSegmentButton() {
  const [isOpen, setOpen] = reactExports.useState(false);
  const menuRef = reactExports.useRef(null);
  const [, setPath] = usePath();
  const [format] = useFormat();
  const handleToggleMenu = () => {
    setOpen((prev) => !prev);
  };
  const {
    addPointDriveSegment,
    addPointTurnSegment,
    addPoseDriveSegment,
    addAngleTurnSegment,
    addAngleSwingSegment,
    addPointSwingSegment,
    addSegmentGroup
  } = FieldMacros();
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: menuRef, className: `relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleToggleMenu, className: "px-1 py-1 cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        className: "block w-[16px] h-[16px] hover:bg-medgray_hover",
        src: plus
      }
    ) }),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute shadow-xs mt-1 shadow-black right-0 top-full w-60 z-40\r\n                    rounded-sm bg-medgray_hover min-h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col mt-2 pl-2 pr-2 mb-2 gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => addPointDriveSegment(format, { x: 0, y: 0 }, setPath),
          className: "flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Drive to Point" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "LMB" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => addPoseDriveSegment(format, { x: 0, y: 0, angle: 0 }, setPath),
          className: "flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Drive to Pose" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "Ctrl+LMB" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => addAngleTurnSegment(format, setPath),
          className: "flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Turn to Angle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "CTRL+RMB" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => addPointTurnSegment(format, setPath),
          className: "flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Turn to Point" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "RMB" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => addAngleSwingSegment(format, setPath),
          className: "flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Swing to Angle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "Ctrl+Alt+RMB" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => addPointSwingSegment(format, setPath),
          className: "flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Swing to Point" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "Alt+RMB" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => addSegmentGroup(setPath),
          className: "flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Segment Group" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]" })
          ]
        }
      )
    ] }) }) })
  ] });
}
function CopyIcon({ className }) {
  const href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAVQElEQVR4Xu3daaytaVnnYepUMZWUyBBKSi1KVBpRQYOA2iUYgrSKBjW0QwTbOA9EicZUnAconAhRiaZxik0T7XaI0ShGEMEJ2k6L4tR0QpxAQEFlViiLv/diWW2d+4HinKp3vevdz7qu5P5YtZ8P73Ov39l77bVvdzsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJhBkitrvrDmKTU/WfOcmucZcxHzKzU/U/PMmqfXfEfNE2oeWnPX/swBcCS1lC+p+dyaF9XcGDisV9X8fM1X1TygP48ArKAW8LU1v3/eeoZ17YLgB2se0p9PAA6gFu5X1Lz9/F0MR/VnNdfV3K0/rwAsoBbsd7XFC1vyxprvrrlXf3YBuJVqqX5xW7awVW+p+b6aK/pzDMBFqEX60TVvO3/Hwua9suaz+vMMwAWqJfqbfbPCGfJrNe/fn2sAbkEtzsf0bQpn0GtrPqU/3wC8G7U0f7FvUjij3lHzvTWX9eccgJupRXl59m+ogpnsPnnQGwQB3p1akp/SNydM4sU19+jPPAC3e2cAfGXfmjCR3QcIXdWfe4CTV8vx+r4xYTJ/UnP3/uwDnLRajM/o2xIm9Ns1d+7PP8DJqqX4LX1TwqR2v+1yrt8BgJNUC/GL+paEiX1TvwMAJ6kW4sf0DQkT+5eaR/R7AHByahmeq3l1W5Iws7+JvyYI8M4IeGbfkDC5n+r3AODk1DK8X83b+4aEyT2y3wWAk1PL8L/27QiT+381d+x3AeCk1CK8V81ftwUJs/u6fhcATk4tw4+seXPfkDCx18QHBAG8MwI+ueaNbUnCzJ7Y7wHASaqF+OE1f963JExq96OvO/R7AHCSaiG+d81Tat5y/q6EKX12vwMAJ60W41XZ/72A/1PzjvN3Jkzjl/uzD8C/yT4GPr7mc2qeVHOdMRcx31Dz/TX/M/tfwduSG2qu7M88ALCwesG9f/ZRsJWPon5SPyMAcCD1wnuXmm/N8X8F9QX9bADAgdUL8EfU/EV7UV7TP8dnAgDA+rL/RMrdG06P5VH9TADACupF+N41r+ivzCu5vp8HAFhJvRA/JMf5C5XP7WcBAFZUL8Y/3F+dV/BX/RwAwIqyfz/AG/or9IHtPuzqvfpZAIAV1Yvxj/ZX6BV8ZD8HALCiejH+1P7qvILH9nMAACuqF+M71by1v0If2BP6OQCAldUL8sv6K/SBfUU/AwCwsnpB/o3+Cn1g1/UzAAArqxfkn+6v0Af25H4GAGBl9YL83/sr9IE9pZ8BAFhZBAAAnJ4IAAA4PREAAHB6IgAA4PREAADA6YkAAIDTEwEAAKcnAgAATk8EAACcnggAADg9EQAAcHoiAIAtqmVxruYDax5a86iaz6x5Qs2XGnOR819qHpf9c/QxNR9Sc1l/5k5NBABwbLUY7ljziJpvq/nZmj+q+ed/3xuwuLfX/N+aX6i5vubRNZf3Z3NmEQDAMdQyeL+ar695Xs1bz98TcBRvq/mtmm+u+aD+zM4mAgBYSy2Ay2seX/PcmhvP3w2wKe+o+Z2aL6t5n/4szyACADi0uvhX1HxNzavbQoCz4E01P1BzVX+2z7IIAOBQ6sK/T81Ta97QFgGcRbsfVT2j5t79WT+LIgCAQ6jL/p9rXtM3AEzgzTXX5Yz/JkEEALCkuuQfWvPCfvNhQi+peVi/A2dFBACwlLrgn5/9v47gVNxQ8+015/p92LoIAOC2qot9l5pn99sOJ+T5Ne/b78aWRQAAt0Vd6muy/0AVOHWvrHlgvyNbFQEA3Fp1oR9Q84p+y+GE/WPNw/td2aIIAODWqMv8sJrX9hsOvPNjrB/X78zWRAAAF6su8kOy/3AU4F37l5rP6HdnSyIAgIuR/V9S+9t+s4HB7oODru13aCsiAIALlf0f8PnLfquBd+v1NQ/qd2kLIgCAC1GX9/Y1L+o3GniPXl5z136nji0CALgQdXm/v99m4IL9bL9TxxYBALwndXE/Nfs/jwrcek/sd+uYIgCAW1KX9l41f99vMnDRdr8eeP9+x44lAgC4JXVp/1u/xcCt9ps1l/R7dgwRAMC7Uxf22vjWPyztc/tdO4YIAOBdqct6Wc2f9BsM3Gavqrmi37m1RQAA70pd1sf32wss5rp+59YWAQB0dVEvqfnjfnuBxew+TfPyfvfWFAEAdHVRP7PfXGBxX93v3poiAICuLuqL+80FFvdXNZf2+7eWCADg5uqS3q/fWuBgHtXv4FoiAICbq0v61H5rN+J12f9WwvNrnmfMRcxLa16TbXpWv4NriQAAblIX9FzNX/dbeyS7F/wfq/m0HPnNUsyhnqM71jyq5hk1f3OzZ+2Y3lxzl37WNUQAADfJ/oN/ju1NNd+RIy1FTkP2MfC12YfmsX12P98aIgCAm9QF/dZ+Y1e2e/PhVf1ccCj1vN2t5lfac7i2H+nnWkMEAHCTuqAv7Dd2Rc+uuVM/ExxaPXeX1jytPY9renk/0xoiAICdupyXZ//Xyo7hF2rO9TPBmuoZ/KH+YK7omn6eQ4sAAHbqcj6839aV7N6h7ef9HF09h7fP/rdMjuHz+nkOLQIA2KnL+WX9tq5g95cGH9zPAsdSz+P71bylPadreHI/y6FFAAA7dTmf3m/rCp7dzwHHVs/l9/QHdQU/089xaBEAwE5dzl/ut3UF9+/ngGPL/jcD1n4/zEv7OQ4tAgDYqcv5sn5bD+yP+xlgK+r5fE5/YA/sLf0MhxYBAOxk/+dJ17T6zzzhQtXz+eX9gV3BHfo5DikCANipy/nWflsP7LH9DLAV9Xw+uD+wK7hHP8chRQAA2X8Qytoe0s8BW1HP5737A7uCa/o5DikCAKiLedd+U1fwAf0csBXZR/EN/aE9sAf2cxxSBABQF/Oe/aau4J79HLAlWf/zAFb9TIwIACACAAYRAEsTALA1EQAwiABYmgCArYkAgEEEwNIEAGxNBAAMIgCWJgBgayIAYBABsDQBAFsTAQCDCIClCQDYmggAGEQALE0AwNZEAMAgAmBpAgC2JgIABhEASxMAsDURADCIAFiaAICtiQCAQQTA0gQAbE0EAAwiAJYmAGBrIgBgEAGwNAEAWxMBAIMIgKUJANiaCAAYRAAsTQDA1kQAwCACYGkCALYmAgAGEQBLEwCwNREAMIgAWJoAgK2JAIBBBMDSBABsTQQADCIAliYAYGsiAGAQAbA0AQBbEwEAgwiApQkA2JoIABhEACxNAMDWRADAIAJgaQIAtiYCAAYRAEsTALA1EQAwiABYmgCArYkAgEEEwNIEAGxNBAAMIgCWJgBgayIAYBABsDQBAFsTAQCDCIClCQDYmggAGEQALE0AwNZEAMAgAmBpAgC2JgIABhEASxMAsDURADCIAFiaAICtiQCAQQTA0gQAbE0EAAwiAJYmAGBrIgBgEAGwNAEAWxMBAIMIgKUJANiaCAAYRAAsTQDA1kQAwCACYGkCALYmAgAGEQBLEwCwNREAMIgAWJoAgK2JAIBBBMDSBABsTQQADCIAliYAYGsiAGAQAbA0AQBbEwEAgwiApQkA2JoIABhEACxNAMDWRADAIAJgaQIAtiYCAAYRAEsTALA1EQAwiABYmgCArYkAgEEEwNIEAGxNBAAMIgCWJgBgayIAYBABsDQBAFsTAQCDCIClCQDYmggAGEQALE0AwNZEAMAgAmBpAgC2JgIABhEASxMAsDURADCIAFiaAICtiQCAQQTA0gQAbE0EAAwiAJYmAGBrIgBgEAGwNAEAWxMBAIMIgKUJANiaCAAYRAAsTQDA1kQAwCACYGkCALYmAgAGEQBLEwCwNREAMIgAWJoAgK2JAIBBBMDSBABsTQQADCIAliYAYGsiAGAQAbA0AQBbEwEAgwiApQkA2JoIABhEACxNAMDWRADAIAJgaQIAtiYCAAYRAEsTALA1EQAwiABYmgCArYkAgEEEwNIEAGxNBAAMIgCWJgBgayIAYBABsDQBAFsTAQCDCIClCQDYmggAGEQALE0AwNZEAMAgAmBpAgC2JgIABhEASxMAsDURADCIAFiaAICtiQCAQQTA0gQAbE0EAAwyfwD8RD/AgX1bPwNwZBEAMMj8AXB9P8CBfUk/A3BkEQAwyPwB8MR+gAN7TD8DcGQRADDI/AHwCf0AB3affgbgyCIAYJD5A+DSmtf2QxzIS/rXBzYgAgAGmTwAdupr/mQ/xIF4AyBsUQQADHIaAXD/mhv6QRb2xpor+9cGNiACAAY5gQDYqa/74/0gC/vG/jWBjYgAgEFOJwCurHlFP8xC/qDmzv1rAhsRAQCDnEgA7NTX/qiaN/cD3Ua7Nxjet38tYEMiAGCQEwqAnfr6n1Tzhn6oW+lVNR/dvwawMREAMMiJBcBOneF+NS/rB7tIu2/7X93/38AGRQDAICcYADt1jvequS4X/92A12X/392x/z+BjYoAgEFONABukv2bA7++5ndqbjz/qP/f22ueW/NVNe/d/x/AxkUAwCAnHgA3V2e7++58NZ9W8wU1j6l5ULzow9kWAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGYXAQCDCABgdhEAMIgAAGZXi+eKvolWcN9+DtiKej7vUPOO/tAe2If1cwAcVC2eczU39m10YNf2c8BW1PN5n/7AruDqfg6Ag6vl86a+jQ7ss/oZYCvq+fzY/sCu4G79HAAHV8vn1X0bHdgP9TPAVtTz+Q39gV3BZf0cAAdXy+eP+jY6sFfUXNLPAVtQz+aL+wN7YP/YzwCwilpAP9c30goe3s8Bx1bP5Qdl/ffE/F4/B8AqagE9tW+kFez+leW7AGxKPZP/oz+oK3hWPwfAKmoBfX7fSCt5bD8LHEs9jw/N+r/+t/NN/SwAq6gF9OC+kVbydzXX9PPA2uo5vHvNy9vzuZZP7+cBWEUtoEtrXt+30kpeWnNFPxOspZ6/29f8ensu17J7v8E9+pkAVlNL6Jf6ZlrRLgLu088Eh5b9v/yP9eK/8/v9TACrqkX0pL6ZVvaamk/s54JDyf5n/sf6tv9NntbPBbCqWkQf1jfTkTyn5kH9fLCU7H/V76dznDf8dY/u5wNYXS2jP+zb6Yh2Pxb4zppH1Ny35k79vPCeZP+Hfa6u+Y/Zf8Lf/8o2Xvh3dp/A6RMAgeOrZfS1fUNtzO6Niv9gzEXMlj2930GAo6iFdGXNDX1LAQfxUf0OAhxNLaVf7FsKWJx3/wPbUovpYX1TAYt7XL97AEdXy+n5fVsBi/mzmnP93gEcXS2nR/aNBSzm8f3OAWxGLalf7VsLuM3+oObSft8ANqOW1AfX/FNbXsCtt/v8gY/tdw1gc2pZfXvfYMCt9mP9jgFsUi2sO9W8rG8x4KL9bc09+x0D2KxaWh9R89a2zIALt/uTvz7zHzh7anl9ed9owAV7cr9TAGdG9n89Dbg4L4h3/QNnWS2xO9f81vm7DbgFf1pz936XAM6cWmZ3zf73mIFb9sqa+/Q7BHBm1VK7quYvzt91wM28ruYB/e4AnHm13O5d84dt6QHJq2oe2O8MwDRqyd2t5rfb8oNTtvsjP1f3uwIwnVp2l9f8XFuCcIpeEG/4A05NLb4vrXnb+fsQTsLu8/1/oOb2/V4AnIRagA+uefn5uxGm9nc1n9TvAsDJyf5HArs/IOS7Acxs96/+Z9Xcq98BgJNWi/E/1Dzv/J0JU9j99svH9WcegH9TS/KSmsfW/O/z9yecSbt3+D8+PtYX4MLV0vxPNS88f5/CmfCSmsfVnOvPNQAXKPsfDezeI+DNgmzZ39c8s+ba/gwDcBvUYj1X8/Ca62teVHPDzZYvrO3G7P+l/7SaR9dc1p9ZAA6gFu4VNY+pua7mx2t+N/vPU4elvb7m97J/F/831nx6zT36MwnAEWX/RsLdRw5fXfOA7D9rwJiLmQ+vuSb758gb+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM6YfwUWeMAloqir/gAAAABJRU5ErkJggg==";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      className,
      viewBox: "0 0 25 25",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("mask", { id: "copyMask", maskUnits: "userSpaceOnUse", x: "0", y: "0", width: "25", height: "25", children: /* @__PURE__ */ jsxRuntimeExports.jsx("image", { href, x: "0", y: "0", width: "25", height: "25", preserveAspectRatio: "none" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "25", height: "25", fill: "currentColor", mask: "url(#copyMask)" })
      ]
    }
  );
}
function CopyPathButton() {
  const [isOpen, setOpen] = reactExports.useState(false);
  const menuRef = reactExports.useRef(null);
  const [pathFormat] = useFormat();
  const [path] = usePath();
  const [flash, setFlash] = reactExports.useState(false);
  const flashTimeoutRef = reactExports.useRef(null);
  const pathRef = reactExports.useRef(path);
  const formatRef = reactExports.useRef(pathFormat);
  reactExports.useEffect(() => {
    pathRef.current = path;
  }, [path]);
  reactExports.useEffect(() => {
    formatRef.current = pathFormat;
  }, [pathFormat]);
  const triggerFlash = () => {
    setFlash(true);
    if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = window.setTimeout(() => setFlash(false), 400);
  };
  const handleToggleMenu = () => setOpen((prev) => !prev);
  const {
    copyAllPath,
    copySelectedPath
  } = FieldMacros();
  reactExports.useEffect(() => {
    const handleKeyDown = (evt) => {
      const target = evt.target;
      if (target?.isContentEditable || target?.tagName === "INPUT") return;
      copyAllPath(evt, pathRef.current, formatRef.current, triggerFlash);
      copySelectedPath(evt, pathRef.current, formatRef.current, triggerFlash);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const copyAllOnClick = () => {
    triggerFlash();
    const out = convertPathToString(path, pathFormat);
    setOpen(false);
    navigator.clipboard.writeText(out ?? "");
  };
  const copySelectedOnClick = () => {
    triggerFlash();
    const out = convertPathToString(path, pathFormat, true);
    setOpen(false);
    navigator.clipboard.writeText(out ?? "");
  };
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: menuRef,
      className: `relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "w-[30px] h-[30px] flex items-center justify-center cursor-pointer\r\n                   rounded-sm hover:bg-medgray_hover active:scale-95 transition-normal duration-50",
            onClick: handleToggleMenu,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              CopyIcon,
              {
                className: [
                  "w-[25px] h-[25px]",
                  "transition-all duration-[0]",
                  flash ? "scale-[1.3] text-lightgray" : "text-white"
                ].join(" ")
              }
            )
          }
        ),
        isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute shadow-xs mt-1 shadow-black right-0 top-full w-50 z-40\r\n                     rounded-sm bg-medgray_hover min-h-2",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col mt-2 pl-2 pr-2 mb-2 gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  className: "flex justify-between px-2 py-1 hover:bg-blackgrayhover rounded-sm",
                  onClick: copyAllOnClick,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Copy All" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[14px] text-lightgray", children: "Ctrl+Shift+C" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  className: "flex justify-between px-2 py-1 hover:bg-blackgrayhover rounded-sm",
                  onClick: copySelectedOnClick,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Copy Selected" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[14px] text-lightgray", children: "Ctrl+C" })
                  ]
                }
              )
            ] })
          }
        )
      ]
    }
  );
}
function PathConfigHeader({ name, isOpen, setOpen }) {
  const [isEyeOpen, setEyeOpen] = reactExports.useState(false);
  const [, setPathVisibility] = usePathVisibility();
  const handleOpenOnClick = () => {
    setOpen((prev) => !prev);
  };
  const handleEyeOnClick = () => {
    setEyeOpen((eye) => {
      setPathVisibility(!eye);
      return !eye;
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex flex-row items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[20px]", children: name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-[10px] items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CopyPathButton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "cursor-pointer",
          onClick: handleEyeOnClick,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              className: "w-[20px] h-[22px]",
              src: isEyeOpen ? eyeClosed : eyeOpen
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleOpenOnClick,
          className: "hover:bg-medgray_hover px-1 py-1 rounded-sm",
          children: isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              className: `w-[15px] h-[15px] rotate-180`,
              src: downArrow
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              className: `w-[15px] h-[15px] rotate-0`,
              src: downArrow
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddSegmentButton, {})
    ] })
  ] });
}
const filterOn = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M16.6666%204.66673C16.6666%204.20002%2016.6663%203.96649%2016.5755%203.78823C16.4956%203.63143%2016.3686%203.50404%2016.2118%203.42414C16.0336%203.33331%2015.7997%203.33331%2015.333%203.33331H4.66632C4.19961%203.33331%203.96649%203.33331%203.78823%203.42414C3.63143%203.50404%203.50404%203.63143%203.42414%203.78823C3.33331%203.96649%203.33331%204.20002%203.33331%204.66673V5.28111C3.33331%205.48494%203.33331%205.58692%203.35634%205.68283C3.37675%205.76786%203.4105%205.84909%203.4562%205.92365C3.50771%206.00771%203.5799%206.0799%203.72394%206.22394L7.94289%2010.4429C8.087%2010.587%208.15868%2010.6586%208.21021%2010.7428C8.2559%2010.8173%208.29011%2010.8988%208.31053%2010.9839C8.33331%2011.0788%208.33331%2011.1796%208.33331%2011.3793V15.3425C8.33331%2016.0568%208.33331%2016.4142%208.48373%2016.6293C8.61515%2016.8171%208.81781%2016.9425%209.04456%2016.976C9.30423%2017.0143%209.6239%2016.8547%2010.2628%2016.5353L10.9295%2016.202C11.1971%2016.0682%2011.3305%2016.0011%2011.4282%2015.9012C11.5146%2015.813%2011.5808%2015.7071%2011.6211%2015.5903C11.6666%2015.4582%2011.6666%2015.3083%2011.6666%2015.0091V11.3855C11.6666%2011.1816%2011.6666%2011.0798%2011.6896%2010.9839C11.7101%2010.8988%2011.7438%2010.8173%2011.7896%2010.7428C11.8407%2010.6592%2011.9122%2010.5877%2012.0544%2010.4456L12.0573%2010.4429L16.2762%206.22394C16.4203%206.07981%2016.492%206.00775%2016.5436%205.92365C16.5892%205.84909%2016.6235%205.76786%2016.6439%205.68283C16.6666%205.5879%2016.6666%205.48701%2016.6666%205.28731V4.66673Z'%20stroke='white'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e";
const filterOff = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M10.8333%203.33331H15.3333C15.8001%203.33331%2016.0341%203.33331%2016.2123%203.42414C16.3691%203.50404%2016.4956%203.63143%2016.5755%203.78823C16.6663%203.96649%2016.6666%204.20002%2016.6666%204.66673V5.28731C16.6666%205.48701%2016.6666%205.5879%2016.6439%205.68283C16.6235%205.76786%2016.5893%205.84909%2016.5436%205.92365C16.4921%206.00774%2016.4202%206.07981%2016.2761%206.22394L15%207.50008M6.24965%203.33331H4.66632C4.19961%203.33331%203.96649%203.33331%203.78823%203.42414C3.63143%203.50404%203.50404%203.63143%203.42414%203.78823C3.33331%203.96649%203.33331%204.20002%203.33331%204.66673V5.28111C3.33331%205.48494%203.33331%205.58692%203.35634%205.68283C3.37675%205.76786%203.4105%205.84909%203.4562%205.92365C3.50771%206.00771%203.5799%206.0799%203.72394%206.22394L7.94289%2010.4429C8.087%2010.587%208.15868%2010.6586%208.21021%2010.7428C8.2559%2010.8173%208.29011%2010.8988%208.31053%2010.9839C8.33331%2011.0788%208.33331%2011.1796%208.33331%2011.3793V15.3425C8.33331%2016.0568%208.33331%2016.4142%208.48373%2016.6293C8.61515%2016.8171%208.81781%2016.9425%209.04456%2016.976C9.30423%2017.0143%209.6239%2016.8547%2010.2628%2016.5353L10.9295%2016.202C11.1971%2016.0682%2011.3305%2016.0011%2011.4282%2015.9012C11.5146%2015.813%2011.5808%2015.7071%2011.6211%2015.5902C11.6666%2015.4582%2011.6666%2015.3083%2011.6666%2015.0091V11.3855C11.6666%2011.1816%2011.6666%2011.0798%2011.6896%2010.9839C11.7101%2010.8988%2011.7438%2010.8174%2011.7896%2010.7429C11.8409%2010.6591%2011.9126%2010.5873%2012.0557%2010.4442L12.0573%2010.4428L12.9167%209.5834M12.9167%209.5834L4.16665%200.833313M12.9167%209.5834L15.8333%2012.5'%20stroke='white'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e";
function getGroupInsertMeta(segments, groupHeaderId, draggedId) {
  const headerIdx = segments.findIndex((s) => s.id === groupHeaderId);
  if (headerIdx === -1) return null;
  const groupSeg = segments[headerIdx];
  if (!groupSeg || groupSeg.kind !== "group") return null;
  const gid = groupSeg.groupId ?? groupSeg.id;
  const topInsertIndex = headerIdx + 1;
  let bottomInsertIndex = headerIdx + 1;
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i];
    if (s.id === draggedId) continue;
    if (s.groupId === gid && s.kind !== "group" && s.id !== groupHeaderId) {
      bottomInsertIndex = i + 1;
      break;
    }
  }
  return { gid, headerIdx, topInsertIndex, bottomInsertIndex };
}
const moveSegment = (setPath, fromId, toIndex, opts) => {
  if (!fromId) return;
  setPath((prev) => {
    const original = prev.segments;
    const fromIdx = original.findIndex((s) => s.id === fromId);
    if (fromIdx === -1) return prev;
    const draggedSeg = original[fromIdx];
    if (fromIdx === 0) return prev;
    if (draggedSeg.kind === "group" && toIndex === 0) return prev;
    if (fromIdx === toIndex) return prev;
    const dropTarget = toIndex >= 0 && toIndex < original.length ? original[toIndex] : null;
    const droppedOnGroupHeader = !opts?.skipGroupHandling && dropTarget?.kind === "group";
    const groupHeaderId = droppedOnGroupHeader ? dropTarget.id : null;
    const segments = [...original];
    const [rawSeg] = segments.splice(fromIdx, 1);
    if (!rawSeg) return prev;
    const seg = {
      ...rawSeg,
      pose: rawSeg.pose ? { ...rawSeg.pose } : rawSeg.pose
    };
    let insertIdx = toIndex;
    if (fromIdx < toIndex) {
      insertIdx = toIndex - 1;
    }
    if (insertIdx < 1) insertIdx = 1;
    if (insertIdx > segments.length) insertIdx = segments.length;
    if (seg.kind !== "group") {
      if (opts?.skipGroupHandling) {
        seg.groupId = void 0;
      } else if (groupHeaderId) {
        const meta = getGroupInsertMeta(segments, groupHeaderId, fromId);
        if (meta) {
          seg.groupId = meta.gid;
          const mode = opts?.headerDrop ?? "bottom";
          if (mode === "top") {
            insertIdx = meta.topInsertIndex;
          } else {
            insertIdx = meta.bottomInsertIndex;
          }
        }
      } else if (opts?.targetGroupId) {
        seg.groupId = opts.targetGroupId;
      } else if (dropTarget?.groupId != null && dropTarget?.kind !== "group") {
        seg.groupId = dropTarget.groupId;
      } else {
        seg.groupId = void 0;
      }
    }
    if (insertIdx < 1) insertIdx = 1;
    if (insertIdx > segments.length) insertIdx = segments.length;
    segments.splice(insertIdx, 0, seg);
    const next = { ...prev, segments };
    AddToUndoHistory({ path: next });
    return next;
  });
};
const moveMultipleSegments = (setPath, fromIds, toIndex, opts) => {
  if (!fromIds || fromIds.length === 0) return;
  if (fromIds.length === 1) {
    moveSegment(setPath, fromIds[0], toIndex, opts);
    return;
  }
  setPath((prev) => {
    const original = prev.segments;
    const fromIndices = fromIds.map((id) => original.findIndex((s) => s.id === id));
    if (fromIndices.some((idx) => idx === -1)) return prev;
    if (fromIndices.some((idx) => idx === 0)) return prev;
    const sortedIndices = [...fromIndices].sort((a, b) => a - b);
    const hasGroup = sortedIndices.some((idx) => original[idx].kind === "group");
    if (hasGroup && toIndex === 0) return prev;
    const fromIdSet = new Set(fromIds);
    const dropTarget = toIndex >= 0 && toIndex < original.length ? original[toIndex] : null;
    if (dropTarget && fromIdSet.has(dropTarget.id)) return prev;
    const droppedOnGroupHeader = !opts?.skipGroupHandling && dropTarget?.kind === "group";
    const groupHeaderId = droppedOnGroupHeader ? dropTarget.id : null;
    const segmentsToMove = sortedIndices.map((idx) => {
      const rawSeg = original[idx];
      return {
        ...rawSeg,
        pose: rawSeg.pose ? { ...rawSeg.pose } : rawSeg.pose
      };
    });
    const segments = original.filter((s) => !fromIdSet.has(s.id));
    let insertIdx = toIndex;
    const removedBefore = sortedIndices.filter((idx) => idx < toIndex).length;
    insertIdx -= removedBefore;
    if (insertIdx < 1) insertIdx = 1;
    if (insertIdx > segments.length) insertIdx = segments.length;
    segmentsToMove.forEach((seg) => {
      if (seg.kind !== "group") {
        if (opts?.skipGroupHandling) {
          seg.groupId = void 0;
        } else if (groupHeaderId) {
          const meta = getGroupInsertMeta(segments, groupHeaderId, null);
          if (meta) {
            seg.groupId = meta.gid;
          }
        } else if (opts?.targetGroupId) {
          seg.groupId = opts.targetGroupId;
        } else if (dropTarget?.groupId != null && dropTarget?.kind !== "group") {
          seg.groupId = dropTarget.groupId;
        } else {
          seg.groupId = void 0;
        }
      }
    });
    if (groupHeaderId) {
      const meta = getGroupInsertMeta(segments, groupHeaderId, null);
      if (meta) {
        const mode = opts?.headerDrop ?? "bottom";
        if (mode === "top") {
          insertIdx = meta.topInsertIndex;
        } else {
          insertIdx = meta.bottomInsertIndex;
        }
      }
    }
    if (insertIdx < 1) insertIdx = 1;
    if (insertIdx > segments.length) insertIdx = segments.length;
    segments.splice(insertIdx, 0, ...segmentsToMove);
    const next = { ...prev, segments };
    AddToUndoHistory({ path: next });
    return next;
  });
};
const useSimulateGroup = createSharedState([]);
function GroupList({
  name,
  segmentId,
  isOpenGlobal,
  draggable = false,
  onDragStart,
  onDragEnd,
  setDraggingIds,
  draggingIds = [],
  headerDropZone = null,
  onHeaderDropZoneChange
}) {
  const [path, setPath] = usePath();
  const [format] = useFormat();
  const [, setSimulatedGroups] = useSimulateGroup();
  const segment = path.segments.find((s) => s.id === segmentId);
  const inputRef = reactExports.useRef(null);
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [value, setValue] = reactExports.useState(name);
  const setGlobalDraggingIds = setDraggingIds ?? (() => {
  });
  const [localOverIndex, setLocalOverIndex] = reactExports.useState(null);
  const startChildDragging = (childId) => {
    const child = path.segments.find((s) => s.id === childId);
    if (child?.selected) {
      const selectedIds = path.segments.filter((s, idx) => s.selected && idx > 0).map((s) => s.id);
      setGlobalDraggingIds(selectedIds.length > 0 ? selectedIds : [childId]);
    } else {
      setGlobalDraggingIds([childId]);
    }
  };
  const groupKey = segment.groupId ?? segment.id;
  const indexById = new Map(path.segments.map((s, i) => [s.id, i]));
  const children = path.segments.filter(
    (s) => s.groupId === groupKey && s.kind !== "group"
  );
  const hasSelectedChildren = children.some((c) => c.selected);
  const [isFiltered, setIsFiltered] = reactExports.useState(false);
  const [isEyeOpen, setEyeOpen] = reactExports.useState(true);
  const [isLocked, setLocked] = reactExports.useState(false);
  const [isOpen, setOpen] = reactExports.useState(false);
  const pathRef = reactExports.useRef(path);
  pathRef.current = path;
  const headerRef = reactExports.useRef(null);
  const dropHandledRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (draggingIds.length > 0) {
      dropHandledRef.current = false;
    }
  }, [draggingIds]);
  reactExports.useEffect(() => {
    setOpen(isOpenGlobal);
  }, [isOpenGlobal]);
  const toggleSegment = (patch, addToHistory = true) => {
    setPath((prev) => {
      const next = {
        ...prev,
        segments: prev.segments.map((s) => s.groupId === groupKey ? patch(s) : s)
      };
      if (addToHistory) AddToUndoHistory({ path: next });
      return next;
    });
  };
  const handleOnClick = (evt) => {
    setPath((prev) => {
      const selectedState = segment.selected;
      const next = {
        ...prev,
        segments: prev.segments.map((s) => s.groupId === groupKey || s.id === segmentId ? { ...s, selected: !selectedState } : { ...s, selected: false })
      };
      return next;
    });
    evt.preventDefault();
    evt.stopPropagation();
  };
  const handleFilterOnClick = (evt) => {
    setIsFiltered((prev) => {
      const newState = !prev;
      setSimulatedGroups((prevGroups) => {
        if (newState) {
          return prevGroups.includes(groupKey) ? prevGroups : [...prevGroups, groupKey];
        } else {
          return prevGroups.filter((id) => id !== groupKey);
        }
      });
      return newState;
    });
    evt.stopPropagation();
  };
  const handleEyeOnClick = (evt) => {
    toggleSegment((s) => ({ ...s, visible: !segment.visible }));
    evt.stopPropagation();
  };
  const handleLockOnClick = (evt) => {
    toggleSegment((s) => ({ ...s, locked: !segment.locked }));
    evt.stopPropagation();
  };
  const handleGroupOnHoverStart = (evt) => {
    toggleSegment((s) => ({ ...s, hovered: true }), false);
    evt.stopPropagation();
  };
  const handleGroupOnHoverEnd = (evt) => {
    toggleSegment((s) => ({ ...s, hovered: false }), false);
    evt.stopPropagation();
  };
  const handleDropDownOnClick = (evt) => {
    setOpen((prev) => !prev);
    evt.stopPropagation();
  };
  reactExports.useEffect(() => {
    setEyeOpen(segment.visible);
  }, [segment.visible]);
  reactExports.useEffect(() => {
    setLocked(segment.locked);
  }, [segment.locked]);
  const getSpeed = (format2) => {
    switch (format2) {
      case "mikLib":
        return 12;
      case "ReveilLib":
        return 1;
      case "JAR-Template":
        return 12;
      case "LemLib":
        return 127;
    }
  };
  const speedScale = getSpeed(format);
  reactExports.useEffect(() => {
    if (draggingIds.length === 0) {
      setLocalOverIndex(null);
    }
  }, [draggingIds]);
  const getDropZone = (e) => {
    if (!headerRef.current) return null;
    const rect = headerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    if (y < height * 0.33) return "above";
    if (y > height * 0.66) return "below";
    return "into";
  };
  const handleHeaderDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingIds.includes(segmentId)) return;
    const zone = getDropZone(e);
    if (onHeaderDropZoneChange) {
      onHeaderDropZoneChange(zone);
    }
  };
  const handleHeaderDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingIds.includes(segmentId)) return;
    const zone = getDropZone(e);
    if (onHeaderDropZoneChange) {
      onHeaderDropZoneChange(zone);
    }
  };
  const handleHeaderDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingIds.length === 0 || draggingIds.includes(segmentId)) return;
    dropHandledRef.current = true;
    const zone = getDropZone(e);
    const headerGlobalIdx = path.segments.findIndex((s) => s.id === segmentId);
    if (headerGlobalIdx === -1) return;
    const currentDraggingIds = [...draggingIds];
    setGlobalDraggingIds([]);
    if (onHeaderDropZoneChange) {
      onHeaderDropZoneChange(null);
    }
    if (zone === "above") {
      moveMultipleSegments(setPath, currentDraggingIds, headerGlobalIdx, { skipGroupHandling: true });
    } else if (zone === "into" || zone === "below") {
      moveMultipleSegments(setPath, currentDraggingIds, headerGlobalIdx, { headerDrop: "bottom" });
    }
  };
  const handleHeaderDragLeave = (e) => {
    e.stopPropagation();
    const rect = headerRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        if (onHeaderDropZoneChange) {
          onHeaderDropZoneChange(null);
        }
      }
    }
  };
  const isHoveringInto = draggingIds.length > 0 && !draggingIds.includes(segmentId) && (headerDropZone === "into" || headerDropZone === "below" || localOverIndex !== null);
  const handleContainerDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingIds.length === 0 || draggingIds.includes(segmentId)) return;
    dropHandledRef.current = true;
    const headerGlobalIdx = path.segments.findIndex((s) => s.id === segmentId);
    if (headerGlobalIdx === -1) return;
    const currentDraggingIds = [...draggingIds];
    const currentZone = headerDropZone;
    const currentLocalOverIndex = localOverIndex;
    setGlobalDraggingIds([]);
    setLocalOverIndex(null);
    if (onHeaderDropZoneChange) {
      onHeaderDropZoneChange(null);
    }
    if (currentLocalOverIndex !== null) {
      if (currentLocalOverIndex === children.length) {
        moveMultipleSegments(setPath, currentDraggingIds, headerGlobalIdx, { headerDrop: "bottom" });
      } else {
        const targetChild = children[currentLocalOverIndex];
        if (targetChild) {
          const targetGlobalIdx = indexById.get(targetChild.id) ?? -1;
          if (targetGlobalIdx !== -1) {
            moveMultipleSegments(setPath, currentDraggingIds, targetGlobalIdx, { targetGroupId: groupKey });
          }
        }
      }
      return;
    }
    if (currentZone === "above") {
      moveMultipleSegments(setPath, currentDraggingIds, headerGlobalIdx, { skipGroupHandling: true });
    } else if (currentZone === "into" || currentZone === "below") {
      moveMultipleSegments(setPath, currentDraggingIds, headerGlobalIdx, { headerDrop: "bottom" });
    }
  };
  const handleContainerDragOver = (e) => {
    if (headerDropZone !== null || localOverIndex !== null) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  reactExports.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `flex flex-col gap-2 mt-[1px] relative`,
      onDragOver: handleContainerDragOver,
      onDrop: handleContainerDrop,
      onDragLeave: (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const { clientX, clientY } = e;
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
          setLocalOverIndex(null);
        }
      },
      children: [
        headerDropZone === "above" && draggingIds.length > 0 && !draggingIds.includes(segmentId) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 left-0 w-[450px] h-[1px] bg-white rounded-full pointer-events-none z-10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            ref: headerRef,
            draggable,
            onDragStart: (e) => {
              if (e.dataTransfer) {
                e.dataTransfer.setData("text/plain", segmentId);
                e.dataTransfer.effectAllowed = "move";
                const emptyImg = new Image();
                emptyImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                e.dataTransfer.setDragImage(emptyImg, 0, 0);
              }
              if (onDragStart) onDragStart(e);
            },
            onDragEnd: (e) => {
              if (onDragEnd) onDragEnd(e);
              setLocalOverIndex(null);
              if (onHeaderDropZoneChange) onHeaderDropZoneChange(null);
            },
            onDragOver: handleHeaderDragOver,
            onDragEnter: handleHeaderDragEnter,
            onDrop: handleHeaderDrop,
            onDragLeave: handleHeaderDragLeave,
            onClick: (evt) => {
              if (isEditing) return;
              handleOnClick(evt);
            },
            onMouseEnter: handleGroupOnHoverStart,
            onMouseLeave: handleGroupOnHoverEnd,
            className: `${isHoveringInto ? "bg-medlightgray brightness-125" : segment.selected ? "bg-medlightgray" : "bg-medgray"}
                    flex flex-row justify-start items-center
                    w-[450px] h-[35px] gap-[12px]
                    hover:brightness-95
                    rounded-lg pl-4 pr-4
                    transition-all duration-100
                    active:scale-[0.995]
                    
                    ${(hasSelectedChildren || isOpen) && !segment.selected && !isHoveringInto ? "border-2 border-medlightgray" : "border-2 border-transparent"}
                    ${draggingIds.includes(segmentId) ? "opacity-10" : ""}
                `,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleDropDownOnClick,
                  className: "cursor-pointer shrink-0",
                  children: !isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[15px] h-[15px] rotate-270", src: downArrow }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[15px] h-[15px]", src: downArrow })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  onPointerDownCapture: (e) => {
                    if (isEditing) e.stopPropagation();
                  },
                  onPointerMoveCapture: (e) => {
                    if (isEditing) e.stopPropagation();
                  },
                  ref: inputRef,
                  value,
                  style: { maxWidth: "280px" },
                  readOnly: !isEditing,
                  onDoubleClick: (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsEditing(true);
                    setTimeout(() => {
                      inputRef.current?.focus();
                      inputRef.current?.select();
                    }, 0);
                  },
                  onClick: (e) => {
                    if (isEditing) {
                      e.stopPropagation();
                    } else {
                      e.preventDefault();
                    }
                  },
                  onBlur: () => {
                    setIsEditing(false);
                    setPath((prev) => ({ ...prev, segments: prev.segments.map(
                      (s) => s.id === segmentId ? { ...s, constants: value } : s
                    ) }));
                  },
                  onChange: (e) => {
                    e.stopPropagation();
                    setValue(e.target.value);
                  },
                  onKeyDown: (e) => {
                    if (isEditing) e.stopPropagation();
                    if (e.key === "Enter") {
                      inputRef.current?.blur();
                    }
                    if (e.key === "Escape") {
                      setValue(name);
                      inputRef.current?.blur();
                    }
                  },
                  onMouseDown: (e) => {
                    if (isEditing) e.stopPropagation();
                  },
                  name,
                  size: Math.max(value?.length, 1),
                  className: `items-center text-[17px] shrink-0 text-left truncate max-w-[280px]
                    outline-none px-1 transition-colors border-none rounded-sm
                    
                    ${isEditing ? "bg-blackgrayhover cursor-text" : "bg-transparent cursor-default"}`
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row w-full gap-2 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "cursor-pointer shrink-0 justify-end", onClick: handleFilterOnClick, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[20px] h-[20px]", src: isFiltered ? filterOn : filterOff }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "cursor-pointer shrink-0 justify-end", onClick: handleEyeOnClick, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[20px] h-[20px]", src: isEyeOpen ? eyeOpen : eyeClosed }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "cursor-pointer shrink-0 justify-end", onClick: handleLockOnClick, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[20px] h-[20px]", src: isLocked ? lockClose : lockOpen }) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `relative flex flex-col ml-9 gap-2 transition-all ${isOpen ? "block" : "hidden"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-[-16px] top-0 h-full w-[4px] rounded-full bg-medlightgray" }),
              children.map((c, localIdx) => {
                const constantsFields = getFormatConstantsConfig(format, path, setPath, c.id);
                const directionFields = getFormatDirectionConfig(format, path, setPath, c.id);
                const globalIdx = indexById.get(c.id) ?? -1;
                if (globalIdx === -1) return null;
                const isDraggingThis = draggingIds.includes(c.id);
                const showDropZone = localOverIndex === localIdx && draggingIds.length > 0 && !isDraggingThis;
                const isLastChild = localIdx === children.length - 1;
                const showBottomDropZone = isLastChild && localOverIndex === children.length && draggingIds.length > 0 && !isDraggingThis;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "w-full relative",
                    onDragOver: (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isDraggingThis) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        if (y < rect.height / 2) {
                          setLocalOverIndex(localIdx);
                        } else if (isLastChild) {
                          setLocalOverIndex(children.length);
                        } else {
                          setLocalOverIndex(localIdx + 1);
                        }
                      }
                    },
                    onDragEnter: (e) => {
                      e.stopPropagation();
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "absolute -top-2 left-0 w-full h-2 z-20",
                          onDragOver: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isDraggingThis) {
                              setLocalOverIndex(localIdx);
                            }
                          }
                        }
                      ),
                      showDropZone && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 left-2 w-[390px] h-[1px] bg-white rounded-full pointer-events-none z-10" }),
                      (c.kind === "pointDrive" || c.kind === "poseDrive") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        MotionList,
                        {
                          name: "Drive",
                          speedScale,
                          field: constantsFields,
                          directionField: directionFields,
                          segmentId: c.id,
                          isOpenGlobal,
                          draggable: true,
                          onDragStart: () => startChildDragging(c.id),
                          onDragEnd: () => {
                            setGlobalDraggingIds([]);
                            setLocalOverIndex(null);
                          },
                          draggingIds,
                          shrink: true
                        }
                      ),
                      (c.kind === "angleTurn" || c.kind === "pointTurn") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        MotionList,
                        {
                          name: "Turn",
                          speedScale,
                          field: constantsFields,
                          directionField: directionFields,
                          segmentId: c.id,
                          isOpenGlobal,
                          draggable: true,
                          onDragStart: () => startChildDragging(c.id),
                          onDragEnd: () => {
                            setGlobalDraggingIds([]);
                            setLocalOverIndex(null);
                          },
                          draggingIds,
                          shrink: true
                        }
                      ),
                      (c.kind === "pointSwing" || c.kind === "angleSwing") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        MotionList,
                        {
                          name: "Swing",
                          speedScale,
                          field: constantsFields,
                          directionField: directionFields,
                          segmentId: c.id,
                          isOpenGlobal,
                          draggable: true,
                          onDragStart: () => startChildDragging(c.id),
                          onDragEnd: () => {
                            setGlobalDraggingIds([]);
                            setLocalOverIndex(null);
                          },
                          draggingIds,
                          shrink: true
                        }
                      ),
                      showBottomDropZone && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 left-2 w-[390px] h-[1px] bg-white rounded-full pointer-events-none z-10" })
                    ]
                  },
                  c.id
                );
              })
            ]
          }
        )
      ]
    }
  );
}
function PathConfig() {
  const [path, setPath] = usePath();
  const [draggingIds, setDraggingIds] = reactExports.useState([]);
  const [overIndex, setOverIndex] = reactExports.useState(null);
  const [isOpen, setOpen] = reactExports.useState(false);
  const [format] = useFormat();
  const [activeGroupDropZone, setActiveGroupDropZone] = reactExports.useState(null);
  const [, forceUpdate] = reactExports.useState({});
  reactExports.useEffect(() => {
    const unsubscribe = globalDefaultsStore.subscribe(() => {
      forceUpdate({});
    });
    return () => unsubscribe();
  }, []);
  reactExports.useEffect(() => {
    if (draggingIds.length === 0) {
      setActiveGroupDropZone(null);
    }
  }, [draggingIds]);
  const startDragging = (segmentId) => {
    const segment = path.segments.find((s) => s.id === segmentId);
    if (segment?.selected) {
      const selectedIds = path.segments.filter((s, idx) => s.selected && idx > 0).map((s) => s.id);
      setDraggingIds(selectedIds.length > 0 ? selectedIds : [segmentId]);
    } else {
      setDraggingIds([segmentId]);
    }
  };
  const stopDragging = () => {
    setDraggingIds([]);
    setOverIndex(null);
    setActiveGroupDropZone(null);
  };
  const speedScale = getFormatSpeed(format);
  const name = getFormatPathName(format);
  const handleGroupDropZoneChange = (groupId) => (zone) => {
    if (zone === null) {
      setActiveGroupDropZone(null);
    } else {
      setActiveGroupDropZone({ groupId, zone });
      setOverIndex(null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-medgray w-[500px] h-[650px] rounded-lg p-[15px] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PathConfigHeader, { name, isOpen, setOpen }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "mt-[10px] flex-1 min-h-2 overflow-y-auto\r\n        flex-col items-center overflow-x-hidden space-y-2 relative",
        onDrop: (e) => {
          if (draggingIds.length === 0) return;
          if (overIndex !== null && overIndex > 0) {
            e.preventDefault();
            moveMultipleSegments(setPath, draggingIds, overIndex);
            stopDragging();
          }
        },
        onDragOver: (e) => {
          if (overIndex !== null) {
            e.preventDefault();
          }
        },
        children: [
          path.segments.map((c, idx) => {
            const constantsFields = getFormatConstantsConfig(format, path, setPath, c.id);
            const directionFields = getFormatDirectionConfig(format, path, setPath, c.id);
            const isGroup = c.kind === "group";
            const groupDropZone = isGroup && activeGroupDropZone?.groupId === c.id ? activeGroupDropZone.zone : null;
            const showNormalDropIndicator = overIndex === idx && draggingIds.length > 0 && !isGroup && idx > 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "w-full relative",
                onDragOver: (e) => {
                  if (e.defaultPrevented) return;
                  if (activeGroupDropZone !== null) return;
                  e.preventDefault();
                  setOverIndex(idx);
                },
                children: [
                  idx > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "absolute -top-2 left-0 w-full h-2 z-20",
                      onDragOver: (e) => {
                        if (activeGroupDropZone !== null) return;
                        e.preventDefault();
                        e.stopPropagation();
                        setOverIndex(idx);
                      }
                    }
                  ),
                  showNormalDropIndicator && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 left-2 w-[435px] h-[1px] bg-white rounded-full pointer-events-none z-10" }),
                  idx > 0 && isGroup && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    GroupList,
                    {
                      name: c.constants,
                      segmentId: c.id,
                      isOpenGlobal: isOpen,
                      draggable: true,
                      onDragStart: () => startDragging(c.id),
                      onDragEnd: stopDragging,
                      onDragEnter: () => setOverIndex(idx),
                      setDraggingIds,
                      draggingIds,
                      headerDropZone: groupDropZone,
                      onHeaderDropZoneChange: handleGroupDropZoneChange(c.id)
                    }
                  ),
                  idx > 0 && ((c.kind === "pointDrive" || c.kind === "poseDrive") && c.groupId == void 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MotionList,
                    {
                      name: "Drive",
                      speedScale,
                      field: constantsFields,
                      directionField: directionFields,
                      segmentId: c.id,
                      isOpenGlobal: isOpen,
                      draggable: true,
                      onDragStart: () => startDragging(c.id),
                      onDragEnd: stopDragging,
                      onDragEnter: () => setOverIndex(idx),
                      draggingIds
                    }
                  ),
                  idx > 0 && ((c.kind === "angleTurn" || c.kind === "pointTurn") && c.groupId == void 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MotionList,
                    {
                      name: "Turn",
                      speedScale,
                      field: constantsFields,
                      directionField: directionFields,
                      segmentId: c.id,
                      isOpenGlobal: isOpen,
                      draggable: true,
                      onDragStart: () => startDragging(c.id),
                      onDragEnd: stopDragging,
                      onDragEnter: () => setOverIndex(idx),
                      draggingIds
                    }
                  ),
                  idx > 0 && ((c.kind === "pointSwing" || c.kind === "angleSwing") && c.groupId == void 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MotionList,
                    {
                      name: "Swing",
                      speedScale,
                      field: constantsFields,
                      directionField: directionFields,
                      segmentId: c.id,
                      isOpenGlobal: isOpen,
                      draggable: true,
                      onDragStart: () => startDragging(c.id),
                      onDragEnd: stopDragging,
                      onDragEnter: () => setOverIndex(idx),
                      draggingIds
                    }
                  ),
                  idx === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MotionList,
                    {
                      name: "Start",
                      speedScale,
                      field: [],
                      directionField: [],
                      segmentId: c.id,
                      isOpenGlobal: isOpen,
                      start: true,
                      draggable: false,
                      draggingIds
                    }
                  )
                ]
              },
              c.id
            );
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-full relative h-4",
              onDragOver: (e) => {
                if (e.defaultPrevented) return;
                e.preventDefault();
                setOverIndex(path.segments.length);
              },
              onDrop: (e) => {
                if (e.defaultPrevented) return;
                e.preventDefault();
                moveMultipleSegments(setPath, draggingIds, path.segments.length);
                stopDragging();
              },
              children: overIndex === path.segments.length && draggingIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 left-2 w-[435px] h-[1px] bg-white rounded-full pointer-events-none z-10" })
            }
          )
        ]
      }
    )
  ] });
}
const play = "data:image/svg+xml,%3csvg%20width='16'%20height='16'%20viewBox='0%20-3%2016%2025'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M16.5%207.3346C18.5%208.4893%2018.5%2011.3761%2016.5%2012.5308L4.5%2019.459C2.5%2020.6137%200%2019.1703%200%2016.8609L0%203.00447C0%200.695072%202.5%20-0.748302%204.5%200.406399L16.5%207.3346Z'%20fill='%23DBDBDB'/%3e%3c/svg%3e";
const pause = "data:image/svg+xml,%3csvg%20width='28'%20height='28'%20viewBox='0%200%2028%2028'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M6.0235%204.4555C5.83334%204.82883%205.83334%205.31883%205.83334%206.3V21.7C5.83334%2022.68%205.83334%2023.17%206.0235%2023.5445C6.19153%2023.8736%206.45944%2024.1411%206.78884%2024.3087C7.16217%2024.5%207.65217%2024.5%208.63334%2024.5H8.86667C9.84667%2024.5%2010.3367%2024.5%2010.7112%2024.3098C11.0407%2024.142%2011.3087%2023.8741%2011.4765%2023.5445C11.6667%2023.1712%2011.6667%2022.6812%2011.6667%2021.7V6.3C11.6667%205.32%2011.6667%204.83%2011.4765%204.4555C11.3087%204.12593%2011.0407%203.858%2010.7112%203.69017C10.3378%203.5%209.84784%203.5%208.86667%203.5H8.63334C7.65334%203.5%207.16334%203.5%206.78884%203.69017C6.45926%203.858%206.19133%204.12593%206.0235%204.4555ZM16.5235%204.4555C16.3333%204.82883%2016.3333%205.31883%2016.3333%206.3V21.7C16.3333%2022.68%2016.3333%2023.17%2016.5247%2023.5445C16.6924%2023.8735%2016.9599%2024.1409%2017.2888%2024.3087C17.6622%2024.5%2018.1522%2024.5%2019.1333%2024.5H19.3667C20.3467%2024.5%2020.8367%2024.5%2021.2112%2024.3098C21.5403%2024.1418%2021.8078%2023.8739%2021.9753%2023.5445C22.1667%2023.1712%2022.1667%2022.6812%2022.1667%2021.7V6.3C22.1667%205.32%2022.1667%204.83%2021.9765%204.4555C21.8087%204.12593%2021.5407%203.858%2021.2112%203.69017C20.8378%203.5%2020.3478%203.5%2019.3667%203.5H19.1333C18.1533%203.5%2017.6633%203.5%2017.2888%203.69017C16.9597%203.85819%2016.691%204.1261%2016.5235%204.4555Z'%20fill='%23DBDBDB'/%3e%3c/svg%3e";
const usePose = createSharedState(null);
const useRobotVisibility = createSharedState(false);
const checkedBox = "data:image/svg+xml,%3csvg%20width='22'%20height='22'%20viewBox='0%200%2022%2022'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M3%201H19C20.1046%201%2021%201.89543%2021%203V19C21%2020.1046%2020.1046%2021%2019%2021H3C1.89543%2021%201%2020.1046%201%2019V3C1%201.89543%201.89543%201%203%201Z'%20fill='%23848484'%20stroke='%23848484'%20stroke-width='2'/%3e%3cpath%20d='M4.5%2012.5L9.16752%2016.7432C9.61058%2017.146%2010.3059%2017.0717%2010.6539%2016.5845L17.5%207'%20stroke='white'%20stroke-width='2'%20stroke-linecap='round'/%3e%3c/svg%3e";
const uncheckedBox = "data:image/svg+xml,%3csvg%20width='22'%20height='22'%20viewBox='0%200%2022%2022'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M3%201H19C20.1046%201%2021%201.89543%2021%203V19C21%2020.1046%2020.1046%2021%2019%2021H3C1.89543%2021%201%2020.1046%201%2019V3C1%201.89543%201.89543%201%203%201Z'%20stroke='%23848484'%20stroke-width='2'/%3e%3c/svg%3e";
function Checkbox({
  checked,
  setChecked
}) {
  const handleMouseDown = () => {
    setChecked(!checked);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("g", { onMouseDown: handleMouseDown, className: "hover:cursor-pointer", children: checked ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: checkedBox }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: uncheckedBox }) });
}
function PathSimMacros() {
  function toggleRobotVisibility(evt, setVisibility) {
    if (evt.key.toLowerCase() === "r" && !evt.ctrlKey) {
      setVisibility((v) => !v);
    }
  }
  const pauseSimulator = (evt, setPlaying, setVisibility) => {
    if (evt.key.toLowerCase() === "k") {
      setPlaying((v) => {
        const newState = !v;
        if (newState) {
          setVisibility(true);
        }
        return newState;
      });
      evt.stopPropagation();
    }
  };
  const scrubSimulator = (evt, setPercent, setPlaying, setVisibility, skip, computedPath, smallStep, largeStep) => {
    const FAST_SCRUB_STEP = largeStep;
    const SLOW_SCRUB_STEP = smallStep;
    const scrub = evt.shiftKey ? FAST_SCRUB_STEP / computedPath.totalTime * 100 : SLOW_SCRUB_STEP / computedPath.totalTime * 100;
    if (evt.key.toLowerCase() === "l") {
      setVisibility(true);
      setPercent((p) => {
        if (p + scrub <= 100) {
          return p + scrub;
        }
        return 100;
      });
      setPlaying(false);
      skip.current = false;
    }
    if (evt.key.toLowerCase() === "j") {
      setVisibility(true);
      setPercent((p) => {
        if (p - scrub >= 0) {
          return p - scrub;
        }
        return 0;
      });
      setPlaying(false);
      skip.current = false;
    }
  };
  return {
    toggleRobotVisibility,
    pauseSimulator,
    scrubSimulator
  };
}
const useRobotPose = createSharedState([]);
const savedGhostRobot = localStorage.getItem("ghostRobots");
const initialGhostRobots = savedGhostRobot === null ? true : savedGhostRobot === "true";
const savedRobotPosition = localStorage.getItem("robotPosition");
const initialRobotsPosition = savedRobotPosition === null ? false : savedRobotPosition === "true";
const savedPrecisePath = localStorage.getItem("precisePath");
const initialPrecisePath = savedPrecisePath === null ? false : savedPrecisePath === "true";
const useSettings = createSharedState({
  ghostRobots: initialGhostRobots,
  robotPosition: initialRobotsPosition,
  precisePath: initialPrecisePath
});
function createRobot() {
  const { width, height, speed, accel } = robotConstantsStore.getState();
  return new Robot(
    0,
    // Start x
    0,
    // Start y
    0,
    // Start angle
    width,
    // Width (inches)
    height,
    // Height (inches)
    speed,
    // Speed (ft/s)
    width,
    // Track Width (inches)
    accel,
    // Max Accel (ft/s^2)
    accel
    // Max Decel (ft/s^2)
  );
}
function PathSimulator() {
  const [value, setValue] = reactExports.useState(0);
  const [time, setTime] = reactExports.useState(0);
  const [pose, setPose] = usePose();
  const [, setRobotPose] = useRobotPose();
  const robotk = robotConstantsStore.useStore();
  const [playing, setPlaying] = reactExports.useState(false);
  const [robotVisible, setRobotVisibility] = useRobotVisibility();
  const [path] = usePath();
  const [format] = useFormat();
  const skip = reactExports.useRef(false);
  const [settings] = useSettings();
  const changes = undoHistory.useStore();
  const computedPath = computedPathStore.useStore();
  const [simulatedGroups] = useSimulateGroup();
  const { pauseSimulator, scrubSimulator } = PathSimMacros();
  const cullSimulatedPath = (sim) => {
    if (!simulatedGroups?.length) return sim;
    const indices = [];
    path.segments.filter((prev) => prev.kind !== "group")?.forEach((seg, i) => {
      if (seg.groupId && simulatedGroups.includes(seg.groupId)) indices.push(i);
    });
    if (indices.length === 0) return sim;
    const culledSegments = indices.map((i) => sim.segmentTrajectorys[i]).filter(Boolean);
    const culledEnds = indices.map((i) => sim.endTrajectory[i]).filter(Boolean);
    const culledTrajectory = culledSegments.flat();
    const timeOffset = culledTrajectory.length > 0 ? culledTrajectory[0].t : 0;
    const rebasedTrajectory = culledTrajectory.map((snap) => ({
      ...snap,
      t: snap.t - timeOffset
    }));
    const totalTime = rebasedTrajectory.length > 0 ? rebasedTrajectory[rebasedTrajectory.length - 1].t : 0;
    return {
      totalTime,
      trajectory: rebasedTrajectory,
      endTrajectory: culledEnds,
      segmentTrajectorys: sim.segmentTrajectorys
    };
  };
  reactExports.useEffect(() => {
    if (path.segments.length === 0) {
      computedPathStore.setState(precomputePath(createRobot(), convertPathToSim(path, format)));
      setRobotPose(computedPath.endTrajectory);
      setPlaying(false);
      setTime(0);
      setValue(0);
      setRobotVisibility(false);
      setPose({ x: 0, y: 0, angle: 0 });
      return;
    }
    const fullSim = precomputePath(createRobot(), convertPathToSim(path, format));
    const pathSim = cullSimulatedPath(fullSim);
    computedPathStore.setState(pathSim);
    setRobotPose(computedPath.endTrajectory);
    if (!robotVisible) {
      setPlaying(false);
      return;
    }
    if (!computedPath.trajectory.length || computedPath.totalTime <= 0) return;
    const clampedTime = clamp(time, 0, computedPath.totalTime);
    if (clampedTime !== time) setTime(clampedTime);
    if (robotVisible) forceSnapTime(computedPath, clampedTime);
    setValue(clampedTime / computedPath.totalTime * 100);
  }, [changes.length, path, robotk, robotVisible]);
  reactExports.useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    if (!playing) {
      setPathPercent(computedPath, value);
    }
  }, [value]);
  reactExports.useEffect(() => {
    skip.current = true;
  }, [path]);
  reactExports.useEffect(() => {
    const handleKeyDown = (evt) => {
      const target = evt.target;
      if (target?.isContentEditable || target?.tagName === "INPUT") return;
      pauseSimulator(evt, setPlaying, setRobotVisibility);
      scrubSimulator(evt, setValue, setPlaying, setRobotVisibility, skip, computedPath, 1 / 60, 0.25);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [computedPath]);
  const setPathPercent = (path2, percent) => {
    if (!path2.trajectory.length) return;
    percent = clamp(percent, 0, 100) / 100;
    const idx = Math.floor(percent * (path2.trajectory.length - 1));
    const snap = path2.trajectory[idx];
    setTime(snap.t);
    setPose({ x: snap.x, y: snap.y, angle: snap.angle });
  };
  const forceSnapTime = (path2, t) => {
    if (!path2.trajectory.length) return;
    const percent = t / path2.totalTime;
    const idx = Math.floor(percent * (path2.trajectory.length - 1));
    try {
      const snap = path2.trajectory[idx];
      setPose({ x: snap.x, y: snap.y, angle: snap.angle });
    } catch {
      return;
    }
  };
  const setPathTime = (path2, t) => {
    if (!path2.trajectory.length) return;
    t = clamp(t, 0, path2.totalTime);
    const percent = t / path2.totalTime;
    setValue(percent * 100);
    const idx = Math.floor(percent * (path2.trajectory.length - 1));
    const snap = path2.trajectory[idx];
    setPose({ x: snap.x, y: snap.y, angle: snap.angle });
  };
  reactExports.useEffect(() => {
    const dt = 1 / 60;
    if (playing) {
      setTime((prev) => prev + dt >= computedPath.totalTime ? 0 : prev);
    }
    if (!playing) return;
    let last = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const dtSec = (now - last) / 1e3;
      last = now;
      setTime((prevTime) => {
        const nextTime = prevTime + dtSec;
        const clamped = Math.min(nextTime, computedPath.totalTime);
        setPathTime(computedPath, clamped);
        if (clamped >= computedPath.totalTime) {
          clearInterval(interval);
          setPlaying(false);
        }
        return clamped;
      });
    }, 1e3 / 60);
    return () => clearInterval(interval);
  }, [playing]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex bg-medgray w-[575px]  h-[65px] rounded-lg \r\n            items-center justify-center gap-4 relative",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setPlaying((p) => {
                if (!p) setRobotVisibility(true);
                return !p;
              });
            },
            className: "hover:bg-medgray_hover px-1 py-1 rounded-sm",
            children: playing ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[25px] h-[25px]", src: pause }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[25px] h-[25px]", src: play })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            value,
            setValue,
            sliderWidth: !settings.robotPosition ? 373 : 117,
            sliderHeight: 8,
            knobHeight: 22,
            knobWidth: 22,
            onChangeStart: () => {
              setPlaying(false);
              setRobotVisibility(true);
            },
            OnChangeEnd: () => {
            }
          }
        ),
        settings.robotPosition && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block w-60 bg-medgray_hover rounded-sm pl-2 pt-1 pb-1 text-center whitespace-pre font-mono", children: [
          "X: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-14 text-left", children: pose?.x?.toFixed(2) }),
          "Y: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-14 text-left", children: pose?.y?.toFixed(2) }),
          "θ: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-12 text-left", children: pose?.angle?.toFixed(2) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block w-14 ", children: [
          time.toFixed(2),
          " s"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: robotVisible, setChecked: setRobotVisibility })
      ]
    }
  );
}
const flipHorizontal = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='mdi-flip-horizontal'%20viewBox='0%200%2024%2024'%3e%3cpath%20d='M15%2021H17V19H15M19%209H21V7H19M3%205V19C3%2020.1%203.9%2021%205%2021H9V19H5V5H9V3H5C3.9%203%203%203.9%203%205M19%203V5H21C21%203.9%2020.1%203%2019%203M11%2023H13V1H11M19%2017H21V15H19M15%205H17V3H15M19%2013H21V11H19M19%2021C20.1%2021%2021%2020.1%2021%2019H19Z'%20fill='%23ffffff'/%3e%3c/svg%3e";
const flipVertical = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20id='mdi-flip-vertical'%20viewBox='0%200%2024%2024'%3e%3cpath%20d='M3%2015V17H5V15M15%2019V21H17V19M19%203H5C3.9%203%203%203.9%203%205V9H5V5H19V9H21V5C21%203.9%2020.1%203%2019%203M21%2019H19V21C20.1%2021%2021%2020.1%2021%2019M1%2011V13H23V11M7%2019V21H9V19M19%2015V17H21V15M11%2019V21H13V19M3%2019C3%2020.1%203.9%2021%205%2021V19Z'%20fill='%23ffffff'/%3e%3c/svg%3e";
function MirrorControl({
  src,
  mirrorDirection
}) {
  const [, setPath] = usePath();
  const mirrorX = () => {
    setPath((prev) => ({
      ...prev,
      segments: prev.segments.map(
        (c) => c.selected ? {
          ...c,
          pose: {
            ...c.pose,
            angle: normalizeDeg(360 - (c.pose.angle ?? 0)),
            x: -(c.pose.x ?? 0)
          }
        } : c
      )
    }));
  };
  const mirrorY = () => {
    setPath((prev) => ({
      ...prev,
      segments: prev.segments.map(
        (c) => c.selected ? {
          ...c,
          pose: {
            ...c.pose,
            angle: normalizeDeg(180 - (c.pose.angle ?? 0)),
            y: -(c.pose.y ?? 0)
          }
        } : c
      )
    }));
  };
  const handleOnClick = () => {
    if (mirrorDirection === "x") {
      mirrorX();
    } else if (mirrorDirection === "y") {
      mirrorY();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      className: "flex items-center justify-center w-[40px] h-[40px] cursor-pointer \r\n            rounded-lg bg-transparent hover:bg-medgray_hover border-none outline-none fill-white",
      onClick: handleOnClick,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          className: "fill-white w-[30px] h-[30px]",
          src
        }
      )
    }
  );
}
function ControlConfig() {
  const [path, setPath] = usePath();
  const [format] = useFormat();
  const getXValue = () => {
    const selectedCount = path.segments.filter((c) => c.selected).length;
    if (selectedCount !== 1) return null;
    const x = path.segments.find((c) => c.selected)?.pose.x;
    if (x === null || x === void 0) return null;
    return x;
  };
  const getYValue = () => {
    const selectedCount = path.segments.filter((c) => c.selected).length;
    if (selectedCount !== 1) return null;
    const y = path.segments.find((c) => c.selected)?.pose.y;
    if (y === null || y === void 0) return null;
    return y;
  };
  const getHeadingValue = () => {
    const selectedCount = path.segments.filter((c) => c.selected).length;
    if (selectedCount !== 1) return null;
    const heading = path.segments.find((c) => c.selected)?.pose.angle;
    if (heading === null || heading === void 0) return null;
    return heading;
  };
  const updateXValue = (newX) => {
    const selectedCount = path.segments.filter((c) => c.selected).length;
    if (selectedCount !== 1) return;
    const selectedSegment = path.segments.find((c) => c.selected);
    if (selectedSegment === void 0) return;
    if (selectedSegment.kind === "angleSwing" || selectedSegment.kind === "pointSwing" || selectedSegment.kind === "angleTurn" || selectedSegment.kind === "pointTurn") return;
    setPath((prev) => ({
      ...prev,
      segments: prev.segments.map(
        (control) => control.selected ? { ...control, pose: { ...control.pose, x: newX } } : control
      )
    }));
  };
  const updateYValue = (newY) => {
    const selectedCount = path.segments.filter((c) => c.selected).length;
    if (selectedCount !== 1) return;
    const selectedSegment = path.segments.find((c) => c.selected);
    if (selectedSegment === void 0) return;
    if (selectedSegment.kind === "angleSwing" || selectedSegment.kind === "pointSwing" || selectedSegment.kind === "angleTurn" || selectedSegment.kind === "pointTurn") return;
    setPath((prev) => ({
      ...prev,
      segments: prev.segments.map(
        (control) => control.selected ? { ...control, pose: { ...control.pose, y: newY } } : control
      )
    }));
  };
  const updateHeadingValue = (newHeading) => {
    const selectedCount = path.segments.filter((c) => c.selected).length;
    if (selectedCount !== 1) return;
    const selectedSegment = path.segments.find((c) => c.selected);
    if (selectedSegment === void 0) return;
    if (newHeading === null && selectedSegment.kind !== "poseDrive") return;
    if (newHeading !== null) newHeading = normalizeDeg(newHeading);
    setPath((prev) => {
      let kind = selectedSegment.kind;
      if (selectedSegment.kind === "poseDrive" && newHeading === null) {
        kind = "pointDrive";
      }
      if (selectedSegment.kind === "pointDrive" && newHeading !== null) {
        kind = "poseDrive";
      }
      return {
        ...prev,
        segments: prev.segments.map(
          (control) => control.selected ? {
            ...control,
            pose: { ...control.pose, angle: newHeading },
            kind
          } : control
        )
      };
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-center gap-4 bg-medgray w-[500px] h-[65px] rounded-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 20 }, children: "X" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberInput,
        {
          width: 80,
          height: 40,
          fontSize: 18,
          setValue: format === "ReveilLib" ? updateYValue : updateXValue,
          value: format === "ReveilLib" ? getYValue() : getXValue(),
          stepSize: 1,
          roundTo: 2,
          bounds: [-999, 999],
          units: "in"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 20 }, children: "Y" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberInput,
        {
          width: 80,
          height: 40,
          fontSize: 18,
          stepSize: 1,
          roundTo: 2,
          setValue: format === "ReveilLib" ? updateXValue : updateYValue,
          value: format === "ReveilLib" ? getXValue() : getYValue(),
          bounds: [-999, 999],
          units: "in"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 20 }, children: "θ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberInput,
        {
          width: 80,
          height: 40,
          fontSize: 18,
          stepSize: 5,
          roundTo: 2,
          setValue: updateHeadingValue,
          value: getHeadingValue(),
          bounds: [-Infinity, Infinity],
          units: "deg"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center flex-row gap-[15px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MirrorControl, { mirrorDirection: "x", src: flipHorizontal }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MirrorControl, { mirrorDirection: "y", src: flipVertical })
    ] })
  ] });
}
function TextInput({
  fontSize,
  unitsFontSize,
  width,
  height,
  value,
  focus,
  setValue,
  setText,
  units = ""
}) {
  const [edit, setEdit] = reactExports.useState(value);
  const displayRef = reactExports.useRef("");
  const labelRef = reactExports.useRef(null);
  const [labelW, setLabelW] = reactExports.useState(0);
  const inputRef = reactExports.useRef(null);
  if (focus && inputRef.current !== null) {
    inputRef.current?.focus();
    focus = false;
  }
  displayRef.current = edit !== null ? edit : displayRef.current;
  setText?.(edit);
  const executeValue = () => {
    if (edit === null) return;
    setValue(edit);
    displayRef.current = edit;
  };
  const handleChange = (evt) => {
    setText?.(evt.target.value);
    setEdit(evt.target.value);
  };
  const handleKeyDown = (evt) => {
    if (evt.key === "Enter") {
      executeValue();
      evt.currentTarget.blur();
    }
  };
  const stroke = 2;
  const radius = 6;
  reactExports.useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    const update = () => setLabelW(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [units]);
  const notchWidth = units !== "" ? labelW + 2 : 0;
  const notchRight = 6;
  function buildNotchedRoundedRectPath(W, H) {
    const sw = stroke;
    const ox = sw / 2;
    const oy = sw / 2;
    const w = Math.max(0, W - sw);
    const h = Math.max(0, H - sw);
    const r = Math.min(radius, w / 2, h / 2);
    const left = ox;
    const top = oy;
    const right = ox + w;
    const bottom = oy + h;
    let gapEnd = w - notchRight;
    let gapStart = gapEnd - notchWidth;
    const minX = r;
    const maxX = w - r;
    gapStart = Math.max(minX, Math.min(gapStart, maxX));
    gapEnd = Math.max(minX, Math.min(gapEnd, maxX));
    return [
      `M ${left + gapEnd} ${top}`,
      `L ${right - r} ${top}`,
      `A ${r} ${r} 0 0 1 ${right} ${top + r}`,
      `L ${right} ${bottom - r}`,
      `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
      `L ${left + r} ${bottom}`,
      `A ${r} ${r} 0 0 1 ${left} ${bottom - r}`,
      `L ${left} ${top + r}`,
      `A ${r} ${r} 0 0 1 ${left + r} ${top}`,
      `L ${left + gapStart} ${top}`
    ].join(" ");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: inputRef,
        className: "bg-blackgray rounded-lg text-center text-white outline-none",
        style: { fontSize: `${fontSize}px`, width: `${width}px`, height: `${height}px` },
        type: "text",
        value: displayRef.current,
        onChange: handleChange,
        onKeyDown: handleKeyDown
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        "aria-hidden": true,
        className: "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: buildNotchedRoundedRectPath(width, height),
            fill: "none",
            className: "stroke-lightgray",
            strokeWidth: stroke,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        ref: labelRef,
        style: { fontSize: `${unitsFontSize}px ` },
        className: `
            pointer-events-none select-none
            absolute -top-1 right-4
            translate-x-2 -translate-y-1/3
            text-lightgray leading-none
            px-1 py-0.5 z-10
        `,
        children: units
      }
    )
  ] });
}
const enter = "data:image/svg+xml,%3csvg%20width='30'%20height='30'%20viewBox='0%200%2030%2030'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M3.75%2017.5C3.75%2017.1685%203.8817%2016.8505%204.11612%2016.6161C4.35054%2016.3817%204.66848%2016.25%205%2016.25H20C20.9946%2016.25%2021.9484%2015.8549%2022.6517%2015.1517C23.3549%2014.4484%2023.75%2013.4946%2023.75%2012.5V7.5C23.75%207.16848%2023.8817%206.85054%2024.1161%206.61612C24.3505%206.3817%2024.6685%206.25%2025%206.25C25.3315%206.25%2025.6495%206.3817%2025.8839%206.61612C26.1183%206.85054%2026.25%207.16848%2026.25%207.5V12.5C26.25%2014.1576%2025.5915%2015.7473%2024.4194%2016.9194C23.2473%2018.0915%2021.6576%2018.75%2020%2018.75H5C4.66848%2018.75%204.35054%2018.6183%204.11612%2018.3839C3.8817%2018.1495%203.75%2017.8315%203.75%2017.5Z'%20fill='%235C5C5C'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M4.11626%2018.3838C3.88192%2018.1494%203.75027%2017.8315%203.75027%2017.5C3.75027%2017.1686%203.88192%2016.8507%204.11626%2016.6163L9.11626%2011.6163C9.35201%2011.3886%209.66776%2011.2626%209.99551%2011.2654C10.3233%2011.2683%2010.6368%2011.3997%2010.8685%2011.6315C11.1003%2011.8633%2011.2318%2012.1768%2011.2346%2012.5045C11.2374%2012.8323%2011.1115%2013.148%2010.8838%2013.3838L6.76751%2017.5L10.8838%2021.6163C11.0031%2021.7316%2011.0984%2021.8695%2011.1639%2022.022C11.2294%2022.1745%2011.2639%2022.3385%2011.2653%2022.5045C11.2668%2022.6705%2011.2351%2022.8351%2011.1723%2022.9887C11.1094%2023.1423%2011.0166%2023.2819%2010.8993%2023.3993C10.7819%2023.5166%2010.6423%2023.6094%2010.4887%2023.6723C10.3351%2023.7351%2010.1705%2023.7668%2010.0045%2023.7653C9.83853%2023.7639%209.67451%2023.7294%209.522%2023.6639C9.3695%2023.5984%209.23157%2023.5032%209.11626%2023.3838L4.11626%2018.3838Z'%20fill='%235C5C5C'/%3e%3c/svg%3e";
const cross = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Uploaded%20to:%20SVG%20Repo,%20www.svgrepo.com,%20Generator:%20SVG%20Repo%20Mixer%20Tools%20--%3e%3csvg%20width='800px'%20height='800px'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M6.99486%207.00636C6.60433%207.39689%206.60433%208.03005%206.99486%208.42058L10.58%2012.0057L6.99486%2015.5909C6.60433%2015.9814%206.60433%2016.6146%206.99486%2017.0051C7.38538%2017.3956%208.01855%2017.3956%208.40907%2017.0051L11.9942%2013.4199L15.5794%2017.0051C15.9699%2017.3956%2016.6031%2017.3956%2016.9936%2017.0051C17.3841%2016.6146%2017.3841%2015.9814%2016.9936%2015.5909L13.4084%2012.0057L16.9936%208.42059C17.3841%208.03007%2017.3841%207.3969%2016.9936%207.00638C16.603%206.61585%2015.9699%206.61585%2015.5794%207.00638L11.9942%2010.5915L8.40907%207.00636C8.01855%206.61584%207.38538%206.61584%206.99486%207.00636Z'%20fill='%23ffffffff'/%3e%3c/svg%3e";
function FileRenamePopup({
  label,
  onEnter,
  open,
  setOpen
}) {
  const [path] = usePath();
  const [format] = useFormat();
  const intialName = path.name === "" || path.name === void 0 || path.name === null ? format.slice(0, 3) + "Path" : path.name;
  const [text, setText] = reactExports.useState(intialName);
  const popupRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handleKeyDown = (evt) => {
      if (evt.key === "Enter") {
        onEnter(text);
        setOpen(false);
      }
      if (evt.key === "Escape") {
        setOpen(false);
      }
    };
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleOnEnter = () => {
    onEnter(text);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "\r\n                        fixed inset-0 z-30\r\n                        bg-black/10 backdrop-blur-[7px]\r\n                        grid place-items-center\r\n                        overflow-x-hidden",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "\r\n                            relative\r\n                            -translate-y-[15%]\r\n                            bg-medgray_hover w-auto h-auto p-4\r\n                            flex flex-col gap-2\r\n                            shadow-xs shadow-blackgray\r\n                            rounded-lg\r\n                        ",
          ref: popupRef,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 text-start ", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "fixed right-2 top-2 px-0.5 py-0.5 rounded-sm hover:bg-blackgrayhover",
                onClick: () => setOpen(false),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    className: "w-[25px] h-[25px]",
                    src: cross
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[18px] text-white", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextInput,
                {
                  fontSize: 18,
                  unitsFontSize: 14,
                  width: 200,
                  height: 40,
                  units: ".txt",
                  value: intialName,
                  setValue: (text2) => {
                    onEnter(text2);
                    setOpen(false);
                  },
                  focus: true,
                  setText
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "flex px-[5px] py-[5px] rounded-sm hover:bg-blackgrayhover",
                  onClick: () => handleOnEnter(),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      className: "w-[30px] h-[30px]",
                      src: enter
                    }
                  )
                }
              )
            ] })
          ] })
        }
      )
    }
  ) });
}
const pushbackVEXUMatchField = "/mikGen/assets/pushback-match-BE3uYq7F.png";
const pushbackSkillsField = "/mikGen/assets/pushback-skills-Efz9rFPV.png";
const pushbackV5MatchField = "/mikGen/assets/pushback-matchv5-DmG8OjtY.png";
const emptyField = "/mikGen/assets/empty-field-DoV3rtqm.png";
const saved = localStorage.getItem("appState");
const initialData = saved ? JSON.parse(saved) : DEFAULT_FORMAT;
const useField = createSharedState(initialData.field);
const fieldMap = [
  { key: "v5-match", src: pushbackV5MatchField, name: "V5 Match Field" },
  { key: "v5-skills", src: pushbackSkillsField, name: "V5 Skills Field" },
  { key: "vexu-match", src: pushbackVEXUMatchField, name: "VEXU Match Field" },
  { key: "separator", src: "", name: "" },
  { key: "empty", src: emptyField, name: "Empty Field" }
];
function getFieldSrcFromKey(key) {
  const field = fieldMap.find((f) => f.key === key);
  return field?.src || "";
}
function useGetFileFormat() {
  const [format] = useFormat();
  const [field] = useField();
  const defaults = globalDefaultsStore.getState()[format];
  const [path] = usePath();
  const robot = robotConstantsStore.getState();
  const [commands] = useCommand();
  const next = {
    format,
    field,
    defaults,
    path,
    robot,
    commands
  };
  return next;
}
const SAVED_SNAPSHOT_KEY = "savedSnapshot";
function getSaveableSnapshot(fileFormat) {
  const stripped = {
    ...fileFormat,
    path: {
      ...fileFormat.path,
      segments: fileFormat.path.segments.map((segment) => ({
        id: segment.id,
        groupId: segment.groupId,
        disabled: segment.disabled,
        locked: segment.locked,
        visible: segment.visible,
        pose: segment.pose,
        command: segment.command,
        format: segment.format,
        kind: segment.kind,
        constants: segment.constants
      }))
    }
  };
  return JSON.stringify(stripped);
}
function FileButton() {
  const menuRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const renameResolveRef = reactExports.useRef(null);
  const fileHandleRef = reactExports.useRef(null);
  const [isOpen, setOpen] = reactExports.useState(false);
  const [popupOpen, setPopupOpen] = reactExports.useState(false);
  const [path, setPath] = usePath();
  const [field] = useField();
  const [format] = useFormat();
  const [, setFileFormat] = useFileFormat();
  const [isSaved, setIsSaved] = reactExports.useState(() => {
    const saved2 = localStorage.getItem(SAVED_SNAPSHOT_KEY);
    return saved2 !== null;
  });
  const savedSnapshotRef = reactExports.useRef(localStorage.getItem(SAVED_SNAPSHOT_KEY));
  const fileText = useGetFileFormat();
  const [label, setLabel] = reactExports.useState("");
  const getFileName = (fileName = "") => {
    const pathName = fileName === "" ? path.name : fileName;
    if (pathName === "" || pathName === null || pathName === void 0) {
      return format.slice(0, 3) + "Path";
    }
    return pathName;
  };
  reactExports.useEffect(() => {
    const currentSnapshot = getSaveableSnapshot(fileText);
    if (savedSnapshotRef.current === null) {
      savedSnapshotRef.current = currentSnapshot;
      localStorage.setItem(SAVED_SNAPSHOT_KEY, currentSnapshot);
    }
    setIsSaved(currentSnapshot === savedSnapshotRef.current);
  }, [fileText]);
  const updatePathName = (name) => {
    setPath((prev) => ({
      ...prev,
      name
    }));
    renameResolveRef.current?.(name);
    renameResolveRef.current = null;
  };
  const requestFileName = () => {
    setPopupOpen(true);
    return new Promise((resolve) => {
      renameResolveRef.current = resolve;
    });
  };
  const handleToggleMenu = () => {
    setOpen((prev) => !prev);
  };
  const handleNewFile = () => {
    if (!isSaved) {
      handleSaveAs();
    }
    setFileFormat(
      {
        format,
        field,
        defaults: INITIAL_DEFAULTS[format],
        path: { segments: [], name: "" },
        robot: defaultRobotConstants,
        commands: []
      }
    );
    fileHandleRef.current = null;
    setOpen(false);
    savedSnapshotRef.current = null;
    localStorage.removeItem(SAVED_SNAPSHOT_KEY);
  };
  const handleOpenFile = async () => {
    setOpen(false);
    if (!("showOpenFilePicker" in window)) {
      console.error("File System Access API not supported");
      fileInputRef.current?.click();
      return;
    }
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Text Files",
            accept: {
              "text/plain": [".txt"]
            }
          },
          {
            description: "JSON Files",
            accept: {
              "application/json": [".json"]
            }
          },
          {
            description: "CSV Files",
            accept: {
              "text/csv": [".csv"]
            }
          }
        ],
        multiple: false
      });
      fileHandleRef.current = handle;
      const file = await handle.getFile();
      const content = await file.text();
      const fileName = handle.name.replace(/\.[^/.]+$/, "");
      const parsed = JSON.parse(content);
      setFileFormat({
        ...parsed,
        path: {
          ...parsed.path,
          name: fileName
        }
      });
      savedSnapshotRef.current = null;
      localStorage.removeItem(SAVED_SNAPSHOT_KEY);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error opening file:", error);
      }
    }
  };
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        const parsed = JSON.parse(content);
        setFileFormat({
          ...parsed,
          path: {
            ...parsed.path,
            name: fileName
          }
        });
      };
      reader.readAsText(file);
      fileHandleRef.current = null;
    }
    event.target.value = "";
  };
  const handleSave = async () => {
    setOpen(false);
    if (!("showSaveFilePicker" in window)) {
      console.error("File System Access API not supported");
      handleDownload();
      return;
    }
    try {
      if (fileHandleRef.current) {
        const writable = await fileHandleRef.current.createWritable();
        await writable.write(JSON.stringify(fileText));
        await writable.close();
        const snapshot = getSaveableSnapshot(fileText);
        savedSnapshotRef.current = snapshot;
        localStorage.setItem(SAVED_SNAPSHOT_KEY, snapshot);
        setIsSaved(true);
      } else {
        await handleSaveAs();
      }
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };
  const handleSaveAs = async () => {
    setOpen(false);
    setLabel("Save As:");
    if (!("showSaveFilePicker" in window)) {
      console.error("File System Access API not supported");
      handleDownloadAs();
      return;
    }
    try {
      const name = await requestFileName();
      if (name === null || name === "") return;
      const handle = await window.showSaveFilePicker({
        suggestedName: `${name}.txt`,
        types: [
          {
            description: "Text Files",
            accept: {
              "text/plain": [".txt"]
            }
          },
          {
            description: "JSON Files",
            accept: {
              "application/json": [".json"]
            }
          }
        ]
      });
      fileHandleRef.current = handle;
      const savedFileName = handle.name.replace(/\.[^/.]+$/, "");
      setPath((prev) => ({
        ...prev,
        name: savedFileName
      }));
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(fileText));
      await writable.close();
      const snapshot = getSaveableSnapshot(fileText);
      savedSnapshotRef.current = snapshot;
      localStorage.setItem(SAVED_SNAPSHOT_KEY, snapshot);
      setIsSaved(true);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error saving file:", error);
      }
    }
  };
  const downloadText = (content, filename) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleDownload = () => {
    downloadText(JSON.stringify(fileText), `${getFileName()}.txt`);
    setOpen(false);
    const snapshot = getSaveableSnapshot(fileText);
    savedSnapshotRef.current = snapshot;
    localStorage.setItem(SAVED_SNAPSHOT_KEY, snapshot);
    setIsSaved(true);
  };
  const handleDownloadAs = async () => {
    setOpen(false);
    setLabel("Download As:");
    const name = await requestFileName();
    if (name === null) return;
    downloadText(JSON.stringify(fileText), `${getFileName(name)}.txt`);
    const snapshot = getSaveableSnapshot(fileText);
    savedSnapshotRef.current = snapshot;
    localStorage.setItem(SAVED_SNAPSHOT_KEY, snapshot);
    setIsSaved(true);
  };
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  reactExports.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "p") {
        event.preventDefault();
        handleNewFile();
      } else if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        handleOpenFile();
      } else if (event.ctrlKey && event.shiftKey && event.key === "S") {
        event.preventDefault();
        handleSaveAs();
      } else if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        handleSave();
      } else if (event.ctrlKey && event.shiftKey && event.key === "D") {
        event.preventDefault();
        handleDownloadAs();
      } else if (event.ctrlKey && event.key === "d") {
        event.preventDefault();
        handleDownload();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: menuRef,
      className: `relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleToggleMenu, className: "px-2 py-1 cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[20px] ${!isSaved ? "underline" : ""}`, children: "File" }) }),
        popupOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          FileRenamePopup,
          {
            label,
            open: popupOpen,
            setOpen: setPopupOpen,
            onEnter: updatePathName
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: ".txt,.json,.csv",
            style: { display: "none" },
            onChange: handleFileSelect
          }
        ),
        isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute shadow-xs mt-1 shadow-black left-0 top-full w-55 z-40\r\n                    rounded-sm bg-medgray_hover min-h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col mt-2 pl-2 pr-2 mb-2 gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleNewFile,
              className: "flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "New File" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "Ctrl+P" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleOpenFile,
              className: "flex pr-1 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Open File" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "Ctrl+O" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleSave,
              className: "flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Save" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "Ctrl+S" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleSaveAs,
              className: "flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Save As" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "Shift+Ctrl+S" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleDownload,
              className: "flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Download" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "Ctrl+D" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleDownloadAs,
              className: "flex pr-1 py-0.5 pl-2 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Download As" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lightgray text-[14px]", children: "Shift+Ctrl+D" })
              ]
            }
          )
        ] }) }) })
      ]
    }
  );
}
function SettingsButton() {
  const [isOpen, setOpen] = reactExports.useState(false);
  const menuRef = reactExports.useRef(null);
  const [settings, setSettings] = useSettings();
  const ghostRobots = settings.ghostRobots;
  const setGhostRobots = (state) => {
    setSettings((prev) => ({
      ...prev,
      ghostRobots: state
    }));
  };
  const robotPosition = settings.robotPosition;
  const setRobotPosition = (state) => {
    setSettings((prev) => ({
      ...prev,
      robotPosition: state
    }));
  };
  const precisePath = settings.precisePath;
  const setPrecisePath = (state) => {
    setSettings((prev) => ({
      ...prev,
      precisePath: state
    }));
  };
  const handleToggleMenu = () => {
    setOpen((prev) => !prev);
  };
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleClose = (evt) => {
      if (evt.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleClose);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleClose);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: menuRef, className: `relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleToggleMenu, className: "px-2 py-1 cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[20px]", children: "Settings" }) }),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute shadow-xs mt-1 shadow-black left-0 top-full w-45 z-40\r\n                    rounded-sm bg-medgray_hover min-h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col mt-3 pl-3 pr-3 mb-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-[16px]", children: "Robot Outlines" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-25 flex items-center justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: ghostRobots, setChecked: setGhostRobots }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-[16px]", children: "Robot Position" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-25 flex items-center justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: robotPosition, setChecked: setRobotPosition }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-[16px]", children: "Precise Path" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-25 flex items-center justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: precisePath, setChecked: setPrecisePath }) }) })
      ] })
    ] }) })
  ] });
}
function CommmandInput({
  width,
  height
}) {
  const [value, SetValue] = reactExports.useState("");
  const [edit, setEdit] = reactExports.useState(null);
  const [commands, setCommand] = useCommand();
  const display = edit !== null ? edit : value;
  const resetValue = () => {
    setEdit("");
  };
  const executeInput = () => {
    if (edit === null || edit === "" || commands.find((c) => c.name === edit)) return;
    const finalEdit = edit.replace(/ /g, "_");
    SetValue(finalEdit);
    setCommand((prev) => [...prev, createCommand(finalEdit)]);
    cancel();
  };
  const handleChange = (evt) => {
    setEdit(evt.target.value);
  };
  const handleKeyDown = (evt) => {
    if (evt.key === "Enter" || evt.key == "Tab") {
      executeInput();
    }
  };
  const handleOnClick = () => {
    executeInput();
  };
  const cancel = () => {
    resetValue();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        className: `bg-blackgray
                outline-2 outline-transparent rounded-lg text-center text-white
                hover:outline-lightgray
                `,
        maxLength: 20,
        style: {
          fontSize: "16px",
          width,
          height
        },
        type: "text",
        value: display,
        onChange: handleChange,
        onKeyDown: handleKeyDown
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "hover:bg-blackgrayhover rounded-sm cursor-pointer",
        onClick: handleOnClick,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: enter })
      }
    )
  ] });
}
function RemoveCommandButton({ commandId }) {
  const [, setCommand] = useCommand();
  const handleDeleteOnClick = () => {
    setCommand((prev) => prev.filter((c) => c.id !== commandId));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[25px] h-[25px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: handleDeleteOnClick,
      className: "cursor-pointer rounded-sm hover:bg-blackgrayhover",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: cross
        }
      )
    }
  ) });
}
function CommandButton() {
  const [isOpen, setOpen] = reactExports.useState(false);
  const [commands] = useCommand();
  const menuRef = reactExports.useRef(null);
  const handleToggleMenu = () => {
    setOpen((prev) => !prev);
  };
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: menuRef, className: `relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleToggleMenu, className: "px-2 py-1 cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[20px]", children: "Commands" }) }),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute shadow-xs mt-1 shadow-black left-0 top-full w-60 \r\n                    rounded-sm bg-medgray_hover min-h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col mt-2 pl-2 mb-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col max-h-40 overflow-y-auto", children: commands.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-between pr-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RemoveCommandButton, { commandId: c.id })
      ] })) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommmandInput, { width: 175, height: 30 })
    ] }) })
  ] });
}
const imageCache = {};
async function preloadImage(src) {
  if (!src) return new Image();
  if (imageCache[src]) {
    return imageCache[src];
  }
  const img = new Image();
  img.src = src;
  try {
    await img.decode();
    imageCache[src] = img;
  } catch {
  }
  return img;
}
function usePreloadImagesOnMount(srcs) {
  const imgRefs = reactExports.useRef([]);
  reactExports.useEffect(() => {
    (async () => {
      imgRefs.current = await Promise.all(srcs.map(preloadImage));
    })();
    return () => {
      imgRefs.current = [];
    };
  }, []);
}
function FieldButton() {
  const [isOpen, setOpen] = reactExports.useState(false);
  const [fieldKey, setFieldKey] = useField();
  const menuRef = reactExports.useRef(null);
  const [, setIsLoading] = reactExports.useState(false);
  const [imagesLoaded, setImagesLoaded] = reactExports.useState(false);
  const [, startTransition] = reactExports.useTransition();
  const hoverTimer = reactExports.useRef(null);
  const fieldWhenMenuOpened = reactExports.useRef(fieldKey);
  usePreloadImagesOnMount(fieldMap.map((f) => f.src));
  const handleCloseMenu = reactExports.useCallback(() => {
    if (isOpen && fieldKey !== fieldWhenMenuOpened.current) {
      AddToUndoHistory({ field: fieldKey });
    }
    setOpen(false);
  }, [isOpen, fieldKey]);
  const handleToggleMenu = async () => {
    if (!isOpen && !imagesLoaded) {
      setIsLoading(true);
      await Promise.all(fieldMap.map((f) => preloadImage(f.src)));
      setImagesLoaded(true);
      setIsLoading(false);
    }
    if (!isOpen) {
      fieldWhenMenuOpened.current = fieldKey;
      setOpen(true);
    } else {
      handleCloseMenu();
    }
  };
  const setFieldSmooth = (key) => {
    startTransition(() => setFieldKey(key));
  };
  if (fieldKey === void 0) {
    setFieldSmooth(fieldMap[0].key);
  }
  const handleHover = (key) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      setFieldSmooth(key);
    }, 0);
  };
  const handleLeaveMenu = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };
  const handleClickItem = () => {
    handleCloseMenu();
  };
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleCloseMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleCloseMenu]);
  reactExports.useEffect(() => {
    return () => {
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: menuRef,
      className: `relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleToggleMenu, className: "px-2 py-1 cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[20px]", children: "Field" }) }),
        isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute shadow-xs mt-1 shadow-black left-0 top-full w-50 rounded-sm bg-medgray_hover min-h-2",
            onMouseLeave: handleLeaveMenu,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 pl-2 pr-2 mb-2 gap-1 flex flex-col max-h-40 overflow-y-auto", children: fieldMap.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              c.name !== "" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  className: `flex items-center justify-between px-2 py-1 hover:bg-blackgrayhover cursor-pointer rounded-sm ${fieldKey === c.key ? "bg-blackgrayhover" : ""}`,
                  onMouseEnter: () => handleHover(c.key),
                  onClick: handleClickItem,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: c.name }),
                    fieldKey === c.key && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "15", height: "12", viewBox: "0 0 15 12", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "path",
                      {
                        d: "M1 6.5L5.66752 10.7433C6.11058 11.1461 6.8059 11.0718 7.15393 10.5846L14 1",
                        stroke: "white",
                        strokeWidth: "2",
                        strokeLinecap: "round"
                      }
                    ) })
                  ]
                },
                c.key
              ),
              c.name === "" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]" })
            ] })) })
          }
        )
      ]
    }
  );
}
const FORMATS = [
  { name: "mikLib v1.2.4", format: "mikLib" },
  { name: "ReveilLib v2.1.0", format: "ReveilLib" },
  { name: "JAR-Template [SOON]", format: "JAR-Template" },
  { name: "LemLib [SOON]", format: "LemLib" }
];
function FormatButton() {
  const [isOpen, setOpen] = reactExports.useState(false);
  const [format, setFormat] = useFormat();
  const [path, setPath] = usePath();
  const menuRef = reactExports.useRef(null);
  const prevFormatRef = reactExports.useRef(format);
  const handleToggleMenu = () => setOpen((prev) => !prev);
  const handleClickItem = (format2) => {
    setFormat(format2);
    setPath((prev) => {
      const newPath = {
        ...prev,
        segments: prev.segments.map((s) => ({
          ...s,
          format: format2,
          constants: getDefaultConstants(format2, s.kind)
        }))
      };
      if (prevFormatRef.current !== format2) {
        AddToUndoHistory({ format: format2, defaults: structuredClone(globalDefaultsStore.getState()[format2]), path: newPath });
      }
      return {
        ...newPath
      };
    });
    prevFormatRef.current = format2;
  };
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: menuRef,
      className: `relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleToggleMenu, className: "px-2 py-1 cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[20px]", children: "Format" }) }),
        isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute shadow-xs mt-1 shadow-black left-0 top-full w-55 rounded-sm bg-medgray_hover min-h-2",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 pl-2 pr-2 mb-2 gap-1 flex flex-col max-h-40 overflow-y-auto", children: FORMATS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              c.name !== "" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  className: `flex items-center justify-between px-2 py-1 hover:bg-blackgrayhover cursor-pointer rounded-sm ${format === c.format ? "bg-blackgrayhover" : ""}`,
                  onClick: () => handleClickItem(c.format),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: c.name }),
                    format === c.format && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "15", height: "12", viewBox: "0 0 15 12", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "path",
                      {
                        d: "M1 6.5L5.66752 10.7433C6.11058 11.1461 6.8059 11.0718 7.15393 10.5846L14 1",
                        stroke: "white",
                        strokeWidth: "2",
                        strokeLinecap: "round"
                      }
                    ) })
                  ]
                },
                c.format
              ),
              c.name === "" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 border-t border-gray-500/40 flex flex-row items-center justify-between h-[4px]" })
            ] })) })
          }
        )
      ]
    }
  );
}
function RobotButton() {
  const [isOpen, setOpen] = reactExports.useState(false);
  const menuRef = reactExports.useRef(null);
  const robot = reactExports.useSyncExternalStore(robotConstantsStore.subscribe, robotConstantsStore.getState);
  const [holonomic, setHolonomic] = reactExports.useState(false);
  const updateWidth = (width) => {
    if (width !== null) {
      robotConstantsStore.merge({ width });
    }
  };
  const updateHeight = (height) => {
    if (height !== null) {
      robotConstantsStore.merge({ height });
    }
  };
  const updateSpeed = (speed) => {
    if (speed !== null) {
      robotConstantsStore.merge({ speed });
    }
  };
  const updateAccel = (accel) => {
    if (accel !== null) {
      robotConstantsStore.merge({ accel });
    }
  };
  const handleToggleMenu = () => {
    setOpen((prev) => !prev);
  };
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleClose = (evt) => {
      if (evt.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleClose);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleClose);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: menuRef, className: `relative ${isOpen ? "bg-medgray_hover" : "bg-none"} hover:bg-medgray_hover rounded-sm`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleToggleMenu, className: "px-2 py-1 cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[20px]", children: "Robot" }) }),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute shadow-xs mt-1 shadow-black left-0 top-full w-40 z-40\r\n                    rounded-sm bg-medgray_hover min-h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col mt-3 pl-3 pr-3 mb-3 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Width" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NumberInput,
          {
            width: 60,
            height: 35,
            fontSize: 16,
            bounds: [0, 30],
            stepSize: 1,
            roundTo: 1,
            units: "in",
            value: robot.width,
            setValue: updateWidth,
            addToHistory: (width) => AddToUndoHistory({ robot: { ...robot, width } })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Height" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NumberInput,
          {
            width: 60,
            height: 35,
            fontSize: 16,
            bounds: [0, 30],
            stepSize: 1,
            roundTo: 1,
            units: "in",
            value: robot.height,
            setValue: updateHeight,
            addToHistory: (height) => AddToUndoHistory({ robot: { ...robot, height } })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Speed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NumberInput,
          {
            width: 60,
            height: 35,
            fontSize: 16,
            bounds: [0, 100],
            stepSize: 0.5,
            roundTo: 2,
            units: "ft/s",
            value: robot.speed,
            setValue: updateSpeed,
            addToHistory: (speed) => AddToUndoHistory({ robot: { ...robot, speed } })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px]", children: "Accel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NumberInput,
          {
            width: 60,
            height: 35,
            fontSize: 16,
            bounds: [0, 100],
            stepSize: 1,
            roundTo: 2,
            units: "ft/s²",
            value: robot.accel,
            setValue: updateAccel,
            addToHistory: (accel) => AddToUndoHistory({ robot: { ...robot, accel } })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 pt-2 border-t border-gray-500/40 flex flex-row items-center justify-between h-[35px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[16px] line-through", children: "Holonomic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-25 flex items-center justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: holonomic, setChecked: setHolonomic }) }) })
      ] })
    ] }) }) })
  ] });
}
function Config() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-medgray w-[575px] h-[65px] rounded-lg flex items-center gap-1 pl-[15px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FileButton, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldButton, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FormatButton, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RobotButton, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CommandButton, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsButton, {})
  ] });
}
function useLocalStorageSync() {
  const [settings] = useSettings();
  const [format] = useFormat();
  const [field] = useField();
  const [path] = usePath();
  const robotStore = robotConstantsStore.useStore();
  const defaultsStore = globalDefaultsStore.useStore();
  const undoHistoryStore = undoHistory.useStore();
  const [commands] = useCommand();
  reactExports.useEffect(() => {
    localStorage.setItem("ghostRobots", settings.ghostRobots ? "true" : "false");
    localStorage.setItem("robotPosition", settings.robotPosition ? "true" : "false");
    localStorage.setItem("precisePath", settings.precisePath ? "true" : "false");
  }, [settings.ghostRobots, settings.robotPosition, settings.precisePath]);
  const skipFirstState = reactExports.useRef(true);
  reactExports.useEffect(() => {
    if (skipFirstState.current) {
      skipFirstState.current = false;
      return;
    }
    const newAppState = {
      format,
      field,
      path,
      commands,
      robot: robotStore,
      defaults: defaultsStore[format]
    };
    console.log(newAppState.path);
    localStorage.setItem("appState", JSON.stringify(newAppState));
  }, [undoHistoryStore.length]);
}
const homeButton = "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M19.7118%209.29261L10.7101%200.295697C10.6171%200.202001%2010.5065%200.127632%2010.3846%200.0768805C10.2628%200.0261293%2010.132%200%2010%200C9.86796%200%209.73723%200.0261293%209.61535%200.0768805C9.49347%200.127632%209.38285%200.202001%209.28987%200.295697L0.288239%209.29261C0.149456%209.43319%200.0554425%209.6117%200.0180616%209.80562C-0.0193193%209.99954%200.00160719%2010.2002%200.0782005%2010.3822C0.153234%2010.5648%200.280655%2010.7211%200.444405%2010.8314C0.608155%2010.9417%200.800906%2011.001%200.998368%2011.002H1.99855V18.2995C2.01678%2018.7671%202.21961%2019.2085%202.56264%2019.527C2.90567%2019.8454%203.36096%2020.0152%203.82888%2019.9989H6.49937C6.76463%2019.9989%207.01903%2019.8936%207.2066%2019.7061C7.39417%2019.5187%207.49955%2019.2644%207.49955%2018.9993V14.101C7.49955%2013.8358%207.60492%2013.5816%207.79249%2013.3941C7.98006%2013.2066%208.23446%2013.1013%208.49973%2013.1013H11.5003C11.7655%2013.1013%2012.0199%2013.2066%2012.2075%2013.3941C12.3951%2013.5816%2012.5005%2013.8358%2012.5005%2014.101V18.9993C12.5005%2019.2644%2012.6058%2019.5187%2012.7934%2019.7061C12.981%2019.8936%2013.2354%2019.9989%2013.5006%2019.9989H16.1711C16.639%2020.0152%2017.0943%2019.8454%2017.4374%2019.527C17.7804%2019.2085%2017.9832%2018.7671%2018.0015%2018.2995V11.002H19.0016C19.1991%2011.001%2019.3918%2010.9417%2019.5556%2010.8314C19.7193%2010.7211%2019.8468%2010.5648%2019.9218%2010.3822C19.9984%2010.2002%2020.0193%209.99954%2019.9819%209.80562C19.9446%209.6117%2019.8505%209.43319%2019.7118%209.29261Z'%20fill='white'/%3e%3c/svg%3e";
function toPxHeight(imgHeight, value) {
  return imgHeight / FIELD_REAL_DIMENSIONS.h * value;
}
function toPxWidth(imageWidth, value) {
  return imageWidth / FIELD_REAL_DIMENSIONS.w * value;
}
function RobotView({
  img,
  x,
  y,
  angle,
  width,
  height,
  bg
}) {
  const pxWidth = toPxWidth(img.w, width);
  const pxHeight = toPxHeight(img.h, height);
  const pos = toPX({ x, y }, FIELD_REAL_DIMENSIONS, img);
  const normAngle = normalizeDeg(angle);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: `translate(${pos.x} ${pos.y}) rotate(${normAngle})`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "rect",
      {
        fill: bg ?? "rgba(150, 150, 150, 0.4)",
        stroke: "black",
        strokeWidth: 0.5,
        x: -pxWidth / 2,
        y: -pxHeight / 2,
        width: pxWidth,
        height: pxHeight
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "line",
      {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: -pxHeight / 2,
        stroke: "black",
        strokeWidth: 1
      }
    )
  ] });
}
function RobotLayer({ img, pose, robotPose, robotConstants, visible, path }) {
  const [settings] = useSettings();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    pose && visible && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RobotView,
      {
        img,
        x: pose.x ?? 0,
        y: pose.y ?? 0,
        angle: pose.angle ?? 0,
        width: robotConstants.width,
        height: robotConstants.height
      }
    ),
    !visible && settings.ghostRobots && robotPose.map((p, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, { children: path.segments[idx]?.visible && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RobotView,
      {
        img,
        x: p.x ?? 0,
        y: p.y ?? 0,
        angle: p.angle ?? 0,
        width: robotConstants.width,
        height: robotConstants.height,
        bg: "rgba(150, 150, 150, 0.05)"
      }
    ) }, `ghost-${idx}`))
  ] });
}
function PathLayer({ path, img, visible, precise }) {
  if (visible || path.segments.length < 2) return null;
  const imgDefaultSize = (FIELD_IMG_DIMENSIONS.w + FIELD_IMG_DIMENSIONS.h) / 2;
  const imgRealSize = (img.w + img.h) / 2;
  const scale = imgRealSize / imgDefaultSize;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: path.segments.map((control, idx) => {
    const segPts = getSegmentLines(idx, path, img, precise);
    if (!segPts) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "polyline",
      {
        points: segPts,
        fill: "none",
        stroke: control.hovered ? "rgba(180, 50, 11, 1)" : "rgba(21, 96, 189, 1)",
        strokeDasharray: `${10 * scale}, ${7 * scale}`,
        strokeWidth: control.hovered ? 3 * scale : 2 * scale,
        strokeLinecap: "round"
      },
      `hover-seg-${control.id}`
    );
  }) });
}
function ControlsLayer({ path, img, radius, format, onPointerDown }) {
  const imgDefaultSize = (FIELD_IMG_DIMENSIONS.w + FIELD_IMG_DIMENSIONS.h) / 2;
  const imgRealSize = (img.w + img.h) / 2;
  const scale = imgRealSize / imgDefaultSize;
  radius = radius * scale;
  const snap = getBackwardsSnapIdx(path, path.segments.length - 1);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: path.segments.map((control, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("g", { onPointerDown: (e) => onPointerDown(e, control.id), children: control.visible && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    control.pose.x !== null && control.pose.y !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "circle",
      {
        className: "stroke-[#1560BD]",
        style: control.locked ? { cursor: "not-allowed" } : { cursor: "grab" },
        id: control.id,
        cx: toPX({ x: control.pose.x, y: control.pose.y }, FIELD_REAL_DIMENSIONS, img).x,
        cy: toPX({ x: control.pose.x, y: control.pose.y }, FIELD_REAL_DIMENSIONS, img).y,
        r: control.hovered ? radius * 1.2 : radius,
        fill: control.selected ? "rgba(180, 50, 11, .75)" : "rgba(160, 32, 7, .5)",
        strokeWidth: idx === snap ? 2 * scale : 0
      }
    ),
    ["angleTurn", "pointTurn", "poseDrive", "start"].includes(control.kind) && (() => {
      const snapPose = getBackwardsSnapPose(path, idx);
      if (snapPose?.x === null || snapPose?.y === null || snapPose === null) return null;
      const active = control.selected;
      const hovered = control.hovered;
      const r = active ? radius * 1.3 : hovered ? radius * 1.2 : radius;
      const thickness = active ? 5 : hovered ? 4 : 2;
      const baseStroke = control.pose.x !== null ? "#1560BDB8" : active ? "rgba(160, 50, 11, .9)" : "#451717";
      const basePx = toPX({ x: snapPose.x, y: snapPose.y }, FIELD_REAL_DIMENSIONS, img);
      let angle = control.pose.angle ?? 0;
      if (control.kind === "pointTurn") {
        const previousPos = getBackwardsSnapPose(path, idx - 1);
        const turnToPos = getForwardSnapPose(path, idx);
        const pos = turnToPos ? { x: turnToPos.x ?? 0, y: turnToPos.y ?? 0 } : previousPos ? { x: previousPos.x ?? 0, y: (previousPos.y ?? 0) + 5 } : { x: 0, y: 5 };
        angle = calculateHeading({ x: snapPose.x, y: snapPose.y }, { x: pos.x, y: pos.y }) + angle;
      }
      const tipPx = toPX(
        {
          x: snapPose.x + r * FIELD_REAL_DIMENSIONS.w / img.w * Math.sin(toRad(angle)),
          y: snapPose.y + r * FIELD_REAL_DIMENSIONS.h / img.h * Math.cos(toRad(angle))
        },
        FIELD_REAL_DIMENSIONS,
        img
      );
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "line",
        {
          pointerEvents: "none",
          x1: basePx.x,
          y1: basePx.y,
          x2: tipPx.x,
          y2: tipPx.y,
          stroke: baseStroke,
          strokeWidth: thickness * scale,
          strokeLinecap: "round"
        }
      );
    })(),
    ["angleSwing", "pointSwing"].includes(control.kind) && (() => {
      const snapPose = getBackwardsSnapPose(path, idx);
      if (!snapPose?.x || !snapPose?.y) return null;
      const active = control.selected;
      const hovered = control.hovered;
      const r = active ? radius * 1.3 : hovered ? radius * 1.2 : radius;
      const thickness = active ? 5 : hovered ? 4 : 2;
      const baseStroke = active ? "rgba(160, 50, 11, .9)" : "#451717";
      let angle = control.pose.angle ?? 0;
      if (control.kind === "pointSwing") {
        const desiredPos = getForwardSnapPose(path, idx);
        angle = desiredPos !== null ? calculateHeading({ x: snapPose.x, y: snapPose.y }, { x: desiredPos.x ?? 0, y: desiredPos.y ?? 0 }) + (control.pose.angle ?? 0) : angle;
      }
      const curveLeft = format === "mikLib" && control.constants.swing.swingDirection == "left";
      const rInner = Math.max(0, r - thickness * 0.6);
      const basePx = toPX({ x: snapPose.x, y: snapPose.y }, FIELD_REAL_DIMENSIONS, img);
      const tipPx = toPX({
        x: snapPose.x + rInner * FIELD_REAL_DIMENSIONS.w / img.w * Math.sin(toRad(angle)),
        y: snapPose.y + rInner * FIELD_REAL_DIMENSIONS.h / img.h * Math.cos(toRad(angle))
      }, FIELD_REAL_DIMENSIONS, img);
      const dx = tipPx.x - basePx.x;
      const dy = tipPx.y - basePx.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const curveAmount = (active ? 0.45 : hovered ? 0.35 : 0.25) * len;
      const mx = (basePx.x + tipPx.x) / 2;
      const my = (basePx.y + tipPx.y) / 2;
      const dir = curveLeft ? 1 : -1;
      const cx = mx + nx * curveAmount * dir;
      const cy = my + ny * curveAmount * dir;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          pointerEvents: "none",
          d: `M ${basePx.x} ${basePx.y} Q ${cx} ${cy} ${tipPx.x} ${tipPx.y}`,
          fill: "none",
          stroke: baseStroke,
          strokeWidth: thickness * scale,
          strokeLinecap: "round"
        }
      );
    })()
  ] }) }, control.id)) });
}
function CommandLayer({ path, img, visible }) {
  if (visible) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: path.segments.map((control, idx) => {
    if (!control.visible || control.pose.x === null || control.pose.y === null || control.command.name === "") {
      return null;
    }
    const snapPose = getBackwardsSnapPose(path, idx - 1);
    if (snapPose === null || snapPose.y === null || snapPose.x === null) return null;
    let posPx = toPX(interpolatePoses(control.pose, snapPose, control.command.percent / 100), FIELD_REAL_DIMENSIONS, img);
    const pts = getSegmentLines(idx, path, img)?.split(" ");
    if (control.kind === "poseDrive" && pts !== void 0) {
      const ptsIdx = Math.floor(control.command.percent / 100 * (pts?.length - 1));
      const coord = pts[ptsIdx].split(",");
      posPx = { x: Number(coord[0]), y: Number(coord[1]) };
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "circle",
      {
        fill: "rgba(21, 102, 189, .75)",
        r: 8,
        cx: posPx.x,
        cy: posPx.y
      },
      `cmd-${control.id}`
    );
  }) });
}
const useClipboard = createSharedState([]);
function Field() {
  const [img, setImg] = reactExports.useState({ x: 0, y: 0, w: 575, h: 575 });
  const [fieldKey] = useField();
  const svgRef = reactExports.useRef(null);
  const [path, setPath] = usePath();
  const [pose] = usePose();
  const [robotPose] = useRobotPose();
  const robot = reactExports.useSyncExternalStore(robotConstantsStore.subscribe, robotConstantsStore.getState);
  const [robotVisible, setRobotVisibility] = useRobotVisibility();
  const [pathVisible] = usePathVisibility();
  const [format] = useFormat();
  const [, setFileFormat] = useFileFormat();
  const [clipboard, setClipboard] = useClipboard();
  const [settings] = useSettings();
  const startDrag = reactExports.useRef(false);
  const radius = 17;
  const [drag, setDrag] = reactExports.useState({ dragging: false, lastPos: { x: 0, y: 0 } });
  const dragHistoryActive = reactExports.useRef(false);
  const dragDidMove = reactExports.useRef(false);
  const dragStartSnapshot = reactExports.useRef(null);
  const dragStartPushed = reactExports.useRef(false);
  const lastReleasedSnapshot = reactExports.useRef(null);
  const dragStartPointerInch = reactExports.useRef(null);
  const dragStartPositions = reactExports.useRef({});
  const [middleMouseDown, setMiddleMouseDown] = reactExports.useState(false);
  const fieldDragRef = reactExports.useRef({ x: 0, y: 0 });
  const isFieldDragging = reactExports.useRef(false);
  const {
    moveControl,
    moveHeading,
    deleteControl,
    unselectPath,
    selectPath,
    selectInversePath,
    undo,
    addPointDriveSegment,
    addPointTurnSegment,
    addPoseDriveSegment,
    addAngleTurnSegment,
    addAngleSwingSegment,
    addPointSwingSegment,
    fieldZoomKeyboard,
    fieldZoomWheel,
    fieldPanWheel,
    cut,
    copy,
    paste
  } = FieldMacros();
  const { toggleRobotVisibility } = PathSimMacros();
  reactExports.useEffect(() => {
    const handleKeyDown = (evt) => {
      const target = evt.target;
      if (target?.isContentEditable || target?.tagName === "INPUT") return;
      if (evt.ctrlKey && evt.key.toLowerCase() === "r") return;
      unselectPath(evt, setPath);
      moveControl(evt, setPath);
      cut(evt, path, setClipboard, setPath);
      copy(evt, path, setClipboard);
      paste(evt, setPath, clipboard);
      deleteControl(evt, setPath);
      selectPath(evt, setPath);
      selectInversePath(evt, setPath);
      undo(evt, setFileFormat);
      fieldZoomKeyboard(evt, setImg);
      toggleRobotVisibility(evt, setRobotVisibility);
    };
    const handleWheelDown = (evt) => {
      const target = evt.target;
      if (target?.isContentEditable || target?.tagName === "INPUT") return;
      moveHeading(evt, setPath);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleWheelDown, { passive: false });
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheelDown);
    };
  }, [
    path,
    clipboard,
    setClipboard,
    setPath,
    setFileFormat,
    moveControl,
    moveHeading,
    deleteControl,
    unselectPath,
    selectPath,
    selectInversePath,
    undo,
    fieldZoomKeyboard,
    toggleRobotVisibility
  ]);
  reactExports.useEffect(() => {
    const svg = svgRef.current;
    if (svg === null) return;
    const onWheel = (evt) => {
      fieldZoomWheel(evt, setImg, svgRef);
      fieldPanWheel(evt, setImg);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      svg.removeEventListener("wheel", onWheel);
    };
  }, []);
  const handleFieldPointerDown = (evt) => {
    if (evt.button !== 1) return;
    evt.preventDefault();
    svgRef.current?.setPointerCapture(evt.pointerId);
    fieldDragRef.current = { x: evt.clientX, y: evt.clientY };
  };
  const handleFieldDrag = (evt) => {
    if (!(evt.buttons & 4)) return;
    const dx = evt.clientX - fieldDragRef.current.x;
    const dy = evt.clientY - fieldDragRef.current.y;
    setImg((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy
    }));
    fieldDragRef.current = { x: evt.clientX, y: evt.clientY };
  };
  const lastAppliedDelta = reactExports.useRef({ dx: 0, dy: 0 });
  const handlePointerMove = (evt) => {
    if (!drag.dragging || !svgRef.current) return;
    const posSvg = pointerToSvg(evt, svgRef.current);
    const posInch = toInch(posSvg, FIELD_REAL_DIMENSIONS, img);
    const start = dragStartPointerInch.current;
    if (!start) return;
    let dx = posInch.x - start.x;
    let dy = posInch.y - start.y;
    const smallMove = Math.abs(dx) < 1 && Math.abs(dy) < 1;
    if (evt.ctrlKey || smallMove) {
      dx = Math.round(dx);
      dy = Math.round(dy);
    }
    if (dx === lastAppliedDelta.current.dx && dy === lastAppliedDelta.current.dy) {
      return;
    }
    lastAppliedDelta.current = { dx, dy };
    if (dx !== 0 || dy !== 0) dragDidMove.current = true;
    setPath((prev) => {
      const next = prev.segments.map((c) => {
        if (!c.selected || c.locked) return c;
        const startPos = dragStartPositions.current[c.id];
        if (!startPos) return c;
        const sx = startPos.x;
        const sy = startPos.y;
        const newX = sx === null ? null : sx + dx;
        const newY = sy === null ? null : sy + dy;
        return { ...c, pose: { ...c.pose, x: newX, y: newY } };
      });
      return { ...prev, segments: next };
    });
  };
  const endDrag = () => {
    setDrag({ dragging: false, lastPos: { x: 0, y: 0 } });
    dragHistoryActive.current = false;
    if (dragDidMove.current) {
      AddToUndoHistory({ path: structuredClone(path) });
      lastReleasedSnapshot.current = structuredClone(path);
    }
    dragDidMove.current = false;
    dragStartSnapshot.current = null;
    dragStartPushed.current = false;
    dragStartPointerInch.current = null;
    dragStartPositions.current = {};
    isFieldDragging.current = false;
  };
  const selectSegment = (controlId, shifting) => {
    setPath((prevSegment) => {
      const prevSelectedIds = prevSegment.segments.filter((c) => c.selected).map((c) => c.id);
      let nextSelectedIds;
      if (!shifting && prevSelectedIds.length <= 1) {
        nextSelectedIds = [controlId];
      } else if (shifting && prevSegment.segments.find((c) => c.id === controlId && c.selected)) {
        nextSelectedIds = prevSelectedIds.filter((c) => c !== controlId);
      } else {
        nextSelectedIds = [...prevSelectedIds, controlId];
      }
      return {
        ...prevSegment,
        segments: prevSegment.segments.map((c) => ({
          ...c,
          selected: !c.locked && nextSelectedIds.includes(c.id)
        }))
      };
    });
  };
  const handleControlPointerDown = (evt, controlId) => {
    if (evt.button !== 0 || !svgRef.current) return;
    evt.stopPropagation();
    evt.currentTarget.setPointerCapture(evt.pointerId);
    if (!dragHistoryActive.current) {
      setPath((prev) => {
        dragStartSnapshot.current = structuredClone(prev);
        return prev;
      });
      dragStartPushed.current = false;
      dragHistoryActive.current = true;
      dragDidMove.current = false;
    }
    const posSvg = pointerToSvg(evt, svgRef.current);
    if (!drag.dragging) selectSegment(controlId, evt.shiftKey);
    const startInch = toInch(posSvg, FIELD_REAL_DIMENSIONS, img);
    dragStartPointerInch.current = structuredClone(startInch);
    const startPositions = {};
    for (const s of path.segments) {
      startPositions[s.id] = { x: s.pose.x, y: s.pose.y };
    }
    dragStartPositions.current = startPositions;
    startDrag.current = true;
    setDrag({ dragging: true, lastPos: posSvg });
  };
  const endSelection = () => {
    setPath((prev) => ({
      ...prev,
      segments: prev.segments.map((c) => ({ ...c, selected: false }))
    }));
  };
  const handleBackgroundPointerDown = (evt) => {
    if (evt.button !== 0 && evt.button !== 2 || pathVisible) return;
    const selectedCount = path.segments.filter((c) => c.selected).length;
    if (selectedCount > 1) {
      endSelection();
      return;
    }
    const pos = getPressedPositionInch(evt, svgRef.current, img);
    if (path.segments.length <= 0) {
      addPoseDriveSegment(format, { x: pos.x, y: pos.y, angle: 0 }, setPath);
      return;
    }
    if (!evt.ctrlKey && evt.button === 0) addPointDriveSegment(format, pos, setPath);
    else if (evt.ctrlKey && evt.button === 0) addPoseDriveSegment(format, { x: pos.x, y: pos.y, angle: 0 }, setPath);
    else if (!evt.ctrlKey && !evt.altKey && !evt.shiftKey && evt.button === 2) addPointTurnSegment(format, setPath);
    else if (evt.ctrlKey && !evt.altKey && !evt.shiftKey && evt.button === 2) addAngleTurnSegment(format, setPath);
    else if (!evt.ctrlKey && evt.altKey && evt.button === 2) addPointSwingSegment(format, setPath);
    else if (evt.ctrlKey && evt.altKey && evt.button === 2) addAngleSwingSegment(format, setPath);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { tabIndex: 0, onMouseLeave: endDrag, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        ref: svgRef,
        viewBox: `${0} ${0} ${FIELD_IMG_DIMENSIONS.w} ${FIELD_IMG_DIMENSIONS.h}`,
        width: FIELD_IMG_DIMENSIONS.w,
        height: FIELD_IMG_DIMENSIONS.h,
        className: `${middleMouseDown ? `cursor-grab` : "cursor-default"}`,
        onContextMenu: (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        onPointerDown: (e) => {
          if (e.button === 1) {
            setMiddleMouseDown(true);
          }
          handleFieldPointerDown(e);
          handleBackgroundPointerDown(e);
        },
        onPointerMove: (e) => {
          handlePointerMove(e);
          handleFieldDrag(e);
        },
        onPointerUp: () => {
          setMiddleMouseDown(false);
          endDrag();
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("image", { href: getFieldSrcFromKey(fieldKey), x: img.x, y: img.y, width: img.w, height: img.h }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PathLayer, { path, img, visible: pathVisible, precise: settings.precisePath }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            RobotLayer,
            {
              img,
              pose,
              robotPose,
              robotConstants: robot,
              visible: robotVisible,
              path
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandLayer, { path, img, visible: pathVisible }),
          !pathVisible && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ControlsLayer,
            {
              path,
              img,
              radius,
              format,
              onPointerDown: handleControlPointerDown
            }
          )
        ]
      }
    ),
    (img.x !== 0 || img.y !== 0 || img.w !== FIELD_IMG_DIMENSIONS.w || img.h !== FIELD_IMG_DIMENSIONS.h) && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setImg((prev) => ({ ...prev, x: 0, y: 0, w: 575, h: 575 })),
        className: "\r\n              absolute top-22 right-129\r\n              flex\r\n              opacity-50\r\n              rounded-sm\r\n              items-center\r\n              justify-center\r\n              w-[20px]\r\n              h-[20px]\r\n              bg-medgray\r\n              z-10\r\n              cursor-pointer\r\n              transition\r\n            ",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            className: "\r\n              w-[15px]\r\n              h-[15px]",
            src: homeButton
          }
        )
      }
    )
  ] });
}
function useFileOpenSync() {
  const [fileFormat] = useFileFormat();
  const [format, setFormat] = useFormat();
  const [, setField] = useField();
  const [, setPath] = usePath();
  const [, setCommands] = useCommand();
  reactExports.useEffect(() => {
    const file = fileFormat;
    console.log(file);
    if ("format" in file && file.format !== void 0) setFormat(file.format);
    if ("field" in file && file.field !== void 0) setField(file.field);
    if ("path" in file && file.path !== void 0) setPath(file.path);
    if ("commands" in file && file.commands !== void 0) setCommands(file.commands);
    if ("robot" in file && file.robot !== void 0) robotConstantsStore.merge(file.robot);
    if ("defaults" in file && file.defaults !== void 0) {
      const targetFormat = file.format ?? format;
      globalDefaultsStore.merge({ [targetFormat]: file.defaults });
    }
  }, [fileFormat]);
}
function App() {
  useLocalStorageSync();
  useFileOpenSync();
  const viewportRef = reactExports.useRef(null);
  const contentRef = reactExports.useRef(null);
  const [scale, setScale] = reactExports.useState(1);
  reactExports.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const compute = () => {
      const prev = content.style.transform;
      content.style.transform = "scale(1)";
      content.style.transformOrigin = "top left";
      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const cw2 = content.scrollWidth;
      const ch = content.scrollHeight;
      content.style.transform = prev;
      if (cw2 <= 0 || ch <= 0) return;
      const padding = 16;
      const s = Math.min((vw - padding) / cw2, (vh - padding) / ch);
      setScale(clamp(s, 0.75, 2));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(viewport);
    ro.observe(content);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: viewportRef, className: "w-screen h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: contentRef,
      style: { transform: `scale(${scale})`, transformOrigin: "top left" },
      className: "inline-flex w-max h-max origin-top-left",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[10px] ml-[10px] pl-[10px] pt-[10px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Config, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PathSimulator, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[10px] pt-[10px] pl-[10px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PathConfig, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ControlConfig, {})
        ] })
      ]
    }
  ) });
}
clientExports.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
//# sourceMappingURL=index-D1AV_W_Y.js.map
