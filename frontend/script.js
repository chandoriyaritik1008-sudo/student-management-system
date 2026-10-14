
const API_URL = "http://localhost:5000/api/students";

const form = document.getElementById("student-form");
const studentList = document.getElementById("student-list");
const searchInput = document.getElementById("search");
const message = document.getElementById("message");
const count = document.getElementById("student-count");
const dbIdInput = document.getElementById("student-db-id");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");

let students = [];
let searchTimer;

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#dc2626" : "#15803d";
}

async function loadStudents(search = "") {
  try {
    const url = new URL(API_URL);
    if (search.trim()) url.searchParams.set("search", search.trim());

    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not load students");

    students = await response.json();
    renderStudents();
  } catch (error) {
    count.textContent = "Could not connect to backend.";
    showMessage(
      "Backend check karo: terminal mein node server.js chal raha hona chahiye.",
      true
    );
  }
}

function renderStudents() {
  studentList.replaceChildren();
  count.textContent = `Total students: ${students.length}`;

  if (students.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No students found.";
    row.appendChild(cell);
    studentList.appendChild(row);
    return;
  }

  students.forEach((student) => {
    const row = document.createElement("tr");

    [
      student.studentId,
      student.name,
      student.email,
      student.course,
      student.semester
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actions = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.type = "button";
    editButton.addEventListener("click", () => editStudent(student));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";
    deleteButton.style.background = "#dc2626";
    deleteButton.addEventListener("click", () => deleteStudent(student._id));

    actions.append(editButton, deleteButton);
    row.appendChild(actions);
    studentList.appendChild(row);
  });
}

function editStudent(student) {
  dbIdInput.value = student._id;
  document.getElementById("studentId").value = student.studentId;
  document.getElementById("name").value = student.name;
  document.getElementById("email").value = student.email;
  document.getElementById("course").value = student.course;
  document.getElementById("semester").value = student.semester;

  document.getElementById("form-title").textContent = "Edit Student";
  submitBtn.textContent = "Update Student";
  cancelBtn.hidden = false;

  form.scrollIntoView({ behavior: "smooth" });
}

function resetForm() {
  form.reset();
  dbIdInput.value = "";
  document.getElementById("form-title").textContent = "Add New Student";
  submitBtn.textContent = "Add Student";
  cancelBtn.hidden = true;
}

cancelBtn.addEventListener("click", resetForm);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const student = {
    studentId: document.getElementById("studentId").value.trim(),
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    course: document.getElementById("course").value.trim(),
    semester: Number(document.getElementById("semester").value)
  };

  const id = dbIdInput.value;
  const endpoint = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? "PUT" : "POST";

  try {
    submitBtn.disabled = true;

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Could not save student");
    }

    showMessage(id ? "Student updated successfully!" : "Student added successfully!");
    resetForm();
    await loadStudents(searchInput.value);
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    submitBtn.disabled = false;
  }
});

async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Could not delete student");
    }

    showMessage("Student deleted successfully!");
    await loadStudents(searchInput.value);
  } catch (error) {
    showMessage(error.message, true);
  }
}

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadStudents(searchInput.value), 250);
});

loadStudents();
