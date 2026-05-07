export function showModal(options) {
    const { title, text, onConfirm, onCancel, confirmText = 'Aceptar', cancelText = 'Cancelar' } = options;
    
    let overlay = document.getElementById('glass-modal');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'glass-modal';
        overlay.className = 'modal-overlay';
        
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-title" id="modal-title"></div>
                <div class="modal-text" id="modal-text"></div>
                <div class="modal-buttons">
                    <button class="btn-secondary" id="modal-cancel"></button>
                    <button class="btn-primary" id="modal-confirm"></button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    const titleEl = overlay.querySelector('#modal-title');
    const textEl = overlay.querySelector('#modal-text');
    const confirmBtn = overlay.querySelector('#modal-confirm');
    const cancelBtn = overlay.querySelector('#modal-cancel');
    
    titleEl.textContent = title;
    textEl.textContent = text;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;
    
    // Add Blur to the board
    const gridEl = document.getElementById('sudoku-grid');
    if (gridEl) gridEl.classList.add('board--blurred');
    
    // Remove old listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.replaceWith(newConfirmBtn);
    cancelBtn.replaceWith(newCancelBtn);
    
    const closeModal = () => {
        overlay.classList.remove('modal-overlay--visible');
        if (gridEl) gridEl.classList.remove('board--blurred');
    };
    
    newConfirmBtn.addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
    });
    
    newCancelBtn.addEventListener('click', () => {
        closeModal();
        if (onCancel) onCancel();
    });
    
    // Animate in
    // setTimeout to allow display block to take effect before opacity transition
    setTimeout(() => {
        overlay.classList.add('modal-overlay--visible');
    }, 10);
}
