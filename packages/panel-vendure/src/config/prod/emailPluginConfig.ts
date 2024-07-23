import emailPluginConfig from '../common/emailPluginConfig';

const forProd = {
  ...emailPluginConfig,
  templatePath: '/app/static/email/templates',
};

export default forProd;
