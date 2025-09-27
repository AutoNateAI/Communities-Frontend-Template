(function ($, global) {
  const NAV_TYPES = {
    unauth: "components/unauth-nav.html",
    auth: "components/auth-nav.html",
  };

  const NAV_FALLBACKS = {
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
      '        <a class="btn btn-outline-primary" href="login.html">Log in</a>',
      '        <a class="btn btn-primary" href="signup.html">Sign up</a>',
      "      </div>",
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
    container.html(markup);
    if (navType === "auth") {
      attachAuthNavHandlers();
    }
    highlightActiveNav(activeNavKey);
  }

  function loadNavigation(navType, activeNavKey) {
    const container = $("#nav-container");
    if (!container.length) {
      return;
    }

    const navPath = NAV_TYPES[navType] || NAV_TYPES.unauth;

    $.get(navPath)
      .done(function (markup) {
        renderNavigation(container, navType, activeNavKey, markup);
      })
      .fail(function (jqXHR, textStatus) {
        console.error("Failed to load navigation component", textStatus);
        const fallbackMarkup = NAV_FALLBACKS[navType] || NAV_FALLBACKS.unauth;
        renderNavigation(container, navType, activeNavKey, fallbackMarkup);
      });
  }

  function attachAuthNavHandlers() {
    $(document)
      .off("click", "#signOutButton")
      .on("click", "#signOutButton", function (event) {
        event.preventDefault();
        if (global.localStorage) {
          global.localStorage.removeItem("authToken");
        }
        global.location.href = "login.html";
      });
  }

  function highlightActiveNav(activeNavKey) {
    if (!activeNavKey) {
      return;
    }

    const navContainer = $("#nav-container");
    const links = navContainer.find("[data-nav]");
    if (!links.length) {
      return;
    }

    links.removeClass("active").removeAttr("aria-current");
    const activeLink = links.filter(`[data-nav="${activeNavKey}"]`).first();
    if (activeLink.length) {
      activeLink.addClass("active").attr("aria-current", "page");
    }
  }

  $(function () {
    const pageConfig = global.pageConfig || {};
    loadNavigation(pageConfig.navType || "unauth", pageConfig.activeNav);
  });
})(jQuery, window);
