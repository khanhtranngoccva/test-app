"use strict";
{
    const white_noise_handle = $("#white_noise_audio");
    const end_sound_handle = $("#end_audio");
    end_sound_handle[0].src = END_SOUND;
    $(document).on("white_noise_toggled", function () {
        if (clock_mode === "started" && AudioVisualConfig.sound_on && pomodoro_mode === "focus") {
            white_noise_handle[0].play().then(() => {
            });
            // Stops the animation of volume, not the sound itself
            white_noise_handle.stop()
            white_noise_handle[0].volume = 0;
            white_noise_handle.animate({volume: 0.6}, 500);
        } else {
            white_noise_handle.stop().animate({volume: 0}, 500, () => {
                white_noise_handle[0].pause();
                white_noise_handle[0].currentTime = 0;
            });
        }
    });
    $(document).on("clock_finished", function() {
        if (AudioVisualConfig.sound_on) {
            end_sound_handle[0].currentTime = 0;
            end_sound_handle[0].play();
        }
    })
}
(function () {
    const mute_button = $(".mute_button");
    function toggle_sound() {
        if (!!AudioVisualConfig.sound_on) {
            AudioVisualConfig.sound_on = 0;
        } else {
            AudioVisualConfig.sound_on = 1;
        }
        update_mute_button();
        document.dispatchEvent(white_noise_toggled);
    }
    function update_mute_button() {
        if (!AudioVisualConfig.sound_on) {
            mute_button.addClass("muted");
        } else {
            mute_button.removeClass("muted");
        }
    }
    mute_button.on("click", toggle_sound);
    update_mute_button();
})();
