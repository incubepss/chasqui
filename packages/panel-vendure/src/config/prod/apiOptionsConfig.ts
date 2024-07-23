import dotenv from 'dotenv';
import { ApiOptions } from '@vendure/core';

import apiOptionsConfig from '../common/apiOptionsConfig';

dotenv.config();

const apiOptionsConfigProd: ApiOptions = {
  ...apiOptionsConfig,
  adminApiDebug: false,
  shopApiDebug: false,
};

export default apiOptionsConfigProd;
