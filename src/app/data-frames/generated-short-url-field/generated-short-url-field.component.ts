import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild, input } from '@angular/core';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'generated-short-url-field',
    templateUrl: './generated-short-url-field.component.html',
    styleUrls: ['./generated-short-url-field.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe]
})
export class GeneratedShortUrlFieldComponent implements OnChanges {

  @ViewChild('clipboardAlert', {static: false}) clipboardAlert: any

  @Input('dataName') field_name: string | undefined;
  readonly url$ = input<Observable<string>>(undefined, { alias: 'shortUrl' });
  readonly isUrlLoading$ = input<Observable<boolean>>(undefined, { alias: 'isUrlLoading' });

  public copiedUrl = false;


  ngOnChanges(changes: SimpleChanges) {
    if (changes['isViewOpen'])
      this.copiedUrl = false;
  }

  public copyURLToClipboard() {
    if (!navigator.clipboard) {
      this.copiedUrl = false;
      return;
    }

    this.url$().pipe(first()).subscribe(
      (shortUrl: string) => {
        navigator.clipboard.writeText(shortUrl).then(
          () => {
            this.copiedUrl = true;
            // Close the clipboard alert after 5 seconds
            setTimeout(() => this.clipboardAlert?.close(), 5000);
          },
          (err) => {
            console.error(err);
            this.copiedUrl = false;
          });
      });
  }
}
