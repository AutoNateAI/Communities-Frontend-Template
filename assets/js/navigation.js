(function ($, global) {
  const NAV_TYPES = {
    unauth: "components/unauth-nav.html",
    auth: "components/auth-nav.html",
  };

  function loadNavigation(navType, activeNavKey) {

    const container = $("#nav-container");
    if (!container.length) {
      return;
    }

    const navPath = NAV_TYPES[navType] || NAV_TYPES.unauth;
    container.load(navPath, function () {
      if (navType === "auth") {
        attachAuthNavHandlers();
      }
      highlightActiveNav(activeNavKey);

    });
  }

  function attachAuthNavHandlers() {
    $(document).on("click", "#signOutButton", function (event) {
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
