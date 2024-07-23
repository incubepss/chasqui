import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, BaseEntityResolver } from '@vendure/admin-ui/core';

@Injectable()
export class ChannelConfigDetailResolver extends BaseEntityResolver<any> {
  constructor(router: Router, dataService: DataService) {
    super(
      router,
      {
        id: '',
        name: '',
        question: '',
        enabled: true,
        options: [],
      },
      () =>
        dataService.settings
          .getActiveChannel()
          .refetchOnChannelChange()
          .mapStream((data: any) => data.activeChannel),
    );
  }
}
