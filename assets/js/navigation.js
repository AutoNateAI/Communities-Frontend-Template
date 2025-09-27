(function ($, global) {
  const NAV_TYPES = {
    unauth: "components/unauth-nav.html",
    auth: "components/auth-nav.html",
  };

  function loadNavigation(navType) {
    const container = $("#nav-container");
    if (!container.length) {
      return;
    }

    const navPath = NAV_TYPES[navType] || NAV_TYPES.unauth;
    container.load(navPath, function () {
      if (navType === "auth") {
        attachAuthNavHandlers();
      }
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

  $(function () {
    const pageConfig = global.pageConfig || {};
    loadNavigation(pageConfig.navType || "unauth");
  });
})(jQuery, window);
