const menuButton = document.querySelector(".menu-toggle");
const siteLinks = document.querySelector("#site-links");

menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    siteLinks.classList.toggle("is-open", !isOpen);
});

siteLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
        siteLinks.classList.remove("is-open");
    }
});

document.querySelector("#year").textContent = new Date().getFullYear();