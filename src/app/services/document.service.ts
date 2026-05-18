import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = 'https://healthcare-backend-uejq.onrender.com/api/documents';

  constructor(private http: HttpClient) {}

  uploadDocument(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getDocuments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDocument(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getDocumentStatus(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/status`);
  }
}
