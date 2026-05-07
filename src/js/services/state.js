import { BOARD_SIZE, EMPTY } from '../types/constants.js';
import { debounce } from '../utils/debounce.js';

let cellUpdateListener = null;

export function subscribeToCellUpdates(listener) {
    cellUpdateListener = listener;
}

const saveState = debounce(() => {
    if (!internalState.gameActive) return;
    try {
        const stateToSave = {
            board: internalState.board.map(row => [...row]),
            given: internalState.given,
            solution: internalState.solution,
            mistakes: internalState.mistakes,
            notes: internalState.notes.map(row => row.map(set => Array.from(set)))
        };
        localStorage.setItem('sudoku_save', JSON.stringify(stateToSave));
    } catch (e) {
        console.error('Error saving state:', e);
    }
}, 500);

const rowHandler = (rowIndex) => ({
    set(target, colIndex, value) {
        target[colIndex] = value;
        const col = Number(colIndex);
        if (internalState.gameActive && cellUpdateListener && !isNaN(col)) {
            cellUpdateListener(rowIndex, col, value, internalState.given[rowIndex][col], internalState.notes[rowIndex][col]);
        }
        saveState();
        return true;
    }
});

const internalState = {
    board: [],
    solution: [],
    given: [],
    notes: [],
    history: [],
    mistakes: 0,
    selectedCell: null,
    notesMode: false,
    gameActive: false
};

export const gameState = new Proxy(internalState, {
    set(target, prop, value) {
        if (prop === 'board') {
            target[prop] = value.map((rowArr, rowIndex) => new Proxy([...rowArr], rowHandler(rowIndex)));
        } else {
            target[prop] = value;
        }
        return true;
    }
});

export function getSavedState() {
    try {
        const saved = localStorage.getItem('sudoku_save');
        if (saved) {
            const parsed = JSON.parse(saved);
            parsed.notes = parsed.notes.map(row => row.map(arr => new Set(arr)));
            return parsed;
        }
    } catch (e) {
        console.error('Error reading saved state', e);
    }
    return null;
}

export function restoreState(savedState) {
    gameState.solution = savedState.solution;
    gameState.given = savedState.given;
    gameState.notes = savedState.notes;
    gameState.history = [];
    gameState.mistakes = savedState.mistakes;
    gameState.selectedCell = null;
    gameState.notesMode = false;
    gameState.gameActive = true;
    gameState.board = savedState.board;
}

export function resetState(puzzle, solution, given) {
    gameState.solution = solution.map(row => [...row]);
    gameState.given = given.map(row => [...row]);
    gameState.notes = Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => new Set())
    );
    gameState.history = [];
    gameState.mistakes = 0;
    gameState.selectedCell = null;
    gameState.notesMode = false;
    gameState.gameActive = true;
    gameState.board = puzzle.map(row => [...row]);
}

export function placeNumber(row, col, num) {
    if (gameState.given[row][col]) return false;
    
    gameState.history.push({ 
        row, col, 
        prevValue: gameState.board[row][col], 
        prevNotes: new Set(gameState.notes[row][col]) 
    });
    
    gameState.notes[row][col] = new Set();
    gameState.board[row][col] = num;
    return true;
}

export function eraseNumber(row, col) {
    if (gameState.given[row][col]) return false;
    
    gameState.history.push({ 
        row, col, 
        prevValue: gameState.board[row][col], 
        prevNotes: new Set(gameState.notes[row][col]) 
    });
    
    gameState.notes[row][col] = new Set();
    gameState.board[row][col] = EMPTY;
    return true;
}

export function toggleNote(row, col, num) {
    if (gameState.board[row][col] !== EMPTY) return false;
    
    gameState.history.push({ 
        row, col, 
        prevValue: gameState.board[row][col], 
        prevNotes: new Set(gameState.notes[row][col]) 
    });
    
    if (gameState.notes[row][col].has(num)) {
        gameState.notes[row][col].delete(num);
    } else {
        gameState.notes[row][col].add(num);
    }
    
    if (cellUpdateListener) {
        cellUpdateListener(row, col, gameState.board[row][col], false, gameState.notes[row][col]);
    }
    
    saveState();
    return true;
}

export function undo() {
    if (gameState.history.length === 0) return null;
    
    const action = gameState.history.pop();
    gameState.notes[action.row][action.col] = action.prevNotes;
    gameState.board[action.row][action.col] = action.prevValue;
    
    if (action.prevValue === EMPTY && cellUpdateListener) {
        cellUpdateListener(action.row, action.col, EMPTY, false, action.prevNotes);
    }
    
    return action;
}

export function isBoardComplete() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (gameState.board[r][c] !== gameState.solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}

export function countNumber(num) {
    let count = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (gameState.board[r][c] === num) count++;
        }
    }
    return count;
}
