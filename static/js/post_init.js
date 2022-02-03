(function () {
    // Turns off notification-based features if notifications are off. Should add a time-based daily notification soon.
    notification_check();

// Stops the clock to force a redraw.
    document.dispatchEvent(force_stop_clock);

// Performance test
    console.log("All native scripts loaded. Time taken:", Math.round(performance.now())/1000);

// Make the logo layer disappear after a set time.
    $(window).on("load", () => {
        console.log("All assets loaded. Time taken", Math.round(performance.now())/1000);
        setTimeout(() => $("#logo_wrapper").fadeOut(200), 500);
    });
}());