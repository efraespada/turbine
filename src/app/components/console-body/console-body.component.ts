import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {GoogleAuthService} from "../../services/google-auth/google-auth.service";
import {RouterService} from "../../services/router/router.service";
import {MessagesService} from "../../services/messages/messages.service";
import {FormControl} from "@angular/forms";
import {ApiService} from "../../services/api/api.service";
import {MatTabChangeEvent} from "@angular/material";
import * as stringifyAligned from 'json-align';
import {ITurbineGet} from "../../services/api/i.turbine.get";
import {ITurbinePost} from "../../services/api/i.turbine.post";
import {ITurbineQuery} from "../../services/api/i.turbine.query";


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

  constructor(public router: RouterService, public gService: GoogleAuthService, public messages: MessagesService,
              public api: ApiService) {
    // nothing to do here
  }

  ngOnInit() {
    this.gService.update((logged) => {
      if (!logged) {
        // nothing to do here (yet)
      }
    }, location, ConsoleBodyComponent.TAG);
    this.doRequest(true);
  }

  doRequest(auto: boolean) {
    if (this.validRequest()) {
      this.buttonRequest.disabled = false;
      if (this.method === "post" && auto) {
        return
      }
      let cbc = this;
      console.log("method: " + this.method);
      if (this.method === "get") {
        this.api.turbineGet(this.databaseName, this.path, this.mask, new class implements ITurbineGet {
          response(response: any) {
            cbc.textAreaResponse.nativeElement.value = stringifyAligned(response)
          }

          error(error: any) {
            cbc.textAreaResponse.nativeElement.value = stringifyAligned(error)
          }
        });
      } else if (this.method === "query") {
        this.api.turbineQuery(this.databaseName, this.path, this.query, this.mask, new class implements ITurbineQuery {
          response(response: any) {
            cbc.textAreaResponse.nativeElement.value = stringifyAligned(response)
          }

          error(error: any) {
            cbc.textAreaResponse.nativeElement.value = stringifyAligned(error)
          }
        });
      } else if (this.method === "post") {
        this.api.turbinePost(this.databaseName, this.path, this.obj, new class implements ITurbinePost {
          response(response: any) {
            cbc.textAreaResponse.nativeElement.value = stringifyAligned(response)
          }

          error(error: any) {
            cbc.textAreaResponse.nativeElement.value = stringifyAligned(error)
          }
        })
      }

    } else {
      this.buttonRequest.disabled = true
    }

  }

  private validRequest(): boolean {
    return this.validString(this.databaseName) && this.validString(this.path) && this.validString(this.method)
      && ((this.method.toLowerCase() === "post" && this.validObjectPost(this.obj)) ||
        ((this.method.toLowerCase() === "query" && this.validObject(this.query))) ||
        (this.method.toLowerCase() === "get"));
  }

  private validString(value: string): boolean {
    return value !== null && value !== undefined && value.length > 0;
  }

  private validObject(value: any): boolean {
    return value !== null && value !== undefined && Object.keys(value).length > 0;
  }

  private validObjectPost(value: any): boolean {
    return value !== null && value !== undefined;
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

}
