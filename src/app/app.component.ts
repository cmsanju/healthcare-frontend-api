import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="app-wrapper">
      <nav class="navbar" *ngIf="isLoggedIn">
        <div class="nav-brand">
          <span class="brand-icon">🏥</span>
          <span class="brand-text">HealthAI</span>
          <span class="brand-sub">Agentic Healthcare</span>
        </div>
        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a routerLink="/chat" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">💬</span> AI Chat
          </a>
          <a routerLink="/documents" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">📄</span> Documents
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">📋</span> Reports
          </a>
        </div>
        <div class="nav-user">
          <span class="user-avatar">{{ userInitial }}</span>
          <span class="user-name">{{ username }}</span>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #0a0e1a;
      color: #e0e6f0;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    .app-wrapper { display: flex; flex-direction: column; min-height: 100vh; }
    .navbar {
      display: flex;
      align-items: center;
      padding: 0 24px;
      height: 64px;
      background: rgba(15, 20, 40, 0.95);
      border-bottom: 1px solid rgba(0, 200, 255, 0.15);
      backdrop-filter: blur(20px);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-right: 40px;
    }
    .brand-icon { font-size: 24px; }
    .brand-text {
      font-size: 20px;
      font-weight: 800;
      background: linear-gradient(135deg, #00c8ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .nav-links { display: flex; gap: 4px; flex: 1; }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .nav-link:hover { background: rgba(255,255,255,0.05); color: #fff; }
    .nav-link.active {
      background: rgba(0, 200, 255, 0.1);
      color: #00c8ff;
      border: 1px solid rgba(0, 200, 255, 0.2);
    }
    .nav-icon { font-size: 16px; }
    .nav-user { display: flex; align-items: center; gap: 12px; margin-left: auto; }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00c8ff, #0070ff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }
    .user-name { font-size: 14px; color: rgba(255,255,255,0.7); }
    .logout-btn {
      padding: 6px 14px;
      border-radius: 6px;
      border: 1px solid rgba(255,80,80,0.3);
      background: rgba(255,80,80,0.05);
      color: #ff6060;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }
    .logout-btn:hover { background: rgba(255,80,80,0.15); }
    .main-content { flex: 1; overflow: auto; }
  `]
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  userInitial = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(auth => {
      this.isLoggedIn = auth;
      if (auth) {
        this.username = this.authService.getUsername();
        this.userInitial = this.username.charAt(0).toUpperCase();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
