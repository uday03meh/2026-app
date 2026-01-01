// tests.js
// Quick verification of logic in app.js
// We need to extract logic from app.js to test it, or copy-paste the logic here.
// Since app.js is DOM-bound, I'll replicate the core calculation function for verification.

const START_DATE_ISO = "2026-01-01T00:00:00+05:30";
const END_DATE_ISO = "2027-01-01T00:00:00+05:30";

const START_EPOCH = Date.parse(START_DATE_ISO);
const END_EPOCH = Date.parse(END_DATE_ISO);
const TOTAL_MS = END_EPOCH - START_EPOCH;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_HOUR = 1000 * 60 * 60;

function calculateProgress(mockTimeISO) {
    const nowMs = Date.parse(mockTimeISO);

    const elapsedMs = Math.max(0, Math.min(nowMs - START_EPOCH, TOTAL_MS));
    const remainingMs = Math.max(0, END_EPOCH - nowMs);

    // Logic from app.js
    const elapsedDays = Math.floor(elapsedMs / MS_PER_DAY);
    let displayDaysLeft = Math.ceil(remainingMs / MS_PER_DAY);
    if (nowMs < START_EPOCH) displayDaysLeft = 365;
    if (nowMs >= END_EPOCH) displayDaysLeft = 0;

    let displayHoursLeft = Math.floor(remainingMs / MS_PER_HOUR);
    if (displayHoursLeft > 8760) displayHoursLeft = 8760;
    if (nowMs >= END_EPOCH) displayHoursLeft = 0;

    return { elapsedDays, displayDaysLeft, displayHoursLeft };
}

console.log("--- TEST REPORT ---");

const cases = [
    { date: "2025-12-31T23:59:59+05:30", desc: "Just before start", expDays: 365, expFilled: 0 },
    { date: "2026-01-01T00:00:01+05:30", desc: "Start + 1s", expDays: 365, expFilled: 0 }, // Day 1 is starting, but not elapsed
    { date: "2026-01-02T00:00:01+05:30", desc: "Day 2 Start", expDays: 364, expFilled: 1 }, // 1 day elapsed
    { date: "2026-06-05T12:00:00+05:30", desc: "Mid June", expDays: 209, expFilled: 155 }, // Approx
    { date: "2026-12-31T23:59:59+05:30", desc: "Year End - 1s", expDays: 1, expFilled: 364 }, // last day
    { date: "2027-01-01T00:00:00+05:30", desc: "End exact", expDays: 0, expFilled: 365 }
];

cases.forEach(c => {
    const res = calculateProgress(c.date);
    // Note: displayDaysLeft might vary by 1 depending on logic "ceil" vs "floor".
    // 2026-06-05 -> Day 156 of year. 
    // Elapsed = 155 days + 12 hours.
    // filled = 155.
    // Remaining = 209 days + 12 hours. ceil -> 210?

    console.log(`[${c.desc}] :: ${c.date}`);
    console.log(`  -> ElapsedDays (Filled): ${res.elapsedDays} (Exp: ${c.expFilled})`);
    console.log(`  -> DaysLeft: ${res.displayDaysLeft} (Exp: ${c.expDays})`);
    console.log("");
});
