import path from 'path';
import dotenv from 'dotenv';
import {
  EmailPluginDevModeOptions,
  EmailPluginOptions,
  defaultEmailHandlers,
  passwordResetHandler,
  emailVerificationHandler,
  emailAddressChangeHandler,
  orderConfirmationHandler,
} from '@vendure/email-plugin';

// import { emailExpirationOrderHandler } from '../../plugins/chasqui-plugin/expiration-order/email/emailExpirationOrderHandler';
import { emailArrepentimientoHandler } from '../../plugins/chasqui-plugin/arrepentimiento/email/emailArrepentimientoHandler';
import { emailPagoRecibidoMPHandler } from '../../plugins/chasqui-plugin/payment-mercadopago/email/emailPagoRecibidoMPHandler';

import { orderConfirmationChasquiHandler } from '../../emails/handlers/order-confirmation-chasqui/order-confirmation-chasqui.handler';
import { orderConfirmationToStoreHandler } from '../../emails/handlers/order-confirmation-chasqui/order-confirmation-tostore.handler';
import { orderGroupConfirmationHandler } from '../../emails/handlers/ordergroup-confirmation/ordergroup-confirmation.handler';
import { orderGroupConfirmationToStoreHandler } from '../../emails/handlers/ordergroup-confirmation/ordergroup-confirmation-tostore.handler';

import { ROUTES } from './routes';

dotenv.config();
const env = process.env;

passwordResetHandler.setSubject('{{emailSubjectEnvironmentFlag}}Blanqueo de contraseña olvidada');
emailVerificationHandler.setSubject('{{emailSubjectEnvironmentFlag}}Verificación de tu dirección de email');
emailAddressChangeHandler.setSubject(
  '{{emailSubjectEnvironmentFlag}}Verificación de cambio de dirección de email',
);

// Deshabilitado en envio de pedidos expirados (story zentao.#170)
// defaultEmailHandlers.push(emailExpirationOrderHandler);
defaultEmailHandlers.push(emailArrepentimientoHandler);
defaultEmailHandlers.push(emailPagoRecibidoMPHandler);
defaultEmailHandlers.push(orderConfirmationToStoreHandler);
defaultEmailHandlers.push(orderGroupConfirmationHandler);
defaultEmailHandlers.push(orderGroupConfirmationToStoreHandler);

const indexDefaultOrderConfirm = defaultEmailHandlers.indexOf(orderConfirmationHandler);
if (indexDefaultOrderConfirm > -1) {
  defaultEmailHandlers.splice(indexDefaultOrderConfirm, 1, orderConfirmationChasquiHandler);
}

const paramsTemplateEnv = {
  fromAddress: env.FROM_ADDRESS || 'Compras en Tiendas Chasqui <noreply@tiendaschasqui.ar>',
  verifyEmailAddressUrl: env.VERIFY_EMAIL_ADDRESS_URL || 'http://localhost:4000/micuenta/verificar',
  passwordResetUrl: env.PASSWORD_RESET_URL || 'http://localhost:4000/micuenta/blanqueo-de-password',
  changeEmailAddressUrl: env.CHANGE_EMAIL_ADDRESS_URL || 'http://localhost:4000/micuenta/cambio-email',
  myOrdersUrl: env.MY_ORDERS_URL || 'http://localhost:4000/micuenta/pedidos',
  emailSubjectEnvironmentFlag: env.EMAIL_SUBJECT_ENVIRONMENT_FLAG || '',
};

const emailPluginConfigDev: EmailPluginDevModeOptions = {
  devMode: true,
  outputPath: path.join(__dirname, '../../emails/test-emails'),
  route: ROUTES.emailTestPath,
  handlers: defaultEmailHandlers,
  templatePath: path.join(__dirname, '../../emails/templates'),
  globalTemplateVars: {
    // The following variables will change depending on your storefront implementation
    ...paramsTemplateEnv,
  },
};

const emailPluginConfigReal: EmailPluginOptions = {
  templatePath: path.join(__dirname, '../../emails/templates'),
  handlers: defaultEmailHandlers,
  transport: {
    type: 'smtp',
    host: env.EMAIL_HOST || '',
    port: parseInt(env.EMAIL_PORT || '587'),
    // secure: false,
    auth: {
      user: env.EMAIL_USERNAME || '',
      pass: env.EMAIL_PASSWORD || '',
    },
  },
  globalTemplateVars: {
    // The following variables will change depending on your storefront implementation
    ...paramsTemplateEnv,
  },
};

export default env.EMAIL_DEVMODE === 'true' ? emailPluginConfigDev : emailPluginConfigReal;
