import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

interface Message {
  role: 'USER' | 'ASSISTANT';
  content: string;
  agentType?: string;
  timestamp: Date;
  loading?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-page">
      <!-- Sidebar -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h3>💬 Chat Sessions</h3>
          <button class="new-chat-btn" (click)="newSession()">+ New Chat</button>
        </div>
        <div class="agent-info">
          <div class="agent-card" *ngFor="let agent of agentTypes">
            <span class="agent-dot" [style.background]="agent.color"></span>
            <div>
              <div class="agent-name">{{ agent.name }}</div>
              <div class="agent-skill">{{ agent.skill }}</div>
            </div>
          </div>
        </div>
        <div class="quick-prompts">
          <div class="prompts-title">Quick Prompts</div>
          <button class="prompt-btn" *ngFor="let prompt of quickPrompts" (click)="usePrompt(prompt)">
            {{ prompt }}
          </button>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="chat-main">
        <div class="chat-header">
          <div class="chat-title">
            <span class="chat-icon">🏥</span>
            <div>
              <div class="title-text">HealthAI Assistant</div>
              <div class="title-sub">Multi-Agent AI | Session: {{ sessionId.substring(0,8) }}...</div>
            </div>
          </div>
          <div class="chat-actions">
            <span class="active-agent" *ngIf="lastAgentType">
              Agent: {{ formatAgentType(lastAgentType) }}
            </span>
            <button class="clear-btn" (click)="clearChat()">🗑️ Clear</button>
          </div>
        </div>

        <div class="messages-container" #messagesContainer>
          <!-- Welcome -->
          <div class="welcome-msg" *ngIf="messages.length === 0">
            <div class="welcome-icon">🤖</div>
            <h2>Hello! I'm HealthAI</h2>
            <p>Your intelligent multi-agent healthcare assistant powered by Gemini AI.</p>
            <div class="welcome-capabilities">
              <div class="cap-item">🩺 Medical Questions</div>
              <div class="cap-item">📋 Symptom Analysis</div>
              <div class="cap-item">💊 Medication Info</div>
              <div class="cap-item">🏃 Wellness Tips</div>
              <div class="cap-item">🍎 Nutrition Advice</div>
              <div class="cap-item">🚨 Emergency Guidance</div>
            </div>
            <p class="disclaimer">⚠️ Always consult a qualified healthcare professional for medical decisions.</p>
          </div>

          <!-- Messages -->
          <div class="message-wrapper" *ngFor="let msg of messages" [class.user]="msg.role === 'USER'" [class.assistant]="msg.role === 'ASSISTANT'">
            <div class="message-avatar">
              <span *ngIf="msg.role === 'USER'">👤</span>
              <span *ngIf="msg.role === 'ASSISTANT'">🤖</span>
            </div>
            <div class="message-bubble">
              <div class="message-meta" *ngIf="msg.role === 'ASSISTANT'">
                <span class="agent-badge" [class]="getAgentClass(msg.agentType)">
                  {{ formatAgentType(msg.agentType) }}
                </span>
                <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
              </div>
              <div class="message-content" *ngIf="!msg.loading" [innerHTML]="formatMessage(msg.content)"></div>
              <div class="typing-indicator" *ngIf="msg.loading">
                <span></span><span></span><span></span>
              </div>
              <div class="msg-time user-time" *ngIf="msg.role === 'USER'">{{ msg.timestamp | date:'HH:mm' }}</div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-area">
          <div class="input-wrapper">
            <textarea
              [(ngModel)]="userInput"
              placeholder="Ask anything about your health... (Press Enter to send, Shift+Enter for new line)"
              class="message-input"
              (keydown)="handleKeydown($event)"
              [disabled]="loading"
              rows="1"
              #inputArea
            ></textarea>
            <button class="send-btn" (click)="sendMessage()" [disabled]="!userInput.trim() || loading">
              <span *ngIf="!loading">➤</span>
              <span *ngIf="loading" class="spin">⟳</span>
            </button>
          </div>
          <div class="input-footer">
            <span>HealthAI uses Gemini 2.5 Flash Lite • RAG • Multi-Agent System</span>
            <span>{{ userInput.length }}/2000</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-page {
      display: flex;
      height: calc(100vh - 64px);
      background: #0a0e1a;
      color: #e0e6f0;
    }

    /* Sidebar */
    .chat-sidebar {
      width: 280px;
      border-right: 1px solid rgba(255,255,255,0.06);
      display: flex;
      flex-direction: column;
      background: #0d1117;
      overflow-y: auto;
    }
    .sidebar-header {
      padding: 20px 16px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sidebar-header h3 { margin: 0; font-size: 15px; color: #fff; font-weight: 600; }
    .new-chat-btn {
      padding: 6px 12px;
      background: linear-gradient(135deg, #00c8ff22, #0070ff22);
      border: 1px solid rgba(0,200,255,0.3);
      border-radius: 6px;
      color: #00c8ff;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .new-chat-btn:hover { background: rgba(0,200,255,0.15); }

    .agent-info { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .agent-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
    }
    .agent-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .agent-name { font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500; }
    .agent-skill { font-size: 11px; color: rgba(255,255,255,0.3); }

    .quick-prompts { padding: 16px; }
    .prompts-title { font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .prompt-btn {
      display: block;
      width: 100%;
      text-align: left;
      padding: 8px 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      cursor: pointer;
      margin-bottom: 6px;
      transition: all 0.2s;
    }
    .prompt-btn:hover { background: rgba(0,200,255,0.05); color: rgba(255,255,255,0.8); border-color: rgba(0,200,255,0.2); }

    /* Chat main */
    .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .chat-header {
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255,255,255,0.01);
    }
    .chat-title { display: flex; align-items: center; gap: 12px; }
    .chat-icon { font-size: 28px; }
    .title-text { font-size: 16px; font-weight: 700; color: #fff; }
    .title-sub { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 2px; }
    .chat-actions { display: flex; align-items: center; gap: 12px; }
    .active-agent {
      padding: 4px 10px;
      background: rgba(0,200,255,0.08);
      border: 1px solid rgba(0,200,255,0.2);
      border-radius: 12px;
      font-size: 12px;
      color: #00c8ff;
    }
    .clear-btn {
      padding: 6px 12px;
      background: rgba(255,80,80,0.06);
      border: 1px solid rgba(255,80,80,0.2);
      border-radius: 6px;
      color: #ff6060;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .clear-btn:hover { background: rgba(255,80,80,0.12); }

    /* Messages */
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      scroll-behavior: smooth;
    }

    .welcome-msg {
      text-align: center;
      padding: 40px 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .welcome-icon { font-size: 56px; margin-bottom: 16px; }
    .welcome-msg h2 { font-size: 28px; font-weight: 700; color: #fff; margin: 0 0 12px; }
    .welcome-msg p { color: rgba(255,255,255,0.5); font-size: 15px; margin-bottom: 24px; }
    .welcome-capabilities {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-bottom: 24px;
    }
    .cap-item {
      padding: 8px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      font-size: 13px;
      color: rgba(255,255,255,0.6);
    }
    .disclaimer {
      font-size: 12px !important;
      color: rgba(255,200,0,0.6) !important;
      background: rgba(255,200,0,0.05);
      border: 1px solid rgba(255,200,0,0.15);
      border-radius: 8px;
      padding: 10px 14px;
      margin: 0 !important;
    }

    .message-wrapper {
      display: flex;
      gap: 12px;
      max-width: 85%;
      align-items: flex-start;
    }
    .message-wrapper.user { margin-left: auto; flex-direction: row-reverse; }
    .message-wrapper.assistant { margin-right: auto; }

    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
    }

    .message-bubble {
      flex: 1;
      min-width: 0;
    }
    .message-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .agent-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-emergency { background: rgba(255,50,50,0.15); color: #ff6060; border: 1px solid rgba(255,50,50,0.3); }
    .badge-diagnostic { background: rgba(100,100,255,0.15); color: #8888ff; border: 1px solid rgba(100,100,255,0.3); }
    .badge-prescription { background: rgba(0,200,100,0.15); color: #00cc88; border: 1px solid rgba(0,200,100,0.3); }
    .badge-wellness { background: rgba(255,180,0,0.15); color: #ffcc00; border: 1px solid rgba(255,180,0,0.3); }
    .badge-nutrition { background: rgba(0,200,255,0.15); color: #00c8ff; border: 1px solid rgba(0,200,255,0.3); }
    .badge-general { background: rgba(160,160,160,0.15); color: #aaa; border: 1px solid rgba(160,160,160,0.3); }

    .msg-time { font-size: 11px; color: rgba(255,255,255,0.25); }
    .user-time { text-align: right; margin-top: 4px; font-size: 11px; color: rgba(255,255,255,0.25); }

    .message-content {
      padding: 14px 18px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.7;
      word-break: break-word;
    }
    .message-wrapper.user .message-content {
      background: linear-gradient(135deg, rgba(0,120,255,0.2), rgba(0,200,255,0.15));
      border: 1px solid rgba(0,200,255,0.2);
      color: #e0f0ff;
      border-radius: 16px 16px 4px 16px;
    }
    .message-wrapper.assistant .message-content {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: #d0dce8;
      border-radius: 16px 16px 16px 4px;
    }

    .message-content :global(strong) { color: #fff; }
    .message-content :global(h3) { color: #00c8ff; font-size: 15px; margin: 12px 0 6px; }
    .message-content :global(ul) { padding-left: 20px; margin: 8px 0; }
    .message-content :global(li) { margin-bottom: 4px; }
    .message-content :global(code) {
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 14px 18px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px 16px 16px 4px;
      width: fit-content;
    }
    .typing-indicator span {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: rgba(0,200,255,0.6);
      animation: bounce 1.4s infinite;
    }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
      40% { transform: translateY(-8px); opacity: 1; }
    }

    /* Input */
    .input-area {
      padding: 16px 24px 20px;
      border-top: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.01);
    }
    .input-wrapper {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 4px 4px 4px 16px;
      transition: border-color 0.2s;
    }
    .input-wrapper:focus-within { border-color: rgba(0,200,255,0.3); }
    .message-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #e0e6f0;
      font-size: 15px;
      resize: none;
      min-height: 24px;
      max-height: 160px;
      padding: 12px 0;
      font-family: inherit;
      line-height: 1.5;
    }
    .message-input::placeholder { color: rgba(255,255,255,0.25); }
    .send-btn {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: linear-gradient(135deg, #00c8ff, #0070ff);
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
      align-self: flex-end;
      margin-bottom: 4px;
    }
    .send-btn:hover:not(:disabled) { transform: scale(1.05); }
    .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .spin { display: inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .input-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 11px;
      color: rgba(255,255,255,0.2);
      padding: 0 4px;
    }
  `]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('inputArea') inputArea!: ElementRef;

  messages: Message[] = [];
  userInput = '';
  loading = false;
  sessionId = '';
  lastAgentType = '';
  private shouldScroll = false;

  agentTypes = [
    { name: 'General Health Agent', skill: 'General health queries', color: '#aaaaaa' },
    { name: 'Diagnostic Agent', skill: 'Symptoms & lab results', color: '#8888ff' },
    { name: 'Prescription Agent', skill: 'Medications & drugs', color: '#00cc88' },
    { name: 'Wellness Agent', skill: 'Lifestyle & fitness', color: '#ffcc00' },
    { name: 'Emergency Agent', skill: 'Urgent medical cases', color: '#ff4444' }
  ];

  quickPrompts = [
    'What are common symptoms of diabetes?',
    'How to lower blood pressure naturally?',
    'Explain my cholesterol report',
    'What should I eat for heart health?',
    'Signs of vitamin D deficiency',
    'How to improve sleep quality?'
  ];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.sessionId = this.generateSessionId();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  sendMessage() {
    if (!this.userInput.trim() || this.loading) return;

    const query = this.userInput.trim();
    this.userInput = '';

    // Add user message
    this.messages.push({ role: 'USER', content: query, timestamp: new Date() });

    // Add loading indicator
    const loadingMsg: Message = { role: 'ASSISTANT', content: '', timestamp: new Date(), loading: true };
    this.messages.push(loadingMsg);
    this.loading = true;
    this.shouldScroll = true;

    this.chatService.sendMessage(query, this.sessionId).subscribe({
      next: (res) => {
        const idx = this.messages.indexOf(loadingMsg);
        if (idx !== -1) {
          this.messages[idx] = {
            role: 'ASSISTANT',
            content: res.message,
            agentType: res.agentType,
            timestamp: new Date()
          };
        }
        this.lastAgentType = res.agentType;
        this.loading = false;
        this.shouldScroll = true;
      },
      error: (err) => {
        const idx = this.messages.indexOf(loadingMsg);
        if (idx !== -1) {
          this.messages[idx] = {
            role: 'ASSISTANT',
            content: 'I apologize, I encountered an error. Please check that the backend server is running on port 8080.',
            timestamp: new Date()
          };
        }
        this.loading = false;
        this.shouldScroll = true;
      }
    });
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  usePrompt(prompt: string) {
    this.userInput = prompt;
    this.sendMessage();
  }

  clearChat() {
    this.messages = [];
    this.chatService.clearSession(this.sessionId).subscribe();
    this.sessionId = this.generateSessionId();
    this.lastAgentType = '';
  }

  newSession() {
    this.clearChat();
  }

  formatMessage(content: string): string {
    if (!content) return '';
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
      .replace(/## (.*?)(\n|$)/g, '<h3>$1</h3>')
      .replace(/# (.*?)(\n|$)/g, '<h3>$1</h3>')
      .replace(/\n- /g, '\n• ')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  formatAgentType(agentType?: string): string {
    if (!agentType) return 'HealthAI';
    return agentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getAgentClass(agentType?: string): string {
    if (!agentType) return 'badge-general';
    const t = agentType.toLowerCase();
    if (t.includes('emergency')) return 'badge-emergency';
    if (t.includes('diagnostic')) return 'badge-diagnostic';
    if (t.includes('prescription')) return 'badge-prescription';
    if (t.includes('wellness')) return 'badge-wellness';
    if (t.includes('nutrition')) return 'badge-nutrition';
    return 'badge-general';
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
