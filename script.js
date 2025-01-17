const modalContainer = document.getElementById("modal-container");
const openModalBtn = document.getElementById("open-btn");
const closeBtn = document.getElementById("close-btn");

function openModal() {
  modalContainer.style.display = "block";
}

function closeModal() {
  modalContainer.style.display = "none";
}

openModalBtn.addEventListener("click", openModal);

closeBtn.addEventListener("click", closeModal);

window.addEventListener("click", (event) => {
  if (event.target === modalContainer) {
    closeModal();
  }
});

const modalContainerDelete = document.getElementById("modal-container-delete");
const openModalBtnDelete = document.getElementById("open-btn-delete");
const closeBtnDelete = document.getElementById("close-btn-delete");

function openModalDelete() {
  modalContainerDelete.style.display = "block";
}

function closeModalDelete() {
  modalContainerDelete.style.display = "none";
}

openModalBtnDelete.addEventListener("click", openModalDelete);

closeBtnDelete.addEventListener("click", closeModalDelete);

window.addEventListener("click", (event) => {
  if (event.target === modalContainerDelete) {
    closeModalDelete();
  }
});

class TodoManager {
  constructor() {
    this.todos = this.loadTodos();
    this.renderTodos();
  }

  loadTodos() {
    return JSON.parse(localStorage.getItem("todos")) || [];
  }

  sortTodos() {
    const activeTodos = this.todos.filter((todo) => !todo.completed);
    const completedTodos = this.todos.filter((todo) => todo.completed);

    activeTodos.sort((a, b) => a.order - b.order);
    this.todos = [...activeTodos, ...completedTodos]; // Inilah dimana yang dicentang kebawah

    this.todos.forEach((todo, index) => {
      // Isi-in ordernya dengan index
      todo.order = index;
    });
  }

  saveTodos() {
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  groupTodosByDate() {
    const grouped = {};
    this.todos.forEach((todo) => {
      if (!grouped[todo.date]) {
        grouped[todo.date] = []; // bikin dulu array kalau gak ada diatas
      }
      grouped[todo.date].push(todo); // lanjut masukan todo sesuai grup tanggal
      // hasilnya: "2025-01-16" : [ {...todos} ]
      // Kaya pattern map gitu
    });

    return grouped;
  }

  formateDateDisplay(dateString) {
    const date = new Date(dateString);
    const today = new Date();

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear === today.getFullYear
    ) {
      return "Hari Ini";
    }

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  }

  toggleTodo(id) {
    const todoIndex = this.todos.findIndex((todo) => todo.id === id); // cari todo sesuai id dengan paramenter

    // ketika todoIndex ada, kalau gak ada -1
    if (todoIndex !== -1) {
      this.todos[todoIndex].completed = !this.todos[todoIndex].completed; // toggle disini, kalau false jadi true dan sebaliknya
      this.sortTodos();
      this.saveTodos();
      this.renderTodos();
    }
  }

  createTodoElement(todo) {
    const sectionItem = document.createElement("section");
    sectionItem.classList.add("todo-list");

    const checkbox = document.createElement("input");
    checkbox.classList.add("checker");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => this.toggleTodo(todo.id)); // toggle selesai atau belum

    const textContainerItem = document.createElement("div");
    textContainerItem.classList.add("text-container");

    const spanPriority = document.createElement("span");
    spanPriority.classList.add(todo.priority); // low, medium, high
    spanPriority.textContent = todo.priority.toUpperCase();

    const contentText = document.createElement("p");
    contentText.classList.add("text");
    contentText.textContent = todo.text;
    if (todo.completed) {
      contentText.classList.add("crossed-out");
    }

    sectionItem.appendChild(checkbox);

    textContainerItem.appendChild(spanPriority);
    textContainerItem.appendChild(contentText);

    sectionItem.appendChild(textContainerItem);

    return sectionItem;

    // div-group-date. didalamnya
    // h2-date
    // hr
    // section-todo-list, didalamnya:
    // input checkbox-chechker
    // div-text-container, didalamnya:
    // span-medium (Prioritas)
    // p-text (content)
  }

  renderTodos() {
    const container = document.getElementById("list-container");
    container.innerHTML = "";

    const groupedTodos = this.groupTodosByDate();
    const sortedDates = Object.keys(groupedTodos).sort(
      (a, b) => new Date(b) - new Date(a) // terbaru ke terlama tanggalnya
    );

    sortedDates.forEach((date) => {
      const containerTodoItem = document.createElement("div");
      containerTodoItem.classList.add("group-date");

      const dateTitle = document.createElement("h2");
      dateTitle.classList.add("date");
      dateTitle.textContent = this.formateDateDisplay(date);
      containerTodoItem.appendChild(dateTitle);

      const line = document.createElement("hr");
      containerTodoItem.appendChild(line);

      const todosForDate = groupedTodos[date];
      const activeTodos = todosForDate.filter((todo) => !todo.completed);
      const completedTodos = todosForDate.filter((todo) => todo.completed);

      activeTodos.forEach((todo) => {
        const todoItem = this.createTodoElement(todo); // priority ganti, tes console log
        containerTodoItem.appendChild(todoItem);
      });

      completedTodos.forEach((todo) => {
        const todoItem = this.createTodoElement(todo);
        containerTodoItem.appendChild(todoItem);
      });

      container.appendChild(containerTodoItem);
    });
  }

  formatDate(date) {
    return date.toISOString().split("T")[0]; // YYYY MM DD
  }

  addTodo(text, date, priority) {
    if (!text) return;
    const todo = {
      id: Date.now(),
      text,
      date: date || this.formatDate(new Date()),
      completed: false,
      priority: priority || "low",
      order: this.todos.length,
    };

    this.todos.push(todo);
    this.sortTodos();
    this.saveTodos();
    this.renderTodos();
  }

  deleteAllTodos() {
    this.todos = [];
    this.sortTodos();
    this.saveTodos();
    this.renderTodos();
  }
}

const todoManager = new TodoManager();

function addTodo() {
  // bekerja cuma ada error iterable di class kah
  const input = document.getElementById("todo-input");
  const dateInput = document.getElementById("todo-date");
  const priority = document.getElementById("todo-priority");
  todoManager.addTodo(input.value, dateInput.value, priority.value);
  input.value = "";
  dateInput.value = "";
  closeModal();
}

function deleteAll() {
  todoManager.deleteAllTodos();
  closeModalDelete();
}
