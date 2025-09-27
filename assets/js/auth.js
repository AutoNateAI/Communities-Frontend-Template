(function ($, global) {
  function parseJson(response) {
    return response
      .text()
      .then((text) => (text ? JSON.parse(text) : {}))
      .catch(() => ({}));
  }

  function handleResponse(response) {
    if (!response.ok) {
      return parseJson(response).then((data) => {
        const errorMessage = data.message || "Authentication failed";
        throw new Error(errorMessage);
      });
    }
    return parseJson(response);
  }

  function storeToken(token) {
    if (!token) {
      throw new Error("Missing authentication token");
    }
    if (global.localStorage) {
      global.localStorage.setItem("authToken", token);
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

  function submitForm({ url, payload, $form }) {
    clearError($form);
    const submitButton = $form.find("button[type='submit']");
    const originalText = submitButton.text();
    submitButton.prop("disabled", true).text("Loading...");

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
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
        email: $form.find("#loginEmail").val(),
        password: $form.find("#loginPassword").val(),
      };

      submitForm({
        url: `${backendHost}/auth/login`,
        payload,
        $form,
      })
        .then((data) => {
          storeToken(data.token);
          global.location.href = "dashboard.html";
        })
        .catch(() => {});
    });
  });
})(jQuery, window);
