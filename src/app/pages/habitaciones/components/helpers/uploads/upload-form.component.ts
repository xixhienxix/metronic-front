import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileUploadService } from '../../../_services/file.upload.service';
import { FileUpload } from '../../../_models/file.upload.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.css']
})
export class UploadFormComponent implements OnInit {
  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  percentage: number;
  myRenamedFile:File
  @Input() fileName:string=''
  @Input() triggerUpload = false;
  @Output() imageSelected = new EventEmitter<boolean>();
  message:string=''
  imgURL: any;
  public imagePath;

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any) {
    if(changes.triggerUpload.currentValue!=undefined){
      if(changes.triggerUpload.currentValue===true){
        this.upload()
      }
    }
  }

  selectFile(event): void {
    this.selectedFiles = event.target.files;

    const file = this.selectedFiles.item(0);
    const typeName = file.type.split("/")[1]
    this.myRenamedFile = new File([file], this.fileName+'.'+typeName);

    var mimeType = file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }

    var reader = new FileReader();
    this.imagePath = file;
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }

    this.imageSelected.emit(true)
  }

  upload(): void {

    this.selectedFiles = undefined;

    this.currentFileUpload = new FileUpload(this.myRenamedFile);
    this.uploadService.pushFileToStorage(this.currentFileUpload).subscribe(
      percentage => {
        this.percentage = Math.round(percentage);
      },
      error => {
        console.log(error);
      }
    );
  }
}
