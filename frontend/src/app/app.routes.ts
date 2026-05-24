import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { HomeComponent } from './home/home.component';

const authGuard = () => localStorage.getItem('exam-auth-user') ? true : '/login';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard/customer', component: CustomerDashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard/admin', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'products', redirectTo: 'dashboard/customer', pathMatch: 'full' },
  { path: 'coupons', redirectTo: 'dashboard/customer', pathMatch: 'full' },
  { path: 'cart', redirectTo: 'dashboard/customer', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'dashboard/customer', pathMatch: 'full' },
  { path: 'orders', redirectTo: 'dashboard/customer', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];