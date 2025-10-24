import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app/app';
import { PromotionComponent } from './app/promotion/promotion';
import { ChatComponent } from './app/chat/chat';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' as const },
  { path: 'promotions', component: PromotionComponent },
  { path: 'chat', component: ChatComponent }
];

const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));