const container = document.getElementById('game-container');

/**
 * Renders the action bar containing gameplay controls (Undo, Erase, Notes).
 * 
 * @param {boolean} notesActive - Indicates whether notes mode is currently active.
 */
let notesBtnElement = null;
let actionBarElement = null;

export function renderActionBar(notesActive) {
    if (!actionBarElement) {
        actionBarElement = document.getElementById('action-bar');
    }

    if (!actionBarElement) {
        actionBarElement = document.createElement('div');
        actionBarElement.id = 'action-bar';
        const numpad = document.getElementById('numpad');
        const messageEl = document.getElementById('message');
        container.insertBefore(actionBarElement, numpad || messageEl);

        actionBarElement.innerHTML = `
            <button class="action-btn" id="undo-btn" title="Undo">
                <span class="action-btn__icon">↩</span>
                <span class="action-btn__label">Undo</span>
            </button>
            <button class="action-btn" id="erase-btn" title="Erase">
                <span class="action-btn__icon">⌫</span>
                <span class="action-btn__label">Erase</span>
            </button>
            <button class="action-btn" id="notes-btn" title="Notes">
                <span class="action-btn__icon">✎</span>
                <span class="action-btn__label">Notes</span>
            </button>
        `;
        notesBtnElement = actionBarElement.querySelector('#notes-btn');
    }

    if (notesBtnElement) {
        if (notesActive) {
            notesBtnElement.classList.add('action-btn--active');
        } else {
            notesBtnElement.classList.remove('action-btn--active');
        }
    }
}

/**
 * Attaches event listeners for the action buttons using event delegation.
 * 
 * @param {Object} callbacks - An object containing event handlers.
 * @param {Function} callbacks.onUndo - Handler for the undo action.
 * @param {Function} callbacks.onErase - Handler for the erase action.
 * @param {Function} callbacks.onToggleNotes - Handler for toggling notes mode.
 */
export function onActionClick(callbacks) {
    container.addEventListener('click', (event) => {
        const btn = event.target.closest('.action-btn');
        if (!btn) return;

        if (btn.id === 'undo-btn') callbacks.onUndo();
        if (btn.id === 'erase-btn') callbacks.onErase();
        if (btn.id === 'notes-btn') callbacks.onToggleNotes();
    });
}
