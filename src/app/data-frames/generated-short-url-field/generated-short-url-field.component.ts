import { first } from 'rxjs/operators';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

// import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'generated-short-url-field',
  templateUrl: './generated-short-url-field.component.html',
  styleUrls: ['./generated-short-url-field.component.scss']
})
export class GeneratedShortUrlFieldComponent implements OnChanges {

  @ViewChild('clipboardAlert', {static: false}) clipboardAlert: any

  @Input('dataName') field_name: string | undefined;
  @Input('shortUrl') url$: Observable<string>;
  @Input('isUrlLoading') isUrlLoading$: Observable<boolean>;

  public clipboardCopyMessage = "Copied to clipboard !";
  public copiedUrl = false;


  ngOnChanges(changes: SimpleChanges) {
    if (changes['isViewOpen'])
      this.copiedUrl = false;
  }

  public copyURLToClipboard() {
    if (!navigator.clipboard) {
      // this.toastService.show("Cannot copy to clipboard!",{ classname: 'bg-danger text-light', delay: 15000 });
      this.copiedUrl = false;
      return;
    }

    this.url$.pipe(first()).subscribe(
      (shortUrl: string) => {
        navigator.clipboard.writeText(shortUrl).then(
          () => {
            this.copiedUrl = true;
            // Close the clipboard alert after 5 seconds
            setTimeout(() => this.clipboardAlert?.close(), 5000);

            // this.toastService.show("Copied to clipboard !",{ classname: 'bg-success text-light', delay: 10000 });
          },
          (err) => {
            console.error(err);
            this.copiedUrl = false;

            // this.toastService.show("Cannot copy to clipboard !",{ classname: 'bg-danger text-light', delay: 15000 })
          });
      });
  }

  public closedAlert() {
    console.log("Close");

    this.copiedUrl = false;
  }
}
