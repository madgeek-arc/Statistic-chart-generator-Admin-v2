import {
  afterNextRender, afterRenderEffect,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChartInfo,
  ChatResponse,
  NlChatService,
  NlQuery,
  OptionsData,
  OptionsResponse
} from '../services/nl-chat-service/nl-chat.service';
import { MappingProfilesService } from '../services/mapping-profiles-service/mapping-profiles.service';
import { DiagramCategoryService } from "../services/diagram-category-service/diagram-category.service";
import { MarkdownModule } from "ngx-markdown";
import { format } from 'sql-formatter';
import { MatCard, MatCardContent } from "@angular/material/card";
import { TextFieldModule } from "@angular/cdk/text-field";

interface Message {
  role: 'user' | 'assistant' | 'sql';
  text: string;
}

@Component({
  selector: 'app-nl-chat',
  standalone: true,
  imports: [
    FormsModule,
    TextFieldModule,
    MarkdownModule,
    MatCard,
    MatCardContent
  ],
  templateUrl: './nl-chat.component.html',
  styleUrl: './nl-chat.component.less'
})
export class NlChatComponent {
  private destroyRef = inject(DestroyRef);
  private nlChatService = inject(NlChatService);
  private profileService = inject(MappingProfilesService);
  private diagramCategoryService = inject(DiagramCategoryService);

  // ViewChild references for message containers
  @ViewChild('messagesContainer') messagesContainer?: ElementRef;

  phase = input<'query' | 'options'>('query');

  // Output event when chat is complete
  queryChatComplete = output<ChartInfo[]>();
  optionChatComplete = output<OptionsData>();

  // Reactive state using signals
  profile = signal<string>('');
  chartType = signal<string>('');
  library = signal<string>('HighCharts');

  // NL query conversation state
  queryMessages = signal<Message[]>([]);
  querySessionId = signal<string | undefined>(undefined);
  canonicalNl = signal<string | undefined>(undefined);
  querySig = signal<string | undefined>(undefined);
  queryDescription = signal<string | undefined>(undefined);
  queryJson = signal<NlQuery | undefined>(undefined);

  // Options conversation state
  optionsMessages = signal<Message[]>([]);
  optionsSessionId = signal<string | undefined>(undefined);
  canonicalDescription = signal<string | undefined>(undefined);
  optionsSig = signal<string | undefined>(undefined);
  optionsJson = signal<string | undefined>(undefined);

  inputText = signal<string>('');
  loading = signal<boolean>(false);
  isFocused = signal(false);
  // phase = signal<'query' | 'options' | 'done'>('query');
  chartData = signal<unknown | null>(null);
  error = signal<string | null>(null);

  constructor() {
    afterRenderEffect(() => {
      this.queryMessages(); // track the signal
      this.scrollToBottom();
    });
  }

  ngOnInit(): void {
    // Subscribe to the current profile
    this.profileService.selectedProfile$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (profile) => {
        if (profile && profile.name) {
          this.profile.set(profile.name);
        }
      }
    });

    this.diagramCategoryService.selectedDiagramCategory$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (category) => {
        if (category && category.type) {
          this.chartType.set(category.type);
        }
      }
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
        });
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

    if (this.phase() === 'query')
      this.sendQueryMessage(text);
    else if (this.phase() === 'options') {
      this.sendOptionsMessage(text);
    }
  }

  private sendQueryMessage(text: string): void {
    this.queryMessages.update(messages => [...messages, { role: 'user', text }]);

    this.nlChatService.chat({
      sessionId: this.querySessionId(),
      profile: this.profile(),
      message: text,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: ChatResponse) => {
        this.querySessionId.set(res.sessionId);
        this.loading.set(false);

        this.queryMessages.update(messages => [...messages, { role: 'assistant', text: res.reply }]);

        if (res.done && res.canonicalNl && res.sig) {

          this.canonicalNl.set(res.canonicalNl);
          this.querySig.set(res.sig);
          this.queryDescription.set(res.description);
          this.queryJson.set(res.queryJson);
          const markdownSql = [
            '```sql',
            format(res.sql, {language: 'sql'}),
            '```'
          ].join('\n');

          this.queryMessages.update(messages => [...messages, { role: 'sql', text: markdownSql }]);

          const chartInfo: ChartInfo[] = [{
            type: this.chartType(),
            name: this.canonicalNl(),
            query: this.queryJson()
          }];
          this.queryChatComplete.emit(chartInfo);
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
      },
    });
  }

  private sendOptionsMessage(text: string): void {
    this.optionsMessages.update(messages => [...messages, { role: 'user', text }]);

    this.nlChatService.optionsChat({
      sessionId: this.optionsSessionId(),
      library: this.library(),
      message: text,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: OptionsResponse) => {
        this.optionsSessionId.set(res.sessionId);
        this.optionsMessages.update(messages => [...messages, { role: 'assistant', text: res.reply }]);
        this.loading.set(false);

        if (res.done && res.canonicalDescription && res.sig) {
          this.optionsJson.set(res.optionsJson);
          this.canonicalDescription.set(res.canonicalDescription);
          this.optionsSig.set(res.sig);
          this.optionChatComplete.emit({nlOptions: this.canonicalDescription(), optionsSig: this.optionsSig(), optionsJson: res.optionsJson});
        }
      },
      error: (err) => {
        console.error('Options chat error', err);
        this.optionsMessages.update(messages => [
          ...messages, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }
        ]);
        this.error.set('Failed to process your request. Please try again.');
        this.loading.set(false);
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
    // this.phase.set('query');
    this.chartData.set(null);
    this.error.set(null);
  }
}
