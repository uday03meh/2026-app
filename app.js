/**
 * 2026 Remaining (IST) - Main Application
 * All 365 pixels are contained within the "2026" text (no underline).
 * Progress fills left-to-right.
 */

// Constants
const START_EPOCH = Date.parse("2026-01-01T00:00:00+05:30");
const END_EPOCH = Date.parse("2027-01-01T00:00:00+05:30");
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TOTAL_DAYS = 365;

// Debug Mode (set to true for testing with a specific date)
const IS_DEBUG = false;
const DEBUG_NOW_ISO = "2026-03-09T12:00:00+05:30";

// DOM Elements
const elDaysLeft = document.getElementById('days-left');
const elHoursLeft = document.getElementById('hours-left');
const elPercentLeft = document.getElementById('percent-left');
const elYearContainer = document.getElementById('year-container');
const elLoaderDays = document.getElementById('loader-days');
const elLoaderHours = document.getElementById('loader-hours');
const elLoaderPercent = document.getElementById('loader-percent');

// State
let particles = [];
let dotsDays = [];
let dotsHours = [];
let dotsPercent = [];

// ============ BITMASKS (365 total: 91+92+91+91) ============
// Each digit is 10 wide x 14 tall
// CLEANED: No stray bottom pixels, no inner '0' dots

// TWO: 91 pixels (Clean - no bottom stray)
const TWO_CLEAN = [
    "0111111110", // 8
    "1111111111", // 10
    "1111111111", // 10
    "0000001111", // 4
    "0000011111", // 5
    "0001111110", // 6
    "0111111100", // 7
    "1111100000", // 5
    "1111000000", // 4
    "1111000000", // 4
    "1111111111", // 10
    "1111111111", // 10
    "1111111111", // 10
    "0000000000"  // 0 (No stray pixel)
]; // Sum: 8+10+10+4+5+6+7+5+4+4+10+10+10 = 93. Need -2.

const TWO_91 = [
    "0111111110", // 8
    "1111111111", // 10
    "1111111111", // 10
    "0000001111", // 4
    "0000011111", // 5
    "0001111110", // 6
    "0111111000", // 6 (-1)
    "1111100000", // 5
    "1111000000", // 4
    "1111000000", // 4
    "1111111111", // 10
    "1111111111", // 10
    "0111111111", // 9 (-1)
    "0000000000"  // 0
]; // Sum: 8+10+10+4+5+6+6+5+4+4+10+10+9 = 91

// ZERO: 92 pixels (Clean - no inner dots)
const ZERO_92 = [
    "0011111100", // 6
    "0111111110", // 8
    "1111111111", // 10 (thicker top)
    "1110000111", // 6
    "1110000111", // 6
    "1110000111", // 6
    "1110000111", // 6
    "1110000111", // 6
    "1110000111", // 6
    "1110000111", // 6
    "1111111111", // 10 (thicker bottom)
    "0111111110", // 8
    "0011111100", // 6
    "0000110000"  // 2
]; // Sum: 6+8+10+6+6+6+6+6+6+6+10+8+6+2 = 92

// SIX: 91 pixels
const SIX_91 = [
    "0011111100", // 6
    "0111111110", // 8
    "1111100000", // 5
    "1111000000", // 4
    "1111000000", // 4
    "1111111110", // 9
    "1111111111", // 10
    "1111000111", // 7
    "1111000111", // 7
    "1111000111", // 7
    "1110000111", // 6
    "0111111110", // 8
    "0011111100", // 6
    "0001111000"  // 4
]; // Sum: 6+8+5+4+4+9+10+7+7+7+6+8+6+4 = 91

// DIGITS: 91 + 92 + 91 + 91 = 365
const DIGITS = [TWO_91, ZERO_92, TWO_91, SIX_91];

function init() {
    generateBitmaskGrid();
    dotsDays = createPixelRing(elLoaderDays, 40);
    dotsHours = createPixelRing(elLoaderHours, 40);
    dotsPercent = createPixelRing(elLoaderPercent, 40);
    update();
    setInterval(update, 1000);
}

function createPixelRing(container, count) {
    const dots = [];
    if (!container) return dots;

    const size = container.clientWidth || 140;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 10;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'loader-particle';
        const angle = (i / count) * 2 * Math.PI - (Math.PI / 2);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.transform = 'translate(-50%, -50%)';
        container.appendChild(p);
        dots.push(p);
    }
    return dots;
}

function getNow() {
    return IS_DEBUG ? new Date(DEBUG_NOW_ISO) : new Date();
}

function generateBitmaskGrid() {
    elYearContainer.innerHTML = '';
    particles = [];

    const charWidth = 10;
    const charHeight = 14;
    const gap = 2;
    const totalW = 46;
    const totalH = 14;

    const candidates = [];

    // Generate Text Particles
    DIGITS.forEach((map, digitIdx) => {
        const xOffset = digitIdx * (charWidth + gap);
        map.forEach((rowStr, y) => {
            for (let x = 0; x < rowStr.length; x++) {
                if (rowStr[x] === '1') {
                    candidates.push({ x: xOffset + x, y: y });
                }
            }
        });
    });

    // Safety check: ensure exactly 365 particles
    if (candidates.length > 365) {
        candidates.length = 365;
    }

    // Sort LEFT-TO-RIGHT then TOP-TO-BOTTOM
    candidates.sort((a, b) => {
        if (a.x === b.x) return a.y - b.y;
        return a.x - b.x;
    });

    // Render
    candidates.forEach((pt, idx) => {
        const p = document.createElement('div');
        p.className = 'day-particle';

        const left = (pt.x / totalW) * 100;
        const top = (pt.y / totalH) * 100;

        p.style.left = `${left}%`;
        p.style.top = `${top}%`;
        p.style.width = `${(100 / totalW) * 0.85}%`;
        p.style.height = `${(100 / totalH) * 0.85}%`;
        p.style.borderRadius = '1px';
        p.style.setProperty('--col', pt.x);

        const date = new Date(START_EPOCH + (idx * MS_PER_DAY));
        const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        p.title = dateStr;
        p.textContent = idx + 1;

        elYearContainer.appendChild(p);
        particles.push({ element: p, dayIndex: idx });
    });

    elYearContainer.style.aspectRatio = `${totalW}/${totalH}`;
}

function calculateProgress() {
    const now = getNow();
    const totalMs = END_EPOCH - START_EPOCH;
    const elapsedMs = now - START_EPOCH;

    const percentGone = (elapsedMs / totalMs) * 100;
    const percentLeft = Math.max(0, Math.min(100, 100 - percentGone));

    const daysLeft = TOTAL_DAYS - Math.floor(elapsedMs / MS_PER_DAY);
    const displayDaysLeft = Math.max(0, Math.min(TOTAL_DAYS, daysLeft));

    // Hours left in the current day (0-24)
    const msIntoToday = elapsedMs % MS_PER_DAY;
    const hoursLeftToday = 24 - (msIntoToday / (1000 * 60 * 60));
    const displayHoursLeft = Math.max(0, Math.floor(hoursLeftToday));

    const elapsedDays = Math.max(0, Math.floor(elapsedMs / MS_PER_DAY));

    return { percentLeft, displayDaysLeft, displayHoursLeft, elapsedDays };
}

function update() {
    const data = calculateProgress();

    if (elDaysLeft) {
        elDaysLeft.textContent = data.displayDaysLeft;
    }

    if (elHoursLeft) {
        elHoursLeft.textContent = data.displayHoursLeft.toLocaleString();
    }

    if (elPercentLeft) {
        const truncated = Math.floor(data.percentLeft * 10) / 10;
        elPercentLeft.textContent = Number.isInteger(truncated) ? truncated + ".0%" : truncated + "%";
    }

    // Update Loader Rings
    if (dotsPercent && dotsPercent.length > 0) {
        const ratio = data.percentLeft / 100;
        const countToFill = Math.floor(ratio * dotsPercent.length);
        dotsPercent.forEach((d, i) => {
            d.classList.remove('filled', 'edge');
            if (i < countToFill) {
                d.classList.add('filled');
                if (i === countToFill - 1) d.classList.add('edge');
            }
        });
    }

    if (dotsDays && dotsDays.length > 0) {
        const dRatio = Math.min(1, Math.max(0, data.displayDaysLeft / TOTAL_DAYS));
        const countToFill = Math.floor(dRatio * dotsDays.length);
        dotsDays.forEach((d, i) => {
            d.classList.remove('filled', 'edge');
            if (i < countToFill) {
                d.classList.add('filled');
                if (i === countToFill - 1) d.classList.add('edge');
            }
        });
    }

    if (dotsHours && dotsHours.length > 0) {
        const hRatio = Math.min(1, Math.max(0, data.displayHoursLeft / 24));
        const countToFill = Math.floor(hRatio * dotsHours.length);
        dotsHours.forEach((d, i) => {
            d.classList.remove('filled', 'edge');
            if (i < countToFill) {
                d.classList.add('filled');
                if (i === countToFill - 1) d.classList.add('edge');
            }
        });
    }

    // Update Grid Particles
    // Current day = elapsedDays (0-indexed)
    // For March 9, elapsedDays = 67 (Jan has 31, Feb has 28, + 8 days = 67)
    particles.forEach((pt) => {
        const el = pt.element;
        el.classList.remove('filled', 'current', 'current-day-fire');

        if (pt.dayIndex < data.elapsedDays) {
            // Past days: filled with day number
            el.classList.add('filled');
            el.textContent = pt.dayIndex + 1;
        } else if (pt.dayIndex === data.elapsedDays) {
            // Current day: fire emoji
            el.classList.add('current-day-fire');
            el.textContent = '🔥';
        } else {
            // Future days: just day number
            el.textContent = pt.dayIndex + 1;
        }
    });
}

// Start
init();
