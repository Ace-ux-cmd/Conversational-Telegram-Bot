// Module to set bot schedule with breaks and holiday overrides

// Hardcoded holiday configurations (Format: 'MM-DD')
const HOLIDAYS = [
    '01-01', // New Year's Day
    '07-04', // Independence Day
    '12-25', // Christmas Day
];

// Seasonal break configurations (Format: 'YYYY-MM-DD')
const SEASONAL_BREAKS = [
    { start: '2026-06-01', end: '2026-08-31' }, // Example: Summer Break 2026
    { start: '2026-12-20', end: '2027-01-05' }  // Example: Winter Break
];

// Helper to determine if a specific date object lands on a scheduled holiday or seasonal break.

function isOnBreak(dateObj) {
    const monthDay = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    if (HOLIDAYS.includes(monthDay)) return true;

    const timeStamp = dateObj.getTime();
    return SEASONAL_BREAKS.some(brk => {
        return timeStamp >= new Date(brk.start).getTime() && timeStamp <= new Date(brk.end).getTime();
    });
}

module.exports = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay();

    const isWeekday = (d) => d >= 1 && d <= 5;
    const isSchoolHours = hour >= 9 && hour < 15;
    const isWorkHours = hour >= 17 && hour < 20;

    const todayIsBreak = isOnBreak(now);
    const tomorrowIsBreak = isOnBreak(tomorrow);

    let currentContext;
    // School closes on breaks, but coffee shop hours remain active
    if (isWeekday(day) && isSchoolHours && !todayIsBreak) {
        currentContext = "You are currently in school.";
    } else if (isWeekday(day) && isWorkHours) {
        currentContext = "You are currently at work at the coffee shop."; // String exact match preserved
    } else {
        currentContext = "You are free right now.";
    }

    let tomorrowContext;
    if (tomorrowIsBreak) {
        // Keeps coffee shop context active for tomorrow if it's a weekday break
        if (isWeekday(tomorrowDay)) {
            tomorrowContext = "Tomorrow you're on school break, but you still have work at the coffee shop in the afternoon.";
        } else {
            tomorrowContext = "Tomorrow is your day off, no school or work.";
        }
    } else if (isWeekday(tomorrowDay)) {
        tomorrowContext = "Tomorrow you have school in the morning and work in the afternoon.";
    } else {
        tomorrowContext = "Tomorrow is your day off, no school or work.";
    }

    return `${currentContext} ${tomorrowContext}`;
};