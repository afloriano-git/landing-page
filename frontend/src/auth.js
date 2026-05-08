const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authError = document.getElementById("auth-error");

const showAuthError = (message) => {
    authError.textContent = message || "Something went wrong. Please try again.";
    authError.classList.add("show");
};

const hideAuthError = () => {
    authError.textContent = "";
    authError.classList.remove("show");
};

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAuthError();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await axios.post("/api/auth/login", {
            email: email,
            password: password
        }, { withCredentials: true });
        window.location.href = "/portfolio";
        console.log(res)
    } catch (error) {
        showAuthError(error.response?.data?.message || "Login failed. Check your email and password.");
    }
});

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAuthError();

    const fullName = document.getElementById("register-fullName").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        const res = await axios.post("/api/auth/signup", {
            fullName: fullName,
            email: email,
            password: password
        }, { withCredentials: true });
        window.location.href = "/portfolio";
    } catch (error) {
        showAuthError(error.response?.data?.message || "Register failed. Please check your information.");
    }
});
