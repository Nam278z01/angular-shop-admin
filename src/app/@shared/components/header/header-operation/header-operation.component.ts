import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/@core/services/auth.service';
import { LANGUAGES } from 'src/config/language-config';
import { I18nService } from 'ng-devui/i18n';

import { DataService } from './../../../../@core/services/data.service';
import { StorageService } from 'src/app/@core/services/storage.service';
import { AdminModel } from 'src/app/@core/data/adminData';

@Component({
  selector: 'da-header-operation',
  templateUrl: './header-operation.component.html',
  styleUrls: ['./header-operation.component.scss'],
})
export class HeaderOperationComponent implements OnInit {
  user: AdminModel;
  languages = LANGUAGES;
  language: string;
  haveLoggedIn = false;
  noticeCount: number;

  constructor(private route: Router, private authService: AuthService, private translate: TranslateService, private i18n: I18nService, private _dataService: DataService, private _storageService: StorageService, private router: Router, private _authService: AuthService) {}

  ngOnInit(): void {
    this._authService.getCurrentAdmin();
    if (localStorage.getItem('CURRENT_ADMIN')) {
      this._dataService.admin$.subscribe((res: any) => {
        this.user = res;
        console.log(this.user);
        this.haveLoggedIn = true;
      }, (err) => {
        this._storageService.removeItem('CURRENT_ADMIN')
        this.router.navigate(['/login'])
      })
    }
    this.language = this.translate.currentLang;
  }

  onSearch(event: any) {
    console.log(event);
  }

  onLanguageClick(language: string) {
    this.language = language;
    localStorage.setItem('lang', this.language);
    this.i18n.toggleLang(this.language);
    this.translate.use(this.language);
  }

  handleUserOps(operation: string) {
    switch (operation) {
      case 'logout': {
        this.haveLoggedIn = false;
        this.authService.logout();
        this.route.navigate(['/', 'login']);
        break;
      }
      default:
        break;
    }
  }

  handleNoticeCount(event: number) {
    this.noticeCount = event;
  }
}
