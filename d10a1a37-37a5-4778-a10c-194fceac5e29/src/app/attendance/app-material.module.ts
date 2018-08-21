import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
    declarations: [],
    imports: [
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatMenuModule,
        MatSnackBarModule
    ],
    exports: [
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatMenuModule,
        MatSnackBarModule
    ],
    providers: [],
})
export class AppMaterialModule { }