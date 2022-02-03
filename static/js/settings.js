"use strict";
// Loads main Pomodoro settings.
(function () {
    const work_duration_handle = $("#work_duration");
    const break_duration_handle = $("#short_break_duration");
    const long_break_duration_handle = $("#long_break_duration");
    const break_cycle_handle = $("#break_cycle");
    const pomodoro_settings_ui = $(".pomodoro_settings");
    const time_left_text = $(".pomodoro_clock .time_left");
    const settings_button = $(".settings_window_button");
    function load_pomodoro_settings() {
        let pomodoro_time = PomodoroConfig.pomodoro_content;
        initial_timer = pomodoro_time.focus_duration;
        work_duration_handle.val(Math.floor(pomodoro_time.focus_duration / 60));
        break_duration_handle.val(Math.floor(pomodoro_time.break_duration / 60));
        long_break_duration_handle.val(Math.floor(pomodoro_time.long_break_duration / 60));
        break_cycle_handle.val(Math.floor(pomodoro_time.long_break_frequency));
        document.dispatchEvent(force_stop_clock);
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
    for (let _ of WORK_DURATION_OPTIONS) {
        work_duration_handle.append($(create_option_tag(_, _ + " minutes")));
    }
    for (let _ of BREAK_DURATION_OPTIONS) {
        break_duration_handle.append($(create_option_tag(_, _ + " minutes")));
    }
    for (let _ of LONG_BREAK_DURATION_OPTIONS) {
        long_break_duration_handle.append($(create_option_tag(_, _ + " minutes")));
    }
    for (let _ of BREAK_CYCLE_OPTIONS) {
        break_cycle_handle.append($(create_option_tag(_, _)));
    }
    load_pomodoro_settings();
    pomodoro_settings_ui.find("select").on("change", function () {
        save_pomodoro_settings();
    });

    // Resets Pomodoro configs to default.
    $("#wipe_pomodoro_config").on("click", function () {
        localStorage.removeItem("pomodoro_data");
        load_pomodoro_settings();
    });

    // Open settings overlay
    [time_left_text, settings_button].map(x => x.on("click", function () {
        pop_overlay("#main_settings");
    }))
})();

// Intensive mode.
(function () {
    const intensive_mode_switch = $("#intensive_mode_switch");
    intensive_mode_switch[0].checked = (PomodoroConfig.intensive_mode);
    intensive_mode_switch.on("change", async function () {
        PomodoroConfig.intensive_mode = intensive_mode_switch[0].checked;
        if (!!PomodoroConfig.intensive_mode) {
            notification_check();
        }
    });
    $(document).on("notifications_disabled", function () {
        intensive_mode_switch[0].checked = false;
        PomodoroConfig.intensive_mode = false;
    })
})();

// End notifications.
(function () {
    const end_notification_switch = $("#end_notification_switch");
    end_notification_switch[0].checked = (PomodoroConfig.end_notification);
    end_notification_switch.on("change", async function () {
        PomodoroConfig.end_notification = end_notification_switch[0].checked;
        if (!!PomodoroConfig.end_notification) {
            notification_check();
        }
    });
    $(document).on("notifications_disabled", function () {
        end_notification_switch[0].checked = false;
        PomodoroConfig.end_notification = false;
    })
})();

// Auto mode.
(function() {
    const auto_break_handle = $("#auto_break");
    const auto_focus_handle = $("#auto_focus");
    auto_break_handle[0].checked = PomodoroConfig.auto_break;
    auto_focus_handle[0].checked = PomodoroConfig.auto_focus;
    auto_break_handle.on("change", ()=>PomodoroConfig.auto_break = auto_break_handle[0].checked);
    auto_focus_handle.on("change", ()=>PomodoroConfig.auto_focus = auto_focus_handle[0].checked);
})();

// Wipe out data.
(function () {
    // Reset all data
    $("#wipe_data").on("click", function () {
        document.cookie = "";
        localStorage.clear();
        const _ = document.createElement("meta");
        _.innerHTML = `<meta http-equiv="refresh" content="0; url='.'">`
        $("html").append($(_));
    })
})();

