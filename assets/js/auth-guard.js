(function (global) {
  function hasToken() {
    if (!global.localStorage) {
      return false;
    }

    if (global.localStorage.getItem("authToken")) {
      return true;
    }

    var rawSession = global.localStorage.getItem("authSession");
    if (!rawSession) {
      return false;
    }

    try {
      var session = JSON.parse(rawSession);
      return !!(session && session.accessToken);
    } catch (error) {
      return false;
    }
  }

  function enforceAuth() {
    const pageConfig = global.pageConfig || {};
    if (pageConfig.requireAuth && !hasToken()) {
      global.location.href = "login.html";
      return;
    }
    if (pageConfig.redirectIfAuthenticated && hasToken()) {
      global.location.href = pageConfig.redirectIfAuthenticated;
    }
  }

  document.addEventListener("DOMContentLoaded", enforceAuth);
})(window);
