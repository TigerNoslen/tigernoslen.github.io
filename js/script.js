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