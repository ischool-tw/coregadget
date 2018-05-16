import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BehaviorDataService {

  constructor() { }

  public addDate:string = "";

  public addComment:string = "";

  public addCheckStudentList:any;


}
