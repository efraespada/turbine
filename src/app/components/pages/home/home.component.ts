import { Component, OnInit } from '@angular/core';
import {DataService} from "../../../services/DataService";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor( private _dataService: DataService) { }

  ngOnInit() {
  }

}
