// Default configurations
const END_SOUND = "/static/audio/end_bells.mp3";
const NOTIFICATION_LOGO = "/static/images/logo.png";
const ALL_THEMES = [
    ["Night", "/static/audio/night.mp3", "/static/images/thumbnails/night.webp", "/static/customizations/night.css"],
    ["Forest", "/static/audio/forest.mp3", "/static/images/thumbnails/forest.webp", "/static/customizations/forest.css"],
    ["Tides", "/static/audio/ocean.mp3", "/static/images/thumbnails/beach.webp", "/static/customizations/ocean.css"], // completed
    ["Night Windchime", "/static/audio/windchime160.mp3", "/static/images/thumbnails/windchime.webp", "/static/customizations/windchime.css"],
    ["Campfire", "/static/audio/campfire.mp3", "/static/images/thumbnails/campfire.webp", "/static/customizations/campfire.css"],
    ["Bells", "/static/audio/bells.mp3", "/static/images/thumbnails/bells.webp", "/static/customizations/bells.css"],
    ["Train", "/static/audio/train160.mp3", "/static/images/thumbnails/train.webp", "/static/customizations/train.css"],
    ["Library", "/static/audio/library.mp3", "/static/images/thumbnails/library.webp", "/static/customizations/library.css"],
    ["Wind", "/static/audio/wind.mp3", "/static/images/thumbnails/wind.webp", "/static/customizations/wind.css"],
    ["Rain", "/static/audio/rain.mp3", "/static/images/thumbnails/rain.webp", "/static/customizations/rain.css"],
];
const WORK_DURATION_OPTIONS = [15, 20, 25, 30, 35];
const BREAK_DURATION_OPTIONS = [3, 4, 5, 6, 7];
const LONG_BREAK_DURATION_OPTIONS = [9, 12, 15, 18, 21];
const MAX_TASKS_ALLOWED = 10000;
const MAX_PROJECTS_ALLOWED = 10000;
const BREAK_CYCLE_OPTIONS = [3, 4, 5];
const FLATPICKR_CONFIG = {
    altFormat: "F j, Y",
    altInput: true,
}

// Data classes.
class InvalidData {
}

class Overflow {
}

class PomodoroConfig {
    static get pomodoro_content() {
        let data;
        data = JSON.parse(localStorage.getItem("pomodoro_data"));
        if (data === null) {
            data = {
                focus_duration: 25 * 60,
                break_duration: 5 * 60,
                long_break_duration: 15 * 60,
                long_break_frequency: 4,
            }
            localStorage.setItem("pomodoro_data", JSON.stringify(data));
        }
        return data;
    }

    static set pomodoro_content(data) {
        let {focus_duration, break_duration, long_break_duration, long_break_frequency} = data;
        if (focus_duration <= 0 || break_duration <= 0 || long_break_duration <= 0 || long_break_frequency <= 0) {
            throw InvalidData;
        }
        PomodoroConfig.pomodoro_cycle_counter = 0;
        localStorage.setItem("pomodoro_data", JSON.stringify(data));
    }

    static get pomodoro_cycle_counter() {
        let data;
        data = JSON.parse(localStorage.getItem("pomodoro_cycle_counter"));
        if (data === null) {
            data = 0;
            localStorage.setItem("pomodoro_cycle_counter", JSON.stringify(data));
        }
        return data;
    }

    static set pomodoro_cycle_counter(n) {
        let new_n = n % this.pomodoro_content.long_break_frequency;
        localStorage.setItem("pomodoro_cycle_counter", JSON.stringify(new_n));
    }

    static get intensive_mode() {
        let data;
        data = JSON.parse(localStorage.getItem("intensive_mode"));
        if (data === null) {
            data = false;
            localStorage.setItem("intensive_mode", JSON.stringify(data));
        }
        return data;
    }

    static set intensive_mode(data) {
        if (typeof data !== "boolean") {
            throw InvalidData;
        }
        localStorage.setItem("intensive_mode", JSON.stringify(data));
    }

    static get projects() {
        let data;
        data = JSON.parse(localStorage.getItem("projects"));
        if (data === null) {
            data = {};
            localStorage.setItem("projects", JSON.stringify(data));
        }
        return data;
    }

    static set projects(data) {
        localStorage.setItem("projects", JSON.stringify(data));
    }

    static get current_task() {
        let data;
        data = JSON.parse(localStorage.getItem("cur_task"));
        if (data === null) {
            localStorage.setItem("cur_task", JSON.stringify(data));
        }
        return data;
    }

    static set current_task(data) {
        localStorage.setItem("cur_task", JSON.stringify(data));
    }

    static get tasks() {
        let data;
        data = JSON.parse(localStorage.getItem("tasks"));
        if (data === null) {
            data = {};
            localStorage.setItem("tasks", JSON.stringify(data));
        }
        return data;
    }

    static set tasks(data) {
        localStorage.setItem("tasks", JSON.stringify(data));
    }
    
    static get auto_break() {
        let data;
        data = JSON.parse(localStorage.getItem("auto_break"));
        if (data === null) {
            data = false;
            localStorage.setItem("auto_break", JSON.stringify(data));
        }
        return data;
    }

    static set auto_break(data) {
        if (typeof data !== "boolean") {
            throw InvalidData;
        }
        localStorage.setItem("auto_break", JSON.stringify(data));
    }

    static get auto_focus() {
        let data;
        data = JSON.parse(localStorage.getItem("auto_focus"));
        if (data === null) {
            data = false;
            localStorage.setItem("auto_focus", JSON.stringify(data));
        }
        return data;
    }

    static set auto_focus(data) {
        if (typeof data !== "boolean") {
            throw InvalidData;
        }
        localStorage.setItem("auto_focus", JSON.stringify(data));
    }

    static get end_notification() {
        let data;
        data = JSON.parse(localStorage.getItem("end_notification"));
        if (data === null) {
            data = false;
            localStorage.setItem("end_notification", JSON.stringify(data));
        }
        return data;
    }

    static set end_notification(data) {
        if (typeof data !== "boolean") {
            throw InvalidData;
        }
        localStorage.setItem("end_notification", JSON.stringify(data));
    }

}

class AudioVisualConfig {
    static get theme() {
        let data;
        data = JSON.parse(localStorage.getItem("white_noise_config"));
        if (data === null) {
            data = ALL_THEMES[0];
            localStorage.setItem("white_noise_config", JSON.stringify(data));
        }
        return data;
    }

    static set theme(data) {
        localStorage.setItem("white_noise_config", JSON.stringify(data));
    }

    static get sound_on() {
        let data;
        data = JSON.parse(localStorage.getItem("sound"));
        if (data === null) {
            data = 1;
            localStorage.setItem("sound", JSON.stringify(data));
        }
        return data;
    }

    static set sound_on(data) {
        localStorage.setItem("sound", JSON.stringify(data));
    }

    static get blur_effects() {
        let data;
        data = JSON.parse(localStorage.getItem("blur_effects"));
        if (data === null) {
            data = navigator.hardwareConcurrency >= 6 ? true:
            localStorage.setItem("blur_effects", JSON.stringify(data));
        }
        return data;
    }

    static set blur_effects(data) {
        if (typeof data !== "boolean") {
            throw InvalidData;
        } else {
            localStorage.setItem("blur_effects", JSON.stringify(data));
        }
    }
}