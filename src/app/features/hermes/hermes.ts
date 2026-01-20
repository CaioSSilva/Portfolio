import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Gemini } from '../../core/services/gemini';
import { LanguageService } from '../../core/services/language';
import { NotificationService } from '../../core/services/notification';
import { Base } from '../../core/models/base';

interface Message {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-hermes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './hermes.html',
  styleUrl: './hermes.scss',
})
export class Hermes extends Base {
  lang = inject(LanguageService);
  not = inject(NotificationService);
  gemini = inject(Gemini);

  userInput = signal('');
  isLoading = signal(false);
  messages = signal<Message[]>([]);

  isButtonDisabled = computed(() => this.userInput().trim().length === 0 || this.isLoading());

  async handleSendMessage() {
    if (this.isButtonDisabled()) return;

    const userText = this.userInput();
    this.messages.update((prev) => [...prev, { role: 'user', text: userText }]);
    this.userInput.set('');
    this.isLoading.set(true);

    try {
      const response = await this.gemini.generateResponse(userText);
      this.messages.update((prev) => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      this.not.show({
        title: this.lang.t().errors.systemError,
        message: this.lang.t().errors.seviceUnavailable,
        icon: 'fas fa-circle-exclamation',
      });
    } finally {
      this.isLoading.set(false);
    }
  }
}
