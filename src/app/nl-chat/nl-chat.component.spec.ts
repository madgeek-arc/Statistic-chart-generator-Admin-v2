import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { provideMarkdown } from 'ngx-markdown';

import { NlChatComponent } from './nl-chat.component';
import { ChartInfo, ChatResponse, NlChatService, OptionsData, OptionsResponse } from '../services/nl-chat-service/nl-chat.service';
import { MappingProfilesService, Profile } from '../services/mapping-profiles-service/mapping-profiles.service';
import { DiagramCategoryService } from '../services/diagram-category-service/diagram-category.service';

// The chat, hosted the way the dashboard hosts it. Answers arrive later, over HTTP, so the specs
// hold each answer in a Subject and release it when they want the reply to come.
@Component({
  template: `<app-nl-chat [phase]="phase" (queryChatComplete)="queryDone.push($event)"
                          (optionChatComplete)="optionsDone.push($event)"></app-nl-chat>`,
  imports: [NlChatComponent]
})
class ChatHostComponent {
  phase: 'query' | 'options' = 'query';
  queryDone: ChartInfo[][] = [];
  optionsDone: OptionsData[] = [];
}

const profileNamed = (name: string): Profile => Object.assign(new Profile(), { name });

const finishedQuery: ChatResponse = {
  sessionId: 's1',
  reply: 'Here is your query.',
  done: true,
  canonicalNl: 'publications per year',
  sig: 'sig-1',
  description: 'Publications per year',
  sql: 'select year, count(*) from result group by year',
  queryJson: { nl: 'publications per year', sig: 'sig-1', profile: 'openaire' }
};

describe('NlChatComponent', () => {
  let fixture: ComponentFixture<ChatHostComponent>;
  let host: ChatHostComponent;
  let profile$: BehaviorSubject<Profile | null>;
  let chat: jasmine.Spy<NlChatService['chat']>;
  let optionsChat: jasmine.Spy<NlChatService['optionsChat']>;

  beforeEach(() => {
    profile$ = new BehaviorSubject<Profile | null>(profileNamed('openaire'));
    chat = jasmine.createSpy('chat');
    optionsChat = jasmine.createSpy('optionsChat');
    TestBed.configureTestingModule({
      providers: [
        provideMarkdown(),
        { provide: NlChatService, useValue: { chat, optionsChat } },
        { provide: MappingProfilesService, useValue: { selectedProfile$: profile$ } },
        { provide: DiagramCategoryService, useValue: { selectedDiagramCategory$: new BehaviorSubject({ type: 'column' }) } }
      ]
    });
    fixture = TestBed.createComponent(ChatHostComponent);
    host = fixture.componentInstance;
  });

  const el = (selector: string): HTMLElement | null => fixture.nativeElement.querySelector(selector);
  const textarea = (): HTMLTextAreaElement => el('textarea') as HTMLTextAreaElement;
  const sendButton = (): HTMLButtonElement => el('.send-btn') as HTMLButtonElement;
  const text = (selector: string): string => el(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const settle = () => { tick(); fixture.detectChanges(); tick(); };
  const start = () => { fixture.detectChanges(); settle(); };

  const type = (value: string) => {
    textarea().value = value;
    textarea().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const send = (value: string) => {
    type(value);
    sendButton().click();
    settle();
  };
  const messages = (): string[] =>
    [...fixture.nativeElement.querySelectorAll('.nl-message')].map(m => (m as HTMLElement).textContent!.replace(/\s+/g, ' ').trim());

  it('invites the user to describe the data, or the appearance in the options phase', fakeAsync(() => {
    start();
    expect(text('h2')).toBe('Describe the data you want');

    host.phase = 'options';
    settle();
    expect(text('h2')).toBe('Describe the appearance of the chart');
  }));

  it('keeps the send button off until there is something to send', fakeAsync(() => {
    start();
    expect(sendButton().disabled).toBeTrue();

    type('   ');
    expect(sendButton().disabled).toBeTrue();

    type('publications');
    expect(sendButton().disabled).toBeFalse();
  }));

  it('marks the composer while the text box has focus', fakeAsync(() => {
    start();
    expect(el('.composer-shell')!.classList).not.toContain('focus');

    textarea().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(el('.composer-shell')!.classList).toContain('focus');

    textarea().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(el('.composer-shell')!.classList).not.toContain('focus');
  }));

  describe('asking for data', () => {
    let reply$: Subject<ChatResponse>;

    beforeEach(() => {
      reply$ = new Subject<ChatResponse>();
      chat.and.returnValue(reply$);
    });

    it('sends the message with the selected profile, and waits for the answer', fakeAsync(() => {
      start();
      send('Publications per year');

      expect(chat).toHaveBeenCalledOnceWith({ sessionId: undefined, profile: 'openaire', message: 'Publications per year' });
      expect(messages()[0]).toContain('Publications per year');
      expect(text('.messages-container')).toContain('Thinking...');
      expect(textarea().value).toBe('');
      expect(textarea().disabled).toBeTrue();
      expect(sendButton().disabled).toBeTrue();
    }));

    it('shows the reply when it arrives, and lets the user type again', fakeAsync(() => {
      start();
      send('Publications per year');

      reply$.next({ sessionId: 's1', reply: 'Which years?', done: false });
      settle();

      expect(messages()).toEqual([jasmine.stringContaining('Publications per year'), jasmine.stringContaining('Which years?')]);
      expect(text('.messages-container')).not.toContain('Thinking...');
      expect(textarea().disabled).toBeFalse();
    }));

    it('sends on Enter, and Shift+Enter does not', fakeAsync(() => {
      start();
      type('Publications per year');

      textarea().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));
      settle();
      expect(chat).not.toHaveBeenCalled();

      textarea().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      settle();
      expect(chat).toHaveBeenCalledTimes(1);
    }));

    it('keeps the conversation going with the session the server gave', fakeAsync(() => {
      start();
      send('Publications per year');
      reply$.next({ sessionId: 's1', reply: 'Which years?', done: false });
      settle();

      reply$ = new Subject<ChatResponse>();
      chat.and.returnValue(reply$);
      send('Since 2020');

      expect(chat.calls.mostRecent().args[0]).toEqual({ sessionId: 's1', profile: 'openaire', message: 'Since 2020' });
    }));

    it('asks with the profile that was selected after it opened', fakeAsync(() => {
      start();
      profile$.next(profileNamed('gr_monitor'));

      send('Publications per year');

      expect(chat.calls.mostRecent().args[0].profile).toBe('gr_monitor');
    }));

    it('shows the query and hands the chart to its host once the query is complete', fakeAsync(() => {
      start();
      send('Publications per year');

      reply$.next(finishedQuery);
      settle();

      expect(text('.sql-block')).toContain('generated.sql');
      expect(text('.sql-block')).toContain('select');
      expect(host.queryDone).toEqual([[{ type: 'column', name: 'publications per year', query: finishedQuery.queryJson! }]]);
    }));

    it('apologises and lets the user try again when the request fails', fakeAsync(() => {
      spyOn(console, 'error');
      start();
      send('Publications per year');

      reply$.error(new Error('503'));
      settle();

      expect(text('.error-message')).toContain('Failed to process your request. Please try again.');
      expect(messages()[1]).toContain('Sorry, something went wrong. Please try again.');
      expect(text('.messages-container')).not.toContain('Thinking...');
      expect(textarea().disabled).toBeFalse();
    }));

    it('scrolls the conversation to its newest message', fakeAsync(() => {
      start();
      send('Publications per year');
      const container = el('.messages-container')!;
      let scrolledTo: number | undefined;
      Object.defineProperty(container, 'scrollHeight', { get: () => 1234 });
      Object.defineProperty(container, 'scrollTop', { set: (top: number) => scrolledTo = top, get: () => 0 });

      reply$.next({ sessionId: 's1', reply: 'Which years?', done: false });
      settle();
      tick(1);

      expect(scrolledTo).toBe(1234);
    }));
  });

  describe('describing the appearance', () => {
    let reply$: Subject<OptionsResponse>;

    beforeEach(() => {
      reply$ = new Subject<OptionsResponse>();
      optionsChat.and.returnValue(reply$);
      host.phase = 'options';
    });

    it('uses the options conversation and hands the description to its host once it is complete', fakeAsync(() => {
      start();
      send('Blue bars');
      expect(chat).not.toHaveBeenCalled();
      expect(optionsChat).toHaveBeenCalledOnceWith({ sessionId: undefined, library: 'HighCharts', message: 'Blue bars' });
      expect(messages()[0]).toContain('Blue bars');

      reply$.next({
        sessionId: 'o1', reply: 'Done.', done: true,
        canonicalDescription: 'Blue bars', sig: 'osig', optionsJson: '{"colors":["blue"]}'
      });
      settle();

      expect(messages()[1]).toContain('Done.');
      expect(host.optionsDone).toEqual([{ nlOptions: 'Blue bars', optionsSig: 'osig', optionsJson: '{"colors":["blue"]}' }]);
    }));
  });
});
