import { MAX_MISTAKES } from './types/constants.js';
import { generatePuzzleFromBackend, validateBoard } from './services/api.js';
import { debounce } from './utils/debounce.js';

import {
    gameState,
    resetState,
    getSavedState,
    restoreState,
    placeNumber,
    eraseNumber,
    toggleNote,
    undo,
    isBoardComplete,
    countNumber,
    subscribeToCellUpdates
} from './services/state.js';

import {
    startTimer,
    stopTimer,
    getCurrentTime,
    clearTimerSave
} from './services/timer.js';

import { showModal } from './ui/modal.js';

import {
    renderBoard,
    refreshCell,
    highlightCells,
    clearHighlights,
    animateCell,
    markCellError,
    clearCellError,
    onBoardClick
} from './ui/board.js';

import {
    renderNumpad,
    onNumpadClick
} from './ui/numpad.js';

import {
    renderActionBar,
    onActionClick
} from './ui/actions.js';

import {
    showMessage,
    clearMessage
} from './ui/messages.js';

const timerEl = document.getElementById('timer');
const newGameBtn = document.getElementById('new-game-btn');
const difficultySelect = document.getElementById('difficulty');
const validateCheckbox = document.getElementById('validate-moves');

// Subscribe to state changes so the UI updates reactively
subscribeToCellUpdates((row, col, value, isGiven, cellNotes) => {
    // Schedule UI update to avoid layout thrashing
    requestAnimationFrame(() => {
        refreshCell(row, col, value, isGiven, cellNotes);
        if (gameState.selectedCell && gameState.selectedCell.row === row && gameState.selectedCell.col === col) {
            highlightCells(row, col, gameState.board);
        }
        renderNumpad(countNumber);
    });
});

async function startGame() {
    clearMessage();
    showMessage('Loading puzzle...', '');
    
    try {
        const difficulty = difficultySelect.value;
        const puzzleData = await generatePuzzleFromBackend(difficulty);
        
        resetState(puzzleData.puzzle, puzzleData.solution, puzzleData.given);
        clearTimerSave(); // Clear timer on fresh game
        
        renderBoard(gameState.board, gameState.given, gameState.notes);
        renderActionBar(gameState.notesMode);
        renderNumpad(countNumber);
        clearMessage();
        
        startTimer((timeStr) => {
            if (timerEl) timerEl.textContent = timeStr;
        });
    } catch (err) {
        showMessage('Error loading puzzle from backend', 'error');
    }
}

function handleCellClick(row, col) {
    if (!gameState.gameActive) return;
    gameState.selectedCell = { row, col };
    highlightCells(row, col, gameState.board);
}

// Debounced API validation
const debouncedValidation = debounce(async (board, row, col, num) => {
    // We send a copy to avoid mutating state
    const isValid = await validateBoard(board.map(r => [...r]));
    
    // In our case, since we have the solution locally, we can just check it instantly,
    // but the prompt explicitly asked to implement a debounce for the real-time API validation.
    // However, since validateBoard from backend returns a boolean for the whole board,
    // let's check against the local solution first to see if it's a mistake as well.
    if (!isValid || num !== gameState.solution[row][col]) {
        markCellError(row, col);
        gameState.mistakes++;
        showMessage(`Mistake ${gameState.mistakes}/${MAX_MISTAKES}`, 'error');
        
        if (gameState.mistakes >= MAX_MISTAKES) {
            endGame(false);
        }
    } else {
        clearCellError(row, col);
        animateCell(row, col, 'cell--number-placed', 300);
        if (isBoardComplete()) {
            endGame(true);
        }
    }
}, 300);

function handleNumberInput(num) {
    if (!gameState.gameActive || !gameState.selectedCell) return;
    const { row, col } = gameState.selectedCell;
    
    if (gameState.given[row][col]) return;
    
    if (gameState.notesMode) {
        toggleNote(row, col, num);
        return;
    }
    
    const wasPlaced = placeNumber(row, col, num);
    if (!wasPlaced) return;
    
    if (validateCheckbox.checked) {
        debouncedValidation(gameState.board, row, col, num);
    } else {
        clearCellError(row, col);
        animateCell(row, col, 'cell--number-placed', 300);
        if (isBoardComplete()) {
            endGame(true);
        }
    }
}

function handleErase() {
    if (!gameState.gameActive || !gameState.selectedCell) return;
    const { row, col } = gameState.selectedCell;
    
    if (eraseNumber(row, col)) {
        clearCellError(row, col);
    }
}

function handleUndo() {
    if (!gameState.gameActive) return;
    
    const action = undo();
    if (action) {
        clearCellError(action.row, action.col);
    }
}

function handleToggleNotes() {
    if (!gameState.gameActive) return;
    gameState.notesMode = !gameState.notesMode;
    renderActionBar(gameState.notesMode);
}

function endGame(won) {
    gameState.gameActive = false;
    stopTimer();
    localStorage.removeItem('sudoku_save');
    clearTimerSave();
    
    if (won) {
        showMessage(`Puzzle Complete! Time: ${getCurrentTime()}`, 'success');
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                setTimeout(() => animateCell(r, c, 'cell--success', 500), (r * 9 + c) * 15);
            }
        }
    } else {
        showMessage(`Game Over — ${MAX_MISTAKES} mistakes!`, 'error');
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (gameState.board[r][c] !== gameState.solution[r][c]) {
                    // Update state silently or visually
                    gameState.board[r][c] = gameState.solution[r][c];
                    markCellError(r, c);
                }
            }
        }
    }
}

onBoardClick(handleCellClick);
onNumpadClick(handleNumberInput);

onActionClick({
    onUndo: handleUndo,
    onErase: handleErase,
    onToggleNotes: handleToggleNotes
});

newGameBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (!gameState.gameActive) return;

    if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
    } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
    } else if (e.key === 'n') {
        handleToggleNotes();
    } else if (gameState.selectedCell) {
        let { row, col } = gameState.selectedCell;
        if (e.key === 'ArrowUp' && row > 0) handleCellClick(row - 1, col);
        if (e.key === 'ArrowDown' && row < 8) handleCellClick(row + 1, col);
        if (e.key === 'ArrowLeft' && col > 0) handleCellClick(row, col - 1);
        if (e.key === 'ArrowRight' && col < 8) handleCellClick(row, col + 1);
    }
});

validateCheckbox.checked = true;

async function initApp() {
    const saved = getSavedState();
    if (saved) {
        // Blur the board first so user knows something is happening behind the modal
        const gridEl = document.getElementById('sudoku-grid');
        if (gridEl) gridEl.classList.add('board--blurred');
        
        showModal({
            title: 'Partida Encontrada',
            text: 'Tienes un juego guardado en progreso. ¿Deseas continuar donde lo dejaste o empezar uno nuevo?',
            confirmText: 'Continuar',
            cancelText: 'Reiniciar',
            onConfirm: () => {
                restoreState(saved);
                showMessage('Partida recuperada', 'success');
                
                renderBoard(gameState.board, gameState.given, gameState.notes);
                renderActionBar(gameState.notesMode);
                renderNumpad(countNumber);
                
                const savedTime = parseInt(localStorage.getItem('sudoku_timer')) || 0;
                startTimer((timeStr) => {
                    if (timerEl) timerEl.textContent = timeStr;
                }, savedTime);
                
                if (gameState.mistakes > 0) {
                    showMessage(`Mistakes: ${gameState.mistakes}/${MAX_MISTAKES}`, 'error');
                } else {
                    setTimeout(clearMessage, 2000);
                }
            },
            onCancel: async () => {
                await startGame();
            }
        });
    } else {
        await startGame();
    }
}

initApp();
