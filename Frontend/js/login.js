document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("login-btn");
    const errorBox = document.getElementById("login-error");

    // If already logged in with a valid (non-expired) token, go straight to dashboard
    const existingToken = sessionStorage.getItem(AUTH_STORAGE_KEYS.token);
    const existingExpiry = sessionStorage.getItem(AUTH_STORAGE_KEYS.expiresAtUtc);
    if (existingToken && existingExpiry && new Date(existingExpiry) > new Date()) {
        window.location.href = "dashboard.html";
        return;
    }

    function showError(message) {
        errorBox.textContent = message;
        errorBox.hidden = false;
    }

    function hideError() {
        errorBox.textContent = "";
        errorBox.hidden = true;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        hideError();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError("Please enter both your email and password.");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing in...";

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    showError("Invalid email or password.");
                } else {
                    showError(`Login failed (HTTP ${response.status}). Please try again.`);
                }
                return;
            }

            const data = await response.json();
            if (!data.token) {
                showError("Server did not return a token.");
                return;
            }

            sessionStorage.setItem(AUTH_STORAGE_KEYS.token, data.token);
            if (data.expiresAtUtc) {
                sessionStorage.setItem(AUTH_STORAGE_KEYS.expiresAtUtc, data.expiresAtUtc);
            }

            window.location.href = "dashboard.html";
        } catch (err) {
            // Often occurs if ResumeAPI isn't running, SSL isn't trusted in browser, or CORS blocks the origin
            showError("Unable to reach the API server. Check that ResumeAPI is running and CORS is enabled.");
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = "Log In";
        }
    });
});