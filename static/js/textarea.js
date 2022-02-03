(function () {
    function textarea_resize() {
        this.style.height = "0";
        this.style.height = (this.scrollHeight) + "px";
        this.style.overflowY = "hidden"
    }
    function resize_all_textarea () {
        $("textarea").each(textarea_resize);
    }
    $(window).on("resize", resize_all_textarea);
    $(document).on("input", "textarea", textarea_resize);
    resize_all_textarea();
    $(document).on("textarea_update", resize_all_textarea);
})();