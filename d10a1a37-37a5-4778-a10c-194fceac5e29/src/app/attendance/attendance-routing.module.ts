import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StudentPickComponent } from './attendance/student-pick.component';
import { MainComponent } from './attendance/main.component';


const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'pick/:type/:id/:p', component: StudentPickComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }