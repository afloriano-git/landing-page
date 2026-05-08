let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');
const parallaxLayers = document.querySelectorAll('.parallax-layer');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

window.addEventListener('scroll', () => {
    menu.classList.remove('bx-x');
    navbar.classList.remove('active');
});

const updateParallax = () => {
    const viewportCenter = window.innerHeight / 2;

    parallaxLayers.forEach((layer) => {
        const speed = Number(layer.dataset.speed) || 0;
        const rect = layer.getBoundingClientRect();
        const layerCenter = rect.top + rect.height / 2;
        const movement = (viewportCenter - layerCenter) * speed;

        layer.style.transform = `translate3d(0, ${movement}px, 0)`;
    });
};

window.addEventListener('scroll', updateParallax, { passive: true });
window.addEventListener('resize', updateParallax);
updateParallax();
loadUser();

const typed = new Typed('.multiple-text',  {
    strings: ['Frontend Developer', 'Backend Developer', 'Blockchain Developer', 'Web Designer', 'Youtuber'],
    typeSpeed: 80,
    backSpeed: 80,
    backDelay: 1200,
    loop: true,
 });

const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        await axios.post("/api/auth/logout", {}, {
            withCredentials: true
        });
        window.location.href = "/auth";
    } catch (error) {
        console.log(error);
    }
});

async function loadUser() {
    try {
        const res = await axios.get("/api/auth/check", {
            withCredentials: true
        });
        const user = res.data;
        console.log(user);
        document.querySelectorAll(".user-fullName-dependent").forEach(e => {
            e.textContent = user.fullName;
            if(e.classList.contains("copyright")) e.textContent = "© " + user.fullName + " - All Rights Reserved"
        });
    } catch (error) {
        window.location.href = "/auth";
    }
}