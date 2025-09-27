(function (global) {
  const ENVIRONMENTS = {
    development: {
      backendHost: "http://127.0.0.1:8000",
    },
    production: {
      backendHost: "https://backend-template-small-snowflake-3911.fly.dev",
    },
  };

  const PRODUCTION_HOSTS = ["autonateai.github.io"];

  const resolveEnvironment = () => {
    const fromGlobal = global.APP_ENV;
    if (fromGlobal && ENVIRONMENTS[fromGlobal]) {
      return fromGlobal;
    }

    const fromStorage =
      global.localStorage && global.localStorage.getItem("appEnv");
    if (fromStorage && ENVIRONMENTS[fromStorage]) {
      return fromStorage;
    }

    const host = global.location && global.location.host;
    if (host && PRODUCTION_HOSTS.includes(host)) {
      return "production";
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
