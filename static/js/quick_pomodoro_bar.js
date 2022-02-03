(function () {
    const quick_tomato_counter_tomatoes = $(".quick_tomato_counter > i.fas.fa-stopwatch");

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
})();