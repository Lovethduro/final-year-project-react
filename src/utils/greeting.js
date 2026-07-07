/** Morning before noon, afternoon until 5pm, evening after. */
export function greetingPeriod(date = new Date()) {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

export function greetingTitle(name, date = new Date()) {
    const who = (name || 'there').trim() || 'there';
    return `Good ${greetingPeriod(date)}, ${who}`;
}

export function formatDashboardDateTime(date = new Date()) {
    const day = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
    const time = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
    return `${day} · ${time}`;
}
