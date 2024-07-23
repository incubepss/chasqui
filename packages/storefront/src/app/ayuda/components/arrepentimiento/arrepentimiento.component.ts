import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../core/providers/data/data.service';

import { ARREPENTIMIENTO_REQUEST } from './arrepentimiento.graphql';

@Component({
  selector: 'vsf-arrepentimiento',
  templateUrl: './arrepentimiento.component.html',
  styleUrls: ['./arrepentimiento.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrepentimientoComponent implements OnInit {
  arrepentimientoForm: FormGroup;
  isSending = false;
  isRequestSended = false;
  showConfirmCancel = false;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.arrepentimientoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/(\+?54)?(15|(0?\d{0,4}))?((\d{4})(\d{4}))/g)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
    });
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.arrepentimientoForm.controls;
  }

  onSubmit() {
    // stop here if form is invalid
    if (this.arrepentimientoForm.invalid) {
      this.arrepentimientoForm.markAllAsTouched();
      this.changeDetector.markForCheck();
      return;
    }

    this.isSending = false;
    this.changeDetector.markForCheck();

    this.dataService
      .mutate(ARREPENTIMIENTO_REQUEST, {
        input: this.arrepentimientoForm.value,
      })
      .subscribe(result => {
        this.isSending = false;
        this.isRequestSended = true;
        this.changeDetector.markForCheck();
      });
  }

  onCancel() {
    if (this.arrepentimientoForm.dirty) {
      this.showConfirmCancel = true;
      this.changeDetector.markForCheck();
    } else {
      this.arrepentimientoForm.reset();
    }
  }

  closeCancel() {
    this.showConfirmCancel = false;
    this.changeDetector.markForCheck();
  }

  doCancel() {
    this.arrepentimientoForm.reset();
    this.closeCancel();
  }
}
