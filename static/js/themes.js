(function () {
    const theme_customization = $("#theme_customization");
    const white_noise_handle = $("#white_noise_audio");
    const white_noise_info = $(".white_noise_info");
    const white_noise_list = $(".white_noise_list");
    (function () {
        for (let [name, dir, image_src, css_dir] of ALL_THEMES) {
            const element = document.createElement("li");
            $(element).attr("audio_dir", dir);
            $(element).attr("css_dir", css_dir);
            $(element).attr("image_dir", image_src);
            element.innerHTML = `<div><img src="${image_src}" alt="No image found."></div><div class="white_noise_description"><span class="white_noise_name">${name}</span></div>`
            white_noise_list.append($(element));
        }
    }());

    function update_title_bar() {
        $("meta[name='theme-color']").attr("content", $(":root").css("--theme-color"));
    }

    function update_theme() {
        let _ = AudioVisualConfig.theme;
        try {
            white_noise_handle.attr("src", _[1]);
        } catch (e) {
            AudioVisualConfig.theme = ALL_THEMES[0];
            _ = ALL_THEMES[0];
            white_noise_handle.attr("src", _[1]);
        }
        white_noise_info.children("span").html(_[0]);
        theme_customization.attr("href", _[3]);
        theme_customization.attr("href", _[3]);
    }

    white_noise_list.children("li").on("click", function () {
        const audio_dir = $(this).attr("audio_dir");
        const name = $(this).find(".white_noise_name").html();
        const css_dir = $(this).attr("css_dir");
        const image_dir = $(this).attr("image_dir");
        AudioVisualConfig.theme = [name, audio_dir, image_dir, css_dir];
        update_theme();
        document.dispatchEvent(white_noise_toggled);
    });

    update_theme();

    setInterval(update_title_bar, 1000);

    white_noise_info.on("click", function () {
        pop_overlay($("#audio_settings"));
    });
})();