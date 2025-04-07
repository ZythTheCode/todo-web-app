async function fetchTasks() {
    const response = await fetch('/tasks');
    const tasks = await response.json();
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';  // Clear the task list before adding new tasks

    tasks.forEach(task => {
        const div = document.createElement('div');
        div.classList.add('task-item');
        div.innerHTML = `
            <img src="unchecked.png" id="task-check-${task.id}" class="task-checkbox" onclick="toggleCheck(${task.id})" alt="Checkbox">
            <span id="task-text-${task.id}" class="task-text">${task.task}</span>
            <div class="task-buttons">
                <button onclick="toggleEdit(${task.id}, '${task.task}')"><i class="fa fa-pencil" aria-hidden="true"></i></button>
                <button onclick="showConfirmModal(${task.id}, '${task.task}')"><i class="fa fa-trash" aria-hidden="true"></i></button>
            </div>
        `;
        taskList.appendChild(div);
    });
}

async function toggleCheck(id) {
    const taskCheck = document.getElementById(`task-check-${id}`);
    const taskText = document.getElementById(`task-text-${id}`); // Corrected ID

    if (taskCheck.src.includes("unchecked.png")) {
        taskCheck.src = "checked.png";
        taskText.style.textDecoration = "line-through";
    } else {
        taskCheck.src = "unchecked.png";
        taskText.style.textDecoration = "none";
    }

    // Update backend
    await fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskText.textContent, done: taskCheck.src.includes("checked.png") })
    });
}
async function toggleEdit(id, taskText) {
    const taskInput = document.getElementById('taskInput');
    taskInput.value = taskText;
    taskInput.focus();
    taskInput.dataset.editingId = id; // Store task ID for saving
}

async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const errorMessage = document.getElementById('error-message');
    if (taskInput.value.trim() === '') {
        errorMessage.style.display = 'block';
        return;
    }
    errorMessage.style.display = 'none';
    
    if (taskInput.dataset.editingId) {
        // Editing an existing task
        await fetch(`/tasks/${taskInput.dataset.editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: taskInput.value })
        });
        taskInput.dataset.editingId = '';
    } else {
        // Adding a new task
        await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: taskInput.value })
        });
    }
    taskInput.value = '';
    fetchTasks();
}


function showConfirmModal(id, taskName) {
    document.getElementById('confirmText').textContent = `Are you sure you already done with this task? (${taskName})`;
    document.getElementById('confirmModal').style.display = 'block';
    document.getElementById('confirmYes').onclick = function () {
        deleteTask(id);
        document.getElementById('confirmModal').style.display = 'none';
    };
    document.getElementById('confirmNo').onclick = function () {
        document.getElementById('confirmModal').style.display = 'none';
    };
}

async function deleteTask(id) {
    await fetch(`/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
}

fetchTasks();
