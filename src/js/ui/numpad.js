// Referencia al contenedor del juego
const container = document.getElementById('game-container');
const messageEl = document.getElementById('message');

/**
 * Initializes or updates the numeric keypad UI component.
 * 
 * @param {Function} countFn - Callback function that takes a number (1-9)
 *                             and returns its occurrence count on the board.
 *                             Used to visually disable completed numbers.
 */
let numpadBtns = [];
let numpadElement = null;

export function renderNumpad(countFn) {
    if (!numpadElement) {
        numpadElement = document.getElementById('numpad');
    }

    if (!numpadElement) {
        numpadElement = document.createElement('div');
        numpadElement.id = 'numpad';
        container.insertBefore(numpadElement, messageEl);
        
        for (let n = 1; n <= 9; n++) {
            const btn = document.createElement('button');
            btn.className = 'numpad-btn';
            btn.dataset.number = n;
            btn.textContent = n;
            numpadBtns[n] = btn;
            numpadElement.appendChild(btn);
        }
    }

    for (let n = 1; n <= 9; n++) {
        const btn = numpadBtns[n];
        if (countFn(n) >= 9) {
            btn.classList.add('numpad-btn--completed');
        } else {
            btn.classList.remove('numpad-btn--completed');
        }
    }
}

/**
 * Attaches a click event listener to the numpad using event delegation.
 * 
 * @param {Function} onNumberClick - Callback function invoked with the selected number (1-9).
 */
export function onNumpadClick(onNumberClick) {
    container.addEventListener('click', (event) => {
        const btn = event.target.closest('.numpad-btn');
        if (!btn) return;
        onNumberClick(parseInt(btn.dataset.number));
    });
}
