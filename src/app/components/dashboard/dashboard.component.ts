import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <div class="header-left">
          <h1>Welcome back, <span class="highlight">{{ fullName }}</span> 👋</h1>
          <p class="subtitle">Your AI-powered health platform is ready</p>
        </div>
        <div class="header-right">
          <div class="system-status">
            <span class="status-dot"></span>
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <a routerLink="/chat" class="action-card primary">
          <div class="action-icon">💬</div>
          <div class="action-text">
            <div class="action-title">Start AI Chat</div>
            <div class="action-desc">Ask any health question</div>
          </div>
          <div class="action-arrow">→</div>
        </a>
        <a routerLink="/documents" class="action-card">
          <div class="action-icon">📤</div>
          <div class="action-text">
            <div class="action-title">Upload Document</div>
            <div class="action-desc">Analyze medical reports</div>
          </div>
          <div class="action-arrow">→</div>
        </a>
        <a routerLink="/reports" class="action-card">
          <div class="action-icon">📊</div>
          <div class="action-text">
            <div class="action-title">View Reports</div>
            <div class="action-desc">Download PDF/DOCX reports</div>
          </div>
          <div class="action-arrow">→</div>
        </a>
      </div>

      <!-- Architecture Overview -->
      <div class="architecture-section">
        <h2>🏗️ Multi-Agent Architecture</h2>
        <div class="arch-grid">
          <div class="arch-card" *ngFor="let agent of agents">
            <div class="arch-icon">{{ agent.icon }}</div>
            <div class="arch-name">{{ agent.name }}</div>
            <div class="arch-desc">{{ agent.desc }}</div>
            <div class="arch-status active">Active</div>
          </div>
        </div>
      </div>

      <!-- Technology Stack -->
      <div class="tech-section">
        <h2>⚙️ AI Technology Stack</h2>
        <div class="tech-grid">
          <div class="tech-badge" *ngFor="let tech of technologies">
            <span class="tech-icon">{{ tech.icon }}</span>
            <span>{{ tech.name }}</span>
          </div>
        </div>
      </div>

      <!-- Workflow -->
      <div class="workflow-section">
        <h2>🔄 AI Workflow Pipeline</h2>
        <div class="workflow-steps">
          <div class="workflow-step" *ngFor="let step of workflowSteps; let i = index">
            <div class="step-num">{{ i + 1 }}</div>
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-title">{{ step.title }}</div>
            <div class="step-desc">{{ step.desc }}</div>
            <div class="step-arrow" *ngIf="i < workflowSteps.length - 1">→</div>
          </div>
        </div>
      </div>

      <!-- Metrics -->
      <div class="metrics-section">
        <h2>📈 System Metrics</h2>
        <div class="metrics-grid">
          <div class="metric-card" *ngFor="let metric of metrics">
            <div class="metric-icon">{{ metric.icon }}</div>
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
      color: #e0e6f0;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }
    .dashboard-header h1 { font-size: 28px; font-weight: 700; color: #fff; margin: 0 0 8px; }
    .highlight { background: linear-gradient(135deg, #00c8ff, #00ff88); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: rgba(255,255,255,0.4); font-size: 15px; margin: 0; }
    .system-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(0,255,100,0.08);
      border: 1px solid rgba(0,255,100,0.2);
      border-radius: 20px;
      font-size: 13px;
      color: #00ff88;
    }
    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #00ff88;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    /* Quick Actions */
    .quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .action-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
    }
    .action-card:hover { border-color: rgba(0,200,255,0.3); background: rgba(0,200,255,0.04); transform: translateY(-2px); }
    .action-card.primary { background: rgba(0,200,255,0.06); border-color: rgba(0,200,255,0.2); }
    .action-icon { font-size: 32px; }
    .action-text { flex: 1; }
    .action-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px; }
    .action-desc { font-size: 13px; color: rgba(255,255,255,0.4); }
    .action-arrow { font-size: 20px; color: #00c8ff; }

    /* Architecture */
    .architecture-section, .tech-section, .workflow-section, .metrics-section { margin-bottom: 32px; }
    h2 { font-size: 20px; font-weight: 700; color: #fff; margin: 0 0 16px; }
    .arch-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .arch-card {
      padding: 20px 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      text-align: center;
    }
    .arch-icon { font-size: 28px; margin-bottom: 8px; }
    .arch-name { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 6px; }
    .arch-desc { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.4; margin-bottom: 10px; }
    .arch-status { font-size: 11px; padding: 3px 8px; border-radius: 10px; display: inline-block; }
    .arch-status.active { background: rgba(0,255,100,0.1); color: #00ff88; border: 1px solid rgba(0,255,100,0.2); }

    /* Tech stack */
    .tech-grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .tech-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      font-size: 13px;
      color: rgba(255,255,255,0.7);
    }
    .tech-icon { font-size: 16px; }

    /* Workflow */
    .workflow-steps { display: flex; align-items: center; gap: 8px; overflow-x: auto; padding-bottom: 8px; }
    .workflow-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      text-align: center;
      min-width: 140px;
      position: relative;
    }
    .step-num {
      width: 24px; height: 24px;
      background: linear-gradient(135deg, #00c8ff, #0070ff);
      border-radius: 50%;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .step-icon { font-size: 24px; margin-bottom: 8px; }
    .step-title { font-size: 12px; font-weight: 600; color: #fff; margin-bottom: 4px; }
    .step-desc { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.3; }
    .step-arrow { font-size: 20px; color: rgba(255,255,255,0.3); flex-shrink: 0; }

    /* Metrics */
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .metric-card {
      padding: 24px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      text-align: center;
    }
    .metric-icon { font-size: 28px; margin-bottom: 12px; }
    .metric-value {
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #00c8ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
    }
    .metric-label { font-size: 13px; color: rgba(255,255,255,0.4); }
  `]
})
export class DashboardComponent implements OnInit {
  fullName = '';

  agents = [
    { icon: '🤖', name: 'General Health Agent', desc: 'Handles general health queries with empathy' },
    { icon: '🔬', name: 'Diagnostic Agent', desc: 'Analyzes symptoms and test results' },
    { icon: '📄', name: 'Document Agent', desc: 'Processes medical documents with RAG' },
    { icon: '💊', name: 'Prescription Agent', desc: 'Medication info and interactions' },
    { icon: '🚨', name: 'Emergency Agent', desc: 'Detects and handles emergencies' }
  ];

  technologies = [
    { icon: '🤖', name: 'Gemini 2.5 Flash Lite' },
    { icon: '🔗', name: 'LangChain4j' },
    { icon: '📡', name: 'MCP Protocol' },
    { icon: '🔍', name: 'RAG Pipeline' },
    { icon: '🗃️', name: 'Vector Database' },
    { icon: '🧠', name: 'AI Memory' },
    { icon: '📊', name: 'Micrometer Observability' },
    { icon: '⚡', name: 'Event-Driven AI' },
    { icon: '🔒', name: 'JWT Security' },
    { icon: '🌿', name: 'Spring Boot 3.3' },
    { icon: '🅰️', name: 'Angular 17' },
    { icon: '🗄️', name: 'H2/MySQL' }
  ];

  workflowSteps = [
    { icon: '👤', title: 'User Input', desc: 'Query submitted via chat or document upload' },
    { icon: '🔒', title: 'Auth & Security', desc: 'JWT validation & rate limiting' },
    { icon: '🧭', title: 'Intent Router', desc: 'Agent orchestrator routes to specialist' },
    { icon: '🔍', title: 'RAG Retrieval', desc: 'Vector DB retrieves relevant context' },
    { icon: '🧠', title: 'Memory Load', desc: 'Conversation history loaded' },
    { icon: '🤖', title: 'Gemini AI', desc: 'Multi-turn reasoning with context' },
    { icon: '📊', title: 'Observability', desc: 'Metrics tracked & events published' },
    { icon: '📤', title: 'Response', desc: 'Structured response delivered' }
  ];

  metrics = [
    { icon: '🤖', value: '5', label: 'AI Agents Active' },
    { icon: '📚', value: '10+', label: 'Medical Knowledge Docs' },
    { icon: '🔧', value: '5', label: 'MCP Tools Available' },
    { icon: '⚡', value: '<3s', label: 'Avg Response Time' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.fullName = this.authService.getFullName() || this.authService.getUsername();
  }
}
