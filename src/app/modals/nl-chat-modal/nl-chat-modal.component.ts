import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NlChatComponent, NlChatResult } from '../../nl-chat/nl-chat.component';

@Component({
  selector: 'app-nl-chat-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    NlChatComponent
  ],
  template: `
    <div class="nl-chat-modal">
      <div mat-dialog-title class="dialog-title">
        <h2>
          <mat-icon>smart_toy</mat-icon>
          AI-Powered Chart Generator
        </h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <app-nl-chat (chatComplete)="onChatComplete($event)"></app-nl-chat>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Cancel</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .nl-chat-modal {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    .dialog-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e0e0e0;

      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        font-size: 1.5rem;
        font-weight: 500;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: #1976d2;
        }
      }

      button {
        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
    }

    mat-dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 0;
      margin: 0;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
      margin: 0;
    }
  `]
})
export class NlChatModalComponent {
  private dialogRef = inject(MatDialogRef<NlChatModalComponent>);

  onChatComplete(result: NlChatResult): void {
    // Close the dialog and return the result
    this.dialogRef.close(result);
  }

  close(): void {
    this.dialogRef.close();
  }
}
