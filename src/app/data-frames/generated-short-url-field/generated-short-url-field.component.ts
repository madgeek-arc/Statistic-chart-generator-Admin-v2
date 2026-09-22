import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, Input, signal, input } from '@angular/core';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'generated-short-url-field',
    templateUrl: './generated-short-url-field.component.html',
    styleUrls: ['./generated-short-url-field.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe]
})
export class GeneratedShortUrlFieldComponent {

  @Input('dataName') field_name: string | undefined;
  readonly url$ = input<Observable<string>>(undefined, { alias: 'shortUrl' });
  readonly isUrlLoading$ = input<Observable<boolean>>(undefined, { alias: 'isUrlLoading' });

  readonly copiedUrl = signal(false);

  public copyURLToClipboard() {
    if (!navigator.clipboard) {
      this.copiedUrl.set(false);
      return;
    }

    this.url$().pipe(first()).subscribe(
      (shortUrl: string) => {
        navigator.clipboard.writeText(shortUrl).then(
          () => {
            this.copiedUrl.set(true);
            // Hide the confirmation after 5 seconds
            setTimeout(() => this.copiedUrl.set(false), 5000);
          },
          (err) => {
            console.error(err);
            this.copiedUrl.set(false);
          });
      });
  }
}
