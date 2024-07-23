import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { TermsandconditionsComponent } from './components/termsandconditions/termsandconditions.component';
import { ArrepentimientoComponent } from './components/arrepentimiento/arrepentimiento.component';

const routes: Routes = [
  { path: 'terminosycondiciones', component: TermsandconditionsComponent },
  { path: 'arrepentimiento', component: ArrepentimientoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule],
  exports: [RouterModule],
})
export class AyudaRoutingModule {}
