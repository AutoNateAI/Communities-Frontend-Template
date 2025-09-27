(function ($, global) {
  function parseJson(response) {
    return response
      .text()
      .then((text) => (text ? JSON.parse(text) : {}))
      .catch(() => ({}));
  }

  function extractErrorMessage(data, fallbackMessage) {
    if (!data) {
      return fallbackMessage;
    }

    if (data.detail) {
      if (typeof data.detail === "string") {
        return data.detail;
      }
      if (Array.isArray(data.detail) && data.detail.length) {
        return data.detail
          .map((item) => {
            if (!item) {
              return null;
            }
            if (typeof item === "string") {
              return item;
            }
            const parts = [];
            if (Array.isArray(item.loc) && item.loc.length) {
              parts.push(item.loc.join("."));
            }
            if (item.msg) {
              parts.push(item.msg);
            }
            return parts.join(": ") || null;
          })
          .filter(Boolean)
          .join(". ");
      }
    }

    return data.message || data.error || fallbackMessage;
  }

  function handleResponse(response) {
    if (!response.ok) {
      return parseJson(response).then((data) => {
        const errorMessage = extractErrorMessage(data, "Authentication failed");
        throw new Error(errorMessage);
      });
    }
    return parseJson(response);
  }

  function storeToken(session) {
    if (!session || !session.access_token) {
      throw new Error("Missing authentication token");
    }

    const record = {
      accessToken: session.access_token,
      tokenType: session.token_type || "bearer",
    };

    if (global.localStorage) {
      try {
        global.localStorage.setItem("authSession", JSON.stringify(record));
      } catch (error) {
        console.warn("Unable to persist auth session", error);
      }
      global.localStorage.setItem("authToken", record.accessToken);
      global.localStorage.setItem("authTokenType", record.tokenType);
    }
  }

  function displayError($form, message) {
    const $alert = $form.find(".form-alert");
    $alert.text(message).removeClass("d-none");
  }

  function clearError($form) {
    const $alert = $form.find(".form-alert");
    $alert.addClass("d-none").text("");
  }

  function submitForm({ url, payload, $form, buildRequest }) {
    clearError($form);
    const submitButton = $form.find("button[type='submit']");
    const originalText = submitButton.text();
    submitButton.prop("disabled", true).text("Loading...");

    const requestInit =
      typeof buildRequest === "function"
        ? buildRequest(payload)
        : {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          };

    return fetch(url, requestInit)
      .then(handleResponse)
      .catch((error) => {
        displayError($form, error.message);
        throw error;
      })
      .finally(() => {
        submitButton.prop("disabled", false).text(originalText);
      });
  }

  function passwordsMatch(password, confirmPassword) {
    return password && password === confirmPassword;
  }

  $(function () {
    const backendHost = global.AppConfig.backendHost;

    $("#signupForm").on("submit", function (event) {
      event.preventDefault();
      const $form = $(this);
      const password = $form.find("#signupPassword").val();
      const confirmPassword = $form.find("#signupConfirmPassword").val();

      if (!passwordsMatch(password, confirmPassword)) {
        displayError($form, "Passwords do not match");
        return;
      }

      const payload = {
        username: $form.find("#signupUsername").val(),
        email: $form.find("#signupEmail").val(),
        password,
        user_type: $form.find("#signupUserType").val(),
      };

      submitForm({
        url: `${backendHost}/auth/signup`,
        payload,
        $form,
      })
        .then(() => {
          global.location.href = "login.html";
        })
        .catch(() => {});
    });

    $("#loginForm").on("submit", function (event) {
      event.preventDefault();
      const $form = $(this);
      const payload = {
        username: $form.find("#loginUsername").val(),
        password: $form.find("#loginPassword").val(),
      };

      submitForm({
        url: `${backendHost}/auth/login`,
        payload,
        $form,
        buildRequest(data) {
          const params = new URLSearchParams();
          Object.keys(data).forEach((key) => {
            if (data[key] !== undefined && data[key] !== null) {
              params.append(key, data[key]);
            }
          });
          return {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
          };
        },
      })
        .then((data) => {
          storeToken(data);
          global.location.href = "dashboard.html";
        })
        .catch(() => {});
    });
  });
})(jQuery, window);
