document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    loadAllSections();
});

async function loadAllSections() {
    await Promise.allSettled([
        loadAboutAndHome(),
        loadSkills(),
        loadEducation(),
        loadProjects()
    ]);
}

async function loadAboutAndHome() {
    const heroName = document.getElementById("hero-name");
    const heroHeadline = document.getElementById("hero-headline");
    const heroLocation = document.getElementById("hero-location");
    const navBrand = document.getElementById("nav-brand");
    const aboutContainer = document.getElementById("about-content");

    try {
        const res = await fetch(`${API_BASE_URL}/api/aboutme`);
        if (res.status === 404) {
            heroName.textContent = "Welcome to My Portfolio";
            heroHeadline.textContent = "Profile details will appear here once added in the Admin Dashboard.";
            heroLocation.textContent = "";
            aboutContainer.innerHTML = `<p class="muted">No About Me profile has been published yet.</p>`;
            return;
        }

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const profile = await res.json();
        const fullName = profile.fullName || "Portfolio";

        document.title = `${fullName} | Resume Portfolio`;
        navBrand.textContent = fullName;
        heroName.textContent = fullName;
        heroHeadline.textContent = profile.headline || "";
        heroLocation.textContent = profile.location || "";

        aboutContainer.innerHTML = "";

        const summaryP = document.createElement("p");
        summaryP.className = "about-summary";
        summaryP.textContent = profile.summary || "";
        aboutContainer.appendChild(summaryP);

        const metaList = document.createElement("div");
        metaList.className = "meta-row";

        if (profile.location) {
            const locSpan = document.createElement("span");
            locSpan.className = "meta-item";
            locSpan.textContent = `Location: ${profile.location}`;
            metaList.appendChild(locSpan);
        }

        if (profile.email) {
            const emailLink = document.createElement("a");
            emailLink.className = "meta-item";
            emailLink.href = `mailto:${profile.email}`;
            emailLink.textContent = profile.email;
            metaList.appendChild(emailLink);
        }

        if (metaList.children.length > 0) {
            aboutContainer.appendChild(metaList);
        }
    } catch (err) {
        heroName.textContent = "Resume Portfolio";
        heroHeadline.textContent = "Unable to connect to the API server.";
        heroLocation.textContent = "";
        aboutContainer.innerHTML = `<p class="error-text">Could not load About Me data. Ensure ResumeAPI is running.</p>`;
    }
}

async function loadSkills() {
    const container = document.getElementById("skills-content");

    try {
        const res = await fetch(`${API_BASE_URL}/api/skills`);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const skills = await res.json();
        container.innerHTML = "";

        if (!Array.isArray(skills) || skills.length === 0) {
            container.innerHTML = `<p class="muted">No skills listed yet.</p>`;
            return;
        }

        const grouped = new Map();
        for (const skill of skills) {
            const cat = (skill.category || "General").trim();
            if (!grouped.has(cat)) {
                grouped.set(cat, []);
            }
            grouped.get(cat).push(skill);
        }

        for (const [category, items] of grouped.entries()) {
            const card = document.createElement("div");
            card.className = "card";

            const heading = document.createElement("h3");
            heading.textContent = category;
            card.appendChild(heading);

            const chipList = document.createElement("div");
            chipList.className = "skill-tags";

            for (const item of items) {
                const chip = document.createElement("span");
                chip.className = "skill-chip";
                chip.textContent = item.name;
                chipList.appendChild(chip);
            }

            card.appendChild(chipList);
            container.appendChild(card);
        }
    } catch (err) {
        container.innerHTML = `<p class="error-text">Could not load skills.</p>`;
    }
}

async function loadEducation() {
    const container = document.getElementById("education-content");

    try {
        const res = await fetch(`${API_BASE_URL}/api/education`);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const items = await res.json();
        container.innerHTML = "";

        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = `<p class="muted">No education records listed yet.</p>`;
            return;
        }

        for (const edu of items) {
            const card = document.createElement("article");
            card.className = "card";

            const topRow = document.createElement("div");
            topRow.className = "card-header-row";

            const degreeTitle = document.createElement("h3");
            degreeTitle.textContent = edu.fieldOfStudy
                ? `${edu.degree} in ${edu.fieldOfStudy}`
                : edu.degree;

            const period = document.createElement("span");
            period.className = "period-badge";
            const endText = edu.endYear ? String(edu.endYear) : "Present";
            period.textContent = `${edu.startYear} – ${endText}`;

            topRow.appendChild(degreeTitle);
            topRow.appendChild(period);
            card.appendChild(topRow);

            const institution = document.createElement("p");
            institution.className = "subtitle-inline";
            institution.textContent = edu.institution;
            card.appendChild(institution);

            if (edu.description) {
                const desc = document.createElement("p");
                desc.textContent = edu.description;
                card.appendChild(desc);
            }

            container.appendChild(card);
        }
    } catch (err) {
        container.innerHTML = `<p class="error-text">Could not load education history.</p>`;
    }
}

async function loadProjects() {
    const container = document.getElementById("projects-content");

    try {
        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const projects = await res.json();
        container.innerHTML = "";

        if (!Array.isArray(projects) || projects.length === 0) {
            container.innerHTML = `<p class="muted">No projects listed yet.</p>`;
            return;
        }

        for (const proj of projects) {
            const card = document.createElement("article");
            card.className = "card project-card";

            const title = document.createElement("h3");
            title.textContent = proj.title;
            card.appendChild(title);

            const summary = document.createElement("p");
            summary.textContent = proj.summary;
            card.appendChild(summary);

            if (proj.techStack) {
                const tech = document.createElement("p");
                tech.className = "tech-stack";
                tech.textContent = `Tech: ${proj.techStack}`;
                card.appendChild(tech);
            }

            const linksRow = document.createElement("div");
            linksRow.className = "project-links";

            if (proj.repoUrl) {
                const repoLink = document.createElement("a");
                repoLink.href = proj.repoUrl;
                repoLink.target = "_blank";
                repoLink.rel = "noopener noreferrer";
                repoLink.textContent = "Repository";
                linksRow.appendChild(repoLink);
            }

            if (proj.liveUrl) {
                const liveLink = document.createElement("a");
                liveLink.href = proj.liveUrl;
                liveLink.target = "_blank";
                liveLink.rel = "noopener noreferrer";
                liveLink.textContent = "Live Demo";
                linksRow.appendChild(liveLink);
            }

            if (linksRow.children.length > 0) {
                card.appendChild(linksRow);
            }

            container.appendChild(card);
        }
    } catch (err) {
        container.innerHTML = `<p class="error-text">Could not load projects.</p>`;
    }
}