# Multi Connect 4

A challenging twist on the classic Connect 4 game where you play simultaneously across 4 boards against an AI opponent. One mistake and you lose everything!

## 🎮 Game Rules

- Play against an AI opponent across 4 different Connect 4 boards
- After each of your moves, the game automatically switches to the next active board
- The AI makes its move on each board after you do
- **Win Condition**: Complete all 4 boards without losing any
- **Lose Condition**: Lose a single board and the entire game is over
- The AI uses Alpha-Beta pruning algorithm with strategic evaluation

## 🚀 Features

- **4 Simultaneous Boards**: Manage multiple games at once
- **Smart AI Opponent**: Uses Alpha-Beta pruning with depth-limited search
- **Keyboard Controls**: Press keys 1-7 to quickly drop tokens
- **Visual Feedback**: Active board highlighting and move animations
- **Strategic AI**: The AI evaluates center control, threats, and winning opportunities
- **Responsive Design**: Works on desktop and mobile devices

## 📋 How to Play

1. Open `index.html` in a web browser
2. Click on column buttons (1-7) or press keyboard keys (1-7) to drop your token (red)
3. The AI (yellow) will respond automatically
4. The game cycles through boards after each player move
5. Try to win all 4 boards without losing any!

### Controls

- **Mouse**: Click column buttons above each board
- **Keyboard**: Press keys 1-7 to drop tokens in the corresponding column
- **New Games**: Click the "New Games" button to restart

## 🏗️ Project Structure

```
├── index.html              # Main HTML file
├── styles.css              # Game styling and animations
├── connect4.js             # Core Connect 4 game logic
├── alphabeta-agent.js      # AI agent with Alpha-Beta pruning
└── multi-game-ui.js        # Multi-board UI and game management
```

## 🧠 AI Strategy

The AI uses several techniques to play competitively:

- **Alpha-Beta Pruning**: Efficient minimax search with pruning
- **Position Evaluation**: Scores based on:
  - Winning positions (instant win/loss)
  - Three-in-a-row with empty space (strong threat)
  - Two-in-a-row with two empty spaces (potential)
  - Center column control (strategic advantage)
- **Search Depth**: Configurable depth (default: 5 moves ahead)
- **Center Preference**: Prefers central moves when scores are equal
- **Random First Move**: AI makes a random first move for variety

## 🛠️ Technical Details

### Core Classes

**Connect4**
- Manages game state (7x6 board by default)
- Handles token drops and move validation
- Checks for wins and game-over conditions
- Provides move simulation for AI planning

**AlphaBetaAgent**
- Implements Alpha-Beta pruning algorithm
- Evaluates board positions with scoring heuristics
- Makes strategic decisions based on lookahead search

### Key Features in Code

- Generator functions for efficient four-in-a-row checking
- Immutable game state simulation for AI planning
- Event-driven UI updates
- Keyboard event handling for quick gameplay

##  Customization

You can easily modify the game:

- **AI Difficulty**: Change the `depth` parameter in `multi-game-ui.js` (line 10)
  ```javascript
  agents.push(new AlphaBetaAgent('x', 5)); // Change 5 to increase/decrease difficulty
  ```
- **Board Size**: Modify `width` and `height` in `Connect4` constructor
- **Number of Boards**: Add/remove board sections in `index.html` and update the loop count in `multi-game-ui.js`

##  Strategy Tips

- Control the center columns early
- Watch for AI threats (three-in-a-row)
- Block AI winning moves immediately
- Build multiple threats simultaneously
- Remember: you're playing 4 games at once - stay focused!

##  License

This project is open source and available under the MIT License.

##  Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

##  Author

Created as a challenging variant of the classic Connect 4 game.

---

**Good luck defeating the AI across all 4 boards!** 🎲
