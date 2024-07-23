import { ChangeDetectorRef, HostListener } from '@angular/core';
/* eslint-disable @angular-eslint/directive-selector */
import { LocationStrategy } from '@angular/common';
import { Directive, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { ChannelSelectionService } from './../services/channel-selection.service';

@Directive({
  selector: '[contextRouterLink]',
})
export class ContextRouterLinkDirective extends RouterLinkWithHref {
  channelSelectionService: ChannelSelectionService;
  changeDetector: ChangeDetectorRef;

  @Input()
  set contextRouterLink(commands: any[] | string) {
    const token = this.channelSelectionService.getSelectedChannelToken();
    if (!token) {
      this.routerLink = commands;
      return;
    }

    if (!Array.isArray(commands)) {
      commands = [commands];
    }
    commands = commands.map(this.prepareCmd).filter(cmd => !!cmd);
    const contextPart = ['/', token];
    this.routerLink = contextPart.concat(commands);
  }

  constructor(
    router: Router,
    route: ActivatedRoute,
    locationStrategy: LocationStrategy,
    channelSelectionService: ChannelSelectionService,
  ) {
    super(router, route, locationStrategy);
    this.channelSelectionService = channelSelectionService;
  }

  prepareCmd(command: string): string {
    if (!command) {
      return command;
    }

    return command.replace('/', '').replace('./', '');
  }

  @HostListener('click', [
    '$event.button',
    '$event.ctrlKey',
    '$event.metaKey',
    '$event.altKey',
    '$event.shiftKey',
  ])
  onClick(button: number, ctrlKey: boolean, metaKey: boolean, altKey: boolean, shiftKey: boolean): boolean {
    // clone the checks being made in super()
    if (button !== 0 || ctrlKey || metaKey || shiftKey) {
      return true;
    }

    if (typeof this.target === 'string' && this.target !== '_self') {
      return true;
    }

    return super.onClick(button, ctrlKey, metaKey, altKey, shiftKey);
  }
}
