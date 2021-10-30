import { sessionStorage } from "@/core/session-storage.js";

(function () {
  'use strict';

  function removeTrailingSlash(url) {
    return url && url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;
  }

  var hook = function (_this, method, callback) {
    var orig = _this[method];

    return function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      callback.apply(null, args);

      return orig.apply(_this, args);
    };
  };

  var doNotTrack = function () {
    var doNotTrack = window.doNotTrack;
    var navigator = window.navigator;
    var external = window.external;

    var msTracking = function () {
      return (
        external &&
        typeof external.msTrackingProtectionEnabled === 'function' &&
        external.msTrackingProtectionEnabled()
      );
    };

    var dnt = doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack || msTracking();

    return dnt === true || dnt === 1 || dnt === 'yes' || dnt === '1';
  };

  (function (window) {
    var window_screen = window.screen;
    var width = window_screen.width;
    var height = window_screen.height;
    var language = window.navigator.language;
    var window_location = window.location;
    var hostname = window_location.hostname;
    var pathname = window_location.pathname;
    var search = window_location.search;
    var localStorage = window.localStorage;

    // sessionStorage is different for background and content scripts.
    // This is why we use only sessionStorage on background page (Mediator)
    // var sessionStorage = window.sessionStorage;

    var document = window.document;
    var history = window.history;

    // var script = document.querySelector('script[data-website-id]');

    // if (!script) { return; }

    // var attr = function (key) { return script && script.getAttribute(key); };
    var website = ANALYTICS_ID;
    var hostUrl = ANALYTICS_URL;
    // var autoTrack = attr('data-auto-track') !== 'false';
    // var dnt = attr('data-do-not-track');
    // var useCache = attr('data-cache');
    // var domains = attr('data-domains');

    var autoTrack = true;
    var dnt = undefined;
    var useCache = true;
    var domains = undefined;

    var disableTracking =
      localStorage.getItem('umami.disabled') ||
      (dnt && doNotTrack()) ||
      (domains &&
        !domains
          .split(',')
          .map(function (n) { return n.trim(); })
          .includes(hostname));

    var root = hostUrl
      ? removeTrailingSlash(hostUrl)
      : script.src.split('/').slice(0, -1).join('/');
    var screen = width + "x" + height;
    var listeners = [];
    var currentUrl = "" + pathname + search;
    var currentRef = document.referrer;

    /* Collect metrics */

    var post = function (url, data, callback) {
      var req = new XMLHttpRequest();
      req.open('POST', url, true);
      req.setRequestHeader('Content-Type', 'application/json');

      req.onreadystatechange = function () {
        if (req.readyState === 4) {
          callback && callback(req.response);
        }
      };

      req.send(JSON.stringify(data));
    };

    var collect = async function (type, params, uuid) {
      if (disableTracking) { return; }

      var key = 'umami.cache';

      var payload = {
        website: uuid,
        hostname: hostname,
        screen: screen,
        language: language,
        cache: useCache && await sessionStorage.getItem(key),
      };

      if (params) {
        Object.keys(params).forEach(function (key) {
          payload[key] = params[key];
        });
      }

      post(
        (root + "/api/collect"),
        {
          type: type,
          payload: payload,
        },
        function (res) { return useCache && sessionStorage.setItem(key, res); }
      );
    };

    var trackView = function (url, referrer, uuid) {
        if ( url === void 0 ) url = currentUrl;
        if ( referrer === void 0 ) referrer = currentRef;
        if ( uuid === void 0 ) uuid = website;

        return collect(
        'pageview',
        {
          url: url,
          referrer: referrer,
        },
        uuid
      );
    };

    var trackEvent = function (event_value, event_type, url, uuid) {
        if ( event_type === void 0 ) event_type = 'custom';
        if ( url === void 0 ) url = currentUrl;
        if ( uuid === void 0 ) uuid = website;

        return collect(
        'event',
        {
          event_type: event_type,
          event_value: event_value,
          url: url,
        },
        uuid
      );
    };

    /* Handle events */

    var addEvents = function () {
      document.querySelectorAll("[class*='umami--']").forEach(function (element) {
        element.className.split(' ').forEach(function (className) {
          if (/^umami--([a-z]+)--([\w]+[\w-]*)$/.test(className)) {
            var ref = className.split('--');
            var type = ref[1];
            var value = ref[2];
            var listener = function () { return trackEvent(value, type); };

            listeners.push([element, type, listener]);
            element.addEventListener(type, listener, true);
          }
        });
      });
    };

    var removeEvents = function () {
      listeners.forEach(function (ref) {
        var element = ref[0];
        var type = ref[1];
        var listener = ref[2];

        element && element.removeEventListener(type, listener, true);
      });
      listeners.length = 0;
    };

    /* Handle history changes */

    var handlePush = function (state, title, url) {
      if (!url) { return; }

      removeEvents();

      currentRef = currentUrl;
      var newUrl = url.toString();

      if (newUrl.substring(0, 4) === 'http') {
        currentUrl = '/' + newUrl.split('/').splice(3).join('/');
      } else {
        currentUrl = newUrl;
      }

      if (currentUrl !== currentRef) {
        trackView(currentUrl, currentRef);
      }

      setTimeout(addEvents, 300);
    };

    /* Global */

    if (!window.umami) {
      var umami = function (event_value) { return trackEvent(event_value); };
      umami.trackView = trackView;
      umami.trackEvent = trackEvent;
      umami.addEvents = addEvents;
      umami.removeEvents = removeEvents;

      window.umami = umami;
    }

    /* Start */

    if (autoTrack && !disableTracking) {
      history.pushState = hook(history, 'pushState', handlePush);
      history.replaceState = hook(history, 'replaceState', handlePush);

      trackView(currentUrl, currentRef);

      addEvents();
    }
  })(window);

}());
