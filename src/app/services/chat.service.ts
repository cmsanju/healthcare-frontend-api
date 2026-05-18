import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'https://healthcare-backend-uejq.onrender.com/api/chat';

  constructor(private http: HttpClient) {}

  sendMessage(message: string, sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/message`, { message, sessionId });
  }

  getChatHistory(sessionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history/${sessionId}`);
  }

  clearSession(sessionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear/${sessionId}`);
  }

  createSession(): Observable<any> {
    return this.http.post(`${this.apiUrl}/new-session`, {});
  }
}
