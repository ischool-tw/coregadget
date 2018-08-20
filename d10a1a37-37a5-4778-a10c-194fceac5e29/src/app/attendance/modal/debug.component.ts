import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'gd-debug',
  templateUrl: './debug.component.html',
  styles: []
})
export class DebugComponent implements OnInit {

  json;

  constructor(
    public dialogRef: MatDialogRef<DebugComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.updateSize('75%', '75%');

    this.json = data;
  }

  ngOnInit() {
  }

}
