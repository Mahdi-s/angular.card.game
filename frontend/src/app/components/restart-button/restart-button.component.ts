import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-restart-button',
  template: '<button (click)="restartGame()">Restart Game</button>',
  styleUrls: ['./restart-button.component.css']
})
export class RestartButtonComponent {
  constructor(private gameService: GameService) {}

  restartGame() {
    this.gameService.restartGame().subscribe({
      next: () => {
        console.log('Game restarted successfully');
        // You might want to emit an event or use a shared service to notify other components
      },
      error: (error) => console.error('Error restarting game:', error)
    });
  }
}