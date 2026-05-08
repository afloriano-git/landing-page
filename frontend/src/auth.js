const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await axios.post("/api/auth/login", {
            email: email,
            password: password
        }, { withCredentials: true });
        window.location.href = "/portfolio";
    } catch (error) {
        console.log(error.response?.data?.message);
    }
});

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
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
        console.log(error.response?.data?.message);
    }
});