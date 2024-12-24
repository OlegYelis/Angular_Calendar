import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AbsenceFormComponent } from '../absence-form/absence-form.component';


@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatExpansionModule],
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.scss']
})
export class AbsenceComponent {

  constructor(private dialog: MatDialog) {}

  openForm() {
    const dialogRef = this.dialog.open(AbsenceFormComponent);
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Форма подана:', result);
      }
    });
  }

}
