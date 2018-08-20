import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'gd-waiting',
  templateUrl: './waiting.component.html',
  styles: []
})
export class WaitingComponent implements OnInit {

  constructor(
    private dialog: MatDialogRef<WaitingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

}
