let timerSeconds = 0;
let timerInterval = null;

export function startTimer(callback, initialSeconds = 0) {
    stopTimer();
    timerSeconds = initialSeconds;
    if (callback) callback(getCurrentTime());
    
    timerInterval = setInterval(() => {
        timerSeconds++;
        localStorage.setItem('sudoku_timer', timerSeconds.toString());
        if (callback) callback(getCurrentTime());
    }, 1000);
}

export function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

export function getCurrentTime() {
    const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const s = String(timerSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}

export function clearTimerSave() {
    localStorage.removeItem('sudoku_timer');
}
