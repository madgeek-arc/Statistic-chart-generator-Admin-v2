---
apply: always
---

# Project: Statistic-chart-generator-Admin-v2 - Angular
## Stack
- Frontend: Angular 20+, TypeScript strict, Signals, LESS
## [CRITICAL] Rules
- Use signal() for local component state
- Use computed() for derived state. 
- Use effect() only for side effects.
- Convert Observable data to signals when appropriate.
- Use @if/@for/@switch — NEVER *ngIf/*ngFor/*ngSwitch
- Set changeDetection: ChangeDetectionStrategy.OnPush always
- Use standalone components — NEVER NgModules
- Use inject() — NEVER constructor injection for DI
- NEVER commit .env files or secrets
## [HIGH] Rules
- Use input()/output() — NOT @Input()/@Output() decorators
- Lazy-load all feature routes
- Use NgOptimizedImage for static images
- Use host: {} — NOT @HostBinding/@HostListener
- Reactive Forms over Template-driven Forms
- Use track with @for.
- Use async pipe instead of manual subscriptions when possible.
## [MEDIUM] Rules
- Prefer inline templates for components < 20 lines
- Use class/style bindings — NOT ngClass/ngStyle
- Services: providedIn: 'root', single responsibility
- Name files: feature-name.component.ts (kebab-case)
