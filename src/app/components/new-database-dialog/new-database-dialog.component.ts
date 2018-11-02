import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {DialogData} from "./data_dialog_new_database";

@Component({
  selector: 'app-new-database-dialog',
  templateUrl: './new-database-dialog.component.html',
  styleUrls: ['./new-database-dialog.component.css']
})

export class NewDatabaseDialogComponent implements OnInit {

  @ViewChild("database_name") textArea;

  constructor(public dialogRef: MatDialogRef<NewDatabaseDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    // nothing to do here
  }

  ngOnInit() {
    // nothing to do here
  }

  createDatabase() {
    if (this.textArea.nativeElement.value.length > 0) {
      this.dialogRef.close(this.textArea.nativeElement.value);
    } else {
      this.dialogRef.close();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
