import { DeepPartial } from '@vendure/common/lib/shared-types';
import { OrderAddress } from '@vendure/common/lib/generated-types';
import { Channel, Customer, ShippingLine, ShippingMethod, VendureEntity } from '@vendure/core';
import { Column, Entity, ManyToOne, OneToOne, JoinColumn } from 'typeorm';

export type OrderGroupState =
  | 'AddingOrders'
  | 'ConfirmedByOwner'
  | 'AcceptedByChannel'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Closed';

export interface IOrderGroup {
  alias: string;
  code: string;
  state: OrderGroupState;
  channel: Channel;
  customer: Customer;
  active: boolean;
  orderPlacedAt?: Date;
  totalQuantity?: number;
  subTotal?: number;
  subTotalWithTax?: number;
  shipping?: number;
  shippingWithTax?: number;
  total?: number;
  totalWithTax?: number;
  ordersQuantity?: number;
  currencyCode?: string;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  shippingLines: Array<any>;
}

@Entity()
export class OrderGroup extends VendureEntity implements IOrderGroup {
  constructor(input?: DeepPartial<OrderGroup>) {
    super(input);
  }

  @Column('varchar', { length: 50, default: '' })
  alias: string;

  @Column('varchar', { length: 30, unique: true })
  code: string;

  @Column('varchar', { length: 20, unique: false })
  state: OrderGroupState;

  @Column({ nullable: true })
  orderPlacedAt: Date;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE', eager: true })
  customer: Customer;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE', eager: true })
  channel: Channel;

  @Column('simple-json', { nullable: true })
  shippingAddress: OrderAddress;

  @Column('simple-json', { nullable: true })
  billingAddress: OrderAddress;

  @ManyToOne(() => ShippingMethod, { onDelete: 'RESTRICT', eager: true })
  shippingMethod: ShippingMethod;

  currencyCode = 'ARS';

  @OneToOne(() => ShippingLine, { nullable: true, cascade: false, eager: true })
  @JoinColumn()
  shippingLine: ShippingLine;

  get shippingLines(): Array<any> {
    return this.shippingLine ? [this.shippingLine] : [];
  }
  /**
   * calculated & hydratated on {@link OrderGroupService}
   */
  totalQuantity = 0;
  shipping = 0;
  shippingWithTax = 0;
  subTotal = 0;
  subTotalWithTax = 0;
  total = 0;
  totalWithTax = 0;
  ordersQuantity = 0;
}
