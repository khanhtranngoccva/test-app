// Intensive/no-distraction mode needs notifications
async function ask_for_permission() {
    try {
        await Notification.requestPermission();
    } catch (e) {
        alert("This browser does not support notifications, or notifications have been automatically blocked. Some features will not work properly.");
    }
}