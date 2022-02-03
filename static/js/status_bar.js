"use strict";
// Updates to the current task status bar
(function () {
    const current_to_do_frame = $(".to_do_frame");
    const current_to_do_div = $(".to_do.current");

    function update_current_to_do() {
        let _ = parseInt(PomodoroConfig.current_task);
        if (isNaN(_)) {
            current_to_do_frame.hide();
        } else {
            current_to_do_frame.css("display", "flex");
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
        const task_id = parseInt(PomodoroConfig.current_task);
        if (!isNaN(task_id)) {
            edit_task(task_id, {completed: this.checked});
        }
    })

    $(document).on("cur_task_updated", update_current_to_do);
})();