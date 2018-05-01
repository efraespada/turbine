import { Component, OnInit } from '@angular/core';
import {DataService} from "../../../services/DataService";

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor( private _dataService: DataService) { }

  ngOnInit() {
    
  }

}
