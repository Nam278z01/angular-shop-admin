import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AdminModel } from '../data/adminData';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { BASE_API } from 'src/config/config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  admin: AdminModel | null;
  host = BASE_API;

  constructor(private _http: HttpClient, private _authService: AuthService, private _storageService: StorageService) {
    this.admin = this._authService.getLoggedInUser();
  }

  get<T>(url: string, params: any = {}, withToken: boolean = true) {
    let header: any = {}
    header['Content-Type'] = 'application/json';

    if (withToken) {
      header['Authorization'] = `${this.admin?.token_type} ${this.admin?.access_token}`;
    }

    let options: any = {
      headers: new HttpHeaders(header),
      params: this.getHttpParams(params)
    }

    return this._http.get<T>(this.host + url, options );
  }

  upload(url: string, files: File[], withToken: boolean = true) {
    let header: any = {}
    header['Content-Disposition'] = 'multipart/form-data';
    header['Accept'] = 'application/json';
    if (withToken) {
      header['Authorization'] = `${this.admin?.token_type} ${this.admin?.access_token}`;
    }

    let formData: FormData = new FormData();
    files.forEach((file) => { formData.append('files[]', file); });

    let options: any = {
      headers: new HttpHeaders(header),
    }

    return this._http
      .post<any>(this.host + url, formData, options)
  }

  post(url: string, body: any, params: any = {}, withToken: boolean = true) {
    let header: any = {}
    header['Content-Type'] = 'application/json';

    if (withToken) {
      header['Authorization'] = `${this.admin?.token_type} ${this.admin?.access_token}`;
    }

    let options: any = {
      headers: new HttpHeaders(header),
      params: this.getHttpParams(params),
    }

    return this._http
      .post<any>(this.host + url, body, options)
  }

  put(url: string, body: any, params: any = {}, withToken: boolean = true) {
    let header: any = {}
    header['Content-Type'] = 'application/json';

    if (withToken) {
      header['Authorization'] = `${this.admin?.token_type} ${this.admin?.access_token}`;
    }

    let options: any = {
      headers: new HttpHeaders(header),
      params: this.getHttpParams(params)
    }

    return this._http
      .put<any>(this.host + url, body, options)
  }

  delete(url: string, params: any = {}, withToken: boolean = true) {
    let header: any = {}
    header['Content-Type'] = 'application/json';

    if (withToken) {
      header['Authorization'] = `${this.admin?.token_type} ${this.admin?.access_token}`;
    }

    let options: any = {
      headers: new HttpHeaders(header),
      params: this.getHttpParams(params)
    }

    return this._http
      .delete<any>(this.host + url, options)
  }

  getHttpParams(params : any) : HttpParams {
    let httpParams : HttpParams  = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.append(key , params[key]);
      }
    });
     return httpParams;
   }
}
