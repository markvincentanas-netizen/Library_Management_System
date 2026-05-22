var el = document.getElementById("wrapper");
var toggleButton = document.getElementById("menu-toggle");

if (toggleButton) {
    toggleButton.onclick = function () {
        el.classList.toggle("toggled");
    };
}
