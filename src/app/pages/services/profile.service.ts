import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // This makes the service available application-wide
})
export class ProfileService {
  private profileUrl = 'http://localhost:3000/profile/';

  constructor(private http: HttpClient) { }

  getUserProfile(userName: string): Observable<any> {
    return this.http.get<any>(`${this.profileUrl}${encodeURIComponent(userName)}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error fetching user profile:', error);
    return throwError('Something went wrong; please try again later.');
  }
}