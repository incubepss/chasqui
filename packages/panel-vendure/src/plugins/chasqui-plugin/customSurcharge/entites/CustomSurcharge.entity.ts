import { DeepPartial } from '@vendure/common/lib/shared-types';
import { Channel, VendureEntity } from '@vendure/core';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CustomSurchargeOption } from './CustomSurchargeOption.entity';

@Entity()
export class CustomSurcharge extends VendureEntity {
  constructor(input?: DeepPartial<CustomSurcharge>) {
    super(input);

    if (input?.options) {
      input.options = input.options.map(raw => new CustomSurchargeOption(raw));
    }
  }

  @Column('varchar', { length: 255, default: '' })
  name: string;

  @Column('varchar', { default: '' })
  question: string;

  @Column({ default: true })
  enabled: boolean;

  @OneToMany(() => CustomSurchargeOption, option => option.customSurcharge, { eager: true })
  options: CustomSurchargeOption[];

  @ManyToOne(() => Channel)
  channel: Channel;
}
