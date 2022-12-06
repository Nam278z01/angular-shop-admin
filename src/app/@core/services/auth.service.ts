import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, of } from 'rxjs';

import { User } from 'src/app/@shared/models/user';
import { AdminModel } from './../data/adminData';
import { StorageService } from './storage.service';
import { BASE_API } from 'src/config/config';
import { DataService } from './data.service';
import { Router } from '@angular/router';

const USERS = [
  {
    account: 'Admin',
    gender: 'male',
    userName: 'Admin',
    password: 'DevUI.admin',
    phoneNumber: '19999996666',
    email: 'admin@devui.com',
    userId: '100',
  },
  {
    account: 'User',
    gender: 'female',
    userName: 'User',
    password: 'DevUI.user',
    phoneNumber: '19900000000',
    email: 'user@devui.com',
    userId: '200',
  },
  {
    account: 'admin@devui.com',
    gender: 'male',
    userName: 'Admin',
    password: 'devuiadmin',
    phoneNumber: '19988888888',
    email: 'admin@devui.com',
    userId: '300',
  },
];

@Injectable()
export class AuthService {
  host: string = BASE_API;
  constructor(private _storageService: StorageService, private _http: HttpClient, private _dataService: DataService, private router: Router) {}

  login(username: string, password: string) {
    let body = {
      accountname: username,
      password
    }
    let header: any = {}
    header['Content-Type'] = 'application/json';

    let options: any = {
      headers: new HttpHeaders(header)
    }

    return this._http
      .post<any>(this.host + 'api/login/admin', body, options)
  }

  logout() {
    if (this.isUserLoggedIn()) {
      let header: any = {}
      header['Content-Type'] = 'application/json';

      let customer = this.getLoggedInUser();
      console.log(customer)
      header['Authorization'] = `${customer?.token_type} ${customer?.access_token}`;

      let options: any = {
        headers: new HttpHeaders(header),
      }

      this._http.delete<any>(this.host + 'api/logout', options).subscribe((res: any) => {
        this._storageService.removeItem('CURRENT_ADMIN');
        this._dataService.sendAdmin(null);
        this.router.navigate(['login']);
      });
    }
  }

  setSession(res: any) {
    this._storageService.setItem('CURRENT_ADMIN', res)
  }

  isUserLoggedIn(): boolean {
    if (this._storageService.getItem('CURRENT_ADMIN') != null) {
      return true;
    } else {
      return false;
    }
  }

  getLoggedInUser(): AdminModel | null {
    let admin: AdminModel | null;
    if (this.isUserLoggedIn()) {
      let userData: any = JSON.parse(this._storageService.getItem('CURRENT_ADMIN') ?? '{}');
      admin = new AdminModel();
      admin.token_type = userData.token_type;
      admin.access_token = userData.access_token;
    } else {
      admin = null;
    }
    return admin;
  }

  getCurrentAdmin() {
    if (this.isUserLoggedIn()) {
      let header: any = {}
      header['Content-Type'] = 'application/json';

      let customer = this.getLoggedInUser();
      console.log(customer)
      header['Authorization'] = `${customer?.token_type} ${customer?.access_token}`;

      let options: any = {
        headers: new HttpHeaders(header),
      }

      this._http.get<AdminModel>(this.host + 'api/admin', options).subscribe((res: any) => {
        this._dataService.sendAdmin(res)
      });
    }
  }
}
