import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ResetPassword } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';
import { RESET_PASSWORD } from './reset-password.graphql';

@Component({
  selector: 'vsf-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  pModel = {
    password: '',
    error: '',
    invalidToken: false,
  };

  private readonly token: string | undefined;

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || undefined;
    if (!this.token) {
      this.pModel.error = 'Falta un token de blanqueo, no se puede blanquear la contraseña';
    }
  }

  confirmPasswordReset() {
    if (!this.token) {
      return;
    }

    this.pModel.error = '';
    this.pModel.invalidToken = false;
    this.changeDetector.markForCheck();

    this.dataService
      .mutate<any, ResetPassword.Variables>(RESET_PASSWORD, {
        token: this.token,
        password: this.pModel.password,
      })
      .subscribe({
        next: ({ resetPassword }) => {
          switch (resetPassword.__typename) {
            case 'CurrentUser':
              this.stateService.setState('signedIn', true);
              this.router.navigate(['/micuenta']);
              break;
            case 'NotVerifiedError':
              this.displayError('No se puede blanquear la cuenta, el E-Mail no está verificado.');
              break;
            case 'PasswordResetTokenExpiredError':
            case 'PasswordResetTokenInvalidError':
              this.pModel.invalidToken = true;
              this.displayError('El token para blanquear la contraseña, ya no es valido');
              break;
            default:
              this.displayError('No se pudo blanquear la cuenta, volvé a intentar más tarde.');
              break;
          }
        },
      });
  }

  private displayError(message: string) {
    this.pModel.error = message;
    this.changeDetector.markForCheck();
  }
}
