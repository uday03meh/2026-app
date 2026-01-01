/**
 * Promo Animation Script
 * ----------------------
 * INSTRUCTIONS:
 * 1. Open the "2026 Remaining" app in your browser (index.html).
 * 2. Open Developer Tools (Press F12 or Ctrl+Shift+I).
 * 3. Go to the "Console" tab.
 * 4. Copy and paste the ENTIRE code block below into the console and press Enter.
 * 5. The animation will start immediately.
 *
 * NOTE: For best results, set your screen recording software to capture the window before running.
 */
(function runPromoAnimation() {
    console.log("%c🎬 Starting Promo Animation...", "color: #00ff41; font-weight: bold; font-size: 1.2em;");

    // 1. Constants (Matching app.js dates)
    const START_EPOCH = Date.parse("2026-01-01T00:00:00+05:30");
    const END_EPOCH = Date.parse("2027-01-01T00:00:00+05:30");
    const TOTAL_YEAR_MS = END_EPOCH - START_EPOCH;

    // 2. Configuration
    const DURATION_SECONDS = 6; // Total duration of animation
    const DURATION_MS = DURATION_SECONDS * 1000;

    // 3. Animation State
    const startTimeRef = performance.now();

    // 4. Override System Time (Hook into app.js)
    // We override the global getNow function to feed simulated time
    if (typeof window.getNow !== 'function') {
        console.error("❌ Error: Could not find 'getNow' function. Make sure app.js is loaded.");
        return;
    }

    // Backup original function (optional, though we don't restore it automatically to keep end state)
    // const originalGetNow = window.getNow;

    function frame(currentTime) {
        const elapsed = currentTime - startTimeRef;
        const progress = Math.min(1, elapsed / DURATION_MS); // 0.0 to 1.0

        // Calculate the simulated date
        // Interpolate between Start of 2026 and End of 2026
        const currentSimulatedTime = START_EPOCH + (progress * TOTAL_YEAR_MS);

        // Override getNow to return our simulated time
        // This affects calculateProgress() which update() uses
        window.getNow = function () {
            return new Date(currentSimulatedTime);
        };

        // Trigger the app's main update function to render this frame
        // We force synchronous update to ensure no race conditions
        if (typeof window.update === 'function') {
            window.update();
        }

        // Loop until finished
        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            console.log("%c✅ Animation Complete!", "color: #00ff41; font-weight: bold;");
            // Ensure final frame is perfect
            window.getNow = () => new Date(END_EPOCH);
            if (typeof window.update === 'function') window.update();
        }
    }

    // Start the loop
    requestAnimationFrame(frame);
})();
