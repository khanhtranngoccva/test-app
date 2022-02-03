(function() {
    $(document).on("focus_finished", ()=>{
        if (Notification.permission === "granted" && PomodoroConfig.end_notification) {
            const end_notification = new Notification("Your Pomodoro has completed!", {
                body: "Time to relax and take care of yourself. Don't burn out!",
                image: AudioVisualConfig.theme[2],
                icon: NOTIFICATION_LOGO,
                silent: true,
            });
            setTimeout(()=>end_notification.close(), 10000);
            $(end_notification).on("click", end_notification.close);
        }
    })
})();