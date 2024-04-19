import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AxiosResponse, AxiosRequestConfig, Method } from 'axios';

import { configuration } from '../config/configuration';
import { CacheService } from './cache.service';

@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService,
    private cacheService: CacheService,
  ) {}

  response(
    recipient: string,
    url: string,
    method: string,
    data: any,
    headers: any,
  ): Promise<any> {
    const config = configuration();
    const recipientUrl = config[recipient];
    const requestUrl = `${recipientUrl}/${url}`;

    delete headers.host;

    let axiosConfig: AxiosRequestConfig = {
      headers,
      baseURL: requestUrl,
      method: method as Method,
    };

    if (data && Object.keys(data).length && method === 'post') {
      axiosConfig = { ...axiosConfig, data };
    } else if (method === 'post') {
      axiosConfig = { ...axiosConfig, data: {} };
    }

    if (url === 'products/' && method === 'get') {
      if (this.cacheService.isData()) {
        return Promise.resolve({
          status: 200,
          headers: {
            'access-control-allow-origin': '*',
            'Content-Type': 'application/json; charset=utf-8',
            'x-cache': 'proxy cache',
          },
          data: this.cacheService.get(),
        });
      }
    }

    return new Promise<any>((resolve, reject) => {
      this.httpService.request<AxiosResponse>(axiosConfig).subscribe(
        (res: AxiosResponse) => {
          const { status, headers, data } = res;
          if (url === 'products/' && method === 'get') {
            this.cacheService.set(data);
          }
          resolve({ status, headers, data });
        },
        (err) => {
          if (err.response.status < HttpStatus.INTERNAL_SERVER_ERROR) {
            const { status, headers, data } = err.response;
            resolve({ status, headers, data });
          }
          reject();
        },
      );
    });
  }

  cannotProcessRequest(): never {
    throw new HttpException(
      'Cannot process request',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
