import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {

  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  // Función de inicio de sesión
  async onLogin() {
    try {
      await this.authService.login(this.email, this.password);
    } catch (error: any) {
      this.showToast(error.message);
    }
  }

  // Ir a registro
  goToRegister() {
    window.location.href = '/register';
  }

  // Mostrar toast con error
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger'
    });
    toast.present();
  }
}

