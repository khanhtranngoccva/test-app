(function () {
    const main_wrapper = $(".main_wrapper");
    main_wrapper.on("click", ".to_do_nav_item", function () {
        const title_name = $(this).children("div").first().html();
        const task_category = $(this).attr("to_do_category");
        const project_id = parseInt($(this).attr("project_id"));
        refresh_task_list(title_name, task_category, project_id);
        pop_overlay("#task_wrapper");
    })
    $(".homepage_btn").on("click", function () {
        main_wrapper.fadeTo(250, 1);
        document.dispatchEvent(textarea_update);
    })
    $(".hide_homepage_btn").on("click", function () {
        main_wrapper.fadeOut(250);
    })
})();