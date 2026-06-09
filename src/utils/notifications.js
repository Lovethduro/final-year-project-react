export function refreshNotifications() {
    window.dispatchEvent(new Event('cyforce:notifications-refresh'));
}
