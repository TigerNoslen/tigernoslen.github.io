"use strict";

const aboutSection = document.querySelector("#about");
const exploreCue = document.querySelector(
    "#hero .hero-scroll-cue"
);
const backUpCue = document.querySelector("#backUpCue");

if (exploreCue && aboutSection) {
    exploreCue.addEventListener("click", () => {
        aboutSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

if (backUpCue) {
    backUpCue.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

const tppTrigger = document.querySelector(".tpp-info-trigger");
const tppPopover = document.querySelector("#tpp-description");

function setTppPopover(open) {
    if (!tppTrigger || !tppPopover) {
        return;
    }

    tppTrigger.setAttribute("aria-expanded", String(open));
    tppPopover.setAttribute("aria-hidden", String(!open));
    tppPopover.classList.toggle("is-visible", open);
}

if (tppTrigger && tppPopover) {
    tppTrigger.addEventListener("mouseenter", () => {
        setTppPopover(true);
    });

    tppTrigger.addEventListener("mouseleave", () => {
        if (document.activeElement !== tppTrigger) {
            setTppPopover(false);
        }
    });

    tppTrigger.addEventListener("focus", () => {
        setTppPopover(true);
    });

    tppTrigger.addEventListener("blur", () => {
        setTppPopover(false);
    });

    tppTrigger.addEventListener("click", (event) => {
        event.stopPropagation();

        const isOpen =
            tppTrigger.getAttribute("aria-expanded") === "true";

        setTppPopover(!isOpen);
    });

    tppPopover.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        setTppPopover(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setTppPopover(false);
            tppTrigger.focus();
        }
    });
}