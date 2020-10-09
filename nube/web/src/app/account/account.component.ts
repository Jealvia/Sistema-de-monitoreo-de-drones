import { Component, OnInit } from '@angular/core';
import * as Constants from '../services/constants';
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  contantes = Constants;
  constructor() { }


  ngOnInit(): void {

  }

}
