import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderState'
})
export class OrderStatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    switch (value) {
      case 0:
          return "Đang xử lý";
      case 1:
          return "Đang giao";
      case 2:
          return "Đã giao";
      case 3:
          return "Đã hủy";
      default:
          return "Hoàn trả";
    }
  }

}
