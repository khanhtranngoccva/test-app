// Quick start
"use strict";
(function () {
    const main_wrapper = $(".main_wrapper");
    const quick_start_button = $(".quick_start");
    quick_start_button.on('click', function () {
        document.dispatchEvent(try_start_clock);
        main_wrapper.fadeOut(250);
    })

    function update_quick_start_button() {
        quick_start_button.html(Math.floor(initial_timer / 60));
        quick_start_button.removeClass("break");
        if (pomodoro_mode === "break") {
            quick_start_button.addClass("break");
        }
    }

    document.addEventListener("clock_stopped", update_quick_start_button);
    update_quick_start_button();
})()