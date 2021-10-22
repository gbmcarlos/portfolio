// Menu toggle
var body = document.querySelector('body')
var menuTrigger = document.querySelector('.toggle-line');
var menuContainer = document.querySelector('.main-menu');

menuTrigger.onclick = function() {
    menuContainer.classList.toggle('open');
    menuTrigger.classList.toggle('active')
    body.classList.toggle('lock-scroll')
}
