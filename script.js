// modal form-todo
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
  // logci ini digunakan untuk menutup modal, jika user klik diluar modal.
  if (event.target === modalContainer) {
    closeModal();
  }
});
// modal hapus seluruh todos
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

// modal profile
const modalContainerProfile = document.getElementById(
  "modal-container-profile"
);
const openModalBtnProfile = document.getElementById("open-btn-profile");
const closeBtnProfile = document.getElementById("close-btn-profile");

function openModalProfile() {
  modalContainerProfile.style.display = "block";
}

function closeModalProfile() {
  modalContainerProfile.style.display = "none";
}

openModalBtnProfile.addEventListener("click", openModalProfile);

closeBtnProfile.addEventListener("click", closeModalProfile);

window.addEventListener("click", (event) => {
  if (event.target === modalContainerProfile) {
    closeModalProfile();
  }
});

class TodoManager {
  constructor() {
    this.todos = this.loadTodos();
    this.showOnlyCompleted = false;
    this.renderTodos();
  }

  loadTodos() {
    return JSON.parse(localStorage.getItem("todos")) || []; // data diambil dari localStorage, kemudian dimasukan ke this.todos
  }

  sortTodos() {
    const activeTodos = this.todos.filter((todo) => !todo.completed);
    const completedTodos = this.todos.filter((todo) => todo.completed);

    activeTodos.sort((a, b) => a.order - b.order);
    this.todos = [...activeTodos, ...completedTodos]; // Inilah dimana, yang tercentang posisinya kebawah

    this.todos.forEach((todo, index) => {
      // Isi value order-nya dengan index
      todo.order = index;
    });
  }

  saveTodos() {
    localStorage.setItem("todos", JSON.stringify(this.todos)); // simpan todos di localStorage
  }

  groupTodosByDate() {
    const grouped = {};
    this.todos.forEach((todo) => {
      if (!grouped[todo.date]) {
        grouped[todo.date] = []; // bikin dulu value baru, kalau belum ada value nya
      }
      grouped[todo.date].push(todo); // lanjut masukan todo sesuai grup tanggal
      // hasilnya: "2025-01-16" : [ {...todos} ], "2025-01-17", : [ {...todos} ]
      // Kaya map?
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

    return date.toLocaleDateString("id-ID", options); // proses untuk mengubah format tanggal menjadi: "Day, DD Month YYYY"
  }

  toggleTodo(id) {
    const todoIndex = this.todos.findIndex((todo) => todo.id === id); // cari todo sesuai id dengan paramenter

    // ketika todoIndex ada, kalau gak ada -1
    if (todoIndex !== -1) {
      this.todos[todoIndex].completed = !this.todos[todoIndex].completed; // kalau disini false jadi true, dan sebaliknya. Ini adalah toggle untuk mencentang todo
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
    checkbox.addEventListener("change", () => this.toggleTodo(todo.id)); // digunakan untuk mencentang todo

    const textContainerItem = document.createElement("div");
    textContainerItem.classList.add("text-container");

    const spanPriority = document.createElement("span");
    spanPriority.classList.add(todo.priority); // low, medium, high
    spanPriority.textContent = todo.priority.toUpperCase();

    const contentText = document.createElement("p");
    contentText.classList.add("text");
    contentText.textContent = todo.text; // disini text todo di taruh
    if (todo.completed) {
      contentText.classList.add("crossed-out"); // jika text todo tercentang/completed maka dicoret
    }

    sectionItem.appendChild(checkbox);

    textContainerItem.appendChild(spanPriority);
    textContainerItem.appendChild(contentText);

    sectionItem.appendChild(textContainerItem);

    return sectionItem;

    // div-group-date. didalamnya
    //   h2-date
    //   hr
    //   section-todo-list, didalamnya:
    //     input checkbox-chechker
    //     div-text-container, didalamnya:
    //       span-medium (Prioritas)
    //       p-text (content)
  }

  renderTodos() {
    const container = document.getElementById("list-container");
    container.innerHTML = "";

    const groupedTodos = this.groupTodosByDate();
    const sortedDates = Object.keys(groupedTodos).sort(
      // proses untuk mengambil setiap tanggal, yaitu hanya tanggal nya saja, dikumpulkan menjadi array
      (a, b) => new Date(b) - new Date(a) // terbaru ke terlama tanggal=nya
    );

    sortedDates.forEach((date) => {
      const containerTodoItem = document.createElement("div"); // buat setiap container sesuai tanggal
      containerTodoItem.classList.add("group-date");

      const dateTitle = document.createElement("h2");
      dateTitle.classList.add("date");
      dateTitle.textContent = this.formateDateDisplay(date); // hasil format menjadi: Day, DD Month Year
      containerTodoItem.appendChild(dateTitle); // masukan tanggal nya dari formateDateDisplate(Date)

      const line = document.createElement("hr");
      containerTodoItem.appendChild(line); // ini hanya sebuah batas yang ditampilkan antara tanggal dan text todo

      const todosForDate = groupedTodos[date]; // mengambil value yang disimpan dengan key-nya yaitu date, contoh value dari groupedTodos: "2025-01-17", : [ {...todos} ]

      const filteredTodos = todosForDate.filter((todo) => {
        if (this.showOnlyCompleted) {
          return todo.completed; // tampilkan hanya yang selesai
        }

        return true; // tampilkan semua todos
      });

      filteredTodos.forEach((todo) => {
        const todoItem = this.createTodoElement(todo);
        containerTodoItem.appendChild(todoItem); // tambah seluruh todo ke dalam containernya dengan melakukan pengulangan
      });

      if (filteredTodos.length > 0) {
        container.appendChild(containerTodoItem); // jika todo ada, langusng ditampilkan
      }
    });
  }

  filterCompleted() {
    this.showOnlyCompleted = !this.showOnlyCompleted; // toggle untuk nampilin yang tercentang saja atau semua
    this.renderTodos();
  }

  formatDate(date) {
    return date.toISOString().split("T")[0]; // YYYY MM DD
  }

  addTodo(text, date, priority) {
    // menambah todo baru, data diambil dari form modal todo.
    if (!text) return; // jika text todo tidak ada, maka tidak dilanjutkan pembuatan todo

    const todo = {
      id: Date.now(),
      text,
      date: date || this.formatDate(new Date()),
      completed: false,
      priority: priority || "low",
      order: this.todos.length,
    }; // ini adalah bentuk data item di dalam array this.todos

    this.todos.push(todo);
    this.sortTodos();
    this.saveTodos();
    this.renderTodos();
  }

  deleteAllTodos() {
    this.todos = []; // hapus semua todos, dengan mengosongkan this.todos[]
    this.sortTodos();
    this.saveTodos();
    this.renderTodos();
  }
}

const todoManager = new TodoManager();

function addTodo() {
  const input = document.getElementById("todo-input");
  const dateInput = document.getElementById("todo-date");
  const priority = document.getElementById("todo-priority");

  todoManager.addTodo(input.value, dateInput.value, priority.value); // data yang dimasukan hanya text, tanggal, dan prioritas

  input.value = "";
  dateInput.value = "";
  closeModal();
}

function deleteAll() {
  todoManager.deleteAllTodos(); // hapus semua todos
  closeModalDelete();
}

document.addEventListener("DOMContentLoaded", () => {
  const registrationPopup = document.getElementById("reg-container");
  const saveProfileBtn = document.getElementById("save-profile-btn");
  const nameInput = document.getElementById("name-input");
  const roleInput = document.getElementById("role-input");
  const userName = document.getElementById("user-name");
  const userRole = document.getElementById("user-role");

  function checkProfile() {
    const userProfile = localStorage.getItem("userProfile");

    if (userProfile) {
      const profile = JSON.parse(userProfile); // mengambil data userProfile dari localStorage, hasil pendaftaran diawal

      // kemudian data dimasukan ke dalam modal profile
      userName.textContent = profile.name;
      userRole.textContent = profile.role;
    } else {
      registrationPopup.style.display = "block"; // jika data userProfile (nama, peran) belum ditambahkan, modal registration ditampilkan
    }
  }

  // lanjut jika user belum mendaftar, saveProfileBtn adalah button submit dari registrationPopup yang ditampilkan diatas
  saveProfileBtn.addEventListener("click", () => {
    // ambil data dari modal registrasi
    const name = nameInput.value;
    const role = roleInput.value;

    const userProfile = {
      name,
      role,
    };

    localStorage.setItem("userProfile", JSON.stringify(userProfile)); // masukan data ke localStorage

    registrationPopup.style.display = "none"; // tutup modal registrasi

    checkProfile(); // cek lagi dari atas, jika data sudah dimasukan
  });

  checkProfile();
});

const checkboxFilter = document.getElementById("checkbox-filter");

checkboxFilter.addEventListener("change", () => {
  todoManager.filterCompleted(); // toggle untuk menampilkan todos yang tercentang saja atau semua todos, dengan checkbox
});
