//  MODULE TO SET BOT SCHEDULE (INCLUDING BREAKS & HOLIDAY OVERIDES)

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

/**
 * Helper to convert a standard Date object into California-specific date details
 */
function getCaliforniaDetails(dateObj) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        weekday: 'narrow', // We won't use this directly to get the day number safely
        hour12: false
    });

    const parts = formatter.formatToParts(dateObj);
    const details = {};
    parts.forEach(p => {
        if (p.type !== 'literal') details[p.type] = p.value;
    });

    // A timezone-safe ISO string for California's date.
    const caDateString = `${details.year}-${details.month}-${details.day}`;
    const dayIndex = new Date(caDateString + 'T00:00:00').getDay();

    return {
        year: parseInt(details.year),
        monthStr: details.month,
        dayStr: details.day,
        hour: parseInt(details.hour),
        dayIndex: dayIndex, // 0 = Sunday, 1 = Monday, etc.
        caDateString: caDateString,
        monthDay: `${details.month}-${details.day}`
    };
}

// Helper to determine if California lands on a scheduled holiday or seasonal break.
function isOnBreak(caDetails) {
    if (HOLIDAYS.includes(caDetails.monthDay)) return true;

    // Use California date string directly for comparison to avoid UTC timezone offsets shifting the date
    return SEASONAL_BREAKS.some(brk => {
        return caDetails.caDateString >= brk.start && caDetails.caDateString <= brk.end;
    });
}

module.exports = () => {
    const now = new Date();
    const caNow = getCaliforniaDetails(now);

    // Calculate tomorrow based on California's current date context
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const caTomorrow = getCaliforniaDetails(tomorrow);

    const isWeekday = (d) => d >= 1 && d <= 5;
    const isSchoolHours = caNow.hour >= 9 && caNow.hour < 15;
    const isWorkHours = caNow.hour >= 17 && caNow.hour < 20;

    const todayIsBreak = isOnBreak(caNow);
    const tomorrowIsBreak = isOnBreak(caTomorrow);

    let currentContext;
    // School closes on breaks, but coffee shop hours remain active
    if (isWeekday(caNow.dayIndex) && isSchoolHours && !todayIsBreak) {
        currentContext = "You are currently in school.";
    } else if (isWeekday(caNow.dayIndex) && isWorkHours) {
        currentContext = "You are currently at work at the coffee shop.";
    } else {
        currentContext = "You are free right now.";
    }

    let tomorrowContext;
    if (tomorrowIsBreak) {
        // Keeps coffee shop context active for tomorrow if it's a weekday break
        if (isWeekday(caTomorrow.dayIndex)) {
            tomorrowContext = "Tomorrow you're on school break, but you still have work at the coffee shop in the afternoon.";
        } else {
            tomorrowContext = "Tomorrow is your day off, no school or work.";
        }
    } else if (isWeekday(caTomorrow.dayIndex)) {
        tomorrowContext = "Tomorrow you have school in the morning and work in the afternoon.";
    } else {
        tomorrowContext = "Tomorrow is your day off, no school or work.";
    }

    return `${currentContext} ${tomorrowContext}`;
};