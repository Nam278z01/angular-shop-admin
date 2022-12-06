import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AdminModel } from './../data/adminData';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private admin = new BehaviorSubject<AdminModel | null>(new AdminModel());
  admin$ = this.admin.asObservable();

  constructor() {

  }

  sendAdmin(admin: AdminModel | null) {
    this.admin.next(admin);
  }

}
