import { AfterViewChecked, Component, DestroyRef, ElementRef, inject, output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChartInfo,
  ChatResponse,
  NlChatService,
  NlQuery,
  OptionsResponse
} from '../services/nl-chat-service/nl-chat.service';
import { first } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { MappingProfilesService } from '../services/mapping-profiles-service/mapping-profiles.service';
import { DiagramCategoryService } from "../services/diagram-category-service/diagram-category.service";
import { MarkdownModule } from "ngx-markdown";
import { MaterialModule } from "../material/material.module";
import { DiagramCreator } from "../services/dynamic-form-handling-service/dynamic-form-handling-diagram-creator";
import { FormFactoryService } from "../services/form-factory-service/form-factory-service";
import { DynamicFormHandlingService } from "../services/dynamic-form-handling-service/dynamic-form-handling.service";
import { HighChartsChart } from "../services/supported-libraries-service/models/chart-description-HighCharts.model";
import { GoogleChartsTable } from "../services/supported-libraries-service/models/chart-description-GoogleCharts.model";
import { RawChartDataModel } from "../services/supported-libraries-service/models/chart-description-rawChartData.model";
import { RawDataModel } from "../services/supported-libraries-service/models/description-rawData.model";
import { format } from 'sql-formatter';

interface Message {
  role: 'user' | 'assistant' | 'sql';
  text: string;
}

@Component({
  selector: 'app-nl-chat',
  standalone: true,
  imports: [
    FormsModule,
    MaterialModule,
    MarkdownModule
  ],
  templateUrl: './nl-chat.component.html',
  styleUrl: './nl-chat.component.less'
})
export class NlChatComponent implements AfterViewChecked {
  private destroyRef = inject(DestroyRef);
  private nlChatService = inject(NlChatService);
  private profileService = inject(MappingProfilesService);
  private diagramCategoryService = inject(DiagramCategoryService);
  private dynamicFormHandlingService = inject(DynamicFormHandlingService);
  private formFactoryService = inject(FormFactoryService);

  private _diagramCreator: DiagramCreator = new DiagramCreator(this.diagramCategoryService);

  // ViewChild references for message containers
  @ViewChild('queryMessagesContainer') queryMessagesContainer?: ElementRef;
  // @ViewChild('optionsMessagesContainer') optionsMessagesContainer?: ElementRef;

  // Output event when chat is complete
  chatComplete = output<ChartInfo[]>();

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

  inputText = signal<string>('');
  loading = signal<boolean>(false);
  // phase = signal<'query' | 'options' | 'done'>('query');
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

    this.diagramCategoryService.selectedDiagramCategory$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (category) => {
        if (category && category.type) {
          this.chartType.set(category.type);
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
      // if (this.phase() === 'query' && this.queryMessagesContainer) {
      if (this.queryMessagesContainer) {
        const element = this.queryMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
      // else if (this.phase() === 'options' && this.optionsMessagesContainer) {
      //   const element = this.optionsMessagesContainer.nativeElement;
      //   element.scrollTop = element.scrollHeight;
      // }
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

    // if (this.phase() === 'query') {
      this.sendQueryMessage(text);
    // } else if (this.phase() === 'options') {
    //   this.sendOptionsMessage(text);
    // }
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
          this.chatComplete.emit(chartInfo);
          // this.phase.set('options');
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

  // private sendOptionsMessage(text: string): void {
  //   this.optionsMessages.update(messages => [...messages, { role: 'user', text }]);
  //
  //   this.nlChatService.optionsChat({
  //     sessionId: this.optionsSessionId(),
  //     library: this.library(),
  //     message: text,
  //   }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
  //     next: (res: OptionsResponse) => {
  //       this.optionsSessionId.set(res.sessionId);
  //       this.optionsMessages.update(messages => [...messages, { role: 'assistant', text: res.reply }]);
  //       this.loading.set(false);
  //
  //       if (res.done && res.canonicalDescription && res.sig) {
  //         this.canonicalDescription.set(res.canonicalDescription);
  //         this.optionsSig.set(res.sig);
  //         // this.phase.set('done');
  //         // this.loadChart();
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Options chat error', err);
  //       this.optionsMessages.update(messages => [
  //         ...messages,
  //         { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }
  //       ]);
  //       this.error.set('Failed to process your request. Please try again.');
  //       this.loading.set(false);
  //     },
  //   });
  // }

  // skipOptions(): void {
  //   // User skips the appearance conversation — fetch chart without options
  //   // this.phase.set('done');
  //   // this.loadChart();
  // }

  // private loadChart(): void {
  //   const chartInfo: ChartInfo[] = [{
  //     type: this.chartType(),
  //     name: this.canonicalNl(),
  //     query: this.queryJson()
  //   }];
  //
  //   const value = this.formFactoryService.getFormRoot().value;
  //   forkJoin([this._diagramCreator.createChart(value), this._diagramCreator.createTable(value),
  //     this._diagramCreator.createRawChartData(value), this._diagramCreator.createRawData(value)])
  //     .pipe(first())
  //     .subscribe(([chartObject, tableObject, rawChartDataObject, rawDataObject]) => {
  //       if (chartObject) {
  //         if (this.library() === 'HighCharts') {
  //           (chartObject as HighChartsChart).chartDescription.queries = chartInfo as any; // Fixme use proper type
  //         }
  //       }
  //       if (tableObject) {
  //         (tableObject as GoogleChartsTable).tableDescription.queriesInfo = chartInfo as any;
  //       }
  //       if (rawChartDataObject) {
  //         (rawChartDataObject as RawChartDataModel).chartsInfo = chartInfo as any;
  //       }
  //       if (rawDataObject) {
  //         (rawDataObject as RawDataModel).series = chartInfo as any;
  //       }
  //
  //
  //       return this.dynamicFormHandlingService.changeDataObjects(chartObject, tableObject, rawChartDataObject, rawDataObject);
  //     })
  //
  //   // this._diagramCreator.createChart(this.formFactoryService.getFormRoot().value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
  //   //   next: (chart) => {
  //   //     console.log(chart);
  //   //     if (this.library() === 'HighCharts') {
  //   //       (chart as HighChartsChart).chartDescription.queries = chartInfo as any; // Fixme use proper type
  //   //       this.dynamicFormHandlingService.changeDataObjects(chart, null, null, null);
  //   //     }
  //   //   }
  //   // });
  //
  //   // this.nlChatService.fetchChart({
  //   //   library: this.library(),
  //   //   chartsInfo: chartInfo,
  //   //   // Include options only if the user went through the options conversation
  //   //   nlOptions: this.canonicalDescription(),
  //   //   optionsSig: this.optionsSig(),
  //   // }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
  //   //   next: (data) => {
  //   //     this.chartData.set(data);
  //   //     console.log('Chart data ready:', data);
  //   //
  //   //     // Emit the complete result
  //   //     this.chatComplete.emit({
  //   //       canonicalNl: this.canonicalNl()!,
  //   //       querySig: this.querySig()!,
  //   //       profile: this.profile(),
  //   //       queryDescription: this.queryDescription(),
  //   //       canonicalDescription: this.canonicalDescription(),
  //   //       optionsSig: this.optionsSig(),
  //   //       library: this.library(),
  //   //       chartData: data
  //   //     });
  //   //   },
  //   //   error: (err) => {
  //   //     console.error('Chart fetch error', err);
  //   //     this.error.set('Failed to load chart data. Please try again.');
  //   //   },
  //   // });
  // }

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
