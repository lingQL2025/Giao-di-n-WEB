import { Routes } from '@angular/router';
import { PromotionListComponent } from './promotion-list/promotion-list.component';

export const routes: Routes = [
  { path: 'promotion-list', component: PromotionListComponent },
  { path: '', redirectTo: '/promotion-list', pathMatch: 'full' }
];
