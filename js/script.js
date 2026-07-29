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

/* ---------------------------------
   Copy Creator Code
---------------------------------- */

const copyCreatorCodeButton = document.querySelector(
    "#copyCreatorCode"
);

const creatorCodeStatus = document.querySelector(
    "#creatorCodeStatus"
);

let creatorCodeResetTimer;

async function copyTextToClipboard(text) {
    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const temporaryTextArea = document.createElement("textarea");

    temporaryTextArea.value = text;
    temporaryTextArea.setAttribute("readonly", "");
    temporaryTextArea.style.position = "fixed";
    temporaryTextArea.style.opacity = "0";
    temporaryTextArea.style.pointerEvents = "none";

    document.body.appendChild(temporaryTextArea);

    temporaryTextArea.select();
    temporaryTextArea.setSelectionRange(
        0,
        temporaryTextArea.value.length
    );

    const copySucceeded = document.execCommand("copy");

    temporaryTextArea.remove();

    if (!copySucceeded) {
        throw new Error("The creator code could not be copied.");
    }
}

if (copyCreatorCodeButton) {
    copyCreatorCodeButton.addEventListener("click", async () => {
        const creatorCode =
            copyCreatorCodeButton.dataset.code || "TIGERNOSLEN";

        const buttonText = copyCreatorCodeButton.querySelector(
            ".support-copy-text"
        );

        clearTimeout(creatorCodeResetTimer);

        try {
            await copyTextToClipboard(creatorCode);

            copyCreatorCodeButton.classList.add("is-copied");

            if (buttonText) {
                buttonText.textContent = "Copied!";
            }

            if (creatorCodeStatus) {
                creatorCodeStatus.textContent =
                    `${creatorCode} copied to your clipboard.`;
            }

            creatorCodeResetTimer = window.setTimeout(() => {
                copyCreatorCodeButton.classList.remove("is-copied");

                if (buttonText) {
                    buttonText.textContent = "Copy Creator Code";
                }

                if (creatorCodeStatus) {
                    creatorCodeStatus.textContent = "";
                }
            }, 2500);
        } catch (error) {
            if (creatorCodeStatus) {
                creatorCodeStatus.textContent =
                    "Copy failed. Please select TIGERNOSLEN manually.";
            }

            console.error(error);
        }
    });
}

/* ---------------------------------
   Active Navigation / Scrollspy
---------------------------------- */

const navLinks = Array.from(
    document.querySelectorAll(".nav-links a[href^='#']")
);

const navSections = navLinks
    .map((link) => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return null;
        }

        return document.querySelector(targetId);
    })
    .filter(Boolean);

function setActiveNavLink(sectionId) {
    navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${sectionId}`;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

if (navLinks.length > 0 && navSections.length > 0) {
    const navObserver = new IntersectionObserver(
        (entries) => {
            const visibleSections = entries
                .filter((entry) => entry.isIntersecting)
                .sort(
                    (firstEntry, secondEntry) =>
                        secondEntry.intersectionRatio -
                        firstEntry.intersectionRatio
                );

            if (visibleSections.length > 0) {
                setActiveNavLink(visibleSections[0].target.id);
            }
        },
        {
            rootMargin: "-18% 0px -55% 0px",
            threshold: [0, 0.1, 0.25, 0.5]
        }
    );

    navSections.forEach((section) => {
        navObserver.observe(section);
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            const targetId = link.getAttribute("href").slice(1);

            setActiveNavLink(targetId);
        });
    });
}

/* ---------------------------------
   Footer
---------------------------------- */

const currentYear = document.querySelector("#currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

const footerCopyCodeButton = document.querySelector(
    ".footer-copy-code"
);

let footerCopyResetTimer;

if (footerCopyCodeButton) {
    footerCopyCodeButton.addEventListener("click", async () => {
        const creatorCode =
            footerCopyCodeButton.dataset.footerCode || "TIGERNOSLEN";

        clearTimeout(footerCopyResetTimer);

        try {
            await copyTextToClipboard(creatorCode);

            footerCopyCodeButton.textContent = "Copied!";
            footerCopyCodeButton.classList.add("is-copied");

            footerCopyResetTimer = window.setTimeout(() => {
                footerCopyCodeButton.textContent = "Copy Creator Code";
                footerCopyCodeButton.classList.remove("is-copied");
            }, 2500);
        } catch (error) {
            footerCopyCodeButton.textContent = "Copy TIGERNOSLEN manually";

            console.error(error);
        }
    });
}