import { DeepPartial } from '@vendure/common/lib/shared-types';
import { Asset, Channel, ChannelAware, VendureEntity } from '@vendure/core';
import { Column, Entity, ManyToOne, JoinTable, ManyToMany } from 'typeorm';

export interface IProductor {
  name: string;
  slug: string;
  descriptionOffered: string;
  description: string;
  sellos: string[];
  pais: string;
  provincia: string;
  localidad: string;
  direccion: string;
  webUrl: string;
  email: string;
  logo: Asset;
  banner: Asset;
  enabled: boolean;
}

@Entity()
export class Productor extends VendureEntity implements ChannelAware, IProductor {
  constructor(input?: DeepPartial<Productor>) {
    super(input);
  }

  @Column('varchar', { length: 255, default: '' })
  name: string;

  @Column('varchar', { length: 255, unique: false })
  slug: string;

  @Column({ default: true })
  enabled: boolean;

  @Column('varchar', { length: 255, nullable: true, default: null })
  descriptionOffered: string;

  @Column('text', { nullable: true, default: null })
  description: string;

  @Column('varchar', { length: 50, nullable: true, default: null })
  pais: string;

  @Column('varchar', { length: 50, nullable: true, default: null })
  provincia: string;

  @Column('varchar', { length: 70, nullable: true, default: null })
  localidad: string;

  @Column('varchar', { length: 255, nullable: true, default: null })
  direccion: string;

  @ManyToOne(() => Asset, { onDelete: 'SET NULL', eager: true })
  logo: Asset;

  @ManyToOne(() => Asset, { onDelete: 'SET NULL', eager: true })
  banner: Asset;

  @Column('simple-array', { nullable: true })
  sellos: string[];

  @Column('text', { nullable: true })
  webUrl: string;

  @Column('varchar', { length: 150, nullable: true })
  email: string;

  @Column('simple-array', { nullable: true })
  linksRRSS: string[];

  @ManyToMany(() => Channel)
  @JoinTable()
  channels: Channel[];
}
