import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { DialogService, ToastService } from 'ng-devui';
import { ApiService } from 'src/app/@core/services/api.service';

@Component({
  selector: 'da-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  chartOption: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Đã giao', 'Đã hủy', 'Hoàn trả']
    },
    toolbox: {
      show: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar', 'stack'] },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    xAxis: [
      {
        type: 'category',
        axisTick: { show: false },
        data: ['2012', '2013', '2014', '2015', '2016']
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: 'Đã giao',
        type: 'bar',
        barGap: 0,
        emphasis: {
          focus: 'series'
        },
        data: [320, 332, 301, 334, 390],

      },
      {
        name: 'Đã hủy',
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        data: [220, 182, 191, 234, 290],
      },
      {
        name: 'Hoàn trả',
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        data: [220, 182, 191, 234, 290],
      },
    ]
  };

  chartOption2 :any = {};

  year: any = {
    selectedDate: new Date()
  };

  date: any = {
    selectedDate: new Date()
  };

  busy: Subscription;

  constructor(private api: ApiService, private dialogService: DialogService, private toastService: ToastService) {}

  ngOnInit() {

  }

  forDayOfMonthChart(date: any) {
    if (!date|| !date.selectedDate) {
      return false;
    }
    let chartOption = JSON.parse(JSON.stringify(this.chartOption))
    this.busy = this.api.get(`api/admin/statistic/revenue/${date?.selectedDate?.getFullYear()}/${date?.selectedDate?.getMonth() + 1}`).subscribe((res: any) => {

      let chart = JSON.parse(JSON.stringify(this.chartOption))

      let day = res.days;
      let quantity_of_order_delivered_by_day: any[] = []
      let quantity_of_order_canceled_by_day: any[] = []
      let quantity_of_order_refund_by_day: any[] = []

      res.order_state_count.forEach((item: any) => {
          quantity_of_order_delivered_by_day.push(item.delivered)
          quantity_of_order_canceled_by_day.push(item.canceled)
          quantity_of_order_refund_by_day.push(item.refund)
      });
      chart.xAxis[0].data = day.map((item: any) => new Date(item.date_field).getDate())
      chart.series[0].data = quantity_of_order_delivered_by_day
      chart.series[1].data = quantity_of_order_canceled_by_day
      chart.series[2].data = quantity_of_order_refund_by_day

      console.log(chart)

      this.chartOption2 = chart;

    });

    return true;
  }
}
