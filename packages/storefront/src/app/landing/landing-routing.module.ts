import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LandingResolver } from './providers/landing.resolver';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    resolve: {
      channel: LandingResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandingRoutingModule {}
