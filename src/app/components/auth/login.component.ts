import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-left">
        <div class="hero-content">
          <div class="hero-icon">🏥</div>
          <h1>HealthAI</h1>
          <p>Agentic AI Healthcare System</p>
          <div class="features">
            <div class="feature">🤖 Multi-Agent AI System</div>
            <div class="feature">📄 Medical Document Analysis</div>
            <div class="feature">💬 Intelligent Health Chatbot</div>
            <div class="feature">📊 AI-Powered Reports</div>
            <div class="feature">🔒 Secure & Private</div>
          </div>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your HealthAI account</p>
          </div>
          <form (ngSubmit)="login()" #loginForm="ngForm">
            <div class="form-group">
              <label>Username</label>
              <input type="text" [(ngModel)]="username" name="username" 
                     placeholder="Enter your username" required class="form-input">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="password" name="password" 
                     placeholder="Enter your password" required class="form-input">
            </div>
            <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
            <button type="submit" class="submit-btn" [disabled]="loading">
              <span *ngIf="!loading">Sign In</span>
              <span *ngIf="loading" class="loading-spin">⟳</span>
            </button>
          </form>
          <div class="demo-hint">
            <strong>Demo:</strong> Register a new account to get started
          </div>
          <div class="auth-footer">
            Don't have an account? <a routerLink="/register">Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      min-height: 100vh;
      background: #0a0e1a;
    }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #0a1628 0%, #0d2040 50%, #081428 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      position: relative;
      overflow: hidden;
    }
    .auth-left::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 50%, rgba(0,200,255,0.05) 0%, transparent 60%),
                  radial-gradient(circle at 70% 50%, rgba(0,100,255,0.05) 0%, transparent 60%);
    }
    .hero-content { position: relative; color: white; max-width: 400px; }
    .hero-icon { font-size: 56px; margin-bottom: 16px; }
    .hero-content h1 {
      font-size: 48px;
      font-weight: 900;
      background: linear-gradient(135deg, #00c8ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 8px;
    }
    .hero-content > p { font-size: 18px; color: rgba(255,255,255,0.5); margin-bottom: 40px; }
    .features { display: flex; flex-direction: column; gap: 12px; }
    .feature {
      padding: 12px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      font-size: 14px;
      color: rgba(255,255,255,0.7);
    }
    .auth-right {
      width: 440px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: #0d1117;
    }
    .auth-card { width: 100%; }
    .auth-header { margin-bottom: 32px; }
    .auth-header h2 { font-size: 28px; font-weight: 700; color: #fff; margin: 0 0 8px; }
    .auth-header p { color: rgba(255,255,255,0.4); font-size: 15px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 8px; font-weight: 500; }
    .form-input {
      width: 100%;
      padding: 14px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: #fff;
      font-size: 15px;
      outline: none;
      transition: all 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus { border-color: #00c8ff; background: rgba(0,200,255,0.04); }
    .error-msg {
      background: rgba(255,60,60,0.1);
      border: 1px solid rgba(255,60,60,0.3);
      color: #ff6060;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .submit-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #00c8ff, #0070ff);
      color: white;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 16px;
    }
    .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .loading-spin { display: inline-block; animation: spin 1s linear infinite; font-size: 20px; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .demo-hint {
      background: rgba(0,200,100,0.08);
      border: 1px solid rgba(0,200,100,0.2);
      color: rgba(0,200,100,0.8);
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 20px;
    }
    .auth-footer { text-align: center; color: rgba(255,255,255,0.4); font-size: 14px; }
    .auth-footer a { color: #00c8ff; text-decoration: none; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (!this.username || !this.password) { this.errorMsg = 'Please fill all fields'; return; }
    this.loading = true;
    this.errorMsg = '';
    this.authService.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg = err.error?.error || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
