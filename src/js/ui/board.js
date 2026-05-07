import { BOARD_SIZE, BOX_SIZE, EMPTY } from '../types/constants.js';

const gridEl = document.getElementById('sudoku-grid');
let cellsCache = [];

/**
 * Completely rebuilds and renders the Sudoku board from scratch.
 * 
 * @param {number[][]} board - The current state of the 9x9 board.
 * @param {boolean[][]} given - Matrix indicating which cells are pre-filled clues.
 * @param {Array<Set>[]} notes - A 9x9 matrix containing sets of player notes.
 */
export function renderBoard(board, given, notes) {
    gridEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    cellsCache = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
        cellsCache[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Apply thick borders to distinguish 3x3 subgrids
            if (col % BOX_SIZE === BOX_SIZE - 1 && col < BOARD_SIZE - 1) {
                cell.classList.add('cell--border-right');
            }
            if (row % BOX_SIZE === BOX_SIZE - 1 && row < BOARD_SIZE - 1) {
                cell.classList.add('cell--border-bottom');
            }

            // Apply staggered entrance animation
            cell.classList.add('cell--animate-in');
            cell.style.animationDelay = `${(row * BOARD_SIZE + col) * 6}ms`;

            fillCellContent(cell, board[row][col], given[row][col], notes[row][col]);

            cellsCache[row][col] = cell;
            fragment.appendChild(cell);
        }
    }
    
    gridEl.appendChild(fragment);
}

/**
 * Updates a single cell's content without re-rendering the entire board.
 * 
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @param {number} value - The current value of the cell (0 if empty).
 * @param {boolean} isGiven - Indicates if the cell is a pre-filled clue.
 * @param {Set} cellNotes - Set of notes currently placed in this cell.
 */
export function refreshCell(row, col, value, isGiven, cellNotes) {
    const cell = cellsCache[row] && cellsCache[row][col];
    if (cell) fillCellContent(cell, value, isGiven, cellNotes);
}

/**
 * Populates the visual content and styling of a specific cell element.
 * 
 * @param {HTMLElement} cell - The DOM element representing the cell.
 * @param {number} value - The numerical value to display.
 * @param {boolean} isGiven - Whether it is a clue.
 * @param {Set} cellNotes - Notes associated with the cell.
 */
function fillCellContent(cell, value, isGiven, cellNotes) {
    cell.classList.remove('cell--given', 'cell--error', 'cell--success');

    if (value !== EMPTY) {
        cell.textContent = value;
        if (isGiven) cell.classList.add('cell--given');
    } else if (cellNotes && cellNotes.size > 0) {
        cell.textContent = '';
        const notesGrid = document.createElement('div');
        notesGrid.className = 'cell__notes';
        for (let n = 1; n <= 9; n++) {
            const noteEl = document.createElement('span');
            noteEl.className = 'cell__note';
            noteEl.textContent = cellNotes.has(n) ? n : '';
            notesGrid.appendChild(noteEl);
        }
        cell.appendChild(notesGrid);
    } else {
        cell.textContent = '';
    }
}

/**
 * Highlights the selected row, column, 3x3 box, and matching numbers.
 * 
 * @param {number} row - The currently selected row.
 * @param {number} col - The currently selected column.
 * @param {number[][]} board - The current board state used for value matching.
 */
export function highlightCells(row, col, board) {
    const selectedValue = board[row][col];
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = cellsCache[r][c];
            cell.classList.remove('cell--selected', 'cell--highlighted', 'cell--same-number');

            if (r === row && c === col) {
                cell.classList.add('cell--selected');
            } else if (
                r === row || c === col ||
                (r >= boxRow && r < boxRow + BOX_SIZE &&
                 c >= boxCol && c < boxCol + BOX_SIZE)
            ) {
                cell.classList.add('cell--highlighted');
            }

            if (selectedValue !== EMPTY &&
                board[r][c] === selectedValue &&
                !(r === row && c === col)) {
                cell.classList.add('cell--same-number');
            }
        }
    }
}

/**
 * Removes all highlighting from the board.
 */
export function clearHighlights() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            cellsCache[r][c].classList.remove('cell--selected', 'cell--highlighted', 'cell--same-number');
        }
    }
}

/**
 * Temporarily applies a CSS animation class to a specific cell.
 * 
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @param {string} className - The CSS animation class to apply.
 * @param {number} duration - The duration of the animation in milliseconds.
 */
export function animateCell(row, col, className, duration) {
    const cell = cellsCache[row] && cellsCache[row][col];
    if (!cell) return;
    cell.classList.add(className);
    setTimeout(() => cell.classList.remove(className), duration);
}

/**
 * Marks a specific cell to visually indicate an error.
 * 
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 */
export function markCellError(row, col) {
    const cell = cellsCache[row] && cellsCache[row][col];
    if (cell) cell.classList.add('cell--error');
}

/**
 * Removes the error styling from a specific cell.
 * 
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 */
export function clearCellError(row, col) {
    const cell = cellsCache[row] && cellsCache[row][col];
    if (cell) cell.classList.remove('cell--error');
}

/**
 * Registers a click event listener on the grid utilizing event delegation.
 * 
 * @param {Function} onCellClick - Callback function invoked with the clicked (row, col).
 */
export function onBoardClick(onCellClick) {
    gridEl.addEventListener('click', (event) => {
        const cell = event.target.closest('.cell');
        if (!cell) return;
        onCellClick(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
    });
}
