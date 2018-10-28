import {Injectable} from '@angular/core';
import {Socket} from "ngx-socket-io";
import {environment} from "../../../environments/environment";
import {d} from "@angular/core/src/render3";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private data: any;
  constructor(private socket: Socket) {
    this.socket.on('connect', () => {
      console.log("connected to socket");
    });
  }

  public sendMessage(message: string) {
    this.socket.emit("message", message);
  }

  update(callback, location, tag) {
    this.socket.on('status', (data) => {
      if (location.pathname.startsWith(environment.base + "/" + tag)) {
        this.data = data;
        callback(data);
      }
    });
    if (location.pathname.startsWith(environment.base + "/" + tag) && this.data !== null && this.data !== undefined) {
      callback(this.data);
    }
    this.socket.emit("message", {test: "test"});
  }

}
