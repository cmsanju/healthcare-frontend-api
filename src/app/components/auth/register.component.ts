import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-left">
        <div class="hero-content">
          <div class="hero-icon">🏥</div>
          <h1>HealthAI</h1>
          <p>Join thousands of patients using AI for better health</p>
          <div class="benefits">
            <div class="benefit">✅ AI-powered medical document analysis</div>
            <div class="benefit">✅ 24/7 intelligent health assistant</div>
            <div class="benefit">✅ Personalized health recommendations</div>
            <div class="benefit">✅ Secure PDF & DOCX report downloads</div>
          </div>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Create Account</h2>
            <p>Start your AI health journey today</p>
          </div>
          <form (ngSubmit)="register()">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" [(ngModel)]="fullName" name="fullName" 
                       placeholder="John Doe" class="form-input">
              </div>
              <div class="form-group">
                <label>Username *</label>
                <input type="text" [(ngModel)]="username" name="username" 
                       placeholder="johndoe" required class="form-input">
              </div>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="email" name="email" 
                     placeholder="john@example.com" required class="form-input">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Password *</label>
                <input type="password" [(ngModel)]="password" name="password" 
                       placeholder="Min 6 characters" required class="form-input">
              </div>
              <div class="form-group">
                <label>Confirm Password *</label>
                <input type="password" [(ngModel)]="confirmPassword" name="confirm" 
                       placeholder="Repeat password" required class="form-input">
              </div>
            </div>
            <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
            <button type="submit" class="submit-btn" [disabled]="loading">
              <span *ngIf="!loading">Create Account</span>
              <span *ngIf="loading">Creating...</span>
            </button>
          </form>
          <div class="auth-footer">
            Already have an account? <a routerLink="/login">Sign In</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; min-height: 100vh; background: #0a0e1a; }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #081428 0%, #0a2040 50%, #0d1628 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }
    .hero-content { color: white; max-width: 400px; }
    .hero-icon { font-size: 56px; margin-bottom: 16px; }
    .hero-content h1 {
      font-size: 48px; font-weight: 900;
      background: linear-gradient(135deg, #00c8ff, #00ff88);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin: 0 0 8px;
    }
    .hero-content > p { font-size: 16px; color: rgba(255,255,255,0.5); margin-bottom: 32px; }
    .benefits { display: flex; flex-direction: column; gap: 12px; }
    .benefit { color: rgba(255,255,255,0.7); font-size: 14px; }
    .auth-right {
      width: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: #0d1117;
    }
    .auth-card { width: 100%; }
    .auth-header { margin-bottom: 28px; }
    .auth-header h2 { font-size: 28px; font-weight: 700; color: #fff; margin: 0 0 8px; }
    .auth-header p { color: rgba(255,255,255,0.4); font-size: 15px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
    .form-input {
      width: 100%; padding: 12px 14px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; color: #fff; font-size: 14px; outline: none;
      transition: all 0.2s; box-sizing: border-box;
    }
    .form-input:focus { border-color: #00c8ff; }
    .error-msg {
      background: rgba(255,60,60,0.1); border: 1px solid rgba(255,60,60,0.3);
      color: #ff6060; padding: 10px 14px; border-radius: 8px; font-size: 14px; margin-bottom: 16px;
    }
    .submit-btn {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, #00c8ff, #0070ff);
      color: white; font-size: 16px; font-weight: 600; border: none;
      border-radius: 10px; cursor: pointer; margin-bottom: 16px;
      transition: all 0.2s;
    }
    .submit-btn:hover { opacity: 0.9; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-footer { text-align: center; color: rgba(255,255,255,0.4); font-size: 14px; }
    .auth-footer a { color: #00c8ff; text-decoration: none; }
  `]
})
export class RegisterComponent {
  fullName = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (!this.username || !this.email || !this.password) { this.errorMsg = 'Please fill required fields'; return; }
    if (this.password !== this.confirmPassword) { this.errorMsg = 'Passwords do not match'; return; }
    if (this.password.length < 6) { this.errorMsg = 'Password must be at least 6 characters'; return; }

    this.loading = true;
    this.errorMsg = '';
    this.authService.register({ username: this.username, email: this.email, password: this.password, fullName: this.fullName }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg = err.error?.error || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
