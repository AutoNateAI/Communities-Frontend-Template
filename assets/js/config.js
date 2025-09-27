(function (global) {
  const ENVIRONMENTS = {
    development: {
      backendHost: "http://localhost:4000",
    },
    production: {
      backendHost: "https://api.example.com",
    },
  };

  const resolveEnvironment = () => {
    const fromGlobal = global.APP_ENV;
    if (fromGlobal && ENVIRONMENTS[fromGlobal]) {
      return fromGlobal;
    }
    const fromStorage = global.localStorage && global.localStorage.getItem("appEnv");
    if (fromStorage && ENVIRONMENTS[fromStorage]) {
      return fromStorage;
    }
    return "development";
  };

  const environment = resolveEnvironment();
  const config = ENVIRONMENTS[environment];

  global.AppConfig = {
    environment,
    backendHost: config.backendHost,
    setEnvironment(nextEnvironment) {
      if (!ENVIRONMENTS[nextEnvironment]) {
        console.warn(`Unknown environment "${nextEnvironment}". Falling back to development.`);
        return;
      }
      if (global.localStorage) {
        global.localStorage.setItem("appEnv", nextEnvironment);
      }
      global.location.reload();
    },
  };
})(window);
