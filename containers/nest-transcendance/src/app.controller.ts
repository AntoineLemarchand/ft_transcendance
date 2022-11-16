import { Controller, Get, Body } from '@nestjs/common';
import { AppService } from './app.service';

class RequestBody {
	readonly name: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async  myMethod(@Body() data: RequestBody) {
		console.log("get received");
		return "John";
  }
  /*
  getHello(@Query() query: { name: string }): string {
		console.log('name: ' + name);
    return this.appService.getHello();
  }
  */
}
