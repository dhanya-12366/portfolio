const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('.site-header');
const sections = Array.from(document.querySelectorAll('main section[id]'));
const themeToggle = document.querySelector('#themeToggle');
const root = document.documentElement;
const expandButtons = document.querySelectorAll('[data-expand-target]');
const galleryTriggers = Array.from(document.querySelectorAll('.project-gallery .lightbox-trigger'));
const certificateButtons = Array.from(document.querySelectorAll('.cert-view-btn[data-certificate]'));
const lightbox = document.querySelector('#galleryLightbox');
const lightboxImage = lightbox?.querySelector('.lightbox-image') ?? null;
const lightboxDocument = lightbox?.querySelector('.lightbox-document') ?? null;
const lightboxCaption = lightbox?.querySelector('.lightbox-caption') ?? null;
const lightboxCloseButton = lightbox?.querySelector('.lightbox-close') ?? null;
const lightboxPrevButton = lightbox?.querySelector('.lightbox-prev') ?? null;
const lightboxNextButton = lightbox?.querySelector('.lightbox-next') ?? null;
const skillsSection = document.querySelector('#skills');
let activeExpand = null;
let activeGalleryImages = [];
let activeImageIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
const typedTargets = Array.from(document.querySelectorAll('.learnova-typed'));

function ensureCoreFocusHeader() {
    if (!skillsSection) {
        return;
    }

    const shell = skillsSection.querySelector('.shell');
    const heading = skillsSection.querySelector('#skills-title');
    if (!shell || !heading || shell.querySelector('.core-focus-kicker')) {
        return;
    }

    const kicker = document.createElement('p');
    kicker.className = 'core-focus-kicker';
    kicker.textContent = 'Core Focus';
    shell.insertBefore(kicker, heading);
}

function highlightTopSkills() {
    const topSkills = ['python', 'ai / ml', 'iot systems'];
    document.querySelectorAll('#skills .skill-item').forEach((item) => {
        const meta = item.querySelector('.skill-meta');
        const label = (meta?.textContent ?? '').trim().toLowerCase();
        if (topSkills.some((skill) => label.includes(skill))) {
            item.classList.add('top-skill');
        }
    });
}

function animateSkillMeters() {
    const bars = Array.from(document.querySelectorAll('#skills .skill-meter span'));
    if (bars.length === 0) {
        return;
    }

    bars.forEach((bar) => {
        const item = bar.closest('.skill-item');
        const targetLevel = item
            ? getComputedStyle(item).getPropertyValue('--level').trim()
            : '0%';

        bar.style.width = '0%';
        window.requestAnimationFrame(() => {
            window.setTimeout(() => {
                bar.style.width = targetLevel || '0%';
            }, 180);
        });
    });
}

ensureCoreFocusHeader();
highlightTopSkills();
animateSkillMeters();

if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
    (entries, observerRef) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observerRef.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
    }
);

revealElements.forEach((element) => revealObserver.observe(element));

function setActiveNav() {
    const offset = window.scrollY + window.innerHeight * 0.35;
    let currentSectionId = '';

    sections.forEach((section) => {
        if (offset >= section.offsetTop) {
            currentSectionId = section.id;
        }
    });

    navLinks.forEach((link) => {
        const targetId = link.getAttribute('href')?.replace('#', '');
        link.classList.toggle('active', targetId === currentSectionId);
    });
}

function setHeaderState() {
    if (!header) {
        return;
    }
    header.classList.toggle('scrolled', window.scrollY > 8);
}

let isTicking = false;

function updateScrollState() {
    setActiveNav();
    setHeaderState();
    isTicking = false;
}

window.addEventListener('scroll', () => {
    if (isTicking) {
        return;
    }
    isTicking = true;
    window.requestAnimationFrame(updateScrollState);
}, { passive: true });

function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
}

const storedTheme = localStorage.getItem('portfolio-theme');
if (storedTheme === 'light' || storedTheme === 'dark') {
    applyTheme(storedTheme);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    });
}

function openExpand(panel, button) {
    if (!panel || !button) {
        return;
    }

    if (activeExpand && activeExpand !== panel) {
        const activeButton = document.querySelector(`[aria-controls="${activeExpand.id}"]`);
        closeExpand(activeExpand, activeButton);
    }

    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    panel.style.maxHeight = `${panel.scrollHeight}px`;

    // Keep expanded height in sync as lazy images load inside the panel.
    panel.querySelectorAll('img').forEach((image) => {
        if (image.complete) {
            return;
        }

        image.addEventListener('load', () => {
            if (panel.classList.contains('open')) {
                panel.style.maxHeight = `${panel.scrollHeight}px`;
            }
        }, { once: true });
    });

    button.setAttribute('aria-expanded', 'true');
    button.textContent = 'Hide Details';
    activeExpand = panel;
}

function closeExpand(panel, button) {
    if (!panel || !button) {
        return;
    }

    panel.style.maxHeight = `${panel.scrollHeight}px`;
    window.requestAnimationFrame(() => {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        panel.style.maxHeight = '0px';
    });
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'View Details';

    if (activeExpand === panel) {
        activeExpand = null;
    }
}

expandButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-expand-target');
        const panel = targetId ? document.getElementById(targetId) : null;

        if (!panel) {
            return;
        }

        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeExpand(panel, button);
            return;
        }

        openExpand(panel, button);
    });
});

window.addEventListener('resize', () => {
    if (activeExpand) {
        activeExpand.style.maxHeight = `${activeExpand.scrollHeight}px`;
    }
});

function applyLightboxImage(index, withTransition = true) {
    if (!lightboxImage || !lightboxCaption || activeGalleryImages.length === 0) {
        return;
    }

    const normalizedIndex = (index + activeGalleryImages.length) % activeGalleryImages.length;
    const target = activeGalleryImages[normalizedIndex];
    const figure = typeof target.closest === 'function' ? target.closest('.gallery-item') : null;
    const caption = figure?.querySelector('figcaption')?.textContent ?? target.dataset?.caption ?? target.alt;

    const updateContent = () => {
        lightbox?.classList.remove('document-mode');
        if (lightboxDocument) {
            lightboxDocument.src = 'about:blank';
        }
        lightboxImage.src = target.src;
        lightboxImage.alt = target.alt;
        lightboxCaption.textContent = caption;
        activeImageIndex = normalizedIndex;
    };

    if (!withTransition) {
        updateContent();
        return;
    }

    lightboxImage.classList.add('is-changing');
    window.setTimeout(() => {
        updateContent();
        lightboxImage.classList.remove('is-changing');
    }, 140);
}

function openLightboxDocument(source, caption) {
    if (!lightbox || !lightboxDocument || !lightboxCaption) {
        return;
    }

    lightbox.classList.add('document-mode');
    lightboxImage.src = '';
    lightboxImage.alt = '';
    lightboxDocument.src = encodeURI(source);
    lightboxCaption.textContent = caption;
    activeGalleryImages = [];
    activeImageIndex = 0;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
}

function openLightbox(index) {
    if (!lightbox) {
        return;
    }

    lightbox.classList.remove('document-mode');
    applyLightboxImage(index, false);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
}

function closeLightbox() {
    if (!lightbox) {
        return;
    }

    lightbox.classList.remove('document-mode');
    if (lightboxDocument) {
        lightboxDocument.src = 'about:blank';
    }
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
}

function showNextImage() {
    applyLightboxImage(activeImageIndex + 1, true);
}

function showPrevImage() {
    applyLightboxImage(activeImageIndex - 1, true);
}

galleryTriggers.forEach((img) => {
    img.addEventListener('click', () => {
        const gallery = img.closest('.project-gallery');
        const scopedImages = gallery
            ? Array.from(gallery.querySelectorAll('.lightbox-trigger'))
            : galleryTriggers;

        activeGalleryImages = scopedImages;
        const localIndex = scopedImages.indexOf(img);
        openLightbox(localIndex >= 0 ? localIndex : 0);
    });
});

certificateButtons.forEach((button) => {
    const openCertificate = () => {
        const certificateSource = button.dataset.certificate;
        if (!certificateSource) {
            return;
        }

        const caption = button.dataset.caption ?? 'Certificate';
        openLightboxDocument(certificateSource, caption);
    };

    button.addEventListener('click', openCertificate);
    button.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        openCertificate();
    });
});

if (lightboxNextButton) {
    lightboxNextButton.addEventListener('click', showNextImage);
}

if (lightboxPrevButton) {
    lightboxPrevButton.addEventListener('click', showPrevImage);
}

if (lightboxCloseButton) {
    lightboxCloseButton.addEventListener('click', closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    lightbox.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (event) => {
        touchEndX = event.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX;

        if (Math.abs(deltaX) < 45) {
            return;
        }

        if (deltaX < 0) {
            showNextImage();
            return;
        }

        showPrevImage();
    }, { passive: true });
}

window.addEventListener('keydown', (event) => {
    if (!lightbox || !lightbox.classList.contains('open')) {
        return;
    }

    if (event.key === 'Escape') {
        closeLightbox();
        return;
    }

    if (event.key === 'ArrowRight') {
        showNextImage();
        return;
    }

    if (event.key === 'ArrowLeft') {
        showPrevImage();
    }
});

function runTypingEffect(element) {
    const text = element.getAttribute('data-typed-text') ?? '';
    element.textContent = '';

    let charIndex = 0;
    const typingDelay = 18;

    const typeNextChar = () => {
        if (charIndex >= text.length) {
            return;
        }

        element.textContent += text.charAt(charIndex);
        charIndex += 1;
        window.setTimeout(typeNextChar, typingDelay);
    };

    window.setTimeout(typeNextChar, 180);
}

typedTargets.forEach((target) => {
    runTypingEffect(target);
});

setActiveNav();
setHeaderState();
