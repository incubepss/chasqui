import { ShippingOptions } from '@vendure/core';
import { defaultChasquiShippingCalculator } from '../../promotions/defaultChasquiShippingCalculator';

const shippingOptionsConfig: ShippingOptions = {
  shippingCalculators: [defaultChasquiShippingCalculator],
};

export default shippingOptionsConfig;
