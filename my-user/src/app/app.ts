import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Promotion } from './promotion/promotion';  
import { Chat } from './chat/chat';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Promotion,Chat],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('my-user');
}
