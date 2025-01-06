import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-form',
  imports: [MatButtonModule, MatDialogClose],
  templateUrl: './confirmation-form.component.html',
  styleUrl: './confirmation-form.component.scss',
})
export class ConfirmationFormComponent {
  readonly data = inject(MAT_DIALOG_DATA);
}
