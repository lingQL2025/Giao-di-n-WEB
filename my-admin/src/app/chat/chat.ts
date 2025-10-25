import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface Conversation {
  id: number;
  name: string;
  initials: string;
  status: string;
  lastMessage: string;
  lastMessageTime: Date;
  starred: boolean;
  messages: Message[];
  selected?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  currentConversation: Conversation | null = null;
  messageText: string = '';
  searchQuery: string = '';
  filterStatus: string = 'unread';
  private shouldScroll = false;

  ngOnInit() {
    this.loadConversations();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadConversations() {
    const savedConversations = localStorage.getItem('chat_conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        this.conversations = parsed.map((conv: any) => ({
          ...conv,
          lastMessageTime: new Date(conv.lastMessageTime),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      } catch (e) {
        this.conversations = this.getSampleConversations();
      }
    } else {
      this.conversations = this.getSampleConversations();
      this.saveConversations();
    }

    this.filterConversations();
    if (this.conversations.length > 0) {
      this.selectConversation(this.conversations[0]);
    }
  }

  saveConversations() {
    const conversationsToSave = this.conversations.map(conv => ({
      ...conv,
      lastMessageTime: conv.lastMessageTime.toISOString(),
      messages: conv.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    }));
    localStorage.setItem('chat_conversations', JSON.stringify(conversationsToSave));
  }

  filterConversations() {
    this.filteredConversations = this.conversations.filter(conv => {
      const matchesSearch = conv.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          conv.lastMessage.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesSearch;
    });
  }

  selectConversation(conversation: Conversation) {
    this.currentConversation = conversation;
    this.shouldScroll = true;
  }

  sendMessage() {
    if (!this.messageText.trim() || !this.currentConversation) return;

    const newMessage: Message = {
      id: Date.now(),
      text: this.messageText.trim(),
      sender: 'agent',
      timestamp: new Date()
    };

    this.currentConversation.messages.push(newMessage);
    this.currentConversation.lastMessage = this.messageText.trim();
    this.currentConversation.lastMessageTime = new Date();
    
    // Move conversation to top
    const index = this.conversations.indexOf(this.currentConversation);
    if (index > 0) {
      this.conversations.splice(index, 1);
      this.conversations.unshift(this.currentConversation);
    }

    this.messageText = '';
    this.shouldScroll = true;
    this.saveConversations();
    this.filterConversations();

    // Simulate user response after 2 seconds
    setTimeout(() => {
      this.simulateUserResponse();
    }, 2000);
  }

  simulateUserResponse() {
    if (!this.currentConversation) return;

    const responses = [
      'Cảm ơn bạn!',
      'Được rồi, tôi hiểu.',
      'Bạn có thể giải thích thêm không?',
      'Tuyệt vời!',
      'OK, cảm ơn.',
      'Vâng, tôi đã rõ.',
      'Cảm ơn hỗ trợ!'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const userMessage: Message = {
      id: Date.now(),
      text: randomResponse,
      sender: 'user',
      timestamp: new Date()
    };

    this.currentConversation.messages.push(userMessage);
    this.currentConversation.lastMessage = randomResponse;
    this.currentConversation.lastMessageTime = new Date();
    
    this.shouldScroll = true;
    this.saveConversations();
  }

  handleEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleStar(conversation: Conversation, event: Event) {
    event.stopPropagation();
    conversation.starred = !conversation.starred;
    this.saveConversations();
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  getSampleConversations(): Conversation[] {
    const now = new Date();
    return [
      {
        id: 1,
        name: 'xxx',
        initials: 'X',
        status: 'Chưa có tài khoản',
        lastMessage: 'yyyyyyyyyyyyyyyy',
        lastMessageTime: new Date(now.getTime() - 300000),
        starred: false,
        messages: [
          {
            id: 1,
            text: 'Xin chào, tôi cần hỗ trợ về sản phẩm.',
            sender: 'user',
            timestamp: new Date(now.getTime() - 3600000)
          },
          {
            id: 2,
            text: 'Chào bạn! Tôi có thể giúp gì cho bạn?',
            sender: 'agent',
            timestamp: new Date(now.getTime() - 3500000)
          },
          {
            id: 3,
            text: 'yyyyyyyyyyyyyyyy',
            sender: 'user',
            timestamp: new Date(now.getTime() - 300000)
          }
        ]
      },
      {
        id: 2,
        name: 'xxx',
        initials: 'X',
        status: 'Chưa có tài khoản',
        lastMessage: 'yyyyyyyyyyyyyyyy',
        lastMessageTime: new Date(now.getTime() - 600000),
        starred: false,
        messages: [
          {
            id: 4,
            text: 'Sản phẩm có còn hàng không?',
            sender: 'user',
            timestamp: new Date(now.getTime() - 600000)
          }
        ]
      },
      {
        id: 3,
        name: 'xxx',
        initials: 'X',
        status: 'Chưa có tài khoản',
        lastMessage: 'yyyyyyyyyyyyyyyy',
        lastMessageTime: new Date(now.getTime() - 900000),
        starred: false,
        messages: [
          {
            id: 5,
            text: 'Làm sao để đổi trả hàng?',
            sender: 'user',
            timestamp: new Date(now.getTime() - 900000)
          }
        ]
      },
      {
        id: 4,
        name: 'xxx',
        initials: 'X',
        status: 'Chưa có tài khoản',
        lastMessage: 'yyyyyyyyyyyyyyyy',
        lastMessageTime: new Date(now.getTime() - 1200000),
        starred: false,
        messages: [
          {
            id: 6,
            text: 'Tôi muốn hủy đơn hàng.',
            sender: 'user',
            timestamp: new Date(now.getTime() - 1200000)
          }
        ]
      },
      {
        id: 5,
        name: 'xxx',
        initials: 'X',
        status: 'Chưa có tài khoản',
        lastMessage: 'yyyyyyyyyyyyyyyy',
        lastMessageTime: new Date(now.getTime() - 1500000),
        starred: false,
        messages: [
          {
            id: 7,
            text: 'Khuyến mãi có áp dụng cho tôi không?',
            sender: 'user',
            timestamp: new Date(now.getTime() - 1500000)
          }
        ]
      },
      {
        id: 6,
        name: 'xxx',
        initials: 'X',
        status: 'Chưa có tài khoản',
        lastMessage: 'yyyyyyyyyyyyyyyy',
        lastMessageTime: new Date(now.getTime() - 1800000),
        starred: false,
        messages: [
          {
            id: 8,
            text: 'Giao hàng mất bao lâu?',
            sender: 'user',
            timestamp: new Date(now.getTime() - 1800000)
          }
        ]
      },
      {
        id: 7,
        name: 'xxx',
        initials: 'X',
        status: 'Chưa có tài khoản',
        lastMessage: 'yyyyyyyyyyyyyyyy',
        lastMessageTime: new Date(now.getTime() - 2100000),
        starred: false,
        messages: [
          {
            id: 9,
            text: 'Có thể đổi màu sản phẩm không?',
            sender: 'user',
            timestamp: new Date(now.getTime() - 2100000)
          }
        ]
      }
    ];
  }
}