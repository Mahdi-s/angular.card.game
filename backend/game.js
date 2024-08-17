const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const cards = [
  'AS', 'AH', 'AD', 'AC', '2S', '2H', '2D', '2C',
  '3S', '3H', '3D', '3C', '4S', '4H', '4D', '4C',
  '5S', '5H', '5D', '5C', '6S', '6H', '6D', '6C',
  '7S', '7H', '7D', '7C', '8S', '8H', '8D', '8C',
  '9S', '9H', '9D', '9C', '10S', '10H', '10D', '10C',
  'JS', 'JH', 'JD', 'JC', 'QS', 'QH', 'QD', 'QC',
  'KS', 'KH', 'KD', 'KC',
];

const saveGameState = (gameState) => {
  const filePath = path.join(__dirname, 'game.json');
  const data = JSON.stringify(gameState);
  fs.writeFileSync(filePath, data);
};

const loadGameState = () => {
  const filePath = path.join(__dirname, 'game.json');
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

function shuffleCards(cards) {
  const shuffledCards = [...cards];
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
  }
  return shuffledCards.map((value, index) => ({ value, flipped: false, index }));
}

app.get('/api/game', (req, res) => {
  const gameState = loadGameState();
  res.status(200).json(gameState);
});

app.post('/api/game', (req, res) => {
  const { cardIndices } = req.body;
  let gameState = loadGameState();

  const { cards, playerTurn, playerScores, gameOver } = gameState;

  if (!gameOver) {
    const flippedCards = cardIndices.map((index) => {
      const card = { ...cards[index] };
      card.flipped = true;
      return card;
    });

    const newCards = cards.map((card, index) =>
      cardIndices.includes(index) ? flippedCards[cardIndices.indexOf(index)] : card
    );

    const flippedValues = flippedCards.map((card) => card.value);

    if (new Set(flippedValues).size === 1) {
      // Cards match
      const matchedCards = newCards.filter((card) => card.flipped);
      const remainingCards = newCards.filter((card) => !card.flipped);

      playerScores[playerTurn] += 1;

      gameState = {
        cards: remainingCards,
        playerTurn: playerTurn,
        playerScores,
        gameOver: remainingCards.length === 0,
      };
    } else {
      // Cards don't match
      gameState = {
        ...gameState,
        cards: newCards,
        playerTurn: (playerTurn + 1) % 2,
      };

      setTimeout(() => {
        const unflippedCards = newCards.map((card) => ({
          ...card,
          flipped: false,
        }));
        gameState = {
          ...gameState,
          cards: unflippedCards,
        };
        saveGameState(gameState);
      }, 1000);
    }

    saveGameState(gameState);
  }

  res.status(200).json(gameState);
});

app.post('/api/new-game', (req, res) => {
  const initialGameState = {
    cards: shuffleCards(cards.concat(cards).slice(0, 20)),
    playerTurn: Math.random() < 0.5 ? 0 : 1,
    playerScores: [0, 0],
    gameOver: false,
  };
  saveGameState(initialGameState);
  res.status(200).json(initialGameState);
});

// Initialize game state if it doesn't exist
const gameStateFilePath = path.join(__dirname, 'game.json');
if (!fs.existsSync(gameStateFilePath)) {
  const initialGameState = {
    cards: shuffleCards(cards.concat(cards).slice(0, 20)),
    playerTurn: Math.random() < 0.5 ? 0 : 1,
    playerScores: [0, 0],
    gameOver: false,
  };
  saveGameState(initialGameState);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});