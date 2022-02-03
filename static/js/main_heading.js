(function(){
    const main_heading = $(".main_heading");
    
    function refresh_heading() {
        const current_hour = moment().hour();
        if (6 <= current_hour <= 11) {
            main_heading.text("Good morning.")
        }
        else if (12 <= current_hour <= 18) {
            main_heading.text("Good afternoon.")
        }
        else if (19 <= current_hour <= 22) {
            main_heading.text("Good evening.")
        } else {
            main_heading.text("Good night")
        }
    }
    
    refresh_heading();
})();