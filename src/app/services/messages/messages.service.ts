import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class MessagesService {

  private _currentMessage: string;
  private _currentType: string;

  constructor() {

  }

  get currentMessage(): string {
    return this._currentMessage;
  }

  set currentMessage(value: string) {
    console.log("_currentMessage A: " + this._currentMessage)
    this._currentMessage = value;
    console.log("_currentMessage B: " + this._currentMessage)
  }

  get currentType(): string {
    return this._currentType;
  }

  set currentType(value: string) {
    this._currentType = value;
  }

}
