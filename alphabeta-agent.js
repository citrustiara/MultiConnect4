class AlphaBetaAgent {
    constructor(my_token = 'x', depth = 7) {
        this.my_token = my_token;
        this.depth = depth;
    }

    async decide(connect4) {
        if (connect4.who_moves !== this.my_token) {
            throw new AgentException('not my round');
        }

        let best_score = -Infinity;
        let best_moves = [];
        let alpha = -Infinity;
        let beta = Infinity;
		
		for (const move of connect4.possible_drops()) {
			const new_connect4 = connect4.simulate_move(move);
			if (new_connect4.wins === this.my_token) {
				return move; // immediate win, no need to search
			}
		}


        for (const move of connect4.possible_drops()) {
            const new_connect4 = connect4.simulate_move(move);
            const score = await this.alphabeta(new_connect4, this.depth - 1, alpha, beta, false);
            if (score > best_score) {
                best_score = score;
                best_moves = [move];
                alpha = Math.max(alpha, best_score);
            } else if (score === best_score) {
                best_moves.push(move);
            }
        }

        // prefer central moves when tie
		
        const center = Math.floor(connect4.width / 2);
        best_moves.sort((a, b) => Math.abs(center - a) - Math.abs(center - b));
        return best_moves[0];
    }

    async alphabeta(connect4, depth, alpha, beta, is_maximizing) {
        if (depth === 0 || connect4.game_over) {
            return this.evaluate(connect4);
        }

        if (is_maximizing) {
            let value = -Infinity;
            for (const move of connect4.possible_drops()) {
                const new_connect4 = connect4.simulate_move(move);
                value = Math.max(value, await this.alphabeta(new_connect4, depth - 1, alpha, beta, false));
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break; // beta cut-off
            }
            return value;
        } else {
            let value = Infinity;
            for (const move of connect4.possible_drops()) {
                const new_connect4 = connect4.simulate_move(move);
                value = Math.min(value, await this.alphabeta(new_connect4, depth - 1, alpha, beta, true));
                beta = Math.min(beta, value);
                if (alpha >= beta) break; // alpha cut-off
            }
            return value;
        }
    }

    evaluate(connect4) {
        const opp = this.get_opponent_token();

        // terminal states
        if (connect4.wins === this.my_token) return Infinity;
        if (connect4.wins === opp) return -Infinity;

        let score = 0;

        // center column control
        const centerCol = Math.floor(connect4.width / 2);
        const centerCount = connect4.board.map(row => row[centerCol])
                                          .filter(cell => cell === this.my_token).length;
        score += centerCount * 6;

        // evaluate all fours using iter_fours
        for (const four of connect4.iter_fours()) {
            score += this._score_window(four, this.my_token, opp);
        }

        return score;
    }

    _score_window(window, me, opp) {
        const my_count = window.filter(c => c === me).length;
        const opp_count = window.filter(c => c === opp).length;
        const empty = window.filter(c => c === '_').length;

        if (my_count === 4) return 10000;
        if (my_count === 3 && empty === 1) return 500;
        if (my_count === 2 && empty === 2) return 50;

        if (opp_count === 3 && empty === 1) return -5000;
        if (opp_count === 2 && empty === 2) return -200;

        return 0;
    }

    get_opponent_token() {
        return this.my_token === 'o' ? 'x' : 'o';
    }
}
