// Intensive mode.
(function() {
    let title = "Stay focused!"
    let warn_string = "You're on no-distraction mode. Please go back to Tranquil. Your Pomodoro will stop in 30 seconds."
    $(window).on("blur", function () {
        if (!!PomodoroConfig.intensive_mode && clock_mode === "started" && pomodoro_mode === "focus") {
            if (Notification.permission === "granted") {
                let warning_timeout;
                warning_timeout = setTimeout(() => document.dispatchEvent(force_stop_clock), 30000);
                let notification = new Notification(title, {
                    body: warn_string,
                    image: AudioVisualConfig.theme[2],
                    icon: NOTIFICATION_LOGO
                });
                notification.addEventListener("click", function () {
                    window.focus();
                })
                $(window).on("focus", function () {
                    notification.close();
                    clearTimeout(warning_timeout);
                })
                $(window).on("clock_finished", function () {
                    notification.close();
                    clearTimeout(warning_timeout);
                })
            }
        }
    })
})();
