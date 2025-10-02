class AlphaBetaAgent {
    constructor(my_token = 'x', depth = 4) {
        this.my_token = my_token;
        this.depth = depth;
    }

    async decide(connect4) {
        if (connect4.who_moves !== this.my_token) {
            throw new AgentException('not my round');
        }

        // Quick check: if there's an immediate winning move, make it
        for (const move of connect4.possible_drops()) {
            const new_connect4 = connect4.simulate_move(move);
            if (new_connect4.wins === this.my_token) {
                return move;
            }
        }

        // Check if opponent has an immediate winning move and block it
        const opp = this.get_opponent_token();
        for (const move of connect4.possible_drops()) {
            const afterOpponent = connect4.simulate_move(move);
            if (afterOpponent.wins === opp) {
                if (connect4.possible_drops().includes(move)) {
                    return move;
                }
            }
        }

        // Normal alpha-beta search
        let best_score = -Infinity;
        let best_moves = [];
        let alpha = -Infinity;
        let beta = Infinity;

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

        return best_moves[Math.floor(Math.random() * best_moves.length)];
    }

    async alphabeta(connect4, depth, alpha, beta, is_maximizing) {
        // Add small delay occasionally to prevent UI blocking
        if (Math.random() < 0.001) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (depth === 0 || connect4.game_over) {
            return this.evaluate(connect4);
        }

        if (is_maximizing) {
            let value = -Infinity;
            for (const move of connect4.possible_drops()) {
                const new_connect4 = connect4.simulate_move(move);
                value = Math.max(value, await this.alphabeta(new_connect4, depth - 1, alpha, beta, false));
                alpha = Math.max(alpha, value);
                if (alpha >= beta) {
                    break;
                }
            }
            return value;
        } else {
            let value = Infinity;
            for (const move of connect4.possible_drops()) {
                const new_connect4 = connect4.simulate_move(move);
                value = Math.min(value, await this.alphabeta(new_connect4, depth - 1, alpha, beta, true));
                beta = Math.min(beta, value);
                if (alpha >= beta) {
                    break;
                }
            }
            return value;
        }
    }

    evaluate(connect4) {
        if (connect4.wins === this.my_token) {
            return 10000;
        } else if (connect4.wins !== null) {
            return -10000;
        }

        let score = 0;

        // Prefer center columns
        //const center_array = connect4.center_column();
        //score += center_array.filter(cell => cell === this.my_token).length * 3;
		//uncomment if you want the ai to be better, the games will be more similar
        // Evaluate all possible four-in-a-row sequences
        for (const four of connect4.iter_fours()) {
            const my_count = four.filter(cell => cell === this.my_token).length;
            const opp_count = four.filter(cell => cell === this.get_opponent_token()).length;
            const empty = four.filter(cell => cell === '_').length;

            if (my_count === 3 && empty === 1) {
                score += 50;
            } else if (my_count === 2 && empty === 2) {
                score += 5;
            } else if (opp_count === 3 && empty === 1) {
                score -= 40;
            } else if (opp_count === 2 && empty === 2) {
                score -= 4;
            }
        }

        return score;
    }

    get_opponent_token() {
        return this.my_token === 'o' ? 'x' : 'o';
    }
}