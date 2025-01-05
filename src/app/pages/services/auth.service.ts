import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userName = new BehaviorSubject<string | null>(null);

  isLoggedIn: Observable<boolean> = this.loggedIn.asObservable();
  currentUserName: Observable<string | null> = this.userName.asObservable();

  login(userName: string): void {
    this.userName.next(userName);
    this.loggedIn.next(true);
  }

  logout(): void {
    this.userName.next(null);
    this.loggedIn.next(false);
  }

  getUserName(): string | null {
    return this.userName.getValue();
  }
}