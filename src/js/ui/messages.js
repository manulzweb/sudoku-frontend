const messageEl = document.getElementById('message');

/**
 * Displays a message to the user with the specified severity type.
 * 
 * @param {string} text - The text content to display.
 * @param {string} [type] - The severity or classification of the message 
 *                          ('error', 'success', or omitted for default info).
 */
export function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'message message--visible';

    if (type === 'error') {
        messageEl.classList.add('message--error');
    }
    if (type === 'success') {
        messageEl.classList.add('message--success');
    }
}

/**
 * Clears the currently displayed message and hides the message container.
 */
export function clearMessage() {
    messageEl.textContent = '';
    messageEl.className = 'message';
}
