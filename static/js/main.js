(function () {
// Defines jQuery clock handles.
    const pomodoro_clock = $(".pomodoro_clock");
    const pomodoro_fill = $(".pomodoro_clock .mask .fill");
    const pomodoro_mask = $(".pomodoro_clock .mask");
    const rotate_trigger = $(".pomodoro_clock .clock_rotate");
    const time_left_text = $(".pomodoro_clock .time_left");
    const [start, pause, resume, stop] = [$(".start_pomodoro"), $(".pause_pomodoro"), $(".resume_pomodoro"), $(".stop_pomodoro")];
    let clock_tick_interval;
    let seconds_left = initial_timer;
    const pomodoro_wrapper = $(".pomodoro_wrapper");


// Makes clock responsive and ticking.
    function clock_resize() {
        pomodoro_clock.css("height", "100%");
        let height = Math.floor(pomodoro_clock[0].offsetHeight);
        pomodoro_clock.css("width", height + "px");
        let width = Math.floor(pomodoro_clock[0].offsetWidth / 16) * 16;
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
        clock_tick_interval = setInterval(clock_tick, 1000);
        pop_element(".btn_overlay_3");
        hide_element(".btn_overlay_2");
        hide_element(".btn_overlay_1");
        document.dispatchEvent(white_noise_toggled);
    }

    function resume_clock() {
        clock_mode = "started";
        clock_tick_interval = setInterval(clock_tick, 1000);
        pop_element(".btn_overlay_3");
        hide_element(".btn_overlay_2");
        hide_element(".btn_overlay_1");
        document.dispatchEvent(white_noise_toggled);
    }

    function finish_clock() {
        if (pomodoro_mode === "focus") {
            pomodoro_mode = "break";
            const task_id = parseInt(PomodoroConfig.current_task);
            if (!isNaN(task_id)) {
                let finished_pomodoros = tasks_in_memory[task_id].pomodoros_done;
                finished_pomodoros += 1;
                edit_task(task_id, {pomodoros_done: finished_pomodoros});
            }
            pomodoro_wrapper.find(".background").addClass("tint_green");
            PomodoroConfig.pomodoro_cycle_counter += 1;
            if (PomodoroConfig.pomodoro_cycle_counter === 0) {
                initial_timer = PomodoroConfig.pomodoro_content.long_break_duration;
            } else {
                initial_timer = PomodoroConfig.pomodoro_content.break_duration;
            }
            document.dispatchEvent(focus_finished);
        } else {
            pomodoro_mode = "focus";
            pomodoro_wrapper.find(".background").removeClass("tint_green");
            initial_timer = PomodoroConfig.pomodoro_content.focus_duration;
        }
        stop_clock(1);
        document.dispatchEvent(clock_finished);
        document.dispatchEvent(white_noise_toggled);
        if (pomodoro_mode === "break" && PomodoroConfig.auto_break) {
            start_clock();
        } else if (pomodoro_mode === "focus" && PomodoroConfig.auto_focus) {
            start_clock();
        }
    }

    function pause_clock() {
        clock_mode = "paused";
        update_clock();
        clearInterval(clock_tick_interval);
        pop_element(".btn_overlay_2");
        hide_element(".btn_overlay_3");
        hide_element(".btn_overlay_1");
        document.dispatchEvent(white_noise_toggled);
    }

    function stop_clock(finished) {
        clock_mode = "stopped";
        clearInterval(clock_tick_interval);
        pop_element(".btn_overlay_1");
        hide_element(".btn_overlay_3");
        hide_element(".btn_overlay_2");
        document.dispatchEvent(white_noise_toggled);
        if (!finished) {
            // console.log("Pomodoro unfinished, break skipped or the app is configuring.");
            pomodoro_mode = "focus";
            pomodoro_wrapper.find(".background").removeClass("tint_green");
            initial_timer = PomodoroConfig.pomodoro_content.focus_duration;
        }
        seconds_left = initial_timer;
        update_clock();
        document.dispatchEvent(clock_stopped);
    }

    start.on("click", start_clock)
    pause.on("click", pause_clock);
    resume.on("click", resume_clock);
    stop.on("click", () => stop_clock(0));

    // Runs if other scripts try to stop the clock.
    $(document).on("force_stop_clock", () => stop_clock(0));
    $(document).on("try_start_clock", () => {
        if (clock_mode === "stopped") {
            start_clock();
        } else if (clock_mode === "paused") {
            resume_clock();
        }
    })
})();