import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { AyudaRoutingModule } from './ayuda-routing.module';
import { ArrepentimientoComponent } from './components/arrepentimiento/arrepentimiento.component';
import { TermsandconditionsComponent } from './components/termsandconditions/termsandconditions.component';

@NgModule({
  declarations: [ArrepentimientoComponent, TermsandconditionsComponent],
  imports: [CommonModule, SharedModule, ReactiveFormsModule, AyudaRoutingModule],
})
export class AyudaModule {}
