import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { ComparatorStateService } from '../core/services/comparator-state.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  protected readonly comparatorState = inject(ComparatorStateService);
  protected readonly infoOpen = signal(false);

  protected toggleInfo(): void {
    this.infoOpen.update(v => !v);
  }

  protected closeInfo(): void {
    this.infoOpen.set(false);
  }
}
