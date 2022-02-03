(function () {
    const close_button = $(".close_button");
    close_button.on("click", function () {
        if (!!database_updated) {
            refresh_task_list_after_edit();
            update_custom_project_ui();
            database_updated = 0;
        }
        const target = $($(this).attr("close_target"));
        close_overlay(target);
    });
    const delete_project_button = $(".delete_project_button");
    const task_wrapper = $("#task_wrapper");
    const deadline_category = ["today", "tomorrow", "upcoming", "no_deadline"];
    const main_wrapper = $(".main_wrapper");
    const edit_task_wrapper = $("#edit_task_wrapper");
    const pomodoro_clear_deadline = $("#clear_deadline");
    let deadline_flatpickr;
    const add_task_box = $(".add_task");
    const quick_tomato_counter = $(".quick_tomato_counter");
    const add_task_button = $(".add_task button");
    const pomodoro_edit_goal_input = $("#pomodoro_count");
    const pomodoro_edit_deadline_input = $("#deadline");
    const pomodoro_edit_task_name = edit_task_wrapper.find(".edit_task_name_input");
    const pomodoro_edit_task_checkbox = edit_task_wrapper.find(".edit_task_name .custom_checkbox");
    const pomodoro_edit_project_location = edit_task_wrapper.find("#project_location");
    const task_list = task_wrapper.find(".main_content > ul");
    const task_wrapper_window_title = task_wrapper.find(".window_title");

    window.refresh_task_list = function (window_title_name, task_category, custom_project_id) {
        task_wrapper_window_title.html(window_title_name);
        if (task_category === "completed") {
            quick_tomato_counter.hide();
            add_task_box.hide();
        } else {
            quick_tomato_counter.show();
            add_task_box.show();
        }
        task_wrapper.attr("to_do_category", task_category);
        task_list.html("");
        // Sort by deadline
        if (task_category !== "custom") {
            delete_project_button.hide();
            task_wrapper.attr("project_id", "");
            for (let task_id in tasks_in_memory) {
                const task_info = tasks_in_memory[task_id];
                // No deadline
                if (deadline_category.includes(task_category)) {
                    if (task_info.deadline === null && task_category === "no_deadline") {
                        task_list.prepend($(add_task_ui_entry(task_id)));
                    } else {
                        const task_deadline_date = moment(task_info.deadline).startOf("day");
                        const day_difference = (task_deadline_date - moment().startOf("day")) / 86400000;
                        if (!task_info.completed) {
                            if (day_difference >= 2 && task_category === "upcoming") {
                                task_list.prepend($(add_task_ui_entry(task_id)));
                            } else if (day_difference === 1 && task_category === "tomorrow") {
                                task_list.prepend($(add_task_ui_entry(task_id)));
                            } else if (day_difference <= 0 && task_category === "today") {
                                task_list.prepend($(add_task_ui_entry(task_id)));
                            }
                        }
                    }
                } else if (task_category === "completed") {
                    if (task_info.completed) {
                        task_list.prepend($(add_task_ui_entry(task_id)));
                    }
                }
            }
        } else {
            replace_window_title_with_textarea();
            delete_project_button.show();
            task_wrapper.attr("project_id", custom_project_id);
            for (let task_id of projects_in_memory[custom_project_id].tasks) {
                task_list.prepend($(add_task_ui_entry(task_id)));
            }
        }
        document.dispatchEvent(textarea_update);
    }

    function replace_window_title_with_textarea() {
        // does not add a new textarea if there's already a textarea
        if (!task_wrapper_window_title.find("textarea").length) {
            const temporary_title = task_wrapper_window_title.find("span");
            const window_title_name = temporary_title.html();
            temporary_title.remove();
            const new_textarea = $(document.createElement("textarea"));
            new_textarea.html(window_title_name);
            new_textarea.attr("placeholder", "Project name");
            new_textarea.attr("rows", 1);
            task_wrapper_window_title.append(new_textarea);
            new_textarea.on("change keyup paste", function () {
                const current_task_id = parseInt(task_wrapper.attr("project_id"));
                if (!isNaN(current_task_id)) {
                    edit_project(current_task_id, {name: $(this).val()});
                }
            })
        }
    }


// Adds new tasks and UI refresh.
    function add_task_ui_entry(id) {
        id = parseInt(id);
        let {name, completed, deadline, recur, pomodoro_goal, pomodoros_done} = tasks_in_memory[id]
        const new_ui_entry = $(document.createElement("li"));
        new_ui_entry.attr("task_id", id);
        new_ui_entry.html(`
    <div class="to_do_item">
    <input type="checkbox" class="custom_checkbox">
    <div class="content">
    <p class="task_name"></p>
    <div class="task_info">
    <div class="pomodoro_status"></div>
    </div>
    </div>
    <div class="options">
    <button class="button btn_no_bg start" start_target="${id}"><i class="fas fa-play-circle"></i></button>
    <button class="button btn_no_bg edit" edit_target="${id}"><i class="fas fa-edit"></i></button>
    <button class="button btn_no_bg delete" delete_target="${id}"><i class="fas fa-trash"></i></button>
    </div>
    </div>`);
        new_ui_entry.find(".task_name").text(name);
        const pomodoro_status = new_ui_entry.find(".pomodoro_status");
        if (pomodoro_goal <= 4 && pomodoros_done <= 4) {
            let highlighted = "";
            if (pomodoros_done >= 1) {
                highlighted = "<i class=\"fas fa-stopwatch highlight\"></i>".repeat(pomodoros_done);
            }
            let unhighlighted = "";
            const unfinished_pomodoros = pomodoro_goal - pomodoros_done;
            if (unfinished_pomodoros >= 1) {
                unhighlighted = "<i class=\"fas fa-stopwatch\"></i>".repeat(unfinished_pomodoros);
            }
            pomodoro_status.html(highlighted + unhighlighted);
        } else {
            pomodoro_status.html(`<i class=\"fas fa-stopwatch highlight\"></i><span>${pomodoros_done}</span> / 
                              <i class=\"fas fa-stopwatch\"></i><span>${pomodoro_goal}</span>`)
        }
        if (pomodoro_goal === 0 && pomodoros_done === 0) {
            pomodoro_status.remove();
        }
        if (deadline !== null) {
            let deadline_string;
            const task_deadline_date = moment(deadline).startOf("day");
            const day_difference = (task_deadline_date - moment().startOf("day")) / 86400000;
            if (day_difference === 1) {
                deadline_string = "Tomorrow";
            } else if (day_difference === 0) {
                deadline_string = "Today";
            } else {
                deadline_string = task_deadline_date.format("MMMM Do, YYYY");
            }
            const task_expiry = document.createElement("div");
            if (day_difference < 0) {
                task_expiry.style.color = "red";
            }
            task_expiry.innerHTML = `<i class=\"fas fa-calendar\"></i><span>${deadline_string}</span>`
            new_ui_entry.find(".task_info").append($(task_expiry));
        }
        const checkbox = new_ui_entry.find(".custom_checkbox");
        checkbox[0].checked = completed;
        checkbox.attr("complete_target", id);
        const project_id = query_project_id(id);
        if (project_id !== null) {
            const task_project = document.createElement("div");
            task_project.innerHTML = `<i class='fas fa-pencil-alt'></i><span></span>`;
            $(task_project).find("span").text(projects_in_memory[project_id].name);
            new_ui_entry.find(".task_info").append($(task_project));
        }
        return new_ui_entry;
    }
    add_task_button.on("click", function () {
        const current_time = moment();
        const deadline_today = moment(current_time).add(1, "days").startOf("day").subtract(1, "seconds").format();
        const deadline_tomorrow = moment(current_time).add(2, "days").startOf("day").subtract(1, "seconds").format();
        const deadline_week = moment(current_time).add(1, "weeks").startOf("day").subtract(1, "seconds").format();
        const task_name = add_task_box.children(".add_task_input").val();
        const project_id = parseInt(task_wrapper.attr("project_id"));
        let deadline_string;
        if (!task_name) {
            return;
        }
        switch (task_wrapper.attr("to_do_category")) {
            case "today":
                deadline_string = deadline_today;
                break;
            case "tomorrow":
                deadline_string = deadline_tomorrow;
                break;
            case "custom":
            case "upcoming":
                deadline_string = deadline_week;
                break;
            case "no_deadline":
                deadline_string = null;
                break;
        }
        const new_task = {
            name: task_name,
            completed: false,
            deadline: deadline_string,
            recur: null,
            pomodoro_goal: add_task_pomodoro_count,
            pomodoros_done: 0,
        }
        const new_task_id = add_task(new_task);
        if (!isNaN(project_id)) {
            add_task_to_project(new_task_id, project_id);
        }
        const new_ui_entry = add_task_ui_entry(new_task_id);
        task_wrapper.find(".main_content > ul").prepend(new_ui_entry);
    })
    task_wrapper.on("click", ".to_do_item .options .delete", function () {
        const task_id = parseInt($(this).attr("delete_target"));
        remove_task(task_id);
        $(`#task_wrapper .main_content li[task_id="${task_id}"]`).remove();
    })
    task_wrapper.on("click", ".to_do_item .options .start", function () {
        const task_id = parseInt($(this).attr("start_target"));
        document.dispatchEvent(try_start_clock);
        PomodoroConfig.current_task = task_id;
        document.dispatchEvent(cur_task_updated);
        close_overlay($(".window_wrapper"));
        main_wrapper.fadeOut(250);
    })
    task_wrapper.on("click", ".to_do_item .options .edit", function () {
        const task_id = parseInt($(this).attr("edit_target"));
        update_edit_ui(task_id);
        pop_overlay(edit_task_wrapper);
    })
    task_wrapper.on("change", ".to_do_item .custom_checkbox", function () {
        const task_id = parseInt($(this).attr("complete_target"));
        if (!isNaN(task_id)) {
            edit_task(task_id, {completed: this.checked});
        }
    })
    function update_edit_ui(task_id) {
        edit_task_wrapper.attr("task_id", task_id);
        pomodoro_edit_task_name.val(tasks_in_memory[task_id].name);
        pomodoro_edit_deadline_input.val(moment(tasks_in_memory[task_id].deadline).format("YYYY-MM-DD"));
        deadline_flatpickr = pomodoro_edit_deadline_input.flatpickr(FLATPICKR_CONFIG);
        pomodoro_edit_goal_input.val(tasks_in_memory[task_id].pomodoro_goal);
        edit_task_wrapper.find(".edit_task_name .custom_checkbox")[0].checked = !!(tasks_in_memory[task_id].completed);
        pomodoro_edit_project_location.html("");
        pomodoro_edit_project_location.append($(create_option_tag("null", "No project")));
        for (let project_id in projects_in_memory) {
            const project_info = projects_in_memory[project_id];
            pomodoro_edit_project_location.append($(create_option_tag(project_id, project_info.name)))
            if (project_info.tasks.includes(task_id)) {
                pomodoro_edit_project_location.val(project_id);
            }
        }
    }

// Handles the editing of tasks and refreshing of the UI.
    function refresh_task_list_after_edit() {
        const category = task_wrapper.attr("to_do_category");
        const name = task_wrapper.find(".window_title").html();
        const project_id = parseInt(task_wrapper.attr("project_id"));
        refresh_task_list(name, category, project_id);
    }
    pomodoro_edit_goal_input.on("change keyup paste", function () {
        const value = pomodoro_edit_goal_input.val();
        if (/^[0-9]+$/.test(value)) {
            const id = parseInt(edit_task_wrapper.attr("task_id"));
            const data = {pomodoro_goal: parseInt(value)};
            edit_task(id, data);
        } else {
            pomodoro_edit_goal_input.val(value.replace(/[^0-9]/gi, ""));
        }
    });
    pomodoro_edit_deadline_input.on("change keyup paste", function () {
        let value = pomodoro_edit_deadline_input.val();
        let deadline;
        if (!value) {
            deadline = null;
        } else {
            deadline = moment(value).add("1", "days").startOf("day").subtract("1", "seconds").format();
        }
        const id = parseInt(edit_task_wrapper.attr("task_id"));
        const data = {deadline: deadline};
        edit_task(id, data);
    })
    pomodoro_edit_project_location.on("change keyup paste", () => {
        const id = parseInt(edit_task_wrapper.attr("task_id"));
        const project_id = pomodoro_edit_project_location.val();
        remove_task_from_all_projects(id);
        if (!isNaN(project_id)) {
            add_task_to_project(id, project_id);
        }
    })
    pomodoro_edit_task_name.on("change keyup paste", function () {
        let value = pomodoro_edit_task_name.val();
        if (!value) {
        } else {
            const id = parseInt(edit_task_wrapper.attr("task_id"));
            const data = {name: value};
            edit_task(id, data);
        }
    })
    pomodoro_edit_task_checkbox.on("change", function () {
        const id = parseInt(edit_task_wrapper.attr("task_id"));
        const status = $(this)[0].checked;
        edit_task(id, {completed: status});
    })
    pomodoro_clear_deadline.on("click", function () {
        deadline_flatpickr.clear();
    });
    const add_project_panel = $(".add_project");
    const add_project_button = add_project_panel.children(".button");
    const add_project_text = add_project_panel.children("textarea");
    const custom_projects_section = $(".custom_projects");

    function add_project_ui_entry(id) {
        const new_element = document.createElement("li");
        const jq_element = $(new_element);
        new_element.classList.add("to_do_nav_item")
        new_element.setAttribute("to_do_category", "custom");
        new_element.setAttribute("project_id", id);
        new_element.innerHTML = `<div><i class="fas fa-pencil-alt"></i><span></span></div>
<div><span class="task_count"></span></div>`
        jq_element.find("span").text(projects_in_memory[id].name);
        jq_element.find(".task_count").text(projects_in_memory[id].tasks.length);
        custom_projects_section.prepend(jq_element);
        return new_element;
    }


// Refreshes the UI every time a project gets edited.
    function update_custom_project_ui() {
        custom_projects_section.html("");
        for (let project_id in projects_in_memory) {
            add_project_ui_entry(project_id)
        }
    }

    add_project_button.on("click", function () {
        const value = add_project_text.val();
        let data;
        if (value !== "") {
            data = {
                name: value, tasks: [],
            }
            const new_project_id = add_project(data);
            const new_task = $(add_project_ui_entry(new_project_id));
            new_task.hide();
            new_task.slideDown(250);
        }
    })
    delete_project_button.on("click", function () {
        const project_id = parseInt(task_wrapper.attr("project_id"))
        remove_project(project_id);
        update_custom_project_ui();
        database_updated = 0;
        close_overlay(task_wrapper);
    })

    update_custom_project_ui();
})();