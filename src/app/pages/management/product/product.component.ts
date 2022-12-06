import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataTableComponent } from 'ng-devui/data-table';

import { ApiService } from 'src/app/@core/services/api.service';
import { IMAGE_API } from 'src/config/config';
import { DialogService } from 'ng-devui/modal';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  @ViewChild(DataTableComponent, { static: true }) datatable: DataTableComponent;
  @ViewChild('EditorTemplate', { static: true }) EditorTemplate: TemplateRef<any>;
  basicDataSource = [];

  categoryOptions = [];
  categoryChosen: any;
  subcategoryChosen = [];

  deleteList: any[] = [];

  sortOptions = [
    {
      label: 'Hàng mới',
      value: 1
    },
    {
      label: 'Bán chạy',
      value: 2
    },
    {
      label: 'Giá giảm nhiều',
      value: 3
    },
    {
      label: 'Giá tăng dần',
      value: 4
    },
    {
      label: 'Giá giảm dần',
      value: 5
    }
  ]
  sortChosen = this.sortOptions[0];

  image_api = IMAGE_API;

  _search = {
    category_id: null,
    list_subcategory_id: null,
    text_search: null,
    min_price: null,
    max_price: null,
    sort: 1
  };

  pager = {
    total: 0,
    pageIndex: 1,
    pageSize: 5,
  };


  searchForm: {
    borderType: '' | 'borderless' | 'bordered';
    size: 'sm' | 'md' | 'lg';
    layout: 'auto' | 'fixed';
  } = {
      borderType: 'bordered',
      size: 'md',
      layout: 'auto',
    };
  editForm: any = null;

  busy: Subscription;
  constructor(private api: ApiService, private dialogService: DialogService) { }

  ngOnInit(): void {
    this.getCategories();
    this.getList()
  }

  search() {
    this.getList();
  }

  getList() {
    console.log(this.sortChosen)
    let category_id = this.categoryChosen?.category_id
    let sort = this.sortChosen.value

    let list_subcategory_id = this.subcategoryChosen.length > 0 ? JSON.stringify(this.subcategoryChosen.map((item: any) => item.subcategory_id)) : null;

    const data = {
      page: this.pager.pageIndex,
      page_size: this.pager.pageSize,
      ...this._search,
      category_id,
      list_subcategory_id,
      sort
    }

    this.busy = this.api.get("api/product/search", data).subscribe((res:any) => {
      let a = JSON.parse(JSON.stringify(res));
      this.basicDataSource = a.data;
      this.pager.total = a.total_row;
    });
  }

  getCategories() {
    this.api.get("api/category/get-all").subscribe((res:any) => {
      let a = JSON.parse(JSON.stringify(res));
      a.unshift({
        category_name: '--Tất cả--',
        subcategories: []
      })
      this.categoryOptions = a;
      this.categoryChosen = this.categoryOptions[0];
      console.log(this.categoryChosen)
    });
  }

  reset() {
    this.searchForm = {
      borderType: '',
      size: 'md',
      layout: 'auto',
    };
    this.pager.pageIndex = 1;
    this.getList();
  }

  onRowCheckChange(checked: any, rowIndex: any, nestedIndex: any, rowItem: any) {
    console.log(rowIndex, nestedIndex, rowItem.$checked)
    rowItem.$checked = checked;
    rowItem.$halfChecked = false;
    this.datatable.setRowCheckStatus({
      rowIndex: rowIndex,
      nestedIndex: nestedIndex,
      rowItem: rowItem,
      checked: checked
    });

    this.deleteList = this.datatable.getCheckedRows();
    console.log(this.deleteList)
  }

  onCheckAllChange() {
    this.deleteList = this.datatable.getCheckedRows();
  }

  addRow() {
    this.editForm = this.dialogService.open({
      id: 'edit-dialog',
      width: '80%',
      title: 'editor',
      showAnimate: false,
      contentTemplate: this.EditorTemplate,
      backdropCloseable: true,
      onClose: () => {},
      buttons: [],
    });
  }

  batchDelete() {
    if (this.deleteList.length > 0) {
      const results = this.dialogService.open({
        id: 'delete-dialog',
        width: '600px',
        maxHeight: '600px',
        title: 'Xóa sản phẩm',
        showAnimate: true,
        content: `Bạn có chắc chắn muốn xóa ${this.deleteList.length} bản ghi?`,
        backdropCloseable: true,
        onClose: () => {},
        buttons: [
          {
            cssClass: 'primary',
            text: 'Ok',
            disabled: false,
            handler: ($event: Event) => {
              // this.deleteRows();
              results.modalInstance.hide();
            },
          },
          {
            id: 'btn-cancel',
            cssClass: 'common',
            text: 'Hủy',
            handler: ($event: Event) => {
              results.modalInstance.hide();
            },
          },
        ],
      });
    }
  }

  onPageChange(e: number) {
    this.pager.pageIndex = e;
    this.getList();
  }

  onSizeChange(e: number) {
    this.pager.pageSize = e;
    this.getList();
  }
}
