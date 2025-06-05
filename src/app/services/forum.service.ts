import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface News {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private supabase: SupabaseClient;
  private newsSubject = new BehaviorSubject<News[]>([]);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.fetchNews().then(news => this.newsSubject.next(news));
  }

  async fetchNews(): Promise<News[]> {
    const { data, error } = await this.supabase
      .from('news')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
    return (data as News[]) || [];
  }

  getNewsUpdates(callback: (news: News[]) => void) {
    const subscription = this.newsSubject.subscribe(news => {
      callback(news);
    });
    return subscription;
  }

  async postNews(userId: string, userName: string, userPhoto: string, content: string): Promise<void> {
    const newNews: Omit<News, 'id'> = {
      userId,
      userName,
      userPhoto,
      content,
      createdAt: Date.now()
    };

    const { data, error } = await this.supabase
      .from('news')
      .insert(newNews)
      .select();

    if (error) {
      console.error('Error posting news:', error);
      throw error;
    }

    const updatedNews = [ ...data!, ...this.newsSubject.value ];
    this.newsSubject.next(updatedNews);
  }

  async editNews(newsId: string, newContent: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('news')
      .update({ content: newContent })
      .eq('id', newsId)
      .select();

    if (error) {
      console.error('Error editing news:', error);
      throw error;
    }

    const currentNews = this.newsSubject.value;
    const index = currentNews.findIndex(n => n.id === newsId);
    if (index !== -1) {
      currentNews[index].content = newContent;
      this.newsSubject.next([...currentNews]);
    }
  }

  async uploadImage(base64Data: string, fileName: string): Promise<string> {
    const filePath = `images/${Date.now()}_${fileName}`;
    const blob = this.base64ToBlob(base64Data);

    const { error } = await this.supabase.storage
      .from('chat-media')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    const { data } = this.supabase.storage.from('chat-media').getPublicUrl(filePath);
    return data.publicUrl;
  }

  base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([intArray], { type: 'image/jpeg' });
  }

  async uploadFile(file: File): Promise<string> {
    const path = `files/${Date.now()}_${file.name}`;

    const { error } = await this.supabase.storage
      .from('chat-media')
      .upload(path, file, {
        contentType: file.type,
        upsert: true
      });

    if (error) throw error;

    const { data } = this.supabase.storage.from('chat-media').getPublicUrl(path);
    return data.publicUrl;
  }
}
