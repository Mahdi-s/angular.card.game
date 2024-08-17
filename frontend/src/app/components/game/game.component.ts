import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

interface Card {
  value: string;
  flipped: boolean;
  matched: boolean;
  index: number;
}

interface Player {
  name: string;
  score: number;
  cumulativeScore: number;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class GameComponent implements OnInit {
  gameState: {
    cards: Card[];
    currentPlayer: number;
    players: Player[];
    gameOver: boolean;
    playerScores: number[]; // Add this line
  };
  selectedCards: number[] = [];
  isProcessing = false;

  constructor(private gameService: GameService, private cd: ChangeDetectorRef) {
    this.gameState = {
      cards: [],
      currentPlayer: 0,
      players: [
        { name: 'Player 1', score: 0, cumulativeScore: 0 },
        { name: 'Player 2', score: 0, cumulativeScore: 0 }
      ],
      gameOver: false,
      playerScores: [0, 0]
    };
    this.initializeGame();
  }

  ngOnInit() {
    this.startNewGame();
  }

  startNewGame() {
    this.gameService.getGameState().subscribe({
      next: (state) => {
        this.gameState = {
          ...state,
          cards: state.cards.map((card: any, index: number) => ({
            ...card,
            matched: false,
            index
          })),
          currentPlayer: Math.floor(Math.random() * 2), // Randomly assign initial turn
          players: state.players || [
            { name: 'Player 1', score: 0, cumulativeScore: 0 },
            { name: 'Player 2', score: 0, cumulativeScore: 0 }
          ],
          gameOver: false,
          playerScores: [0, 0]
        };
  
        this.selectedCards = [];
        this.isProcessing = false;
        this.cd.detectChanges();
      },
      error: (error) => console.error('Error starting new game:', error)
    });
  }

  flipCard(index: number) {
    if (this.isProcessing || this.selectedCards.length >= 2 || this.gameState.cards[index].flipped || this.gameState.gameOver) {
      return;
    }

    this.gameState.cards[index].flipped = true;
    this.selectedCards.push(index);

    if (this.selectedCards.length === 2) {
      this.isProcessing = true;
      this.checkForMatch();
    }

    this.cd.detectChanges();
  }

  checkForMatch() {
    const [index1, index2] = this.selectedCards;
    const card1 = this.gameState.cards[index1];
    const card2 = this.gameState.cards[index2];

    if (card1.value === card2.value) {
      // Match found
      card1.matched = true;
      card2.matched = true;
      this.gameState.players[this.gameState.currentPlayer].score++;
      this.selectedCards = [];
      this.isProcessing = false;
      this.checkGameOver();
    } else {
      // No match
      setTimeout(() => {
        card1.flipped = false;
        card2.flipped = false;
        this.selectedCards = [];
        this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % 2;
        this.isProcessing = false;
        this.cd.detectChanges();
      }, 1000);
    }
  }

  checkGameOver() {
    if (this.gameState.cards.every(card => card.matched)) {
      this.gameState.gameOver = true;
      this.updateCumulativeScores();
    }
  }

  restartGame() {
    this.gameService.restartGame().subscribe({
      next: (newGameState) => {
        this.gameState = {
          ...newGameState,
          cards: newGameState.cards.map((card: any, index: number) => ({
            ...card,
            matched: false,
            flipped: false,
            index
          })),
          currentPlayer: newGameState.playerTurn,
          players: [
            { name: 'Player 1', score: 0, cumulativeScore: this.gameState.players[0].cumulativeScore },
            { name: 'Player 2', score: 0, cumulativeScore: this.gameState.players[1].cumulativeScore }
          ],
          gameOver: false,
          playerScores: [0, 0]
        };
        this.selectedCards = [];
        this.isProcessing = false;
        this.cd.detectChanges();
      },
      error: (error) => console.error('Error restarting game:', error)
    });
  }

  initializeGame() {
    this.gameService.getGameState().subscribe(
      (state) => {
        this.gameState = state;
        this.cd.detectChanges();
      },
      (error) => {
        console.error('Error initializing game:', error);
      }
    );
  }

  updateCumulativeScores() {
    this.gameState.players.forEach(player => {
      player.cumulativeScore += player.score;
    });

  }

  resetScores() {
    this.gameState.players.forEach(player => {
      player.score = 0;
      player.cumulativeScore = 0;
    });
  }

  getCardImagePath(card: Card): string {
    return card.flipped ? `assets/cards/${card.value}.png` : 'assets/cards/back.png';
  }
}