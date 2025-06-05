// import { Routes } from '@angular/router';

// export const routes: Routes = [
//   {
//     path: 'home',
//     loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
//   },
//   {
//     path: '',
//     redirectTo: 'home',
//     pathMatch: 'full',
//   },
//   {
//     path: 'login',
//     loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
//   },
//   {
//     path: 'register',
//     loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
//   },
//   {
//     path: 'chat',
//     loadComponent: () => import('./pages/chat/chat.page').then( m => m.ChatPage)
//   },
// ];

import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { ChatPage } from './pages/chat/foro.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'chat', component: ChatPage },
];
