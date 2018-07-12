import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { TeacherService } from '../service/teacher.service';
import { EquipmentService } from './../service/equipment.service';
import { ManageService, todayDetail, Action } from './../service/manage.service';
import { DialogService } from '../service/dialog.service';
import { EquipApplicationService } from '../service/equip-application.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styles: []
})
export class ManageComponent implements OnInit {

  @ViewChild("currInfo") currInfo: TemplateRef<any>;

  // 可選單位
  unitNameList: any = [];
  // 可選類別
  categoryList: any = [];
  // 搜尋關鍵字
  searchKeyWord = '';
  selectedUnitName = '';
  selectedCategory = '全部';
  isLoading = true;
  isSaving = false;
  isSearching = false;
  isLimit = true;

  detailList: todayDetail[] = [];
  currDetail: todayDetail;

  dialogRef: MatDialogRef<any>;

  constructor(
    public dialog: MatDialog,
    private teacherService: TeacherService,
    private equipmentService: EquipmentService,
    private manageService: ManageService,
    private dialogService: DialogService,
    private equipApplicationService: EquipApplicationService,
  ) { }

  async ngOnInit() {
    const isAdmin = this.teacherService.IsAdmin();
    const isUnitAdmin = this.teacherService.IsUnitAdmin();

    if (isAdmin || isUnitAdmin) {
      await this.equipmentService.getData(); // 必須要先取得設備

      const tmpUnits = this.equipmentService.getEquipUnits();
      if (isAdmin) {
        this.unitNameList = tmpUnits;
        this.selectedUnitName = '全部';
      } else if (isUnitAdmin) {
        const myEquipUnits = this.teacherService.MyEquipUnits();
        this.unitNameList = myEquipUnits.map(item => item.equip_units_name);
        this.selectedUnitName = (this.unitNameList.length) ? this.unitNameList[0] : '無單位';
      }

      this.categoryList = this.equipmentService.getEquipmentsCategory();
      this.detailList = await this.manageService.filterTodayDetails(this.selectedUnitName, this.selectedCategory, '');

      this.isLimit = false;
    }

    this.isLoading = false;
  }

  /**選擇單位 */
  async unitNameValueChange(value) {
    if (this.isSearching) return;

    this.isSearching = true;
    this.detailList = await this.manageService.filterTodayDetails(value, this.selectedCategory, '');
    this.isSearching = false;
  }

  /**選擇類型 */
  async categoryValueChange(value) {
    if (this.isSearching) return;

    this.isSearching = true;
    this.detailList = await this.manageService.filterTodayDetails(this.selectedUnitName, value, '');
    this.isSearching = false;
  }

  /**搜尋 */
  async searchButtonClick() {
    if (this.isSearching) return;

    this.isSearching = true;
    if (this.searchKeyWord) {
      this.detailList = await this.manageService.filterTodayDetails(this.selectedUnitName, this.selectedCategory, this.searchKeyWord);
    } else {
      this.detailList = await this.manageService.filterTodayDetails(this.selectedUnitName, this.selectedCategory, '');
    }
    this.isSearching = false;
  }

  /**取消本次預約 */
  async doCancel() {
    const result = await this.dialogService.confirmCancel('取消預約', '請輸入取消原因？');
    if (result.confirm) {
      try {
        this.isSaving = true;
        await this.equipApplicationService.cancelDetail(this.currDetail.detail_uid, result.reason);
        this.dialogRef.close();
        this.searchButtonClick();
      } catch (error) {
        alert(error);
      } finally {
        this.isSaving = false;
      }
    }
  }

  /**借出 */
  async doEquipmentOut() {
    if (this.isSaving) return;

    const result = await this.dialogService.confirm('借出設備', '您確定嗎？');
    if (result) {
      try {
        this.isSaving = true;
        await this.manageService.setIOHistory(this.currDetail.detail_uid, Action.OUT);
        this.dialogRef.close();
        this.searchButtonClick();
      } catch (error) {
        alert(error);
      } finally {
        this.isSaving = false;
      }
    }
  }

  /**歸還 */
  async doEquipmentIn() {
    if (this.isSaving) return;

    const result = await this.dialogService.confirm('設備歸還', '您確定嗎？');
    if (result) {
      try {
        this.isSaving = true;
        await this.manageService.setIOHistory(this.currDetail.detail_uid, Action.IN);
        this.dialogRef.close();
        this.searchButtonClick();
      } catch (error) {
        alert(error);
      } finally {
        this.isSaving = false;
      }
    }
  }

  showCurrentInfo(item) {
    this.currDetail = item;

    this.dialogRef = this.dialog.open(this.currInfo, {
      maxWidth: '770px',
      width: '70vw',
    });
  }

}
