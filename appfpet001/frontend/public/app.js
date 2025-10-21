(() => {
  const API_BASE_URL =
    window.API_BASE_URL ||
    `${window.location.protocol}//${window.location.hostname || "localhost"}:5000/api`;

  const STORAGE_KEY = "fpet-current-user";
  let usersCache = [];

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    if (page === "login") {
      initLoginPage();
    } else if (page === "dashboard") {
      initDashboardPage();
    }
  });

  function initLoginPage() {
    const form = document.getElementById("login-form");
    const errorBox = document.getElementById("login-error");

    if (!form) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorBox.textContent = "";

      const formData = new FormData(form);
      const payload = {
        login: formData.get("login")?.toString().trim(),
        senha: formData.get("senha")?.toString().trim(),
      };

      if (!payload.login || !payload.senha) {
        errorBox.textContent = "Informe o login e a senha.";
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          errorBox.textContent = data.message || "Não foi possível acessar o sistema.";
          return;
        }

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        window.location.href = "/dashboard.html";
      } catch (error) {
        errorBox.textContent = "Falha de comunicação com o servidor.";
        // eslint-disable-next-line no-console
        console.error(error);
      }
    });
  }

  function initDashboardPage() {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      window.location.href = "/login.html";
      return;
    }

    const currentUser = JSON.parse(stored);
    document.getElementById("current-user").textContent = `${currentUser.usuario} (${currentUser.login})`;
    document.getElementById("current-profile").textContent = currentUser.perfil || "—";

    document.getElementById("logout-button").addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.href = "/login.html";
    });

    setupMenuToggle();
    setupUserModal();
    loadUsers();
  }

  function setupMenuToggle() {
    const toggleButton = document.getElementById("toggle-menu");
    const sidebar = document.getElementById("sidebar");

    toggleButton?.addEventListener("click", () => {
      sidebar?.classList.toggle("sidebar-open");
    });
  }

  function setupUserModal() {
    const modal = document.getElementById("user-modal");
    const backdrop = document.getElementById("modal-backdrop");
    const addButton = document.getElementById("add-user-button");
    const closeButton = document.getElementById("close-user-modal");
    const cancelButton = document.getElementById("cancel-user");
    const form = document.getElementById("user-form");

    const closeModal = () => {
      modal.classList.add("hidden");
      backdrop.classList.add("hidden");
      form.reset();
      form.dataset.mode = "";
      form.dataset.originalId = "";
      document.getElementById("user-form-error").textContent = "";
    };

    window.openUserModal = (mode, user = null) => {
      form.dataset.mode = mode;
      form.dataset.originalId = user?.iduser ?? "";
      document.getElementById("user-modal-title").textContent =
        mode === "edit" ? "Editar Usuário" : "Novo Usuário";
      document.getElementById("user-form-error").textContent = "";

      if (user) {
        fillUserForm(user);
      } else {
        form.reset();
        document.getElementById("form-data-criado").value = formatDateTimeLocal(new Date());
      }

      modal.classList.remove("hidden");
      backdrop.classList.remove("hidden");
    };

    addButton?.addEventListener("click", () => window.openUserModal("create"));
    closeButton?.addEventListener("click", closeModal);
    cancelButton?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      document.getElementById("user-form-error").textContent = "";

      const mode = form.dataset.mode;
      const originalId = form.dataset.originalId;
      const payload = readUserForm();

      if (!payload) {
        return;
      }

      try {
        const endpoint =
          mode === "edit" ? `${API_BASE_URL}/users/${encodeURIComponent(originalId)}` : `${API_BASE_URL}/users`;
        const method = mode === "edit" ? "PUT" : "POST";
        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          const target = document.getElementById("user-form-error");
          target.textContent = data.message || "Não foi possível salvar o usuário.";
          return;
        }

        closeModal();
        showUsersFeedback("Usuário salvo com sucesso.", false);
        await loadUsers();
      } catch (error) {
        document.getElementById("user-form-error").textContent = "Erro ao comunicar com o servidor.";
        // eslint-disable-next-line no-console
        console.error(error);
      }
    });
  }

  function fillUserForm(user) {
    document.getElementById("form-iduser").value = user.iduser ?? "";
    document.getElementById("form-usuario").value = user.usuario ?? "";
    document.getElementById("form-login").value = user.login ?? "";
    document.getElementById("form-senha").value = user.senha ?? "";
    document.getElementById("form-perfil").value = user.perfil ?? "";
    document.getElementById("form-fone").value = user.fone ?? "";
    document.getElementById("form-data-criado").value = user.data_criado
      ? formatDateTimeLocal(user.data_criado)
      : "";
  }

  function readUserForm() {
    const form = document.getElementById("user-form");
    const errorBox = document.getElementById("user-form-error");
    const formData = new FormData(form);
    const payload = {};

    for (const [key, value] of formData.entries()) {
      if (value === "") {
        continue;
      }

      if (key === "iduser") {
        payload[key] = Number(value);
      } else if (key === "data_criado") {
        payload[key] = toSqlDateTime(value.toString());
      } else {
        payload[key] = value.toString();
      }
    }

    if (!payload.iduser || Number.isNaN(payload.iduser)) {
      errorBox.textContent = "Informe um ID de usuário válido.";
      return null;
    }

    for (const requiredField of ["usuario", "login", "senha", "perfil"]) {
      if (!payload[requiredField]) {
        errorBox.textContent = "Preencha todos os campos obrigatórios.";
        return null;
      }
    }

    return payload;
  }

  async function loadUsers() {
    const feedback = document.getElementById("users-feedback");
    feedback.textContent = "Carregando usuários...";
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error("Não foi possível carregar os usuários.");
      }
      usersCache = await response.json();
      renderUsers(usersCache);
      feedback.textContent = "";
    } catch (error) {
      feedback.textContent = "Erro ao carregar usuários.";
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  function renderUsers(users) {
    const tbody = document.getElementById("users-tbody");
    tbody.innerHTML = "";

    if (!users || users.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 8;
      cell.textContent = "Nenhum usuário cadastrado.";
      row.appendChild(cell);
      tbody.appendChild(row);
      return;
    }

    users.forEach((user) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.iduser ?? ""}</td>
        <td>${sanitize(user.usuario)}</td>
        <td>${sanitize(user.login)}</td>
        <td>${sanitize(user.senha)}</td>
        <td>${sanitize(user.perfil)}</td>
        <td>${sanitize(user.fone)}</td>
        <td>${formatDateForDisplay(user.data_criado)}</td>
      `;

      const actionsTd = document.createElement("td");
      actionsTd.classList.add("actions-column");

      const wrapper = document.createElement("div");
      wrapper.classList.add("table-actions");

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "table-button";
      editButton.textContent = "Editar";
      editButton.addEventListener("click", () => window.openUserModal("edit", user));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "table-button danger";
      deleteButton.textContent = "Excluir";
      deleteButton.addEventListener("click", () => handleDeleteUser(user));

      wrapper.appendChild(editButton);
      wrapper.appendChild(deleteButton);
      actionsTd.appendChild(wrapper);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  }

  function showUsersFeedback(message, isError = true) {
    const feedback = document.getElementById("users-feedback");
    feedback.textContent = message;
    feedback.classList.toggle("form-error", isError);
  }

  async function handleDeleteUser(user) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o usuário "${user.usuario}" (ID ${user.iduser})?`
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(user.iduser)}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        showUsersFeedback(data.message || "Não foi possível excluir o usuário.");
        return;
      }

      showUsersFeedback("Usuário excluído com sucesso.", false);
      await loadUsers();
    } catch (error) {
      showUsersFeedback("Erro ao excluir usuário.");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  function formatDateForDisplay(value) {
    if (!value) {
      return "";
    }
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleString("pt-BR");
    } catch {
      return value;
    }
  }

  function formatDateTimeLocal(value) {
    if (!value) {
      return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const pad = (num) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  }

  function toSqlDateTime(value) {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    const pad = (num) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function sanitize(value) {
    if (value === null || value === undefined) {
      return "";
    }
    return value.toString();
  }
})();

