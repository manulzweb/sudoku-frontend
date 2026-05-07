const API_BASE = 'https://sudoku-server-s22e.onrender.com/sudoku';

export async function generatePuzzleFromBackend(difficulty) {
    try {
        const response = await fetch(`${API_BASE}/generate?difficulty=${difficulty}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to generate puzzle');
        const data = await response.json();
        
        // The backend returns a board with 0 for empty cells.
        // We need to return an object with { puzzle, solution, given }
        // Let's also fetch the solution to have it locally for validation
        // const solveResponse = await fetch(`${API_BASE}/solve`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ board: data.board })
        // });
        
        // if (!solveResponse.ok) throw new Error('Failed to solve puzzle');
        // const solveData = await solveResponse.json();
        
        const given = data.board.map(row => row.map(cell => cell !== 0));
        
        return {
            puzzle: data.board,
            solution: data.solution,
            given: given
        };
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export async function validateBoard(board) {
    try {
        const response = await fetch(`${API_BASE}/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ board })
        });
        if (!response.ok) throw new Error('Failed to validate board');
        const data = await response.json();
        return data.valid;
    } catch (error) {
        console.error('API Error:', error);
        return false;
    }
}
