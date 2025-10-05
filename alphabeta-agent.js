class AlphaBetaAgent {
    constructor(my_token = 'x', depth = 7) {
        this.my_token = my_token;
        this.depth = depth;
		this.nodes_visited = 0;
    }

    async decide(connect4) {
		this.nodes_visited = 0;
		
        if (connect4.who_moves !== this.my_token) {
            throw new AgentException('not my round');
        }

        const moves = connect4.possible_drops();
        if (!moves || moves.length === 0) return null;

        // immediate win -> take it
        for (const move of moves) {
            const s = connect4.simulate_move(move);
            if (this.evaluate(s) === Infinity) return move;
        }

        // try to find a move that prevents any opponent immediate win after we play it
        // (guaranteed block-in-one if such a move exists)
        const safeMoves = [];
        for (const move of moves) {
            const s = connect4.simulate_move(move); // now opponent to move
            let oppCanWin = false;
            for (const oppMove of s.possible_drops()) { // double for loop, we simulate our move, then the opponent, if he wins we dont place the move in safemoves
                const s2 = s.simulate_move(oppMove);
                if (this.evaluate(s2) === -Infinity) { // opponent wins after our move
                    oppCanWin = true;
                    break;
                }
            }
            if (!oppCanWin) safeMoves.push(move);
        }
        // If there's exactly one safe move (must-block), play it.
        if (safeMoves.length === 1) return safeMoves[0];

        // If there are safe moves, prefer searching only them (prunes hopeless moves),
        // otherwise search all moves.
        const rootMoves = safeMoves.length ? safeMoves : moves;

        // standard alphabeta search over rootMoves.
        let best_score = -Infinity;
        let best_moves = [];
		let alpha = -Infinity;
		let beta = Infinity;
        for (const move of rootMoves) {
            const newState = connect4.simulate_move(move);
            const score = await this.alphabeta(newState, this.depth - 1, alpha, beta);
            if (score > best_score) {
                best_score = score;
                best_moves = [move];
				alpha = Math.max(alpha, best_score);
            } else if (score === best_score) {
                best_moves.push(move);
            }
        }
		
		console.log(`Nodes visited: ${this.nodes_visited}`);

        // prefer center on ties
        const center = Math.floor(connect4.width / 2);
        best_moves.sort((a, b) => Math.abs(center - a) - Math.abs(center - b));
        return best_moves[0];
    }

    async alphabeta(connect4, depth, alpha, beta) {
		this.nodes_visited++;
        // terminal or depth 
        if (depth === 0 || connect4.game_over) {
            return this.evaluate(connect4);
        }

        // Derive role from the position
        const is_maximizing = (connect4.who_moves === this.my_token);

        if (is_maximizing) {
            let value = -Infinity;
            for (const move of connect4.possible_drops()) {
                const child = connect4.simulate_move(move);
                value = Math.max(value, await this.alphabeta(child, depth - 1, alpha, beta));
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break; // beta cut-off
            }
            return value;
        } else {
            let value = Infinity;
            for (const move of connect4.possible_drops()) {
                const child = connect4.simulate_move(move);
                value = Math.min(value, await this.alphabeta(child, depth - 1, alpha, beta));
                beta = Math.min(beta, value);
                if (alpha >= beta) break; // alpha cut-off
            }
            return value;
        }
    }

    evaluate(connect4) {
        const opp = this.get_opponent_token();

        // Terminal flags if connect4 provides them:
        if (connect4.wins === this.my_token) return Infinity;
        if (connect4.wins === opp) return -Infinity;

        // Fallback: check windows for a 4-in-row even if connect4.wins wasn't set
        for (const four of connect4.iter_fours()) {
            const my_count = four.filter(c => c === this.my_token).length;
            const opp_count = four.filter(c => c === opp).length;
            if (my_count === 4) return Infinity;
            if (opp_count === 4) return -Infinity;
        }

        let score = 0;

        // center control
        const centerCol = Math.floor(connect4.width / 2);
        const centerCount = connect4.board.map(row => row[centerCol])
                                          .filter(cell => cell === this.my_token).length;
        score += centerCount * 6;

        // window heuristics
        for (const four of connect4.iter_fours()) {
            score += this._score_window(four, this.my_token, opp);
        }

        return score;
    }

    _score_window(window, me, opp) {
        const my_count = window.filter(c => c === me).length;
        const opp_count = window.filter(c => c === opp).length;
        // be permissive about what counts as empty
        const empty = window.filter(c => c === '_' || c === '.' || c === null || c === undefined).length;

        if (my_count === 3 && empty === 1) return 5000;
        if (my_count === 2 && empty === 2) return 200;

        if (opp_count === 3 && empty === 1) return -5000;
        if (opp_count === 2 && empty === 2) return -200;

        return 0;
    }

    get_opponent_token() {
        return this.my_token === 'o' ? 'x' : 'o';
    }
}
