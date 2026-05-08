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

const typed = new Typed('.multiple-text',  {
    strings: ['Frontend Developer', 'Backend Developer', 'Blockchain Developer', 'Web Designer', 'Youtuber'],
    typeSpeed: 80,
    backSpeed: 80,
    backDelay: 1200,
    loop: true,
 });
