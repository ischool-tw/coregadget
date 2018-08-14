import { Component, OnInit } from '@angular/core';
import { SakuraService } from './service/sakura.service';
import { TeacherService } from './service/teacher.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {

  loading: boolean = true;
  isTeacher: boolean;
  // isAdmin:boolean = false;

  constructor(
    private sakura: SakuraService,
    private teacherService:TeacherService
  ) {
  }


  async ngOnInit() {
    this.loading = true;
    // 取得是否教師
    await this.sakura.getMyRole();
    this.isTeacher = this.sakura.isTeacher();

    // 取得管理者
    if(this.isTeacher)
    {
      await this.teacherService.checkAdmin();
    }
    

    this.loading = false;
  }


}
