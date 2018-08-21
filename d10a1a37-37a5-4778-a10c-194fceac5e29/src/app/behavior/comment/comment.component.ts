import { Component, OnInit } from '@angular/core';
import { GadgetService, Contract } from 'src/app/gadget.service';
import { Utils } from 'src/app/util';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['../common.css']
})
export class CommentComponent implements OnInit {
  head: string;
  accessPoint: string;
  commentTemplateInfo: any;
  defaultTemplate: any;
  userDefineTemplate: any;
  loading: boolean;
  error: any;
  addText: string;

  constructor(private gadget: GadgetService) { }
  // 取得 contract 連線。
  contract: Contract;

  async ngOnInit() {
    // 取得 contract 連線。
    this.contract = await this.gadget.getContract('kcis');
    this.getCommet();
  }

  async getCommet() {
    try {
      this.loading = true;

      // 呼叫 service。
      const rsp = await this.contract.send('behavior.GetCommentTemplate');

      this.commentTemplateInfo = Utils.array(rsp, "Response/CommentTemplate");
      this.defaultTemplate = [];
      this.userDefineTemplate = [];
      for (const comment of this.commentTemplateInfo) {
        if (comment.IsDefault === 't') {
          this.defaultTemplate.push(comment);
        } else {
          this.userDefineTemplate.push(comment);
        }
      }

      // console.log(this.commentTemplateInfo);
      // console.log(this.defaultTemplate);
      // console.log(this.userDefineTemplate);
    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }

  }

  async add() {
    // console.log(this.addText);

    if (this.addText !== undefined) {
      try {
        this.loading = true;

        // 呼叫 service。
        this.commentTemplateInfo = (await this.contract.send('behavior.AddCommentTemplate', {
          Request: {
            CommentTemplate: {
              Field: {
                Comment: this.addText,
              }
            }
          }
        })).Response.CommentTemplate;

      } catch (err) {
        console.log(err);
      } finally {
        this.loading = false;
      }
      //this.userDefineTemplate.push({ Comment: this.addText });
      this.getCommet();
    } else {
      alert("請輸入 Comment");
    }

  }

  async delete(comment) {
    console.log(comment);
    this.userDefineTemplate = this.userDefineTemplate.filter(v => v.Uid != comment.Uid);
    try {
      this.loading = true;

      // 呼叫 service。
      this.commentTemplateInfo = (await this.contract.send('behavior.DelCommentTemplate', {
        Request: {
          CommentTemplate: {
            Condition: {
              Uid: comment.Uid
            }
          }
        }
      })).Response.CommentTemplate;

    } catch (err) {
      console.log(err);
    } finally {
      this.loading = false;
    }


  }
}
