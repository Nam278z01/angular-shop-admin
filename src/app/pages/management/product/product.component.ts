import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { DataTableComponent } from 'ng-devui/data-table';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { DialogService } from 'ng-devui/modal';
import { ToastService } from 'ng-devui/toast';

import { ApiService } from 'src/app/@core/services/api.service';
import { IMAGE_API } from 'src/config/config';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  public Editor = ClassicEditor;

  @ViewChild(DataTableComponent, { static: true }) datatable: DataTableComponent;
  @ViewChild('EditorTemplate', { static: true }) EditorTemplate: TemplateRef<any>;
  basicDataSource = [];

  categoryOptions = [];
  categoryForEditOptions = [];
  categoryChosen: any;
  subcategoryChosen = [];

  deleteList: any[] = [];
  files_for_delete: any[] = [];
  product: any = {};

  insert = true;
  doneSetup: Subscription;
  isSubmitting = false;
  isHasEnoughImage = true;

  editRowIndex = -1;

  sortOptions = [
    {
      label: 'Hàng mới',
      value: 1,
    },
    {
      label: 'Bán chạy',
      value: 2,
    },
    {
      label: 'Giá giảm nhiều',
      value: 3,
    },
    {
      label: 'Giá tăng dần',
      value: 4,
    },
    {
      label: 'Giá giảm dần',
      value: 5,
    },
  ];
  sortChosen = this.sortOptions[0];

  image_api = IMAGE_API;

  _search = {
    category_id: null,
    list_subcategory_id: null,
    text_search: null,
    min_price: null,
    max_price: null,
    sort: 1,
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
  constructor(private api: ApiService, private dialogService: DialogService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.getCategories();
    this.getList();
  }

  search() {
    this.getList();
  }

  getList() {
    console.log(this.sortChosen);
    let category_id = this.categoryChosen?.category_id;
    let sort = this.sortChosen.value;

    let list_subcategory_id =
      this.subcategoryChosen.length > 0 ? JSON.stringify(this.subcategoryChosen.map((item: any) => item.subcategory_id)) : null;

    const data = {
      page: this.pager.pageIndex,
      page_size: this.pager.pageSize,
      ...this._search,
      category_id,
      list_subcategory_id,
      sort,
    };

    this.busy = this.api.get('api/product/search', data).subscribe((res: any) => {
      let a = JSON.parse(JSON.stringify(res));
      this.basicDataSource = a.data;
      this.pager.total = a.total_row;
    });
  }

  getCategories() {
    this.api.get('api/category/get-all').subscribe((res: any) => {
      this.categoryForEditOptions = JSON.parse(JSON.stringify(res));

      let a = JSON.parse(JSON.stringify(res));

      a.unshift({
        category_name: '--Tất cả--',
        subcategories: [],
      });
      this.categoryOptions = a;
      this.categoryChosen = this.categoryOptions[0];

      console.log(this.categoryChosen);
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

  initialProduct() {
    const product = {
      product_discount: 0,
      product_description: null,
      colors: [
        {
          color_name: '',
          product_price: 0,
          sizes: [
            {
              size_name: '',
              quantity: 0,
            },
          ],
          files: [...Array(5)],
          files_for_delete: [],
        },
      ],
      sizes: [
        {
          size_name: '',
          quantity: 0,
        },
      ],
    };
    this.files_for_delete = [];
    return product;
  }

  addColor() {
    this.product.colors.push({
      color_name: '',
      sizes: JSON.parse(JSON.stringify([...this.product.sizes])),
      files: [...Array(5)],
      files_for_delete: [],
    });
  }

  removeColor(index: number) {
    if (this.product.colors.length > 1) {
      if (!this.insert) {
        let colors_of_product = this.product.colors[index];
        colors_of_product.product_image1 && this.files_for_delete.push(colors_of_product.product_image1);
        colors_of_product.product_image2 && this.files_for_delete.push(colors_of_product.product_image2);
        colors_of_product.product_image3 && this.files_for_delete.push(colors_of_product.product_image3);
        colors_of_product.product_image4 && this.files_for_delete.push(colors_of_product.product_image4);
        colors_of_product.product_image5 && this.files_for_delete.push(colors_of_product.product_image5);
      }
      this.product.colors.splice(index, 1);
    }
  }

  addSize() {
    this.product.sizes.push({
      size_name: '',
      quantity: 0,
    });
    this.product.colors.forEach((color: any) => {
      color.sizes.push({
        size_name: '',
        quantity: 0,
      });
    });
  }

  changeSizeName(index: number, size: any) {
    this.product.colors.forEach((color: any) => {
      color.sizes[index].size_name = size.size_name;
    });
  }

  removeSize(index: number) {
    if (this.product.sizes.length > 1) {
      this.product.sizes.splice(index, 1);
    }
    this.product.colors.forEach((color: any) => {
      color.sizes.splice(index, 1);
    });
  }

  selectedFiles(files: any, cl: any, index: number) {
    console.log(files);
    let quantity = files.addedFiles.length + cl.files.filter((file: any) => file != undefined).length;
    cl.product_image1 && quantity++;
    cl.product_image2 && quantity++;
    cl.product_image3 && quantity++;
    cl.product_image4 && quantity++;
    cl.product_image5 && quantity++;
    if (quantity <= 5) {
      let [one_file, ...several_files] = files.addedFiles;
      cl.files[index] = one_file;
      cl.files.forEach(function (file: any, index: number) {
        if (!file && !cl[`product_image${index + 1}`]) {
          cl.files[index] = several_files.shift();
        }
      });
    } else {
      this.toastService.open({
        value: [{ severity: 'warn', summary: 'Chú ý', content: 'Tối đa 5 ảnh/màu!' }],
      });
    }
  }

  removeFile(cl: any, index: number) {
    if (cl.files) {
      cl.files[index] = undefined;
    }
    if (!this.insert) {
      cl.files_for_delete.push(cl[`product_image${index + 1}`]);
      cl[`product_image${index + 1}`] = null;
    }
  }

  addRow() {
    this.insert = true;
    this.product = this.initialProduct();
    this.editForm = this.dialogService.open({
      id: 'edit-dialog',
      width: '65%',
      title: 'Thêm sản phẩm',
      showAnimate: false,
      contentTemplate: this.EditorTemplate,
      backdropCloseable: true,
      onClose: () => {},
      buttons: [],
    });
  }

  editRow(index: number, product_id: any) {
    this.product = this.initialProduct();
    this.doneSetup = this.getProductById(product_id).subscribe((res: any) => {
      this.product = this.mapProductForModal(res);
    });
    this.insert = false;
    this.editRowIndex = index;
    this.editForm = this.dialogService.open({
      id: 'edit-dialog',
      width: '65%',
      title: 'Cập nhập sản phẩm',
      showAnimate: false,
      contentTemplate: this.EditorTemplate,
      backdropCloseable: true,
      onClose: () => {},
      buttons: [],
    });
  }

  getFileToUpload(product: any) {
    this.isHasEnoughImage = true;
    let _this = this;
    let files = product.colors
      .reduce(function (files: any, colorCurrent: any) {
        if (!colorCurrent.files[0] && !colorCurrent.product_image1) {
          _this.isHasEnoughImage = false;
          _this.toastService.open({
            value: [{ severity: 'warn', summary: 'Chú ý', content: `Bắt buộc sản phẩm mỗi màu phải có ảnh đầu tiên!` }],
          });
        }
        return [...files, ...colorCurrent.files];
      }, [])
      .filter(function (file: any) {
        return file != undefined;
      });
    return files;
  }

  getFilePathForDelete() {
    let paths_for_delete = this.product.colors.reduce(function (paths_for_delete: any, colorCurrent: any) {
      return [...paths_for_delete, ...colorCurrent.files_for_delete];
    }, []);

    return paths_for_delete;
  }

  onSubmitted({ valid, directive, data, errors }: any) {
    console.log('Valid:', valid, 'Directive:', directive, 'data', data, 'errors', errors);
    if (!valid) {
      this.toastService.open({
        value: [{ severity: 'warn', summary: 'Chú ý', content: `Chưa điền đủ thông tin được yêu cầu!` }],
      });
      return false;
    }
    if (this.isSubmitting) {
      return false;
    }
    let files = this.getFileToUpload(this.product);
    if (!this.isHasEnoughImage) {
      return false;
    }
    this.isSubmitting = true;

    console.log(files);
    if ((files && files.length) || !this.insert) {
      this.api.upload('api/admin/file', files).subscribe((res: any) => {
        let productToUpdate = this.mapProductToUpdate(res);

        if (this.insert) {
          this.api.post('api/admin/product', productToUpdate).subscribe((res: any) => {
            this.reset();
            this.product = this.initialProduct();
            this.toastService.open({
              value: [{ severity: 'success', summary: 'Thành công', content: `Thêm sản phẩm thành công!` }],
            });

            this.isSubmitting = false;
            this.isHasEnoughImage = true;
          })
        }
        else {
          let paths_for_delete = this.getFilePathForDelete();

          let arrayRequest = [];
          arrayRequest.push(this.api.post(`api/admin/file/delete`, {
            paths: [
              ...paths_for_delete,
              ...this.files_for_delete,
            ],
          }));
          arrayRequest.push(this.api.put(`api/admin/product/${productToUpdate.product_id}`, productToUpdate));

          combineLatest(arrayRequest).subscribe((res: any[]) => {
            this.product = this.mapProductForModal(res[1]);
            this.reset();

            this.toastService.open({
              value: [{ severity: 'success', summary: 'Thành công', content: `Cập nhập sản phẩm thành công!` }],
            });

            this.isSubmitting = false;
            this.isHasEnoughImage = true;
          })
        }
      });
    }
    return true;
  }

  mapProductToUpdate(filenames: any[]) {
    let path_of_files = filenames;
    //Enter src img
    this.product.colors.forEach(function (color: any) {
      color.files.forEach(function (file: any, index: number) {
        if (file != undefined) {
          color[`product_image${index + 1}`] = path_of_files.shift();
        }
      });
    });

    this.product.subcategory_id = this.product.subcategory.subcategory_id;

    //Remove sizes, files, files_for_delete
    let { sizes, ...product_new } = this.product;
    product_new = JSON.parse(JSON.stringify(product_new));
    this.product.colors.forEach(function ({ files, files_for_delete, ...color }: any, index: number) {
      product_new.colors[index] = color;
    });

    return product_new;
  }

  getProductById(product_id: any) {
    return this.api.get(`api/product/get-detail/${product_id}`);
  }

  mapProductForModal(product: any) {
    let mapProduct = JSON.parse(JSON.stringify(product));

    // Select category & subcategory
    mapProduct.category = this.categoryForEditOptions.find((c: any) => {
      return c.category_id == mapProduct.subcategory.category_id;
    });

    mapProduct.subcategory = mapProduct.category.subcategories.find(
      (sc: any) => sc.subcategory_id == mapProduct.subcategory.subcategory_id
    );

    // Size
    mapProduct.sizes = JSON.parse(JSON.stringify(mapProduct.colors[0].sizes));
    mapProduct.sizes.forEach((size: any) => {
      size.quantity = 0;
    });

    // Color
    mapProduct.colors.forEach((color: any) => {
      color.files = [...Array(5)];
      color.files_for_delete = [];
    });

    console.log(mapProduct);

    this.files_for_delete = [];
    return mapProduct;
  }

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
                    value: [{ severity: 'success', summary: 'Thành công', content: `Xóa sản phẩm thành công!` }],
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
      product_ids.push(product.product_id)
      product.colors.forEach((color: any) => {
        color.product_image1 && paths_for_delete.push(color.product_image1);
        color.product_image2 && paths_for_delete.push(color.product_image2);
        color.product_image3 && paths_for_delete.push(color.product_image3);
        color.product_image4 && paths_for_delete.push(color.product_image4);
        color.product_image5 && paths_for_delete.push(color.product_image5);
      });
    })

    let arrayRequest = [];
    arrayRequest.push(this.api.post(`api/admin/file/delete`, {
      paths: paths_for_delete,
    }));

    arrayRequest.push(this.api.post('api/admin/product/deleteMulti', {
      ids: product_ids
    }))

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
}
