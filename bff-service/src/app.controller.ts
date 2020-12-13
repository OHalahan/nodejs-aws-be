import {
  All,
  Body,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Param,
  Req,
  Res
} from '@nestjs/common';
import {Request, Response} from 'express';

import {AppService} from './services/app.service';

const paths = new Set(['api', 'products']);

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get('ping')
  main(): string {
    return 'proxy service works';
  }

  @All(':path')
  async anyRequest(
    @Param('path') path: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<any> {
    if (paths.has(path)) {
      try {
        const response = await this.appService.response(
          path,
          `${path}${req.url}`,
          req.method.toLowerCase(),
          body,
          req.headers
        );
        return res
          .set({...response.headers})
          .status(response.status)
          .json(response.data);
      } catch {
        throw new InternalServerErrorException();
      }
    }

    if (req.originalUrl === '/favicon.ico') {
      throw new ForbiddenException({
        message: 'Forbidden'
      });
    }

    this.appService.cannotProcessRequest();
  }

  @All()
  all(): never {
    this.appService.cannotProcessRequest();
  }
}
