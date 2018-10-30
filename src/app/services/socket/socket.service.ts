import {Injectable} from '@angular/core';
import {Socket} from "ngx-socket-io";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) {
    this.socket.on('connect', () => {});
  }

  /**
   * Returns databases info
   * @param callback
   * @param access
   */
  retrieveDatabasesInfo(callback, access) {
    this.socket.on('status', (data) => {
      callback(data);
    });
    this.socket.emit("message", access);
  }

  /**
   * Returns mode info
   * @param callback
   * @param access
   */
  retrieveMode(callback, access) {
    this.socket.on('mode', (data) => {
      callback(data.mode);
    });
    this.socket.emit("mode", access);
  }

}
