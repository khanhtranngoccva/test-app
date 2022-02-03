// Creates a form option tag.
function create_option_tag(value, text) {
    const _ = document.createElement("option");
    _.innerText = text;
    _.value = value;
    return _;
}

// Makes a wrapper slide down into the screen
function pop_overlay(element) {
    const $1 = $(element);
    $1.addClass("visible");
    $1.on("transitionend", () => {
        $1.addClass("blur");
        $1.off("transitionend");
    })
}

// Makes a wrapper slide out of screen
function close_overlay(element) {
    const $1 = $(element);
    $1.removeClass("blur");
    $1.on("transitionend", () => {
        $1.removeClass("visible");
        $1.off("transitionend");
    })
}

// Adds a task.
function add_task(data) {
    let final_task_id;
    for (let i = 0; i <= MAX_TASKS_ALLOWED; i++) {
        if (i === MAX_TASKS_ALLOWED) {
            console.error("Add failure. Max tasks reached.");
            throw Overflow;
        } else if (tasks_in_memory[i] === undefined) {
            tasks_in_memory[i] = data;
            final_task_id = i;
            break;
        }
    }
    PomodoroConfig.tasks = tasks_in_memory;
    return final_task_id;
}

// Edits a task.
function remove_task(id) {
    delete tasks_in_memory[id];
    PomodoroConfig.tasks = tasks_in_memory;
    if (id === PomodoroConfig.current_task) {
        PomodoroConfig.current_task = null;
        document.dispatchEvent(cur_task_updated);
    }
    remove_task_from_all_projects(id);
}

// Deletes a task.
function edit_task(id, data) {
    for (let key in data) {
        tasks_in_memory[id][key] = data[key];
    }
    PomodoroConfig.tasks = tasks_in_memory;
    database_updated = 1;
    document.dispatchEvent(cur_task_updated);
}

// Adds a new project.
function add_project(data) {
    let final_project_id;
    for (let i = 0; i <= MAX_PROJECTS_ALLOWED; i++) {
        if (i === MAX_PROJECTS_ALLOWED) {
            console.error("Add failure. Max projects reached.");
            throw Overflow;
        } else if (projects_in_memory[i] === undefined) {
            projects_in_memory[i] = data;
            final_project_id = i;
            break;
        }
    }
    PomodoroConfig.projects = projects_in_memory;
    return final_project_id;
}

// Edits a project.
function edit_project(id, data) {
    for (let key in data) {
        projects_in_memory[id][key] = data[key];
    }
    PomodoroConfig.projects = projects_in_memory;
    database_updated = 1;
}

// Adds a task to a project.
function add_task_to_project(task_id, project_id) {
    let cur_project_tasks = projects_in_memory[project_id].tasks;
    if (!cur_project_tasks.includes(task_id)) {
        cur_project_tasks.push(task_id);
        edit_project(project_id, {tasks: cur_project_tasks});
    } else {
        console.error("Task already added.");
    }
}

// Removes a task from all projects.
function remove_task_from_all_projects(task_id) {
    for (let project_id in projects_in_memory) {
        let cur_project_tasks = projects_in_memory[project_id].tasks;
        let task_index = cur_project_tasks.indexOf(task_id)
        if (task_index !== -1) {
            cur_project_tasks.splice(task_index, 1);
            edit_project(project_id, {tasks: cur_project_tasks});
        }
    }
}

// Queries the project id of a task. Returns null if there is no project associated.
function query_project_id(task_id) {
    for (let project_id in projects_in_memory) {
        let cur_project_tasks = projects_in_memory[project_id].tasks;
        if (cur_project_tasks.includes(task_id)) {
            return project_id;
        }
    }
    return null;
}

// Removes a project. All tasks are disassociated.
function remove_project(id) {
    delete projects_in_memory[id];
    PomodoroConfig.projects = projects_in_memory;
    database_updated = 1;
}

// Checks for notifications. If it's off then all notification-based features will be turned off.
async function notification_check() {
    if (Notification.permission !== "granted") {
        await ask_for_permission();
        if (Notification.permission !== "granted") {
            document.dispatchEvent(notification_disabled);
        }
    }
}

