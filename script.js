const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    navLinks.classList.toggle("is-open", !isExpanded);
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const taskForm = document.querySelector("#task-form");
if (taskForm) {
  const taskInput = document.querySelector("#task-input");
  const taskList = document.querySelector("#task-list");
  const emptyState = document.querySelector("#empty-state");
  const remainingCount = document.querySelector("#remaining-count");
  const completedCount = document.querySelector("#completed-count");
  const taskTotal = document.querySelector("#task-total");
  const plannerStatus = document.querySelector("#planner-status");
  const clearCompleted = document.querySelector("#clear-completed");
  const storageKey = "alex-portfolio-academic-tasks";
  let tasks = [];

  try {
    const savedTasks = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(savedTasks)) {
      tasks = savedTasks.filter((task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
      );
    }
  } catch (error) {
    console.error("Unable to load saved planner tasks.", error);
    plannerStatus.textContent = "Saved tasks could not be loaded.";
  }

  const saveTasks = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error("Unable to save planner tasks.", error);
      plannerStatus.textContent = "Tasks changed, but could not be saved in this browser.";
    }
  };

  const renderTasks = () => {
    taskList.replaceChildren();
    tasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = `task-item${task.completed ? " is-complete" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.id = `task-${task.id}`;
      checkbox.setAttribute("aria-label", `Mark "${task.text}" ${task.completed ? "incomplete" : "complete"}`);
      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
        plannerStatus.textContent = checkbox.checked ? "Task marked complete." : "Task marked incomplete.";
      });

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.textContent = task.text;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "delete-task";
      removeButton.textContent = "Delete";
      removeButton.setAttribute("aria-label", `Delete "${task.text}"`);
      removeButton.addEventListener("click", () => {
        tasks = tasks.filter((entry) => entry.id !== task.id);
        saveTasks();
        renderTasks();
        plannerStatus.textContent = "Task deleted.";
      });

      item.append(checkbox, label, removeButton);
      taskList.append(item);
    });

    const completed = tasks.filter((task) => task.completed).length;
    remainingCount.textContent = String(tasks.length - completed);
    completedCount.textContent = String(completed);
    taskTotal.textContent = String(tasks.length);
    emptyState.hidden = tasks.length > 0;
    clearCompleted.disabled = completed === 0;
  };

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (!text) {
      taskInput.setCustomValidity("Please enter a task.");
      taskInput.reportValidity();
      return;
    }
    taskInput.setCustomValidity("");
    tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
    saveTasks();
    renderTasks();
    taskInput.value = "";
    taskInput.focus();
    plannerStatus.textContent = "Task added.";
  });

  taskInput.addEventListener("input", () => taskInput.setCustomValidity(""));
  clearCompleted.addEventListener("click", () => {
    const completed = tasks.filter((task) => task.completed).length;
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
    plannerStatus.textContent = `${completed} completed ${completed === 1 ? "task" : "tasks"} cleared.`;
  });

  renderTasks();
}

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  const fields = {
    name: {
      input: document.querySelector("#name"),
      error: document.querySelector("#name-error"),
      message: "Please enter your name."
    },
    email: {
      input: document.querySelector("#email"),
      error: document.querySelector("#email-error"),
      message: "Enter a valid email address."
    },
    phone: {
      input: document.querySelector("#phone"),
      error: document.querySelector("#phone-error"),
      message: "Enter a phone number using digits only."
    },
    message: {
      input: document.querySelector("#message"),
      error: document.querySelector("#message-error"),
      message: "Please enter a message."
    }
  };
  const contactStatus = document.querySelector("#contact-status");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let isValid = true;

    Object.entries(fields).forEach(([name, field]) => {
      const value = field.input.value.trim();
      let errorMessage = "";
      if (!value) {
        errorMessage = name === "email" ? "Please enter your email address." : field.message;
      } else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMessage = field.message;
      } else if (name === "phone" && !/^\d+$/.test(value)) {
        errorMessage = field.message;
      }

      field.error.textContent = errorMessage;
      field.input.setAttribute("aria-invalid", String(Boolean(errorMessage)));
      if (errorMessage) isValid = false;
    });

    if (!isValid) {
      contactStatus.textContent = "Please fix the highlighted fields and try again.";
      const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    contactStatus.textContent = "Thanks! Your details passed the checks. This demo does not send or store messages.";
    contactForm.reset();
    Object.values(fields).forEach(({ input }) => input.removeAttribute("aria-invalid"));
  });

  Object.values(fields).forEach(({ input, error }) => {
    input.addEventListener("input", () => {
      error.textContent = "";
      input.removeAttribute("aria-invalid");
    });
  });
}
