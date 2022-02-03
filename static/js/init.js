// Initializes task and project databases in memory.
const tasks_in_memory = PomodoroConfig.tasks;
const projects_in_memory = PomodoroConfig.projects;

// Initializes the updated flags.
let database_updated;

// Initializes global variables
let clock_mode = "stopped";
let initial_timer;
let pomodoro_mode = "focus";
let add_task_pomodoro_count = 1;

// Events. Allows modularization.

// Event is triggered when the Focus finishes (only focus)
const focus_finished = new Event("focus_finished");

// Event is triggered when time on the clock runs out
const clock_finished = new Event("clock_finished");

// Event is triggered when the clock stops without finishing
const clock_canceled = new Event("clock_canceled");

// Event is triggered when the clock is stopped in general
const clock_stopped = new Event("clock_stopped");

// Event is triggered when notifications are disabled.
const notification_disabled = new Event("notifications_disabled");

// Event is triggered when white noise is toggled.
const white_noise_toggled = new Event("white_noise_toggled");

// Event is triggered when the clock is requested to stop by other scripts.
const force_stop_clock = new Event("force_stop_clock");

// Event is triggered when the clock is requested to try to start.
const try_start_clock = new Event("try_start_clock");

// Event is triggered when the current task is updated.
const cur_task_updated = new Event("cur_task_updated");

// Event is triggered when scripts request to update the textarea.
const textarea_update = new Event("textarea_update");