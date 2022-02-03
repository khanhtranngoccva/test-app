(function () {
    const blur_effects_css = $("#blur_effects");
    const effects_button = $(".effects_button");

    function update_visual_effects() {
        const _ = AudioVisualConfig.blur_effects;
        blur_effects_css[0].disabled = !_;
        if (!_) {
            effects_button.addClass("disabled");
        } else {
            effects_button.removeClass("disabled");
        }
    }

    effects_button.on("click", () => {
        AudioVisualConfig.blur_effects = !AudioVisualConfig.blur_effects;
        update_visual_effects();
    })

    update_visual_effects();

})();