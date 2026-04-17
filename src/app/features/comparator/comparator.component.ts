import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ComparatorStateService } from '../../core/services/comparator-state.service';
import { GeoLocation } from '../../core/models/location.model';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CityColumnComponent } from './components/city-column/city-column.component';

@Component({
  selector: 'app-comparator',
  imports: [SearchBarComponent, CityColumnComponent],
  templateUrl: './comparator.component.html',
  styleUrl: './comparator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparatorComponent {
  protected readonly state = inject(ComparatorStateService);
  private readonly router = inject(Router);

  onLocationSelected(location: GeoLocation): void {
    this.state.addCity(location);
  }

  removeCity(id: string): void {
    this.state.removeCity(id);
  }

  clearAll(): void {
    this.state.clearAll();
  }

  goToMap(): void {
    this.router.navigate(['/']);
  }
}
