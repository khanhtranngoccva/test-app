(function () {
    // Defines jQuery handles and other variables.
    const max_tasks_allowed = 10000;
    const pomodoro_clock = $(".pomodoro_clock");
    const pomodoro_fill = $(".pomodoro_clock .mask .fill");
    const pomodoro_mask = $(".pomodoro_clock .mask");
    const rotate_trigger = $(".pomodoro_clock .clock_rotate");
    const time_left_text = $(".pomodoro_clock .time_left");
    const [start, pause, resume, stop] = [$(".start_pomodoro"), $(".pause_pomodoro"), $(".resume_pomodoro"), $(".stop_pomodoro")];
    const white_noise_handle = $("#white_noise_audio");
    const mute_button = $(".mute_button");
    const white_noise_list = $(".white_noise_list");
    const white_noise_info = $(".white_noise_info");
    const close_button = $(".close_button");
    let clock_mode = "stopped";
    let clock_started;
    let initial_timer;
    let seconds_left = initial_timer;
    const theme_customization = $("#theme_customization");
    const work_duration_options = [15, 20, 25, 30, 35];
    const work_duration_handle = $("#work_duration");
    const break_duration_options = [3, 4, 5, 6, 7];
    const break_duration_handle = $("#short_break_duration");
    const long_break_duration_options = [9, 12, 15, 18, 21];
    const long_break_duration_handle = $("#long_break_duration");
    const break_cycle_options = [3, 4, 5];
    const break_cycle_handle = $("#break_cycle");
    const pomodoro_settings_ui = $(".pomodoro_settings");
    const pomodoro_wrapper = $(".pomodoro_wrapper");
    const settings_button = $(".settings_window_button");
    const intensive_mode_switch = $("#intensive_mode_switch");
    const delete_project_button = $(".delete_project_button");
    const task_wrapper = $("#task_wrapper");
    const deadline_category = ["today", "tomorrow", "upcoming", "no_deadline"];
    const main_wrapper = $(".main_wrapper");
    const current_to_do_frame = $(".to_do_frame");
    const current_to_do_div = $(".to_do.current");
    const edit_task_wrapper = $("#edit_task_wrapper");
    const quick_start_button = $(".quick_start");

// Performance flags. Sets to 1 if any task or project is updated, and resets to 0 after updating.
    let tasks_updated = 0;
    let projects_updated = 0;

// Pomodoro modes.
// If pomodoro finished, add +1 to pomodoro_done then modulo 4.
    let pomodoro_mode;
    pomodoro_mode = "focus";

// Settings overlay
    function pop_overlay(element) {
        const $1 = $(element);
        $1.addClass("visible");
        $1.on("transitionend", () => {
            $1.addClass("blur");
            $1.unbind("transitionend");
        });
    }

    function close_overlay(element) {
        const $1 = $(element);
        $1.removeClass("blur");
        $1.on("transitionend", () => {
            $1.removeClass("visible");
            $1.unbind("transitionend")
        });
    }

// Open settings overlay
    [time_left_text, settings_button].map(x => x.on("click", function () {
        pop_overlay("#main_settings");
    }))

    class InvalidData {
    }

    class Overflow {
    }

    class PomodoroConfig {
        static get pomodoro_content() {
            let data;
            data = JSON.parse(localStorage.getItem("pomodoro_data"));
            if (data === null) {
                data = {
                    focus_duration: 25 * 60,
                    break_duration: 5 * 60,
                    long_break_duration: 15 * 60,
                    long_break_frequency: 4,
                }
                localStorage.setItem("pomodoro_data", JSON.stringify(data));
            }
            return data;
        }

        static set pomodoro_content(data) {
            let {focus_duration, break_duration, long_break_duration, long_break_frequency} = data;
            if (focus_duration <= 0 || break_duration <= 0 || long_break_duration <= 0 || long_break_frequency <= 0) {
                throw InvalidData;
            }
            PomodoroConfig.pomodoro_cycle_counter = 0;
            localStorage.setItem("pomodoro_data", JSON.stringify(data));
        }

        static get pomodoro_cycle_counter() {
            let data;
            data = JSON.parse(localStorage.getItem("pomodoro_cycle_counter"));
            if (data === null) {
                data = 0;
                localStorage.setItem("pomodoro_cycle_counter", JSON.stringify(new_n));
            }
            return data;
        }

        static set pomodoro_cycle_counter(n) {
            let new_n = n % this.pomodoro_content.long_break_frequency;
            localStorage.setItem("pomodoro_cycle_counter", JSON.stringify(new_n));
        }

        static get intensive_mode() {
            let data;
            data = JSON.parse(localStorage.getItem("intensive_mode"));
            if (data === null) {
                data = false;
                localStorage.setItem("intensive_mode", JSON.stringify(data));
            }
            return data;
        }

        static set intensive_mode(data) {
            if (typeof data !== "boolean") {
                throw InvalidData;
            }
            localStorage.setItem("intensive_mode", JSON.stringify(data));
        }

        static get projects() {
            let data;
            data = JSON.parse(localStorage.getItem("projects"));
            if (data === null) {
                data = {};
                localStorage.setItem("projects", JSON.stringify(data));
            }
            return data;
        }

        static set projects(data) {
            localStorage.setItem("projects", JSON.stringify(data));
        }

        static get current_task() {
            let data;
            data = JSON.parse(localStorage.getItem("cur_task"));
            if (data === null) {
                localStorage.setItem("cur_task", JSON.stringify(data));
            }
            return data;
        }

        static set current_task(data) {
            localStorage.setItem("cur_task", JSON.stringify(data));
        }

        static get tasks() {
            let data;
            data = JSON.parse(localStorage.getItem("tasks"));
            if (data === null) {
                data = {};
                localStorage.setItem("tasks", JSON.stringify(data));
            }
            return data;
        }

        static set tasks(data) {
            localStorage.setItem("tasks", JSON.stringify(data));
        }
    }

    class AudioVisualConfig {
        static get theme() {
            let data;
            data = JSON.parse(localStorage.getItem("white_noise_config"));
            if (data === null) {
                data = white_noise_stuff[0];
                localStorage.setItem("white_noise_config", JSON.stringify(data));
            }
            return data;
        }

        static set theme(data) {
            localStorage.setItem("white_noise_config", JSON.stringify(data));
        }

        static get sound_on() {
            let data;
            data = JSON.parse(localStorage.getItem("sound"));
            if (data === null) {
                data = 1;
                localStorage.setItem("sound", JSON.stringify(data));
            }
            return data;
        }

        static set sound_on(data) {
            localStorage.setItem("sound", JSON.stringify(data));
        }
    }

// Configures the themes
    const white_noise_stuff =
        [["Tides", "/test-app/static/audio/ocean.mp3", "/test-app/static/images/ocean.png", "/test-app/static/customizations/ocean.css"], // completed
        ["Night Windchime", "/test-app/static/audio/windchime160.mp3", "/test-app/static/images/windchime.jpg", "/test-app/static/customizations/windchime.css"],
        ["Campfire", "/test-app/static/audio/campfire.mp3", "/test-app/static/images/campfire.jpg", "/test-app/static/customizations/campfire.css"],
        ["Forest", "/test-app/static/audio/forest.mp3", "/test-app/static/images/forest.jpg", "/test-app/static/customizations/forest.css"],
        ["Night", "/test-app/static/audio/night.mp3", "/test-app/static/images/night.jpg", "/test-app/static/customizations/night.css"],];
    for (let [name, dir, image_src, css_dir] of white_noise_stuff) {
        const element = document.createElement("li");
        $(element).attr("audio_dir", dir);
        $(element).attr("css_dir", css_dir);
        element.innerHTML = `<div><img src="${image_src}" alt="No image found."></div><div class="description"><span class="white_noise_name">${name}</span></div>`
        white_noise_list.append($(element));
    }

    function update_theme() {
        let _ = AudioVisualConfig.theme;
        try {
            white_noise_handle.attr("src", _[1]);
        } catch (e) {
            AudioVisualConfig.theme = white_noise_info[0];
            _ = white_noise_info[0];
        }
        white_noise_info.children("span").html(_[0]);
        theme_customization.attr("href", _[3]);
    }

    white_noise_list.children("li").on("click", function () {
        console.log()
        const audio_dir = $(this).attr("audio_dir");
        const name = $(this).find(".white_noise_name").html();
        const css_dir = $(this).attr("css_dir");
        AudioVisualConfig.theme = [name, audio_dir, 0, css_dir];
        update_theme();
        activate_deactivate_noise();
    });
    update_theme();

// Configures white noises.
    function toggle_sound() {
        if (!!AudioVisualConfig.sound_on) {
            AudioVisualConfig.sound_on = 0;
        } else {
            AudioVisualConfig.sound_on = 1;
        }
        console.log("Sound mode:", AudioVisualConfig.sound_on);
        -
            update_mute_button();
        activate_deactivate_noise();
    }

    function update_mute_button() {
        if (!AudioVisualConfig.sound_on) {
            mute_button.css({backgroundColor: "#ff0000", color: "white"});
        } else {
            mute_button.css({backgroundColor: "white", color: "black"});
        }
    }

    mute_button.on("click", toggle_sound);
    update_mute_button();

    function activate_deactivate_noise() {
        if (clock_mode === "started" && AudioVisualConfig.sound_on === 1 && pomodoro_mode === "focus") {
            white_noise_handle[0].play().then(() => {
            });
            white_noise_handle.stop()
            white_noise_handle[0].volume = 0;
            white_noise_handle.animate({volume: 0.6}, 500);
        } else {
            white_noise_handle.stop().animate({volume: 0}, 500, () => {
                white_noise_handle[0].pause();
                white_noise_handle[0].currentTime = 0;
            });
        }
    }

// Makes clock responsive and ticking.
    function clock_resize() {
        pomodoro_clock.css("height", "100%");
        let height = Math.floor(pomodoro_clock[0].offsetHeight);
        pomodoro_clock.css("width", height + "px");
        let width = Math.floor(pomodoro_clock[0].offsetWidth / 20) * 20;
        pomodoro_clock.css("height", width + "px");
        pomodoro_clock.css("width", width + "px");
        pomodoro_fill.css("clip", `rect(0px, ${(width / 2)}px, ${width}px, 0px)`);
        pomodoro_mask.css({clip: `rect(0px, ${width}px, ${width}px, ${(width / 2)}px)`});
        time_left_text.css({fontSize: width / 4 + "px"});
    }

    function clock_tick() {
        seconds_left--;
        update_clock();
        if (seconds_left <= 0) {
            finish_clock();
        } else {
            clock_started = setTimeout(clock_tick, 1000);
        }
    }

    function update_clock() {
        let degrees;
        if (clock_mode === "stopped") {
            degrees = 180;
        } else {
            degrees = 180 - seconds_left / initial_timer * 180;
        }
        rotate_trigger.css({transform: `rotate(${degrees}deg)`});
        let minutes_string = Math.floor(seconds_left / 60).toString().padStart(2, "0");
        let seconds_string = Math.floor(seconds_left % 60).toString().padStart(2, "0");
        time_left_text.html(`${minutes_string}:${seconds_string}`)
    }

    clock_resize();
    update_clock();
    $(window).on("resize", clock_resize);

// Starts, pauses, finishes the pomodoro.
    function hide_element(element) {
        const jq = $(element);
        requestAnimationFrame(() => jq.addClass("hidden"))
        jq.hide();
    }

    function pop_element(element) {
        const jq = $(element);
        jq.show();
        requestAnimationFrame(() => jq.removeClass("hidden"))
    }

    function start_clock() {
        clock_mode = "started";
        seconds_left = initial_timer;
        update_clock();
        clock_started = setTimeout(clock_tick, 1000);
        pop_element(".btn_overlay_3");
        hide_element(".btn_overlay_2");
        hide_element(".btn_overlay_1");
        activate_deactivate_noise();
    }

    function resume_clock() {
        clock_mode = "started";
        clock_started = setTimeout(clock_tick, 1000);
        pop_element(".btn_overlay_3");
        hide_element(".btn_overlay_2");
        hide_element(".btn_overlay_1");
        activate_deactivate_noise();
    }

    function finish_clock() {
        if (pomodoro_mode === "focus") {
            // console.log("Pomodoro finished. Switching to break mode.");
            const task_id = parseInt(current_to_do_div.attr("current_task"));
            if (!isNaN(task_id)) {
                let finished_pomodoros = tasks_in_memory[task_id].pomodoros_done;
                finished_pomodoros += 1;
                edit_task(task_id, {pomodoros_done: finished_pomodoros});
            }
            pomodoro_mode = "break";
            PomodoroConfig.pomodoro_cycle_counter += 1;
            pomodoro_wrapper.find(".background").addClass("tint_green");
            if (PomodoroConfig.pomodoro_cycle_counter === 0) {
                initial_timer = PomodoroConfig.pomodoro_content.long_break_duration;
            } else {
                initial_timer = PomodoroConfig.pomodoro_content.break_duration;
            }
        } else {
            // console.log("Break finished. Switching to focus mode.");
            pomodoro_mode = "focus";
            pomodoro_wrapper.find(".background").removeClass("tint_green");
            initial_timer = PomodoroConfig.pomodoro_content.focus_duration;
        }
        stop_clock(1);
        activate_deactivate_noise();
    }

    function pause_clock() {
        clock_mode = "paused";
        update_clock();
        clearTimeout(clock_started);
        pop_element(".btn_overlay_2");
        hide_element(".btn_overlay_3");
        hide_element(".btn_overlay_1");
        activate_deactivate_noise();
    }

    function stop_clock(finished) {
        clock_mode = "stopped";
        clearTimeout(clock_started);
        pop_element(".btn_overlay_1");
        hide_element(".btn_overlay_3");
        hide_element(".btn_overlay_2");
        activate_deactivate_noise();
        if (!finished) {
            // console.log("Pomodoro unfinished, break skipped or the app is configuring.");
            pomodoro_mode = "focus";
            pomodoro_wrapper.removeClass("tint_green");
            initial_timer = PomodoroConfig.pomodoro_content.focus_duration;
        }
        seconds_left = initial_timer;
        update_clock();
        update_quick_start_button();
    }

    start.on("click", start_clock)
    pause.on("click", pause_clock);
    resume.on("click", resume_clock);
    stop.on("click", () => stop_clock(0));
    stop_clock();

// Closes full screen wrappers except the main page.
    close_button.on("click", function () {
        if (!!tasks_updated) {
            refresh_task_list_after_edit();
            tasks_updated = 0;
        }
        if (!!projects_updated) {
            update_custom_project_ui();
            projects_updated = 0;
        }
        const target = $($(this).attr("close_target"));
        close_overlay(target);
    });


    white_noise_info.on("click", function () {
        pop_overlay($("#audio_settings"));
    });

// Loads the Pomodoro settings and miscellaneous (including intensive mode).
    function load_pomodoro_settings() {
        stop_clock();
        let pomodoro_time = PomodoroConfig.pomodoro_content;
        initial_timer = pomodoro_time.focus_duration;
        work_duration_handle.val(Math.floor(pomodoro_time.focus_duration / 60));
        break_duration_handle.val(Math.floor(pomodoro_time.break_duration / 60));
        long_break_duration_handle.val(Math.floor(pomodoro_time.long_break_duration / 60));
        break_cycle_handle.val(Math.floor(pomodoro_time.long_break_frequency));
        stop_clock();
    }

    function save_pomodoro_settings() {
        PomodoroConfig.pomodoro_content = {
            focus_duration: work_duration_handle.val() * 60,
            break_duration: break_duration_handle.val() * 60,
            long_break_duration: long_break_duration_handle.val() * 60,
            long_break_frequency: break_cycle_handle.val(),
        }
        load_pomodoro_settings();
    }

    function create_option(value, text) {
        const _ = document.createElement("option");
        _.innerHTML = text;
        _.value = value;
        return _;
    }

    for (let _ of work_duration_options) {
        work_duration_handle.append($(create_option(_, _ + " minutes")));
    }
    for (let _ of break_duration_options) {
        break_duration_handle.append($(create_option(_, _ + " minutes")));
    }
    for (let _ of long_break_duration_options) {
        long_break_duration_handle.append($(create_option(_, _ + " minutes")));
    }
    for (let _ of break_cycle_options) {
        break_cycle_handle.append($(create_option(_, _)));
    }
    load_pomodoro_settings();
    pomodoro_settings_ui.find("select").on("change", function () {
        save_pomodoro_settings();
    })
    intensive_mode_switch[0].checked = (PomodoroConfig.intensive_mode);
    intensive_mode_switch.on("change", function () {
        PomodoroConfig.intensive_mode = intensive_mode_switch[0].checked;
    })

// Configures the task interface
    let tasks_in_memory = PomodoroConfig.tasks;
    let add_task_pomodoro_count = 1;

    function add_task(data) {
        let final_task_id;
        for (let i = 0; i <= max_tasks_allowed; i++) {
            if (i === max_tasks_allowed) {
                console.log("Add failure. Max tasks reached.");
                throw Overflow
            } else if (tasks_in_memory[i] === undefined) {
                tasks_in_memory[i] = data;
                final_task_id = i;
                break;
            }
        }
        console.log(tasks_in_memory);
        PomodoroConfig.tasks = tasks_in_memory;
        return final_task_id;
    }

    function remove_task(id) {
        delete tasks_in_memory[id];
        PomodoroConfig.tasks = tasks_in_memory;
        if (id === PomodoroConfig.current_task) {
            PomodoroConfig.current_task = null;
            update_current_to_do();
        }
        remove_task_from_all_projects(id);
    }

    function edit_task(id, data) {
        for (let key in data) {
            tasks_in_memory[id][key] = data[key];
        }
        PomodoroConfig.tasks = tasks_in_memory;
        tasks_updated = 1;
        projects_updated = 1;
    }


// Quick pomodoro count edit before adding.
    const add_task_box = $(".add_task");
    const quick_tomato_counter_tomatoes = $(".quick_tomato_counter > i.fas.fa-stopwatch");
    const quick_tomato_counter = $(".quick_tomato_counter");
    const add_task_button = $(".add_task button");
    const pomodoro_edit_goal_input = $("#pomodoro_count");
    const pomodoro_edit_deadline_input = $("#deadline");
    const pomodoro_edit_task_name = edit_task_wrapper.find(".edit_task_name_input");
    const pomodoro_edit_task_checkbox = edit_task_wrapper.find(".edit_task_name .custom_checkbox");
    const pomodoro_edit_project_location = edit_task_wrapper.find("#project_location");
    const task_list = task_wrapper.find(".main_content > ul");
    const task_wrapper_window_title = task_wrapper.find(".window_title");

    function refresh_task_list(window_title_name, task_category, custom_project_id) {
        task_wrapper_window_title.html(window_title_name);
        if (task_category === "completed") {
            quick_tomato_counter.hide();
            add_task_box.hide();
        } else {
            quick_tomato_counter.show();
            add_task_box.show();
        }
        task_wrapper.attr("to_do_category", task_category);
        console.log("Task category:", task_category);
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
    }

    function replace_window_title_with_textarea() {
        // does not add a new textarea if there's already a textarea
        if (!task_wrapper_window_title.find("textarea").length) {
            const temporary_title = task_wrapper_window_title.find("span");
            const window_title_name = temporary_title.html();
            console.log(window_title_name);
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

    for (let _ = 1; _ <= quick_tomato_counter_tomatoes.length; _++) {
        $(quick_tomato_counter_tomatoes[_ - 1]).attr("pomodoro_count", _)
    }

    function update_add_pomodoro_count_interface() {
        quick_tomato_counter_tomatoes.removeClass("highlight")
        for (let _ = 1; _ <= add_task_pomodoro_count; _++) {
            $(quick_tomato_counter_tomatoes[_ - 1]).addClass("highlight");
        }
    }

    quick_tomato_counter_tomatoes.on("click", function () {
        add_task_pomodoro_count = parseInt($(this).attr("pomodoro_count"));
        update_add_pomodoro_count_interface();
    })
    update_add_pomodoro_count_interface();

// Adds new tasks and UI refresh.
    function add_task_ui_entry(id) {
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
        console.log("Adding task...")
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
        stop_clock();
        start_clock();
        close_overlay($(".window_wrapper"));
        main_wrapper.fadeOut(250);
        PomodoroConfig.current_task = task_id;
        update_current_to_do();
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
            console.log(PomodoroConfig.tasks);
        }
    })

    function update_edit_ui(task_id) {
        edit_task_wrapper.attr("task_id", task_id);
        pomodoro_edit_task_name.val(tasks_in_memory[task_id].name);
        pomodoro_edit_deadline_input.val(moment(tasks_in_memory[task_id].deadline).format("YYYY-MM-DD"));
        pomodoro_edit_deadline_input.flatpickr({
            altFormat: "F j, Y",
            altInput: true,
        })
        pomodoro_edit_goal_input.val(tasks_in_memory[task_id].pomodoro_goal);
        edit_task_wrapper.find(".edit_task_name .custom_checkbox")[0].checked = !!(tasks_in_memory[task_id].completed);
        pomodoro_edit_project_location.html("");
        pomodoro_edit_project_location.append($(create_option("null", "No project")));
        for (let project_id in projects_in_memory) {
            const project_info = projects_in_memory[project_id];
            pomodoro_edit_project_location.append($(create_option(project_id, project_info.name)))
            if (project_info.tasks.includes(task_id)) {
                pomodoro_edit_project_location.val(project_id);
            }
        }
    }


// Updates to the main status bar
    function update_current_to_do() {
        let _ = PomodoroConfig.current_task;
        if (_ === null || _ === undefined) {
            current_to_do_frame.hide();
            current_to_do_div.attr("current_task", "");
        } else {
            current_to_do_frame.css("display", "flex");
            current_to_do_div.attr("current_task", _);
            current_to_do_div.children("p").text(tasks_in_memory[_].name);
            current_to_do_div.children("input")[0].checked = !!(tasks_in_memory[_].completed);
        }
    }

    update_current_to_do();
    current_to_do_div.children(".cancel_task").on("click", function () {
        PomodoroConfig.current_task = null;
        update_current_to_do();
    });
    current_to_do_div.children(".custom_checkbox").on("change", function () {
        const task_id = parseInt(current_to_do_div.attr("current_task"));
        if (!isNaN(task_id)) {
            edit_task(task_id, {completed: this.checked});
        }
    })


// Intensive mode.
    {
        let warning_timeout;
        $(window).on("blur", function () {
            if (!!PomodoroConfig.intensive_mode && clock_mode === "started" && pomodoro_mode === "focus") {
                alert("Please go back to Focus. Stay focused!")
                warning_timeout = setTimeout(() => stop_clock(0), 10000);
            }
        })

        $(window).on("mouseover", function () {
            clearTimeout(warning_timeout);
        })
    }


// Handles the editing of tasks and refreshing of the UI.
    function refresh_task_list_after_edit() {
        console.log("Tasks edited. Refreshing...");
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
        if (!isNaN(id)) {
            add_task_to_project(id, project_id)
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

// Textarea patches
    function textarea_resize() {
        this.style.height = "0";
        this.style.height = (this.scrollHeight) + "px";
        this.style.overflowY = "hidden"
    }

    $(window).on("resize", function () {
        $("textarea").each(textarea_resize);
    });
    $(document).on("input", "textarea", textarea_resize);


// Projects constants
    let projects_in_memory = PomodoroConfig.projects;
    let max_projects_allowed = 10000;
    const add_project_panel = $(".add_project");
    const add_project_button = add_project_panel.children(".button");
    const add_project_text = add_project_panel.children("textarea");
    const custom_projects_section = $(".custom_projects");

// Manages projects and contained tasks.
    function add_project(data) {
        let final_project_id;
        for (let i = 0; i <= max_projects_allowed; i++) {
            if (i === max_projects_allowed) {
                console.log("Add failure. Max projects reached.");
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

    function edit_project(id, data) {
        for (let key in data) {
            projects_in_memory[id][key] = data[key];
        }
        PomodoroConfig.projects = projects_in_memory;
        projects_updated = 1;
    }

    function add_task_to_project(task_id, project_id) {
        let cur_project_tasks = projects_in_memory[project_id].tasks;
        if (!cur_project_tasks.includes(task_id)) {
            cur_project_tasks.push(task_id);
            edit_project(project_id, {tasks: cur_project_tasks});
        } else {
            console.warn("Task already added.");
        }
    }

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

    function remove_project(id) {
        delete projects_in_memory[id];
        PomodoroConfig.projects = projects_in_memory;
        projects_updated = 1;
    }

// Creates a new clickable project entry.
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
        close_overlay(task_wrapper);
    })

    update_custom_project_ui();

// Makes all links clickable.
    main_wrapper.on("click", ".to_do_nav_item", function () {
        console.log("");
        const title_name = $(this).children("div").first().html();
        const task_category = $(this).attr("to_do_category");
        const project_id = parseInt($(this).attr("project_id"));
        refresh_task_list(title_name, task_category, project_id);
        pop_overlay("#task_wrapper");
    })

// Reset all data
    $("#wipe_data").on("click", function () {
        localStorage.clear();
        const _ = document.createElement("meta");
        _.innerHTML = `<meta http-equiv="refresh" content="0; url='.'">`
        $("html").append($(_));
    })

// Pomodoro defaults
    $("#wipe_pomodoro_config").on("click", function () {
        localStorage.removeItem("pomodoro_data");
        load_pomodoro_settings();
    })

// Quick start
    quick_start_button.on('click', function () {
        if (clock_mode === "stopped") {
            start_clock();
        } else if (clock_mode === "paused") {
            resume_clock();
        }
        main_wrapper.fadeOut(250);
    })

    function update_quick_start_button() {
        quick_start_button.html(Math.floor(initial_timer / 60));
        quick_start_button.removeClass("break");
        if (pomodoro_mode === "break") {
            quick_start_button.addClass("break");
        }
    }

    update_quick_start_button();


// Homepage button
    $(".homepage").on("click", function () {
        main_wrapper.fadeTo(250, 1);
    })

    $(".hide_homepage").on("click", function () {
        main_wrapper.fadeOut(250);
    })
})();