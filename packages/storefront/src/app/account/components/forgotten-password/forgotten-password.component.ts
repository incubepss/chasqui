import { map } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { RequestPasswordReset } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';

import { REQUEST_PASSWORD_RESET } from './forgotten-password.graphql';

@Component({
  selector: 'vsf-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ForgottenPasswordComponent {
  model = {
    emailAddress: '',
  };
  notFound = false;
  submitted = false;
  success = false;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.model.emailAddress = this.route.snapshot.paramMap.get('email') || '';
  }

  resetPassword() {
    this.dataService
      .mutate<RequestPasswordReset.Mutation, RequestPasswordReset.Variables>(REQUEST_PASSWORD_RESET, {
        emailAddress: this.model.emailAddress,
      })
      .pipe(map((response: any) => response.requestPasswordReset))
      .subscribe(response => {
        this.submitted = true;
        this.success = response.success;
        this.notFound = !this.success;
        this.changeDetector.detectChanges();
      });
  }

  reset() {
    this.success = false;
    this.submitted = false;
    this.notFound = false;
    this.changeDetector.detectChanges();
  }
}
