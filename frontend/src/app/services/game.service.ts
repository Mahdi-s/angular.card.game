import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/game';

  constructor(private http: HttpClient) {}

  getGameState(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  flipCards(cardIndices: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/flip`, { cardIndices });
  }

  updateGameState(gameState: any) {
    return this.http.post<any>(`${this.apiUrl}/update-game-state`, gameState);
  }

  restartGame(): Observable<any> {
    return this.http.post(`${this.apiUrl}/new-game`, {});
  }
}