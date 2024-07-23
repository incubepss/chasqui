import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CustomSurcharge } from './CustomSurcharge.entity';

@Entity()
export class CustomSurchargeOption extends VendureEntity {
  constructor(input?: DeepPartial<CustomSurchargeOption>) {
    super(input);
  }

  @Column()
  description: string;

  @Column({ default: '' })
  sku: string;

  @Column({ default: 0 })
  listPrice: number;

  @ManyToOne(() => CustomSurcharge, customSurcharge => customSurcharge.options, { onDelete: 'CASCADE' })
  customSurcharge: CustomSurcharge;
}
