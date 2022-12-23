import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subscription, Observable, combineLatest, of } from 'rxjs';
import { DataTableComponent } from 'ng-devui/data-table';
import { DialogService } from 'ng-devui/modal';
import { ToastService } from 'ng-devui/toast';

import { ApiService } from 'src/app/@core/services/api.service';
import { IMAGE_API } from 'src/config/config';

@Component({
  selector: 'app-product',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  @ViewChild(DataTableComponent, { static: true }) datatable: DataTableComponent;
  @ViewChild('EditorTemplate', { static: true }) EditorTemplate: TemplateRef<any>;
  basicDataSource = [];
  basicDataSourcePag : any[] = [];
  order: any;

  deleteList: any[] = [];

  insert = true;
  doneSetup = false;
  order_state_picked: any;
  isSubmitting = false;

  editRowIndex = -1;
  image_api = IMAGE_API;

  _search = {
    order_id: '',
    customer_name: '',
  };

  pager = {
    total: 0,
    pageIndex: 1,
    pageSize: 5,
  };

  order_states = [
    { value: 0, label: 'Đang xử lý' },
    { value: 1, label: 'Đang giao' },
    { value: 2, label: 'Đã giao' },
    { value: 3, label: 'Đã hủy' },
    { value: 4, label: 'Hoàn trả' },
  ];

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
  constructor(private api: ApiService, private dialogService: DialogService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.search();
  }

  search() {
    this.busy = this.api.get('api/admin/order').subscribe((res: any) => {
      let a = JSON.parse(JSON.stringify(res));
      this.basicDataSource = a;
      this.mapOrders(this.basicDataSource);
      this.getList();
    });
  }

  getList() {
    this.busy = this.getListData(this.pager).subscribe((res: any) => {
      const data = JSON.parse(JSON.stringify(res.pageList));
      this.pager.total = res.total;
      this.basicDataSourcePag = data.filter((item: any) => {
        return (
          item.order_id.toString().toUpperCase().includes(this._search.order_id?.toUpperCase()) &&
          item.customer_name.toUpperCase().includes(this._search.customer_name?.toUpperCase())
        );
      });
    });
  }

  mapOrders(orders: any) {
    orders.forEach((order: any) => {
      order.order_state_current = order.orderstates[order.orderstates.length - 1].orderstate_name;
    });
  }

  mapOrder(order: any) {
    order.order_state_current = order.orderstates[order.orderstates.length - 1].orderstate_name;
    console.log(order.order_state_current);
    this.order_state_picked = this.order_states.filter((item: any) => item.value === order.order_state_current)[0];
    console.log(this.order_state_picked);
    this.disableOptions(order.order_state_current);
  }

  disableOptions(order_state: any) {
    this.order_states = this.order_states.map((item: any) => {
      if (order_state == 0) {
        if (item.value > 1 && item.value != 3) {
          return { ...item, disabled: true };
        }
        return { ...item, disabled: false };
      } else if (order_state == 1) {
        if (item.value < 1 || item.value > 3) {
          return { ...item, disabled: true };
        }
        return { ...item, disabled: false };
      } else if (order_state == 2) {
        if (item.value < 2 || item.value == 3) {
          return { ...item, disabled: true };
        }
        return { ...item, disabled: false };
      } else if (order_state == 3) {
        if (item.value < 3 || item.value > 3) {
          return { ...item, disabled: true };
        }
        return { ...item, disabled: false };
      } else {
        if (item.value < 4 || item.value > 4) {
          return { ...item, disabled: true };
        }
        return { ...item, disabled: false };
      }
    });
  }

  getOrder(order_id: any) {
    return this.api.get(`api/admin/order/${order_id}`);
  }

  updateOrderState() {
    this.api
      .put('api/admin/order/' + this.order.order_id, {
        orderstate_name: this.order_state_picked.value,
      })
      .subscribe((res: any) => {
        if (res) {
          this.order.orderstates.push(res);
          this.mapOrder(this.order);

          let index = this.basicDataSourcePag.findIndex((o: any) => o.order_id == this.order.order_id)
          this.basicDataSourcePag[index].orderstates.push(res);
          this.mapOrder(this.basicDataSourcePag[index]);

          this.toastService.open({
            value: [{ severity: 'success', summary: 'Thành công', content: 'Cập nhập trạng thái đơn hàng thành công' }],
          });

          this.disableOptions(this.order.order_state_current);
        } else {
          this.toastService.open({
            value: [{ severity: 'warning', summary: 'Chú ý', content: 'Đơn hàng đang ở trạng thái này!' }],
          });
        }
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
    console.log(rowIndex, nestedIndex, rowItem.$checked);
    rowItem.$checked = checked;
    rowItem.$halfChecked = false;
    this.datatable.setRowCheckStatus({
      rowIndex: rowIndex,
      nestedIndex: nestedIndex,
      rowItem: rowItem,
      checked: checked,
    });

    this.deleteList = this.datatable.getCheckedRows();
    console.log(this.deleteList);
  }

  onCheckAllChange() {
    this.deleteList = this.datatable.getCheckedRows();
  }

  editRow(index: number, order_id: any) {
    this.doneSetup = false;
    this.getOrder(order_id).subscribe((res: any) => {
      let a = JSON.parse(JSON.stringify(res));
      this.order = a;
      this.mapOrder(this.order);
      this.doneSetup = true;
    });

    this.insert = false;
    this.editRowIndex = index;
    this.editForm = this.dialogService.open({
      id: 'edit-dialog',
      width: '65%',
      title: 'Cập nhập đơn hàng',
      showAnimate: false,
      contentTemplate: this.EditorTemplate,
      backdropCloseable: true,
      onClose: () => {},
      buttons: [],
    });
  }
  onSubmitted({ valid, directive, data, errors }: any) {}

  batchDelete(deleteList: any[]) {
    if (deleteList.length > 0) {
      const results = this.dialogService.open({
        id: 'delete-dialog',
        width: '600px',
        maxHeight: '600px',
        title: 'Xóa sản phẩm',
        showAnimate: true,
        content: `Bạn có chắc chắn muốn xóa ${deleteList.length} bản ghi?`,
        backdropCloseable: true,
        onClose: () => {},
        buttons: [
          {
            cssClass: 'primary',
            text: 'Ok',
            disabled: false,
            handler: ($event: Event) => {
              if (!this.isSubmitting) {
                this.isSubmitting = true;
                this.deleteRows(deleteList).subscribe((res) => {
                  results.modalInstance.hide();
                  this.reset();
                  this.toastService.open({
                    value: [{ severity: 'success', summary: 'Thành công', content: `Xóa đơn hàng thành công!` }],
                  });
                  this.isSubmitting = false;
                });
              }
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

      console.log(results);
    }
  }

  deleteRows(deleteList: any[]) {
    let product_ids: any[] = [];
    let paths_for_delete: any[] = [];
    deleteList.forEach((product: any) => {
      product_ids.push(product.product_id);
      product.colors.forEach((color: any) => {
        color.product_image1 && paths_for_delete.push(color.product_image1);
        color.product_image2 && paths_for_delete.push(color.product_image2);
        color.product_image3 && paths_for_delete.push(color.product_image3);
        color.product_image4 && paths_for_delete.push(color.product_image4);
        color.product_image5 && paths_for_delete.push(color.product_image5);
      });
    });

    let arrayRequest = [];
    arrayRequest.push(
      this.api.post(`api/admin/file/delete`, {
        paths: paths_for_delete,
      })
    );

    arrayRequest.push(
      this.api.post('api/admin/product/deleteMulti', {
        ids: product_ids,
      })
    );

    return combineLatest(arrayRequest);
  }

  onCanceled() {
    this.editForm!.modalInstance.hide();
    this.editRowIndex = -1;
  }

  onPageChange(e: number) {
    this.pager.pageIndex = e;
    this.getList();
  }

  onSizeChange(e: number) {
    this.pager.pageSize = e;
    this.getList();
  }

  pagerList(data: any[], pager: any) {
    return data.slice(pager.pageSize! * (pager.pageIndex! - 1), pager.pageSize! * pager.pageIndex!);
  }

  getListData(pager: any): Observable<any> {
    return of({
      pageList: this.pagerList(this.basicDataSource, pager),
      total: this.basicDataSource.length,
    });
  }
}
