import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Capacitor } from '@capacitor/core';

import { AuthService } from '../../services/auth.service';
import { PhotoService } from 'src/app/services/photo.service';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { ForumService } from 'src/app/services/forum.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './foro.page.html',
  styleUrls: ['./foro.page.scss']
})
export class ChatPage implements OnInit, OnDestroy {
  userName = '';
  userPhoto = '';
  userId: string | null = null;

  newsList: any[] = [];
  newsText = '';
  editMode = false;
  editNewsId: string | null = null;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  private newsSubscription: any;

  constructor(
    private authService: AuthService,
    private forumService: ForumService,
    private toastController: ToastController,
    private photoService: PhotoService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userId = user.uid;
      this.userName = user.email || 'Sin correo';
      const randomAvatarId = Math.floor(Math.random() * 70) + 1;
      this.userPhoto = user.photoURL || `https://i.pravatar.cc/150?img=${randomAvatarId}`;

      this.loadNews();

      // Suscripción a cambios en tiempo real
      this.newsSubscription = this.forumService.getNewsUpdates((news) => {
        this.newsList = news;
      });
    } else {
      this.showToast('No hay usuario autenticado');
    }
  }

  ngOnDestroy() {
    if (this.newsSubscription) {
      this.newsSubscription.unsubscribe();
    }
  }

  async loadNews() {
    try {
      this.newsList = await this.forumService.fetchNews();
    } catch (error: any) {
      this.showToast('Error al cargar noticias');
      console.error(error);
    }
  }

  async publishNews() {
    if (!this.newsText.trim()) return;

    let locationUrl = null;
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    } catch (error) {
      console.warn('Error al obtener ubicación:', error);
    }

    const newNews = {
      content: this.newsText.trim(),
      userId: this.userId,
      userName: this.userName,
      userPhoto: this.userPhoto,
      createdAt: new Date(),
      location: locationUrl
    };

    this.newsList.unshift(newNews);
    this.newsText = '';
  }

  editNews(news: any) {
    this.newsText = news.content;
    this.editMode = true;
    this.editNewsId = news.id;
  }

  async logout() {
    await this.authService.logout();
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }

  async sendPhoto() {
    try {
      const base64 = await this.photoService.capturePhoto();
      const fileName = `photo_${Date.now()}.jpeg`;

      const imageUrl = await this.forumService.uploadImage(base64, fileName);
      await this.forumService.postNews(this.userId!, this.userName, this.userPhoto, imageUrl);

      this.loadNews();
    } catch (err: any) {
      this.showToast('Error al capturar imagen.');
      console.error(err);
    }
  }

  selectFile() {
    this.fileInput.nativeElement.click();
  }

  async handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const fileUrl = await this.forumService.uploadFile(file);
      await this.forumService.postNews(this.userId!, this.userName, this.userPhoto, fileUrl);

      this.loadNews();
    } catch (err: any) {
      this.showToast('Error al subir archivo');
      console.error(err);
    }
  }

async sendLocation() {
  try {
    if (Capacitor.getPlatform() === 'web') {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          // Publicar el mensaje con la URL de la ubicación
          await this.forumService.postNews(this.userId!, this.userName, this.userPhoto, mapUrl);
          this.loadNews();
          this.showToast('Ubicación enviada correctamente');
        },
        (error) => {
          this.showToast('Error al obtener ubicación GPS en navegador');
          console.error(error);
        }
      );
    } else {
      const permission = await Geolocation.requestPermissions();
      if (permission.location === 'granted' || permission.location === 'prompt') {
        const position = await Geolocation.getCurrentPosition();
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        await this.forumService.postNews(this.userId!, this.userName, this.userPhoto, mapUrl);
        this.loadNews();
        this.showToast('Ubicación enviada correctamente');
      } else {
        this.showToast('Permiso de ubicación denegado');
      }
    }
  } catch (err) {
    this.showToast('Error al obtener ubicación GPS');
    console.error(err);
  }
}

isLocation(content: string): boolean {
  return content.includes('https://www.google.com/maps?q=');
}




  async sendJoke() {
    try {
      const res: any = await this.http.get('https://official-joke-api.appspot.com/jokes/random').toPromise();
      const joke = `${res.setup} - ${res.punchline}`;
      await this.forumService.postNews(this.userId!, this.userName, this.userPhoto, joke);

      this.loadNews();
    } catch (err) {
      this.showToast('Error al obtener chiste');
      console.error(err);
    }
  }
}
