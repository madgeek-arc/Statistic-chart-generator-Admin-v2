import { AfterViewChecked, Component, DestroyRef, ElementRef, inject, output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatResponse, NlChatService, NlQuery, OptionsResponse } from '../services/nl-chat-service/nl-chat.service';
import { ChartLoadingService } from '../services/chart-loading-service/chart-loading.service';
import { MappingProfilesService } from '../services/mapping-profiles-service/mapping-profiles.service';
import { MaterialModule } from "../material/material.module";

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export interface NlChatResult {
  canonicalNl: string;
  querySig: string;
  profile: string;
  queryDescription?: string;
  canonicalDescription?: string;
  optionsSig?: string;
  library: string;
  chartData?: unknown;
}

@Component({
  selector: 'app-nl-chat',
  standalone: true,
  imports: [
    FormsModule,
    MaterialModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './nl-chat.component.html',
  styleUrl: './nl-chat.component.less'
})
export class NlChatComponent implements AfterViewChecked {
  private destroyRef = inject(DestroyRef);
  private nlChatService = inject(NlChatService);
  private chartLoadingService = inject(ChartLoadingService);
  private profileService = inject(MappingProfilesService);

  // ViewChild references for message containers
  @ViewChild('queryMessagesContainer') queryMessagesContainer?: ElementRef;
  @ViewChild('optionsMessagesContainer') optionsMessagesContainer?: ElementRef;

  // Output event when chat is complete
  chatComplete = output<NlChatResult>();

  // Reactive state using signals
  profile = signal<string>('');
  library = signal<string>('HighCharts');

  // NL query conversation state
  queryMessages = signal<Message[]>([]);
  querySessionId = signal<string | undefined>(undefined);
  canonicalNl = signal<string | undefined>(undefined);
  querySig = signal<string | undefined>(undefined);
  queryDescription = signal<string | undefined>(undefined);

  // Options conversation state
  optionsMessages = signal<Message[]>([]);
  optionsSessionId = signal<string | undefined>(undefined);
  canonicalDescription = signal<string | undefined>(undefined);
  optionsSig = signal<string | undefined>(undefined);

  inputText = signal<string>('');
  loading = signal<boolean>(false);
  phase = signal<'query' | 'options' | 'done'>('query');
  chartData = signal<unknown | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Subscribe to the current profile
    this.profileService.selectedProfile$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile) => {
        if (profile && profile.name) {
          this.profile.set(profile.name);
        }
      }
    });
  }

  ngAfterViewChecked(): void {
    // Auto-scroll to the bottom when messages change
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.phase() === 'query' && this.queryMessagesContainer) {
        const element = this.queryMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } else if (this.phase() === 'options' && this.optionsMessagesContainer) {
        const element = this.optionsMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      // Silently handle any scrolling errors
    }
  }

  send(): void {
    const text = this.inputText().trim();
    if (!text || this.loading()) return;

    this.inputText.set('');
    this.loading.set(true);
    this.error.set(null);

    if (this.phase() === 'query') {
      this.sendQueryMessage(text);
    } else if (this.phase() === 'options') {
      this.sendOptionsMessage(text);
    }
  }

  private sendQueryMessage(text: string): void {
    this.queryMessages.update(messages => [...messages, { role: 'user', text }]);

    this.chartLoadingService.chartLoadingStatus = true;

    this.nlChatService.chat({
      sessionId: this.querySessionId(),
      profile: this.profile(),
      message: text,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: ChatResponse) => {
        this.querySessionId.set(res.sessionId);
        this.queryMessages.update(messages => [...messages, { role: 'assistant', text: res.reply }]);
        this.loading.set(false);
        this.chartLoadingService.chartLoadingStatus = false;

        if (res.done && res.canonicalNl && res.sig) {
          this.canonicalNl.set(res.canonicalNl);
          this.querySig.set(res.sig);
          this.queryDescription.set(res.description);
          this.phase.set('options');
        }
      },
      error: (err) => {
        console.error('NL chat error', err);
        this.queryMessages.update(messages => [
          ...messages,
          { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }
        ]);
        this.error.set('Failed to process your request. Please try again.');
        this.loading.set(false);
        this.chartLoadingService.chartLoadingStatus = false;
      },
    });
  }

  private sendOptionsMessage(text: string): void {
    this.optionsMessages.update(messages => [...messages, { role: 'user', text }]);

    this.chartLoadingService.chartLoadingStatus = true;

    this.nlChatService.optionsChat({
      sessionId: this.optionsSessionId(),
      library: this.library(),
      message: text,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: OptionsResponse) => {
        this.optionsSessionId.set(res.sessionId);
        this.optionsMessages.update(messages => [...messages, { role: 'assistant', text: res.reply }]);
        this.loading.set(false);
        this.chartLoadingService.chartLoadingStatus = false;

        if (res.done && res.canonicalDescription && res.sig) {
          this.canonicalDescription.set(res.canonicalDescription);
          this.optionsSig.set(res.sig);
          this.phase.set('done');
          this.loadChart();
        }
      },
      error: (err) => {
        console.error('Options chat error', err);
        this.optionsMessages.update(messages => [
          ...messages,
          { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }
        ]);
        this.error.set('Failed to process your request. Please try again.');
        this.loading.set(false);
        this.chartLoadingService.chartLoadingStatus = false;
      },
    });
  }

  skipOptions(): void {
    // User skips the appearance conversation — fetch chart without options
    this.phase.set('done');
    this.loadChart();
  }

  private loadChart(): void {
    this.chartLoadingService.chartLoadingStatus = true;

    this.nlChatService.fetchChart({
      library: this.library(),
      chartsInfo: [{
        type: 'bar',
        name: this.canonicalNl(),
        query: {
          nl: this.canonicalNl()!,
          sig: this.querySig()!,
          profile: this.profile(),
        } as NlQuery
      }],
      // Include options only if the user went through the options conversation
      nlOptions: this.canonicalDescription(),
      optionsSig: this.optionsSig(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.chartData.set(data);
        this.chartLoadingService.chartLoadingStatus = false;
        console.log('Chart data ready:', data);

        // Emit the complete result
        this.chatComplete.emit({
          canonicalNl: this.canonicalNl()!,
          querySig: this.querySig()!,
          profile: this.profile(),
          queryDescription: this.queryDescription(),
          canonicalDescription: this.canonicalDescription(),
          optionsSig: this.optionsSig(),
          library: this.library(),
          chartData: data
        });
      },
      error: (err) => {
        console.error('Chart fetch error', err);
        this.error.set('Failed to load chart data. Please try again.');
        this.chartLoadingService.chartLoadingStatus = false;
      },
    });
  }

  reset(): void {
    this.queryMessages.set([]);
    this.querySessionId.set(undefined);
    this.canonicalNl.set(undefined);
    this.querySig.set(undefined);
    this.queryDescription.set(undefined);

    this.optionsMessages.set([]);
    this.optionsSessionId.set(undefined);
    this.canonicalDescription.set(undefined);
    this.optionsSig.set(undefined);

    this.inputText.set('');
    this.loading.set(false);
    this.phase.set('query');
    this.chartData.set(null);
    this.error.set(null);
  }
}
