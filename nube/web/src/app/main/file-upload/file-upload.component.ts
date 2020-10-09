import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import {
  HttpClient,
  HttpResponse,
  HttpRequest,
  HttpEventType,
  HttpErrorResponse,
} from "@angular/common/http";
import { catchError, last, map, tap } from "rxjs/operators";
import { of } from "rxjs/internal/observable/of";
import { Subscription } from "rxjs";

@Component({
  selector: "app-file-upload",
  templateUrl: "./file-upload.component.html",
  styleUrls: ["./file-upload.component.scss"],
  animations: [
    trigger("fadeInOut", [
      state("in", style({ opacity: 100 })),
      transition("* => void", [animate(300, style({ opacity: 0 }))]),
    ]),
  ],
})
export class FileUploadComponent implements OnInit {
  @Input() text = "Upload";
  @Input() param = "file";
  @Input() target = "https://file.io";
  @Input() accept = "text/*";
  // tslint:disable-next-line:no-output-native
  @Output() complete = new EventEmitter<any>();
  fileInformation: any;
  public files: Array<FileUploadModel> = [];

  // tslint:disable-next-line:variable-name
  constructor(private _http: HttpClient) {}

  ngOnInit() {}

  onClick() {
    console.log("-----------------------------");
    const fileUpload = document.getElementById(
      "fileUpload"
    ) as HTMLInputElement;
    fileUpload.onchange = () => {
      // tslint:disable-next-line:prefer-for-of
      console.log("ONCHANGE");
      const file = fileUpload.files[0];
      this.complete.emit(file);
      const fileUploadAfter = document.getElementById(
        "fileUpload"
      ) as HTMLInputElement;
      fileUploadAfter.files = null;
      fileUploadAfter.value = null;
      /* for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        this.files.push({
          data: file,
          state: 'in',
          inProgress: false,
          progress: 0,
          canRetry: false,
          canCancel: true
        });
      } */

      //this.uploadFiles();
    };

    fileUpload.click();
  }
}

export class FileUploadModel {
  data: File;
  state: string;
  inProgress: boolean;
  progress: number;
  canRetry: boolean;
  canCancel: boolean;
  sub?: Subscription;
}
