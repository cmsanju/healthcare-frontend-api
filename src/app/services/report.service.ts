import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = 'https://healthcare-backend-uejq.onrender.com/api/reports';

  constructor(private http: HttpClient) {}

  generateReport(documentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate/${documentId}`, {});
  }

  getReports(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  downloadPDF(reportId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${reportId}/download/pdf`, { responseType: 'blob' });
  }

  downloadDOCX(reportId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${reportId}/download/docx`, { responseType: 'blob' });
  }
}
