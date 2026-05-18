import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { ReportService } from '../../services/report.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="docs-page">
      <div class="page-header">
        <h1>📄 Medical Document Analysis</h1>
        <p>Upload medical reports, lab results, or health records for AI-powered analysis</p>
      </div>

      <!-- Upload Zone -->
      <div class="upload-section">
        <div
          class="drop-zone"
          [class.drag-over]="isDragOver"
          [class.has-file]="selectedFile"
          (dragover)="onDragOver($event)"
          (dragleave)="isDragOver = false"
          (drop)="onDrop($event)"
          (click)="fileInput.click()"
        >
          <input #fileInput type="file" hidden accept=".pdf,.txt,.docx,.doc" (change)="onFileSelect($event)">
          <div class="drop-content" *ngIf="!selectedFile">
            <div class="drop-icon">📤</div>
            <h3>Drop your medical document here</h3>
            <p>or click to browse files</p>
            <div class="supported-types">
              <span class="type-badge">PDF</span>
              <span class="type-badge">TXT</span>
              <span class="type-badge">DOCX</span>
              <span class="type-badge">DOC</span>
            </div>
            <p class="size-limit">Maximum file size: 50MB</p>
          </div>
          <div class="file-preview" *ngIf="selectedFile">
            <div class="file-icon">{{ getFileIcon(selectedFile.name) }}</div>
            <div class="file-info">
              <div class="file-name">{{ selectedFile.name }}</div>
              <div class="file-size">{{ formatSize(selectedFile.size) }}</div>
            </div>
            <button class="remove-file" (click)="removeFile($event)">✕</button>
          </div>
        </div>

        <div class="upload-actions" *ngIf="selectedFile">
          <button class="upload-btn" (click)="uploadDocument()" [disabled]="uploading">
            <span *ngIf="!uploading">🚀 Upload & Analyze</span>
            <span *ngIf="uploading">⟳ Uploading...</span>
          </button>
          <div class="upload-info">
            AI will extract text, analyze content, and generate health suggestions
          </div>
        </div>

        <div class="upload-progress" *ngIf="uploading">
          <div class="progress-bar">
            <div class="progress-fill" [style.width]="uploadProgress + '%'"></div>
          </div>
          <div class="progress-label">{{ progressLabel }}</div>
        </div>

        <div class="alert success" *ngIf="successMsg">✅ {{ successMsg }}</div>
        <div class="alert error" *ngIf="errorMsg">❌ {{ errorMsg }}</div>
      </div>

      <!-- Documents List -->
      <div class="docs-section">
        <div class="section-header">
          <h2>📁 Your Documents</h2>
          <button class="refresh-btn" (click)="loadDocuments()">🔄 Refresh</button>
        </div>

        <div class="docs-empty" *ngIf="documents.length === 0 && !loadingDocs">
          <div class="empty-icon">📂</div>
          <p>No documents uploaded yet</p>
          <p class="empty-sub">Upload a medical document to get AI-powered analysis</p>
        </div>

        <div class="loading-docs" *ngIf="loadingDocs">
          <div class="loader">Loading documents...</div>
        </div>

        <div class="docs-grid">
          <div class="doc-card" *ngFor="let doc of documents">
            <div class="doc-header">
              <div class="doc-icon">{{ getFileIcon(doc.originalFilename) }}</div>
              <div class="doc-meta">
                <div class="doc-name">{{ doc.originalFilename }}</div>
                <div class="doc-date">{{ doc.uploadedAt | date:'MMM dd, yyyy HH:mm' }}</div>
              </div>
              <div class="doc-status" [class]="'status-' + doc.status?.toLowerCase()">
                {{ getStatusLabel(doc.status) }}
              </div>
            </div>

            <div class="doc-size">{{ formatSize(doc.fileSize) }} • {{ doc.fileType }}</div>

            <!-- Analysis Results -->
            <div class="doc-analysis" *ngIf="doc.status === 'ANALYZED' && expandedDoc === doc.id">
              <div class="analysis-section" *ngIf="doc.analysisResult">
                <div class="analysis-title">🔬 AI Analysis</div>
                <div class="analysis-text">{{ doc.analysisResult | slice:0:600 }}{{ doc.analysisResult?.length > 600 ? '...' : '' }}</div>
              </div>
              <div class="analysis-section" *ngIf="doc.suggestions">
                <div class="analysis-title">💡 Health Suggestions</div>
                <div class="analysis-text">{{ doc.suggestions | slice:0:400 }}{{ doc.suggestions?.length > 400 ? '...' : '' }}</div>
              </div>
            </div>

            <div class="doc-actions">
              <button class="action-btn view-btn" *ngIf="doc.status === 'ANALYZED'" (click)="toggleExpand(doc)">
                {{ expandedDoc === doc.id ? '🔼 Collapse' : '🔽 View Analysis' }}
              </button>
              <button class="action-btn report-btn" *ngIf="doc.status === 'ANALYZED'" (click)="generateReport(doc.id)">
                📊 Generate Report
              </button>
              <div class="analyzing-badge" *ngIf="doc.status === 'ANALYZING'">
                <span class="spin-icon">⟳</span> Analyzing...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .docs-page { padding: 32px; max-width: 1200px; margin: 0 auto; color: #e0e6f0; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 8px; }
    .page-header p { color: rgba(255,255,255,0.4); font-size: 15px; margin: 0; }

    /* Upload Zone */
    .upload-section { margin-bottom: 40px; }
    .drop-zone {
      border: 2px dashed rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 48px 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: rgba(255,255,255,0.02);
      margin-bottom: 16px;
    }
    .drop-zone:hover, .drop-zone.drag-over {
      border-color: rgba(0,200,255,0.5);
      background: rgba(0,200,255,0.04);
    }
    .drop-zone.has-file { border-style: solid; border-color: rgba(0,200,255,0.3); }
    .drop-icon { font-size: 48px; margin-bottom: 16px; }
    .drop-zone h3 { font-size: 20px; color: #fff; margin: 0 0 8px; }
    .drop-zone p { color: rgba(255,255,255,0.4); margin: 0 0 16px; }
    .supported-types { display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; }
    .type-badge {
      padding: 4px 12px;
      background: rgba(0,200,255,0.1);
      border: 1px solid rgba(0,200,255,0.2);
      border-radius: 20px;
      font-size: 12px;
      color: #00c8ff;
      font-weight: 600;
    }
    .size-limit { font-size: 12px !important; color: rgba(255,255,255,0.25) !important; }

    .file-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(0,200,255,0.06);
      border-radius: 10px;
      max-width: 400px;
      margin: 0 auto;
    }
    .file-icon { font-size: 36px; }
    .file-info { flex: 1; text-align: left; }
    .file-name { font-size: 14px; color: #fff; font-weight: 500; word-break: break-all; }
    .file-size { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; }
    .remove-file {
      background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.3);
      color: #ff6060; width: 28px; height: 28px; border-radius: 50%;
      cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;
    }

    .upload-actions { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .upload-btn {
      padding: 14px 32px;
      background: linear-gradient(135deg, #00c8ff, #0070ff);
      color: white; font-size: 15px; font-weight: 600;
      border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s;
    }
    .upload-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
    .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .upload-info { font-size: 13px; color: rgba(255,255,255,0.35); }

    .upload-progress { margin-bottom: 16px; }
    .progress-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #00c8ff, #00ff88); border-radius: 3px; transition: width 0.3s; }
    .progress-label { font-size: 13px; color: rgba(255,255,255,0.4); }

    .alert {
      padding: 12px 16px; border-radius: 10px; font-size: 14px; margin-bottom: 12px;
    }
    .alert.success { background: rgba(0,200,100,0.08); border: 1px solid rgba(0,200,100,0.2); color: #00cc88; }
    .alert.error { background: rgba(255,60,60,0.08); border: 1px solid rgba(255,60,60,0.2); color: #ff6060; }

    /* Docs grid */
    .docs-section { }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-header h2 { font-size: 20px; font-weight: 700; color: #fff; margin: 0; }
    .refresh-btn {
      padding: 7px 14px; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
      color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer;
    }

    .docs-empty { text-align: center; padding: 48px 20px; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .docs-empty p { color: rgba(255,255,255,0.4); margin: 0 0 6px; font-size: 16px; }
    .empty-sub { font-size: 13px !important; color: rgba(255,255,255,0.25) !important; }
    .loading-docs { text-align: center; padding: 32px; color: rgba(255,255,255,0.4); }

    .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
    .doc-card {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px; padding: 20px; transition: border-color 0.2s;
    }
    .doc-card:hover { border-color: rgba(255,255,255,0.15); }
    .doc-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
    .doc-icon { font-size: 28px; flex-shrink: 0; }
    .doc-meta { flex: 1; min-width: 0; }
    .doc-name { font-size: 14px; color: #fff; font-weight: 500; word-break: break-all; margin-bottom: 4px; }
    .doc-date { font-size: 12px; color: rgba(255,255,255,0.3); }
    .doc-status { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .status-uploaded { background: rgba(100,100,255,0.1); color: #8888ff; border: 1px solid rgba(100,100,255,0.2); }
    .status-analyzing { background: rgba(255,180,0,0.1); color: #ffcc00; border: 1px solid rgba(255,180,0,0.2); }
    .status-analyzed { background: rgba(0,200,100,0.1); color: #00cc88; border: 1px solid rgba(0,200,100,0.2); }
    .status-failed { background: rgba(255,60,60,0.1); color: #ff6060; border: 1px solid rgba(255,60,60,0.2); }
    .doc-size { font-size: 12px; color: rgba(255,255,255,0.25); margin-bottom: 14px; }

    .doc-analysis { background: rgba(0,0,0,0.2); border-radius: 10px; padding: 14px; margin-bottom: 14px; }
    .analysis-section { margin-bottom: 12px; }
    .analysis-title { font-size: 12px; font-weight: 600; color: #00c8ff; margin-bottom: 6px; }
    .analysis-text { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.6; }

    .doc-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .action-btn {
      padding: 7px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; border: 1px solid;
      transition: all 0.2s; font-weight: 500;
    }
    .view-btn { background: rgba(0,200,255,0.06); border-color: rgba(0,200,255,0.2); color: #00c8ff; }
    .view-btn:hover { background: rgba(0,200,255,0.12); }
    .report-btn { background: rgba(0,200,100,0.06); border-color: rgba(0,200,100,0.2); color: #00cc88; }
    .report-btn:hover { background: rgba(0,200,100,0.12); }
    .analyzing-badge { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #ffcc00; }
    .spin-icon { display: inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class DocumentUploadComponent implements OnInit {
  documents: any[] = [];
  selectedFile: File | null = null;
  isDragOver = false;
  uploading = false;
  loadingDocs = false;
  uploadProgress = 0;
  progressLabel = '';
  successMsg = '';
  errorMsg = '';
  expandedDoc: number | null = null;
  private pollingSubscriptions: Map<number, Subscription> = new Map();

  constructor(
    private documentService: DocumentService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loadingDocs = true;
    this.documentService.getDocuments().subscribe({
      next: (docs) => {
        this.documents = docs;
        this.loadingDocs = false;
        // Poll status for analyzing docs
        docs.filter(d => d.status === 'ANALYZING').forEach(d => this.pollStatus(d.id));
      },
      error: () => { this.loadingDocs = false; }
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.selectedFile = file;
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
  }

  uploadDocument() {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.uploadProgress = 10;
    this.progressLabel = 'Uploading document...';
    this.successMsg = '';
    this.errorMsg = '';

    const progress = setInterval(() => {
      if (this.uploadProgress < 70) this.uploadProgress += 15;
    }, 500);

    this.documentService.uploadDocument(this.selectedFile).subscribe({
      next: (res) => {
        clearInterval(progress);
        this.uploadProgress = 100;
        this.progressLabel = 'Upload complete! AI analysis started...';
        this.successMsg = `Document uploaded! AI is analyzing "${res.filename}". This may take 30-60 seconds.`;
        this.selectedFile = null;
        this.uploading = false;
        this.loadDocuments();
        this.pollStatus(res.id);
        setTimeout(() => { this.successMsg = ''; this.uploadProgress = 0; }, 8000);
      },
      error: (err) => {
        clearInterval(progress);
        this.errorMsg = err.error?.error || 'Upload failed. Please ensure the backend is running.';
        this.uploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  pollStatus(docId: number) {
    if (this.pollingSubscriptions.has(docId)) return;
    const sub = interval(5000).subscribe(() => {
      this.documentService.getDocumentStatus(docId).subscribe({
        next: (status) => {
          if (status.status === 'ANALYZED' || status.status === 'FAILED') {
            sub.unsubscribe();
            this.pollingSubscriptions.delete(docId);
            this.loadDocuments();
          }
        }
      });
    });
    this.pollingSubscriptions.set(docId, sub);
  }

  generateReport(docId: number) {
    this.reportService.generateReport(docId).subscribe({
      next: () => {
        this.successMsg = 'Report generated! Go to Reports section to download.';
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Failed to generate report.';
        setTimeout(() => this.errorMsg = '', 4000);
      }
    });
  }

  toggleExpand(doc: any) {
    if (this.expandedDoc === doc.id) {
      this.expandedDoc = null;
    } else {
      this.expandedDoc = doc.id;
      if (!doc.analysisResult) {
        this.documentService.getDocument(doc.id).subscribe(full => {
          const idx = this.documents.findIndex(d => d.id === doc.id);
          if (idx !== -1) this.documents[idx] = full;
        });
      }
    }
  }

  getFileIcon(filename: string): string {
    if (!filename) return '📄';
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'docx' || ext === 'doc') return '📘';
    if (ext === 'txt') return '📝';
    return '📄';
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getStatusLabel(status: string): string {
    const labels: any = { UPLOADED: '⏳ Uploaded', ANALYZING: '🔄 Analyzing', ANALYZED: '✅ Analyzed', FAILED: '❌ Failed' };
    return labels[status] || status;
  }
}
