import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SignIn } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { SIGN_IN } from './sign-in.graphql';

@Component({
  selector: 'vsf-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  @Input() navigateToOnSuccess: any[] | undefined;
  @Input() displayRegisterLink = true;
  @Input() illustration = true;

  model = {
    emailAddress: '',
    password: '',
    rememberMe: false,
    invalid: false,
    invalidMessage: '',
  };

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.model.emailAddress = this.route.snapshot.paramMap.get('email') || '';
  }

  signIn() {
    this.model.invalid = false;
    this.changeDetector.markForCheck();
    this.dataService
      .mutate<SignIn.Mutation, SignIn.Variables>(SIGN_IN, {
        emailAddress: this.model.emailAddress,
        password: this.model.password,
        rememberMe: this.model.rememberMe,
      })
      .subscribe({
        next: ({ login }) => {
          switch (login.__typename) {
            case 'CurrentUser':
              this.stateService.setState('signedIn', true);
              const commands = this.navigateToOnSuccess || ['/micuenta'];
              this.router.navigate(commands);
              break;
            case 'NativeAuthStrategyError':
            case 'InvalidCredentialsError':
              this.displayError('Credenciales invalidas. Por favor intentá de nuevo');
              break;
            case 'NotVerifiedError':
              this.displayError(
                'Todavía te falta verificar tu cuenta, revisá tu correo y verificá el E-Mail para finalizar la creación de tu cuenta',
              );
              break;
            default:
              this.displayError('Ocurrió un error no esperado, intentá más tarde nuevamente');
              break;
          }
        },
      });
  }

  private displayError(message: string) {
    this.model.invalid = true;
    this.model.invalidMessage = message;
    this.changeDetector.markForCheck();
  }
}
