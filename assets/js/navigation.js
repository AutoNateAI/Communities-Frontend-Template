(function (global) {
  var NAV_TYPES = {
    unauth: "components/unauth-nav.html",
    auth: "components/auth-nav.html",
  };

  var NAV_FALLBACKS = {
    unauth: [
      '<nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">',
      '  <div class="container">',
      '    <a class="navbar-brand fw-bold" href="index.html">AutoNateAI Communities</a>',
      '    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarUnauth" aria-controls="navbarUnauth" aria-expanded="false" aria-label="Toggle navigation">',
      '      <span class="navbar-toggler-icon"></span>',
      '    </button>',
      '    <div class="collapse navbar-collapse" id="navbarUnauth">',
      '      <ul class="navbar-nav nav-tabs-line mx-lg-auto mb-3 mb-lg-0 flex-lg-row flex-column align-items-lg-center">',
      '        <li class="nav-item"><a class="nav-link" href="index.html" data-nav="home">Home</a></li>',
      '        <li class="nav-item"><a class="nav-link" href="feed.html" data-nav="feed">Feed</a></li>',
      '        <li class="nav-item"><a class="nav-link" href="marketplace.html" data-nav="marketplace">Marketplace</a></li>',
      '        <li class="nav-item"><a class="nav-link" href="blog.html" data-nav="blog">Blog</a></li>',
      '      </ul>',
      '      <div class="d-flex gap-2 ms-lg-3">',
      '        <a class="btn btn-outline-primary" href="login.html" data-nav="login">Log in</a>',
      '        <a class="btn btn-primary" href="signup.html" data-nav="signup">Sign up</a>',
      '      </div>',
      "    </div>",
      "  </div>",
      "</nav>",
    ].join("\n"),
    auth: [
      '<nav class="navbar navbar-expand-lg navbar-dark bg-primary">',
      '  <div class="container">',
      '    <a class="navbar-brand fw-bold text-white" href="dashboard.html">AutoNateAI Communities</a>',
      '    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarAuth" aria-controls="navbarAuth" aria-expanded="false" aria-label="Toggle navigation">',
      '      <span class="navbar-toggler-icon"></span>',
      '    </button>',
      '    <div class="collapse navbar-collapse" id="navbarAuth">',
      '      <ul class="navbar-nav me-auto mb-2 mb-lg-0">',
      '        <li class="nav-item"><a class="nav-link" href="dashboard.html" data-nav="dashboard">Dashboard</a></li>',
      '        <li class="nav-item"><a class="nav-link" href="profile.html" data-nav="profile">Profile</a></li>',
      '      </ul>',
      '      <button class="btn btn-outline-light" id="signOutButton">Sign out</button>',
      '    </div>',
      '  </div>',
      '</nav>',
    ].join("\n"),
  };

  function renderNavigation(container, navType, activeNavKey, markup) {
    container.innerHTML = markup;
    if (navType === "auth") {
      attachAuthNavHandlers(container);
    }
    highlightActiveNav(container, activeNavKey);
  }

  function loadNavigation(navType, activeNavKey) {
    var container = global.document.getElementById("nav-container");
    if (!container) {
      return;
    }

    var resolvedNavType = NAV_TYPES[navType] ? navType : "unauth";
    var navPath = NAV_TYPES[resolvedNavType];
    var fallbackMarkup = NAV_FALLBACKS[resolvedNavType] || "";

    if (fallbackMarkup) {
      renderNavigation(container, resolvedNavType, activeNavKey, fallbackMarkup);
    }

    if (!navPath) {
      return;
    }

    requestMarkup(navPath)
      .then(function (markup) {
        if (typeof markup === "string" && markup.trim()) {
          renderNavigation(container, resolvedNavType, activeNavKey, markup);
        }
      })
      .catch(function (error) {
        console.error("Failed to load navigation component", error);
      });
  }

  function requestMarkup(path) {
    if (global.fetch) {
      return global
        .fetch(path, { cache: "no-cache" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("HTTP " + response.status);
          }
          return response.text();
        });
    }

    return new global.Promise(function (resolve, reject) {
      var request = new XMLHttpRequest();
      request.addEventListener("load", function () {
        if (request.status >= 200 && request.status < 300) {
          resolve(request.responseText);
        } else {
          reject(new Error("HTTP " + request.status));
        }
      });
      request.addEventListener("error", function () {
        reject(new Error("Network error"));
      });
      request.open("GET", path, true);
      request.send();
    });
  }

  function readStoredSession() {
    if (!global.localStorage) {
      return null;
    }

    var session = null;
    var rawSession = global.localStorage.getItem("authSession");
    if (rawSession) {
      try {
        session = JSON.parse(rawSession);
      } catch (error) {
        session = null;
      }
    }

    if (!session) {
      var legacyToken = global.localStorage.getItem("authToken");
      if (legacyToken) {
        session = {
          accessToken: legacyToken,
          tokenType: global.localStorage.getItem("authTokenType") || "bearer",
        };
      }
    }

    return session;
  }

  function clearStoredSession() {
    if (!global.localStorage) {
      return;
    }
    global.localStorage.removeItem("authSession");
    global.localStorage.removeItem("authToken");
    global.localStorage.removeItem("authTokenType");
  }

  function attachAuthNavHandlers(container) {
    var signOutButton = container.querySelector("#signOutButton");
    if (!signOutButton) {
      return;
    }

    var backendHost =
      global.AppConfig && global.AppConfig.backendHost ? global.AppConfig.backendHost : null;

    signOutButton.addEventListener("click", function (event) {
      event.preventDefault();
      var session = readStoredSession();
      var request = null;

      if (backendHost && session && session.accessToken) {
        var headers = {
          Authorization:
            (session.tokenType ? session.tokenType : "Bearer") + " " + session.accessToken,
        };

        request = fetch(backendHost + "/auth/logout", {
          method: "POST",
          headers: headers,
        }).catch(function (error) {
          console.warn("Logout request failed", error);
        });
      }

      Promise.resolve(request)
        .catch(function () {
          /* swallow errors after logging */
        })
        .finally(function () {
          clearStoredSession();
          global.location.href = "index.html";
        });
    });
  }

  function highlightActiveNav(container, activeNavKey) {
    if (!activeNavKey) {
      return;
    }

    var links = container.querySelectorAll("[data-nav]");
    if (!links.length) {
      return;
    }

    for (var i = 0; i < links.length; i++) {
      links[i].classList.remove("active");
      links[i].removeAttribute("aria-current");
    }

    var activeLink = container.querySelector('[data-nav="' + activeNavKey + '"]');
    if (activeLink) {
      activeLink.classList.add("active");
      activeLink.setAttribute("aria-current", "page");
    }
  }

  function initNavigation() {
    var pageConfig = global.pageConfig || {};
    loadNavigation(pageConfig.navType || "unauth", pageConfig.activeNav);
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", initNavigation);
  } else {
    initNavigation();
  }
})(window);
