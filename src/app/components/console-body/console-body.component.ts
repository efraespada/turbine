import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatTabChangeEvent} from "@angular/material";
import * as stringifyAligned from 'json-align';
import {SessionService} from "../../services/session/session.service";
import {DataService} from "../../services/data/data.service";

@Component({
  selector: 'app-console-body',
  templateUrl: './console-body.component.html',
  styleUrls: ['./console-body.component.css']
})
export class ConsoleBodyComponent implements OnInit, AfterViewInit {

  static TAG: string = "console";
  options: string[] = ['GET', 'QUERY', 'POST'];
  myControl = new FormControl();

  databaseName: string;
  path: string;
  method: string;
  query: any;
  mask: any;
  obj: any;

  @ViewChild("database") databaseTextSelect;
  @ViewChild("path") pathInput;
  @ViewChild("methods") methodsGroup;
  @ViewChild("mask_get") textAreaMaskGet;
  @ViewChild("query_query") textAreaQueryQuery;
  @ViewChild("mask_query") textAreaMaskQuery;
  @ViewChild("object_post") textAreaObjectPost;
  @ViewChild("button_request") buttonRequest;
  @ViewChild("response") textAreaResponse;

  constructor(private session: SessionService, public data: DataService) {
    // nothing to do here
  }

  async ngOnInit() {
    await this.data.updateDatabases();
    /*
    this.gService.statusIO(location, ConsoleBodyComponent.TAG, (data) => {
      console.log("console message: " + JSON.stringify(data));
    });
    this.doRequest(true);
    */
  }

  doRequest(auto: boolean) {
    if (this.validRequest()) {
      this.buttonRequest.disabled = false;
      if (this.method === "post" && auto) {
        return
      }
      if (this.method === "get") {
        this.data.get(this.databaseName, this.path, this.mask).then((res) => {
          this.textAreaResponse.nativeElement.value = stringifyAligned(res)
        }).catch((err) => {
          this.textAreaResponse.nativeElement.value = stringifyAligned(err)
        });
      } else if (this.method === "query") {
        this.data.query(this.databaseName, this.path, this.query, this.mask).then((res) => {
          this.textAreaResponse.nativeElement.value = stringifyAligned(res)
        }).catch((err) => {
          this.textAreaResponse.nativeElement.value = stringifyAligned(err.message)
        });
      } else if (this.method === "post") {
        this.data.post(this.databaseName, this.path, this.obj).then((res) => {
          this.textAreaResponse.nativeElement.value = stringifyAligned(res)
        }).catch((err) => {
          this.textAreaResponse.nativeElement.value = stringifyAligned(err)
        });
      }
    } else {
      this.buttonRequest.disabled = true
    }
  }

  private validRequest(): boolean {
    return ConsoleBodyComponent.validString(this.databaseName) && ConsoleBodyComponent.validString(this.path) && ConsoleBodyComponent.validString(this.method)
      && ((this.method.toLowerCase() === "post" && ConsoleBodyComponent.validObjectPost(this.obj)) ||
        ((this.method.toLowerCase() === "query" && ConsoleBodyComponent.validObject(this.query))) ||
        (this.method.toLowerCase() === "get"));
  }

  databaseChanged(name: string) {
    this.databaseName = name;
    this.doRequest(true)
  }

  pathChanged(path: string) {
    this.path = path;
    this.doRequest(true)

  }

  maskGetChanged(mask: string) {
    try {
      this.mask = JSON.parse(mask);
      this.textAreaMaskGet.nativeElement.value = stringifyAligned(this.mask)
    } catch (e) {
      this.mask = null;
    }
    this.doRequest(true)
  }

  maskQueryChanged(mask: string) {
    try {
      this.mask = JSON.parse(mask);
      this.textAreaMaskQuery.nativeElement.value = stringifyAligned(this.mask)
    } catch (e) {
      this.mask = null;
    }
    this.doRequest(true)
  }

  queryChanged(query: string) {
    try {
      this.query = JSON.parse(query);
      this.textAreaQueryQuery.nativeElement.value = stringifyAligned(this.query)
    } catch (e) {
      this.query = null;
    }
    this.doRequest(true)
  }

  objectChanged(obj: string) {
    try {
      this.obj = JSON.parse(obj);
      this.textAreaObjectPost.nativeElement.value = stringifyAligned(this.obj)
    } catch (e) {
      this.obj = null;
    }
    this.doRequest(true)
  }

  methodChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.method = this.options[tabChangeEvent.index].toLowerCase();
    if (this.method === "get") {
      this.maskGetChanged(this.textAreaMaskGet.nativeElement.value);
      this.doRequest(true)
    } else if (this.method === "query") {
      this.queryChanged(this.textAreaQueryQuery.nativeElement.value);
      this.maskQueryChanged(this.textAreaMaskQuery.nativeElement.value);
      this.doRequest(true)
    } else {
      this.doRequest(true)
    }
  }

  ngAfterViewInit() {
    this.method = this.options[this.methodsGroup.selectedIndex].toLowerCase();
  }

  private static validString(value: string): boolean {
    return value !== null && value !== undefined && value.length > 0;
  }

  private static validObject(value: any): boolean {
    return value !== null && value !== undefined && Object.keys(value).length > 0;
  }

  private static validObjectPost(value: any): boolean {
    return value !== null && value !== undefined;
  }

}
