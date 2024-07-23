import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { ChangeEmailAddress, ChangePassword } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';

import { CHANGE_EMAIL_ADDRESS, CHANGE_PASSWORD } from './account-change-credentials.graphql';

@Component({
  selector: 'vsf-account-change-credentials',
  templateUrl: './account-change-credentials.component.html',
  styleUrls: ['./account-change-credentials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountChangeCredentialsComponent {
  changeEmailAddressMessage = '';
  emailState = '';
  changePasswordMessage = '';
  passwordState = '';
  pModel = {
    currentPassword: '',
    newPassword: '',
  };
  eModel = {
    password: '',
    emailAddress: '',
  };

  constructor(private dataService: DataService, private changeDetectorRef: ChangeDetectorRef) {}

  changePassword() {
    this.dataService
      .mutate<ChangePassword.Mutation, ChangePassword.Variables>(CHANGE_PASSWORD, {
        old: this.pModel.currentPassword,
        new: this.pModel.newPassword,
      })
      .subscribe((data: any) => {
        const error = data.updateCustomerPassword.errorCode;
        this.pModel.currentPassword = '';
        this.pModel.newPassword = '';
        this.changeDetectorRef.markForCheck();
        if (error) {
          this.passwordState = 'error';
          this.changePasswordMessage = 'La contraseña ingresada no es válida.';
        } else {
          this.passwordState = 'success';
          this.changePasswordMessage = 'La contraseña fue actualizada correctamente.';
        }
      });
  }

  handleEmailError(error: any, data: any) {
    if (error === 'EMAIL_ADDRESS_CONFLICT_ERROR') {
      return 'La dirección de E-mail no está disponible';
    } else if (error === 'INVALID_CREDENTIALS_ERROR') {
      return 'Contraseña invalida';
    }
    return data.requestUpdateCustomerEmailAddress.message;
  }

  changeEmailAddress() {
    const email = this.eModel.emailAddress;
    this.dataService
      .mutate<ChangeEmailAddress.Mutation, ChangeEmailAddress.Variables>(CHANGE_EMAIL_ADDRESS, {
        password: this.eModel.password,
        emailAddress: this.eModel.emailAddress,
      })
      .subscribe(
        (data: any) => {
          const error = data.requestUpdateCustomerEmailAddress?.errorCode;
          this.eModel.password = '';
          this.eModel.emailAddress = '';
          this.changeDetectorRef.markForCheck();
          if (error) {
            this.emailState = 'error';
            this.changeEmailAddressMessage = this.handleEmailError(error, data);
          } else {
            this.emailState = 'success';
            this.changeEmailAddressMessage = `Para completar el proceso, por favor revisa tu E-mail (${email}) para verificar tu nueva dirección.`;
          }
        },
        err => console.log(err),
      );
  }

  resetEmailForm() {
    this.changeEmailAddressMessage = '';
  }

  resetPasswordForm() {
    this.changePasswordMessage = '';
  }
}
