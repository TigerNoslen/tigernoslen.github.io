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

const creatorCodeBanner = document.querySelector(
    "#creatorCodeBanner"
);

const creatorCodeBannerStatus = document.querySelector(
    "#creatorCodeBannerStatus"
);

let creatorCodeBannerResetTimer;

if (creatorCodeBanner) {
    creatorCodeBanner.addEventListener("click", async () => {
        const creatorCode =
            creatorCodeBanner.dataset.code || "TIGERNOSLEN";

        clearTimeout(creatorCodeBannerResetTimer);

        try {
            await copyTextToClipboard(creatorCode);

            creatorCodeBanner.classList.add("is-copied");

            const codeValue = creatorCodeBanner.querySelector(
                ".creator-code-value"
            );

            if (codeValue) {
                codeValue.textContent = "COPIED!";
            }

            if (creatorCodeBannerStatus) {
                creatorCodeBannerStatus.textContent =
                    `${creatorCode} copied to your clipboard.`;
            }

            creatorCodeBannerResetTimer = window.setTimeout(() => {
                creatorCodeBanner.classList.remove("is-copied");

                if (codeValue) {
                    codeValue.textContent = creatorCode;
                }

                if (creatorCodeBannerStatus) {
                    creatorCodeBannerStatus.textContent = "";
                }
            }, 2500);
        } catch (error) {
            if (creatorCodeBannerStatus) {
                creatorCodeBannerStatus.textContent =
                    "Copy failed. Please copy TIGERNOSLEN manually.";
            }

            console.error(error);
        }
    });
}

/* ---------------------------------
   Mobile Navigation
---------------------------------- */

const mobileMenuButton = document.querySelector(
    ".mobile-menu-button"
);

const mainNavigation = document.querySelector(
    ".main-nav"
);

if (mobileMenuButton && mainNavigation) {
    mobileMenuButton.addEventListener("click", () => {
        const isOpen = mainNavigation.classList.toggle("is-open");

        mobileMenuButton.classList.toggle("is-open", isOpen);
        mobileMenuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNavigation.classList.remove("is-open");
            mobileMenuButton.classList.remove("is-open");
            mobileMenuButton.setAttribute(
                "aria-expanded",
                "false"
            );
        });
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
    const updateActiveNavLink = () => {
        const headerOffset = 150;
        const scrollPosition =
            window.scrollY + headerOffset;

        let currentSectionId =
            navSections[0].id;

        navSections.forEach((section) => {
            if (section.offsetTop <= scrollPosition) {
                currentSectionId = section.id;
            }
        });

        const pageBottom =
            window.innerHeight + window.scrollY;

        const documentHeight =
            document.documentElement.scrollHeight;

        if (pageBottom >= documentHeight - 5) {
            currentSectionId =
                navSections[navSections.length - 1].id;
        }

        setActiveNavLink(currentSectionId);
    };

    window.addEventListener(
        "scroll",
        updateActiveNavLink,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        updateActiveNavLink
    );

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            const targetId =
                link.getAttribute("href").slice(1);

            setActiveNavLink(targetId);
        });
    });

    updateActiveNavLink();
}

    document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key !== "Escape" ||
            !mainNavigation.classList.contains("is-open")
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        mainNavigation.classList.remove("is-open");
        mobileMenuButton.classList.remove("is-open");
        mobileMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );
    },
    true
);

/* ==================================================
   TIGER'S MAPS — CLASSIFIED FILE
================================================== */

const classifiedButton =
    document.getElementById("classifiedButton");

const classifiedMessage =
    document.getElementById("classifiedMessage");

if (classifiedButton && classifiedMessage) {
    let classifiedSequenceRunning = false;

    const wait = (milliseconds) =>
        new Promise((resolve) => {
            window.setTimeout(resolve, milliseconds);
        });

    classifiedButton.addEventListener(
        "click",
        async () => {
            if (classifiedSequenceRunning) {
                return;
            }

            classifiedSequenceRunning = true;
            classifiedButton.disabled = true;
            classifiedButton.textContent =
                "Decrypting...";

            classifiedMessage.classList.remove(
                "is-denied"
            );

            classifiedMessage.classList.add(
                "is-visible",
                "is-decrypting"
            );

            classifiedMessage.textContent =
                "CONNECTING TO SECURE SERVER...";

            await wait(500);

            classifiedMessage.textContent =
                "DECRYPTING CLASSIFIED FILE...\n" +
                "██░░░░░░░░ 18%";

            await wait(550);

            classifiedMessage.textContent =
                "DECRYPTING CLASSIFIED FILE...\n" +
                "█████░░░░░ 52%";

            await wait(550);

            classifiedMessage.textContent =
                "DECRYPTING CLASSIFIED FILE...\n" +
                "████████░░ 84%";

            await wait(650);

            classifiedMessage.classList.remove(
                "is-decrypting"
            );

            classifiedMessage.classList.add(
                "is-denied"
            );

            classifiedMessage.textContent =
                "ACCESS DENIED\n" +
                "INSUFFICIENT CLEARANCE — NICE TRY.";

            classifiedButton.textContent =
                "Clearance Denied";

            await wait(2600);

            classifiedMessage.classList.remove(
                "is-visible",
                "is-denied"
            );

            classifiedButton.textContent =
                "View Classified File";

            classifiedButton.disabled = false;
            classifiedSequenceRunning = false;
        }
    );
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



/* ==================================================
   LIVE STREAM STATUS
================================================== */

const LIVE_STATUS_CONFIG = {
    /*
     * Replace this after deploying the Cloudflare Worker.
     * Example:
     * https://tng-live-status.your-name.workers.dev/status
     */
    endpoint: "https://tng-live-status.tiger-noslen.workers.dev/status",

    youtubeChannelUrl: "https://www.youtube.com/@TigerNoslen",
    refreshIntervalMs: 15000,
    staleAfterMinutes: 720
};

const liveStatusElements = {
    navIndicator: document.querySelector("#navLiveIndicator"),
    navText: document.querySelector("#navLiveText"),
    navButton: document.querySelector("#navWatchButton"),
    navButtonText: document.querySelector("#navWatchText"),
    heroStatus: document.querySelector("#heroLiveStatus"),
    heroLabel: document.querySelector("#heroStatusLabel"),
    heroDetail: document.querySelector("#heroStatusDetail"),
    heroCountdown: document.querySelector("#heroCountdown"),
    heroButton: document.querySelector("#heroWatchButton"),
    heroButtonText: document.querySelector("#heroWatchText")
};

function getAnnouncementStreamOverride() {
    const announcement =
        document.querySelector("#announcement");

    if (!announcement) {
        return null;
    }

    const title =
        announcement.dataset.nextStreamTitle;

    const dateValue =
        announcement.dataset.nextStreamDate;

    if (!title || !dateValue) {
        return null;
    }

    const date = new Date(dateValue);

    if (
        !Number.isFinite(date.getTime()) ||
        date <= new Date()
    ) {
        return null;
    }

    return {
        title,
        date
    };
}

const weeklyStreams = [
    { day: 1, title: "Mod Mondays", hour: 17, minute: 0 },
    { day: 2, title: "Tiger Strike Tuesdays", hour: 17, minute: 0 },
    { day: 4, title: "Thrilling Thursdays", hour: 17, minute: 0 },
    { day: 5, title: "Fight Night Fridays", hour: 18, minute: 0 },
    { day: 6, title: "Squad Up Saturdays", hour: 18, minute: 30 }
];

function setStatusClasses(element, state) {
    if (!element) {
        return;
    }

    element.classList.remove(
        "is-checking",
        "is-live",
        "is-offline",
        "is-stale"
    );

    element.classList.add(`is-${state}`);
}

function formatNextStream() {
    const now = new Date();

    const announcementOverride =
        getAnnouncementStreamOverride();

    if (announcementOverride) {
        const dateText = new Intl.DateTimeFormat(
            "en-CA",
            {
                weekday: "long",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZone: "America/Toronto",
                timeZoneName: "short"
            }
        ).format(announcementOverride.date);

        return {
            title: announcementOverride.title,
            detail: dateText,
            date: announcementOverride.date
        };
    }

    const candidates = weeklyStreams.map((stream) => {
        const candidate = new Date(now);

        const daysUntil =
            (stream.day - now.getDay() + 7) % 7;

        candidate.setDate(
            now.getDate() + daysUntil
        );

        candidate.setHours(
            stream.hour,
            stream.minute,
            0,
            0
        );

        if (candidate <= now) {
            candidate.setDate(
                candidate.getDate() + 7
            );
        }

        return {
            ...stream,
            date: candidate
        };
    });

    candidates.sort(
        (a, b) => a.date - b.date
    );

    const next = candidates[0];

    const dateText = new Intl.DateTimeFormat(
        "en-CA",
        {
            weekday: "long",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZone: "America/Toronto",
            timeZoneName: "short"
        }
    ).format(next.date);

    return {
        title: next.title,
        detail: dateText,
        date: next.date
    };
}

let countdownTargetDate = null;

function stopStreamCountdown() {
    countdownTargetDate = null;

    if (liveStatusElements.heroCountdown) {
        liveStatusElements.heroCountdown.textContent = "";
        liveStatusElements.heroCountdown.hidden = true;
    }
}

function updateStreamCountdown() {
    if (
        !countdownTargetDate ||
        !liveStatusElements.heroCountdown
    ) {
        return;
    }

    const remainingMs =
        countdownTargetDate.getTime() - Date.now();

    if (remainingMs <= 0) {
        const nextStream = formatNextStream();

        countdownTargetDate = nextStream.date;

        liveStatusElements.heroCountdown.textContent =
            "Stream starting soon!";

        return;
    }

    const totalSeconds =
        Math.floor(remainingMs / 1000);

    const days =
        Math.floor(totalSeconds / 86400);

    const hours =
        Math.floor((totalSeconds % 86400) / 3600);

    const minutes =
        Math.floor((totalSeconds % 3600) / 60);

    const seconds =
        totalSeconds % 60;

    liveStatusElements.heroCountdown.hidden = false;

    liveStatusElements.heroCountdown.innerHTML = `
        <span class="countdown-unit">
            <strong>${String(days).padStart(2, "0")}</strong>
            <small>Days</small>
        </span>

        <span class="countdown-unit">
            <strong>${String(hours).padStart(2, "0")}</strong>
            <small>Hours</small>
        </span>

        <span class="countdown-unit">
            <strong>${String(minutes).padStart(2, "0")}</strong>
            <small>Minutes</small>
        </span>

        <span class="countdown-unit">
            <strong>${String(seconds).padStart(2, "0")}</strong>
            <small>Seconds</small>
        </span>
    `;

    liveStatusElements.heroCountdown.setAttribute(
        "aria-label",
        `${days} days, ${hours} hours, ` +
        `${minutes} minutes, and ${seconds} seconds until the next stream`
    );
}

function startStreamCountdown(date) {
    if (!(date instanceof Date)) {
        stopStreamCountdown();
        return;
    }

    countdownTargetDate = date;

    updateStreamCountdown();
}
  
function renderLiveStatus(status) {
    const isLive = status.live === true;
    const streamUrl =
        status.streamUrl || LIVE_STATUS_CONFIG.youtubeChannelUrl;

    if (isLive) {
        stopStreamCountdown();
        setStatusClasses(liveStatusElements.navIndicator, "live");
        setStatusClasses(liveStatusElements.heroStatus, "live");

        if (liveStatusElements.navText) {
            liveStatusElements.navText.textContent = "Live Now";
        }

        if (liveStatusElements.navButton) {
            liveStatusElements.navButton.href = streamUrl;
            liveStatusElements.navButton.classList.remove("is-offline");
        }

        if (liveStatusElements.navButtonText) {
            liveStatusElements.navButtonText.textContent = "Watch Live";
        }

        if (liveStatusElements.heroLabel) {
            liveStatusElements.heroLabel.textContent = "Live Now";
        }

        if (liveStatusElements.heroDetail) {
            liveStatusElements.heroDetail.textContent =
                status.title || "Tiger Noslen is live on YouTube";
        }

        if (liveStatusElements.heroButton) {
            liveStatusElements.heroButton.href = streamUrl;
            liveStatusElements.heroButton.classList.remove("is-offline");
        }

        if (liveStatusElements.heroButtonText) {
            liveStatusElements.heroButtonText.textContent = "Watch Live";
        }

        return;
    }

    const nextStream = formatNextStream();

    startStreamCountdown(nextStream.date);

    setStatusClasses(liveStatusElements.navIndicator, "offline");
    setStatusClasses(liveStatusElements.heroStatus, "offline");

    if (liveStatusElements.navText) {
        liveStatusElements.navText.textContent = "Offline";
    }

    if (liveStatusElements.navButton) {
        liveStatusElements.navButton.href =
            LIVE_STATUS_CONFIG.youtubeChannelUrl;

        liveStatusElements.navButton.classList.add("is-offline");
    }

    if (liveStatusElements.navButtonText) {
        liveStatusElements.navButtonText.textContent = "YouTube";
    }

    if (liveStatusElements.heroLabel) {
        liveStatusElements.heroLabel.textContent =
            `Next Stream: ${nextStream.title}`;
    }

    if (liveStatusElements.heroDetail) {
        liveStatusElements.heroDetail.textContent =
            nextStream.detail;
    }

    if (liveStatusElements.heroButton) {
        liveStatusElements.heroButton.href =
            LIVE_STATUS_CONFIG.youtubeChannelUrl;

        liveStatusElements.heroButton.classList.add("is-offline");
    }

    if (liveStatusElements.heroButtonText) {
        liveStatusElements.heroButtonText.textContent =
            "Visit YouTube";
    }
}

function renderFallbackStatus() {
    const nextStream = formatNextStream();

    startStreamCountdown(nextStream.date);

    setStatusClasses(liveStatusElements.navIndicator, "stale");
    setStatusClasses(liveStatusElements.heroStatus, "stale");

    if (liveStatusElements.navText) {
        liveStatusElements.navText.textContent = "OFFLINE";
    }

    if (liveStatusElements.heroLabel) {
        liveStatusElements.heroLabel.textContent =
            `Next Stream: ${nextStream.title}`;
    }

    if (liveStatusElements.heroDetail) {
        liveStatusElements.heroDetail.textContent =
            nextStream.detail;
    }
}

function getTestStatus() {
    const params = new URLSearchParams(window.location.search);
    const testState = params.get("liveTest");

    if (testState === "live") {
        return {
            live: true,
            title: "TEST — Tiger Noslen Live",
            streamUrl: LIVE_STATUS_CONFIG.youtubeChannelUrl
        };
    }

    if (testState === "offline") {
        return {
            live: false
        };
    }

    return null;
}

async function refreshLiveStatus() {
    const testStatus = getTestStatus();

    if (testStatus) {
        renderLiveStatus(testStatus);
        return;
    }

    if (LIVE_STATUS_CONFIG.endpoint.includes("YOUR-WORKER-NAME")) {
        renderLiveStatus({ live: false });
        return;
    }

    try {
        const response = await fetch(
            `${LIVE_STATUS_CONFIG.endpoint}?t=${Date.now()}`,
            {
                method: "GET",
                cache: "no-store",
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Live status request failed: ${response.status}`
            );
        }

        const status = await response.json();

        if (status.updatedAt) {
            const ageMs =
                Date.now() - new Date(status.updatedAt).getTime();

            const staleAfterMs =
                LIVE_STATUS_CONFIG.staleAfterMinutes * 60 * 1000;

            if (Number.isFinite(ageMs) && ageMs > staleAfterMs) {
                renderFallbackStatus();
                return;
            }
        }

        renderLiveStatus(status);
    } catch (error) {
        renderFallbackStatus();
        console.error(error);
    }
}

refreshLiveStatus();

window.setInterval(
    refreshLiveStatus,
    LIVE_STATUS_CONFIG.refreshIntervalMs
);

window.setInterval(
    updateStreamCountdown,
    1000
);


/* ==================================================
   YOU'RE NEVER ALONE
   Scroll Reveal
================================================== */

const neverAloneRevealItems =
    document.querySelectorAll(".never-alone-reveal");

if (neverAloneRevealItems.length) {

    const observer = new IntersectionObserver(

        (entries) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");

                observer.unobserve(entry.target);

            });

        },

        {
            threshold: 0.15
        }

    );

    neverAloneRevealItems.forEach((item) => {

        observer.observe(item);

    });

}

/* ==========================================
   LATEST GITHUB RELEASE
========================================== */

async function loadLatestSiteVersion() {
    const versionElement = document.getElementById("site-version");

    if (!versionElement) {
        return;
    }

    const releaseUrl =
        "https://api.github.com/repos/TigerNoslen/tigernoslen.github.io/releases/latest";

    try {
        const response = await fetch(releaseUrl, {
            headers: {
                Accept: "application/vnd.github+json"
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }

        const release = await response.json();
        const version = release.tag_name || "v1.0.0";

        versionElement.textContent = `Tiger Nation HQ • ${version}`;
    } catch (error) {
        console.error("Unable to load the latest website version:", error);

        // Safe fallback if GitHub cannot be reached.
        versionElement.textContent = "Tiger Nation HQ • v1.0.0";
    }
}

loadLatestSiteVersion();