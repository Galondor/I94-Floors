document.querySelector("#year").textContent = new Date().getFullYear();

const gallery = document.querySelector(".product-gallery");
const slides = [...gallery.querySelectorAll(".product-slide")];
const slideContainer = gallery.querySelector(".product-slides");
const status = gallery.querySelector(".gallery-status");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let activeIndex = 0;
let userPaused = false;
let imageFailed = false;
const heldPointers = new Set();
let timer;

function scheduleRotation() {
    clearTimeout(timer);
    const paused = userPaused || heldPointers.size > 0 || reducedMotion.matches || imageFailed;
    slideContainer.setAttribute("aria-live", paused ? "polite" : "off");
    gallery.classList.toggle("is-paused", paused);

    if (!paused && !document.hidden) {
        timer = setTimeout(() => {
            showSlide(activeIndex + 1);
        }, 7000);
    }
}

function showSlide(index) {
    const nextIndex = (index + slides.length) % slides.length;
    const image = slides[nextIndex].querySelector("img");

    if (!image.complete) {
        image.addEventListener("load", () => {
            scheduleRotation();
        }, { once: true });
    }

    if (image.complete && image.naturalWidth > 0) {
        slides[activeIndex].classList.remove("is-active");
        slides[activeIndex].setAttribute("aria-hidden", "true");
        slides[nextIndex].classList.add("is-active");
        slides[nextIndex].removeAttribute("aria-hidden");
        activeIndex = nextIndex;
    }

    scheduleRotation();
}

gallery.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("a, button")) {
        return;
    }
    heldPointers.add(event.pointerId);
    gallery.setPointerCapture(event.pointerId);
    scheduleRotation();
});

function releasePointer(event) {
    heldPointers.delete(event.pointerId);
    scheduleRotation();
}

gallery.addEventListener("pointerup", releasePointer);
gallery.addEventListener("pointercancel", releasePointer);
gallery.addEventListener("lostpointercapture", releasePointer);
gallery.addEventListener("dragstart", (event) => event.preventDefault());
gallery.addEventListener("contextmenu", (event) => event.preventDefault());

gallery.addEventListener("keydown", (event) => {
    if (event.code === "Space" && event.target === gallery) {
        event.preventDefault();
        if (!event.repeat) {
            userPaused = !userPaused;
            scheduleRotation();
        }
    }
});

reducedMotion.addEventListener("change", () => {
    scheduleRotation();
});

function releaseAllPointers() {
    heldPointers.clear();
    scheduleRotation();
}

window.addEventListener("blur", releaseAllPointers);
document.addEventListener("visibilitychange", releaseAllPointers);

for (const image of gallery.querySelectorAll("img")) {
    const reportImageError = () => {
        imageFailed = true;
        status.textContent = "A product photo could not load. Please call us for help viewing samples.";
        status.hidden = false;
        console.error("Could not load product photo:", image.getAttribute("src"));
        scheduleRotation();
    };

    image.addEventListener("error", reportImageError);
    if (image.complete && image.naturalWidth === 0) {
        reportImageError();
    }
}

scheduleRotation();