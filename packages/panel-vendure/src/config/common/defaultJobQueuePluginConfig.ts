import { DefaultJobQueueOptions } from '@vendure/core';

const jobQueueOptions: DefaultJobQueueOptions = {
  pollInterval: (queueName: string) => {
    if (queueName === 'importer-odoo-product') {
      return 1000; // == 1seg
    }
    return 200;
  },
};

export default jobQueueOptions;
