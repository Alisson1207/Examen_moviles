import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root' // Disponible globalmente
})
export class AuthService {

  currentUser: User | null = null;

  constructor(private auth: Auth, private router: Router) {
    // Detectar si hay un usuario ya logueado
    onAuthStateChanged(this.auth, user => {
      this.currentUser = user;
    });
  }

  // Método para iniciar sesión
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigateByUrl('/chat'); // Redirigir al chat si login es exitoso
    } catch (error) {
      throw error;
    }
  }

  // Método para registrar usuario nuevo
  async register(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
      this.router.navigateByUrl('/chat');
    } catch (error) {
      throw error;
    }
  }

  // Método para cerrar sesión
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigateByUrl('/login');
  }

  // Obtener el usuario actual
  getUser(): User | null {
    return this.currentUser;
  }
}
