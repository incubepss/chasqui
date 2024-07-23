import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Register } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';

import { REGISTER } from './register.graphql';

@Component({
  selector: 'vsf-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  model = { firstName: '', lastName: '', emailAddress: '' };
  registrationSent = false;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.model.emailAddress = this.route.snapshot.paramMap.get('email') || '';
  }

  register() {
    this.dataService
      .mutate<Register.Mutation, Register.Variables>(REGISTER, {
        input: {
          emailAddress: this.model.emailAddress,
          firstName: this.model.firstName,
          lastName: this.model.lastName,
        },
      })
      .subscribe(() => {
        this.registrationSent = true;
        this.changeDetector.markForCheck();
      });
  }
}
