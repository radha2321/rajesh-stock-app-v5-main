import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CompanyNames,
  Quote,
  StckInfo,
  StockInfo,
  Stocks,
} from '../../@model/stock';
import { StockInfoService } from '../../@services/stock-info.service';

@Component({
  selector: 'app-stock-info',
  templateUrl: './stock-info.component.html',
  styleUrls: ['./stock-info.component.css'],
})
export class StockInfoComponent implements OnInit, OnDestroy {
  stockTrackerFormGroup: FormGroup;
  stock: StockInfo[] = [];
  stockList: Stocks[] = [];
  quoteData = [];
  companyNames: CompanyNames;
  quotes: Quote;
  subscription: Subscription = new Subscription();

  constructor(private readonly stockService: StockInfoService) {}

  ngOnInit(): void {
    this.createStockTracerForm();
    this.getInititalStocksInfo();
  }

  createStockTracerForm(): void {
    this.stockTrackerFormGroup = new FormGroup({
      symbol: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(5),
      ]),
    });
  }

  getInititalStocksInfo(): void {
    const stocks = localStorage.getItem('stockData');
    this.stockList = stocks ? JSON.parse(stocks) : [];
  }

  submit(): void {
    this.getStckCompanyNames();
  }

  getStckCompanyNames(): void {
    const { symbol } = this.stockTrackerFormGroup.value;
    combineLatest({
      companyNames: this.stockService.getStckCompanyNames(symbol),
      quotes: this.stockService.getQuotesInfo(symbol),
    })
      .pipe(
        map((response: StckInfo) => {
          this.companyNames = response?.companyNames;
          this.quotes = response?.quotes;
          const list = {
            description: this.companyNames.result[0].description,
            symbol: this.companyNames.result[0].symbol,
          };
          this.stock.push(list);
          this.quoteData.push(this.quotes);
          for (let i = 0; i < this.stock.length; i++) {
            this.stockList[i] = {
              description: this.stock[i].description,
              symbol: this.stock[i].symbol,
              d: this.quoteData[i]?.d,
              c: this.quoteData[i]?.c,
              o: this.quoteData[i]?.o,
              h: this.quoteData[i]?.h,
            };
          }
          localStorage.setItem('stockData', JSON.stringify(this.stockList));
          this.stockTrackerFormGroup.reset();
        })
      )
      .subscribe();
  }

  removeStock(indx: number): void {
    this.stockList.splice(indx, 1);
    this.stock = this.stockList;
    localStorage.setItem('stockData', JSON.stringify(this.stockList));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
