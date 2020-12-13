import { Injectable } from '@nestjs/common';

import { CacheModel } from '../models/cache.model';

@Injectable()
export class CacheService {
  private readonly cache: CacheModel = {
    data: [],
    expDate: 0,
  };

  private readonly expTime: number = 120000;

  set(cache: any[]) {
    this.cache.data = cache;
    this.cache.expDate = Date.now() + this.expTime;
  }

  get(): any[] {
    return this.cache.data;
  }

  isData(): boolean {
    return !!this.cache.data.length && this.cache.expDate > Date.now();
  }
}
