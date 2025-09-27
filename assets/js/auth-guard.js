(function (global) {
  function hasToken() {
    return !!(global.localStorage && global.localStorage.getItem("authToken"));
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
