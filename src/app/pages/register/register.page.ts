import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {

  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  // Función para crear una cuenta nueva
  async onRegister() {
    if (this.password !== this.confirmPassword) {
      this.showToast('Las contraseñas no coinciden');
      return;
    }

    try {
      await this.authService.register(this.email, this.password);
    } catch (error: any) {
      this.showToast(error.message);
    }
  }

  // Ir al login si ya tiene cuenta
  goToLogin() {
    window.location.href = '/login';
  }

  // Mostrar mensajes de error o éxito
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger'
    });
    toast.present();
  }
}

