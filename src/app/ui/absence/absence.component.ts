import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AbsenceFormComponent } from '../absence-form/absence-form.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatExpansionModule],
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.scss'],
})
export class AbsenceComponent {
  private destroy$ = new Subject<void>();

  constructor(private dialog: MatDialog) {}

  openForm() {
    const dialogRef = this.dialog.open(AbsenceFormComponent);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          console.log('Форма подана:', result);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
