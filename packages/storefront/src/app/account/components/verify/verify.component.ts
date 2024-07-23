import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Verify } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { VERIFY } from './verify.graphql';

@Component({
  selector: 'vsf-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class VerifyComponent {
  password = '';
  errorMessage = '';
  showGoToLogin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private stateService: StateService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  verify() {
    const password = this.password;
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!password || !token) {
      return;
    }

    this.errorMessage = '';
    this.showGoToLogin = false;
    this.changeDetector.markForCheck();

    this.dataService
      .mutate<Verify.Mutation, Verify.Variables>(VERIFY, {
        password,
        token,
      })
      .subscribe({
        next: ({ verifyCustomerAccount }) => {
          switch (verifyCustomerAccount.__typename) {
            case 'CurrentUser':
              this.stateService.setState('signedIn', true);
              this.router.navigate(['/micuenta']);
              break;
            case 'VerificationTokenInvalidError':
            case 'VerificationTokenExpiredError':
              this.showGoToLogin = true;
              this.displayError('El token para verificar la cuenta ya no es válido');
              break;
            case 'PasswordAlreadySetError':
              this.showGoToLogin = true;
              this.displayError('La cuenta ya tiene asignada una contraseña');
              break;
            case 'PasswordValidationError':
              this.displayError('La contraseña debe tener al menos 6 caracteres, letras y números');
              break;
            default:
              this.displayError('No se pudo verificar la cuenta, volvé a intentar más tarde.');
              break;
          }
        },
      });
  }

  private displayError(message: string) {
    this.errorMessage = message;
    this.changeDetector.markForCheck();
  }
}
