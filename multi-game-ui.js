// Game state
let games = [];
let agents = [];
let currentBoardIndex = 0;
let isAiTurn = false;
let gameOverAll = false;

function initializeUI() {
    // Initialize 4 games
    games = [];
    agents = [];
    for (let i = 0; i < 4; i++) {
        games.push(new Connect4());
        agents.push(new AlphaBetaAgent('x', 5));
    }
    
    currentBoardIndex = 0;
    gameOverAll = false;
    
    // Create UI for all boards
    for (let boardIndex = 0; boardIndex < 4; boardIndex++) {
        createBoardUI(boardIndex);
    }
    
    updateAllUI();
    setupKeyboardControls();
}

function createBoardUI(boardIndex) {
    const game = games[boardIndex];
    const grid = document.getElementById(`grid-${boardIndex}`);
    const columnButtons = document.getElementById(`columnButtons-${boardIndex}`);
    
    // Create column buttons
    columnButtons.innerHTML = '';
    for (let col = 0; col < game.width; col++) {
        const btn = document.createElement('button');
        btn.className = 'column-btn';
        btn.textContent = `${col + 1}`;
        btn.onclick = () => makeMove(boardIndex, col);
        columnButtons.appendChild(btn);
    }

    // Create grid
    grid.innerHTML = '';
    for (let row = 0; row < game.height; row++) {
        for (let col = 0; col < game.width; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${boardIndex}-${row}-${col}`;
            grid.appendChild(cell);
        }
    }
}

function setupKeyboardControls() {
    document.addEventListener('keydown', function(event) {
        // Check if keys 1-7 are pressed
        const key = event.key;
        if (key >= '1' && key <= '7') {
            const column = parseInt(key) - 1;
            if (column < games[currentBoardIndex].width) {
                highlightButton(currentBoardIndex, column);
                makeMove(currentBoardIndex, column);
            }
        }
    });
}

function highlightButton(boardIndex, column) {
    const buttons = document.querySelectorAll(`#columnButtons-${boardIndex} .column-btn`);
    if (buttons[column]) {
        buttons[column].classList.add('highlight');
        setTimeout(() => {
            buttons[column].classList.remove('highlight');
        }, 300);
    }
}

function updateBoardUI(boardIndex) {
    const game = games[boardIndex];
    
    // Update board display
    for (let row = 0; row < game.height; row++) {
        for (let col = 0; col < game.width; col++) {
            const cell = document.getElementById(`cell-${boardIndex}-${row}-${col}`);
            const value = game.board[row][col];
            
            cell.className = 'cell';
            if (value === 'o') {
                cell.className += ' player-o';
                cell.textContent = '';
            } else if (value === 'x') {
                cell.className += ' player-x';
                cell.textContent = '';
            } else {
                cell.textContent = '';
            }
        }
    }

    // Update column buttons
    const columnButtons = document.querySelectorAll(`#columnButtons-${boardIndex} .column-btn`);
    const possibleMoves = game.possible_drops();
    const isCurrentBoard = boardIndex === currentBoardIndex;
    
    columnButtons.forEach((btn, index) => {
        btn.disabled = !possibleMoves.includes(index) || game.game_over || isAiTurn || !isCurrentBoard || gameOverAll;
    });

    // Update board appearance
    const boardElement = document.getElementById(`board-${boardIndex}`);
    const resultElement = document.getElementById(`result-${boardIndex}`);
    
    if (game.game_over) {
        boardElement.className = 'board completed-board';
        if (game.wins === 'o') {
            resultElement.textContent = '🎉 You Won!';
            resultElement.className = 'board-result win';
        } else if (game.wins === 'x') {
            resultElement.textContent = '';
            resultElement.className = 'board-result lose';
        } else {
            resultElement.textContent = '🤝 Tie Game!';
            resultElement.className = 'board-result tie';
        }
    } else if (isCurrentBoard && !isAiTurn && !gameOverAll) {
        boardElement.className = 'board active-board';
        resultElement.textContent = '';
        resultElement.className = 'board-result';
    } else {
        boardElement.className = 'board inactive-board';
        resultElement.textContent = '';
        resultElement.className = 'board-result';
    }
}

function updateAllUI() {
    // Update all boards
    for (let i = 0; i < 4; i++) {
        updateBoardUI(i);
    }

    // Update main status
    const status = document.getElementById('status');
    
    if (gameOverAll) {
        status.innerHTML = '<div class="game-over-message">💀 GAME OVER - You Lost! 💀</div>';
    } else if (allGamesCompleted()) {
        status.textContent = '🎊 All games completed! Start new games to continue.';
    } else {
        status.textContent = '';
    }
}

function allGamesCompleted() {
    return games.every(game => game.game_over);
}

function findNextActiveBoard() {
    // Find next incomplete game
    for (let i = 0; i < 4; i++) {
        const nextIndex = (currentBoardIndex + 1 + i) % 4;
        if (!games[nextIndex].game_over) {
            return nextIndex;
        }
    }
    return -1;
}

async function makeMove(boardIndex, column) {
    // Only allow moves on current board
    if (boardIndex !== currentBoardIndex || games[boardIndex].game_over || isAiTurn || gameOverAll) {
        return;
    }

    const game = games[boardIndex];
    const agent = agents[boardIndex];

    try {
        // Player move
        game.drop_token(column);
        updateBoardUI(boardIndex);

        // Check if game is over after player move
        if (game.game_over) {
            if (game.wins === 'x') {
                // Player lost - game over for all boards
                gameOverAll = true;
                updateAllUI();
                return;
            }
        }

        // AI move
        isAiTurn = true;
        updateAllUI();
        
        setTimeout(async () => {
            try {
                const aiMove = await agent.decide(game);
                game.drop_token(aiMove);
                updateBoardUI(boardIndex);
                
                // Check if game is over after AI move
                if (game.game_over && game.wins === 'x') {
                    // Player lost - game over for all boards
                    gameOverAll = true;
                    isAiTurn = false;
                    updateAllUI();
                    return;
                }
                
                isAiTurn = false;
                
                // Switch to next board after AI move
                const nextBoard = findNextActiveBoard();
                if (nextBoard !== -1) {
                    currentBoardIndex = nextBoard;
                }
                
                updateAllUI();
            } catch (error) {
                console.error('AI move error:', error);
                isAiTurn = false;
                
                // Switch to next board even if AI move failed
                const nextBoard = findNextActiveBoard();
                if (nextBoard !== -1) {
                    currentBoardIndex = nextBoard;
                }
                
                updateAllUI();
            }
        }, 50);

    } catch (error) {
        console.error('Move error:', error);
    }
}

function newGames() {
    // Reset all games
    games = [];
    agents = [];
    
    for (let i = 0; i < 4; i++) {
        games.push(new Connect4());
        agents.push(new AlphaBetaAgent('x', 5));
    }
    
    currentBoardIndex = 0;
    isAiTurn = false;
    gameOverAll = false;
    
    updateAllUI();
}

// Initialize the game
window.onload = initializeUI;