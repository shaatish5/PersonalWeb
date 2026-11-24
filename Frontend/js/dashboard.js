document.addEventListener("DOMContentLoaded", () => {
    const token = getValidToken();
    if (!token) {
        redirectToLogin();
        return;
    }

    wireLogout();
    wireAboutForm();
    wireSkillForm();
    wireEducationForm();
    wireProjectForm();

    refreshAllDashboardData();
});

function getValidToken() {
    const token = sessionStorage.getItem(AUTH_STORAGE_KEYS.token);
    const expiresAtUtc = sessionStorage.getItem(AUTH_STORAGE_KEYS.expiresAtUtc);

    if (!token) {
        return null;
    }

    if (expiresAtUtc && new Date(expiresAtUtc) <= new Date()) {
        clearAuthSession();
        return null;
    }

    return token;
}

function clearAuthSession() {
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.token);
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.expiresAtUtc);
}

function redirectToLogin() {
    window.location.href = "login.html";
}

function showBanner(message, isError = false) {
    const banner = document.getElementById("dash-banner");
    banner.textContent = message;
    banner.className = isError ? "alert alert-error" : "alert alert-success";
    banner.hidden = false;
    banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function authFetch(path, options = {}) {
    const token = getValidToken();
    if (!token) {
        redirectToLogin();
        throw new Error("Session expired.");
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        clearAuthSession();
        redirectToLogin();
        throw new Error("Unauthorized (token expired or invalid).");
    }

    return response;
}

function wireLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.addEventListener("click", () => {
        clearAuthSession();
        redirectToLogin();
    });
}

async function refreshAllDashboardData() {
    await Promise.allSettled([
        loadAboutAdmin(),
        loadSkillsAdmin(),
        loadEducationAdmin(),
        loadProjectsAdmin()
    ]);
}

/* ---------------- About Me ---------------- */
async function loadAboutAdmin() {
    const statEl = document.getElementById("stat-about");
    try {
        const res = await fetch(`${API_BASE_URL}/api/aboutme`);
        if (res.status === 404) {
            statEl.textContent = "Not Set";
            document.getElementById("about-id").value = "";
            return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        statEl.textContent = "Published";
        document.getElementById("about-id").value = data.id ?? "";
        document.getElementById("about-fullname").value = data.fullName ?? "";
        document.getElementById("about-headline").value = data.headline ?? "";
        document.getElementById("about-location").value = data.location ?? "";
        document.getElementById("about-email").value = data.email ?? "";
        document.getElementById("about-summary").value = data.summary ?? "";
    } catch {
        statEl.textContent = "Error";
    }
}

function wireAboutForm() {
    const form = document.getElementById("about-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const idVal = document.getElementById("about-id").value;
        const payload = {
            id: idVal ? Number(idVal) : 0,
            fullName: document.getElementById("about-fullname").value.trim(),
            headline: document.getElementById("about-headline").value.trim(),
            location: document.getElementById("about-location").value.trim(),
            email: document.getElementById("about-email").value.trim(),
            summary: document.getElementById("about-summary").value.trim()
        };

        try {
            const isUpdate = Boolean(idVal);
            const res = await authFetch(isUpdate ? `/api/aboutme/${idVal}` : "/api/aboutme", {
                method: isUpdate ? "PUT" : "POST",
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errText = await res.text();
                showBanner(`Failed to save About Me (${res.status}): ${errText}`, true);
                return;
            }

            showBanner("About Me saved successfully.");
            await loadAboutAdmin();
        } catch (err) {
            showBanner(err.message || "Error saving About Me.", true);
        }
    });
}

/* ---------------- Skills ---------------- */
async function loadSkillsAdmin() {
    const listEl = document.getElementById("skills-admin-list");
    const statEl = document.getElementById("stat-skills");

    try {
        const res = await fetch(`${API_BASE_URL}/api/skills`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const skills = await res.json();
        statEl.textContent = String(skills.length);

        listEl.innerHTML = "";
        if (skills.length === 0) {
            listEl.innerHTML = `<p class="muted">No skills added yet.</p>`;
            return;
        }

        for (const s of skills) {
            const row = document.createElement("div");
            row.className = "admin-item";

            const info = document.createElement("div");
            const title = document.createElement("strong");
            title.textContent = s.name;
            const meta = document.createElement("div");
            meta.className = "muted small-text";
            meta.textContent = `${s.category || "General"} · Order: ${s.displayOrder}`;
            info.appendChild(title);
            info.appendChild(meta);

            const actions = document.createElement("div");
            actions.className = "item-actions";

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "btn btn-secondary btn-sm";
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", () => startEditSkill(s));

            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "btn btn-danger btn-sm";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => deleteSkill(s.id, s.name));

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            row.appendChild(info);
            row.appendChild(actions);
            listEl.appendChild(row);
        }
    } catch {
        listEl.innerHTML = `<p class="error-text">Failed to load skills.</p>`;
    }
}

function startEditSkill(skill) {
    document.getElementById("skill-id").value = skill.id;
    document.getElementById("skill-name").value = skill.name || "";
    document.getElementById("skill-category").value = skill.category || "";
    document.getElementById("skill-order").value = skill.displayOrder ?? 0;
    document.getElementById("skill-form-title").textContent = "Edit Skill";
    document.getElementById("skill-cancel-btn").hidden = false;
}

function resetSkillForm() {
    document.getElementById("skill-form").reset();
    document.getElementById("skill-id").value = "";
    document.getElementById("skill-order").value = "0";
    document.getElementById("skill-form-title").textContent = "Add Skill";
    document.getElementById("skill-cancel-btn").hidden = true;
}

function wireSkillForm() {
    const form = document.getElementById("skill-form");
    document.getElementById("skill-cancel-btn").addEventListener("click", resetSkillForm);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const idVal = document.getElementById("skill-id").value;
        const payload = {
            id: idVal ? Number(idVal) : 0,
            name: document.getElementById("skill-name").value.trim(),
            category: document.getElementById("skill-category").value.trim(),
            displayOrder: Number(document.getElementById("skill-order").value || 0)
        };

        try {
            const isUpdate = Boolean(idVal);
            const res = await authFetch(isUpdate ? `/api/skills/${idVal}` : "/api/skills", {
                method: isUpdate ? "PUT" : "POST",
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                showBanner(`Failed to save skill (HTTP ${res.status}).`, true);
                return;
            }

            resetSkillForm();
            showBanner(isUpdate ? "Skill updated." : "Skill added.");
            await loadSkillsAdmin();
        } catch (err) {
            showBanner(err.message || "Error saving skill.", true);
        }
    });
}

async function deleteSkill(id, name) {
    if (!confirm(`Delete skill "${name}"?`)) return;
    try {
        const res = await authFetch(`/api/skills/${id}`, { method: "DELETE" });
        if (!res.ok) {
            showBanner(`Failed to delete skill (HTTP ${res.status}).`, true);
            return;
        }
        showBanner("Skill deleted.");
        await loadSkillsAdmin();
    } catch (err) {
        showBanner(err.message || "Error deleting skill.", true);
    }
}

/* ---------------- Education ---------------- */
async function loadEducationAdmin() {
    const listEl = document.getElementById("education-admin-list");
    const statEl = document.getElementById("stat-education");

    try {
        const res = await fetch(`${API_BASE_URL}/api/education`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items = await res.json();
        statEl.textContent = String(items.length);

        listEl.innerHTML = "";
        if (items.length === 0) {
            listEl.innerHTML = `<p class="muted">No education entries added yet.</p>`;
            return;
        }

        for (const item of items) {
            const row = document.createElement("div");
            row.className = "admin-item";

            const info = document.createElement("div");
            const title = document.createElement("strong");
            title.textContent = `${item.degree} — ${item.institution}`;
            const meta = document.createElement("div");
            meta.className = "muted small-text";
            meta.textContent = `${item.startYear} – ${item.endYear ?? "Present"}`;
            info.appendChild(title);
            info.appendChild(meta);

            const actions = document.createElement("div");
            actions.className = "item-actions";

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "btn btn-secondary btn-sm";
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", () => startEditEducation(item));

            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "btn btn-danger btn-sm";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => deleteEducation(item.id, item.degree));

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            row.appendChild(info);
            row.appendChild(actions);
            listEl.appendChild(row);
        }
    } catch {
        listEl.innerHTML = `<p class="error-text">Failed to load education entries.</p>`;
    }
}

function startEditEducation(item) {
    document.getElementById("education-id").value = item.id;
    document.getElementById("edu-institution").value = item.institution || "";
    document.getElementById("edu-degree").value = item.degree || "";
    document.getElementById("edu-field").value = item.fieldOfStudy || "";
    document.getElementById("edu-start").value = item.startYear ?? "";
    document.getElementById("edu-end").value = item.endYear ?? "";
    document.getElementById("edu-description").value = item.description || "";
    document.getElementById("education-form-title").textContent = "Edit Education";
    document.getElementById("education-cancel-btn").hidden = false;
}

function resetEducationForm() {
    document.getElementById("education-form").reset();
    document.getElementById("education-id").value = "";
    document.getElementById("education-form-title").textContent = "Add Education";
    document.getElementById("education-cancel-btn").hidden = true;
}

function wireEducationForm() {
    const form = document.getElementById("education-form");
    document.getElementById("education-cancel-btn").addEventListener("click", resetEducationForm);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const idVal = document.getElementById("education-id").value;
        const endVal = document.getElementById("edu-end").value;

        const payload = {
            id: idVal ? Number(idVal) : 0,
            institution: document.getElementById("edu-institution").value.trim(),
            degree: document.getElementById("edu-degree").value.trim(),
            fieldOfStudy: document.getElementById("edu-field").value.trim(),
            startYear: Number(document.getElementById("edu-start").value),
            endYear: endVal ? Number(endVal) : null,
            description: document.getElementById("edu-description").value.trim()
        };

        try {
            const isUpdate = Boolean(idVal);
            const res = await authFetch(isUpdate ? `/api/education/${idVal}` : "/api/education", {
                method: isUpdate ? "PUT" : "POST",
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                showBanner(`Failed to save education (HTTP ${res.status}).`, true);
                return;
            }

            resetEducationForm();
            showBanner(isUpdate ? "Education updated." : "Education added.");
            await loadEducationAdmin();
        } catch (err) {
            showBanner(err.message || "Error saving education.", true);
        }
    });
}

async function deleteEducation(id, label) {
    if (!confirm(`Delete education "${label}"?`)) return;
    try {
        const res = await authFetch(`/api/education/${id}`, { method: "DELETE" });
        if (!res.ok) {
            showBanner(`Failed to delete education (HTTP ${res.status}).`, true);
            return;
        }
        showBanner("Education deleted.");
        await loadEducationAdmin();
    } catch (err) {
        showBanner(err.message || "Error deleting education.", true);
    }
}

/* ---------------- Projects ---------------- */
async function loadProjectsAdmin() {
    const listEl = document.getElementById("projects-admin-list");
    const statEl = document.getElementById("stat-projects");

    try {
        const res = await fetch(`${API_BASE_URL}/api/projects`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const projects = await res.json();
        statEl.textContent = String(projects.length);

        listEl.innerHTML = "";
        if (projects.length === 0) {
            listEl.innerHTML = `<p class="muted">No projects added yet.</p>`;
            return;
        }

        for (const p of projects) {
            const row = document.createElement("div");
            row.className = "admin-item";

            const info = document.createElement("div");
            const title = document.createElement("strong");
            title.textContent = p.title;
            const meta = document.createElement("div");
            meta.className = "muted small-text";
            meta.textContent = `${p.techStack || "No tech stack specified"} · Order: ${p.displayOrder}`;
            info.appendChild(title);
            info.appendChild(meta);

            const actions = document.createElement("div");
            actions.className = "item-actions";

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "btn btn-secondary btn-sm";
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", () => startEditProject(p));

            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "btn btn-danger btn-sm";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => deleteProject(p.id, p.title));

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            row.appendChild(info);
            row.appendChild(actions);
            listEl.appendChild(row);
        }
    } catch {
        listEl.innerHTML = `<p class="error-text">Failed to load projects.</p>`;
    }
}

function startEditProject(proj) {
    document.getElementById("project-id").value = proj.id;
    document.getElementById("proj-title").value = proj.title || "";
    document.getElementById("proj-summary").value = proj.summary || "";
    document.getElementById("proj-tech").value = proj.techStack || "";
    document.getElementById("proj-order").value = proj.displayOrder ?? 0;
    document.getElementById("proj-repo").value = proj.repoUrl || "";
    document.getElementById("proj-live").value = proj.liveUrl || "";
    document.getElementById("project-form-title").textContent = "Edit Project";
    document.getElementById("project-cancel-btn").hidden = false;
}

function resetProjectForm() {
    document.getElementById("project-form").reset();
    document.getElementById("project-id").value = "";
    document.getElementById("proj-order").value = "0";
    document.getElementById("project-form-title").textContent = "Add Project";
    document.getElementById("project-cancel-btn").hidden = true;
}

function wireProjectForm() {
    const form = document.getElementById("project-form");
    document.getElementById("project-cancel-btn").addEventListener("click", resetProjectForm);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const idVal = document.getElementById("project-id").value;
        const repoVal = document.getElementById("proj-repo").value.trim();
        const liveVal = document.getElementById("proj-live").value.trim();

        const payload = {
            id: idVal ? Number(idVal) : 0,
            title: document.getElementById("proj-title").value.trim(),
            summary: document.getElementById("proj-summary").value.trim(),
            techStack: document.getElementById("proj-tech").value.trim(),
            repoUrl: repoVal || null,
            liveUrl: liveVal || null,
            displayOrder: Number(document.getElementById("proj-order").value || 0)
        };

        try {
            const isUpdate = Boolean(idVal);
            const res = await authFetch(isUpdate ? `/api/projects/${idVal}` : "/api/projects", {
                method: isUpdate ? "PUT" : "POST",
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                showBanner(`Failed to save project (HTTP ${res.status}).`, true);
                return;
            }

            resetProjectForm();
            showBanner(isUpdate ? "Project updated." : "Project added.");
            await loadProjectsAdmin();
        } catch (err) {
            showBanner(err.message || "Error saving project.", true);
        }
    });
}

async function deleteProject(id, title) {
    if (!confirm(`Delete project "${title}"?`)) return;
    try {
        const res = await authFetch(`/api/projects/${id}`, { method: "DELETE" });
        if (!res.ok) {
            showBanner(`Failed to delete project (HTTP ${res.status}).`, true);
            return;
        }
        showBanner("Project deleted.");
        await loadProjectsAdmin();
    } catch (err) {
        showBanner(err.message || "Error deleting project.", true);
    }
}