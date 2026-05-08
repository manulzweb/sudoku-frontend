let timerSeconds = 0;
let timerInterval = null;

<<<<<<< HEAD
export function startTimer(callback, initialSeconds = 0) {
    stopTimer();
    timerSeconds = initialSeconds;
    if (callback) callback(getCurrentTime());
    
    timerInterval = setInterval(() => {
        timerSeconds++;
        localStorage.setItem('sudoku_timer', timerSeconds.toString());
=======
export function startTimer(callback) {
    stopTimer();
    timerSeconds = 0;
    if (callback) callback('00:00');
    
    timerInterval = setInterval(() => {
        timerSeconds++;
>>>>>>> b8a0cdea78e2ace1aa3a891a228241e09230ac1d
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
<<<<<<< HEAD

export function clearTimerSave() {
    localStorage.removeItem('sudoku_timer');
}
=======
>>>>>>> b8a0cdea78e2ace1aa3a891a228241e09230ac1d
