import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/app-shell.component').then(m => m.AppShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/map/map.component').then(m => m.MapComponent),
      },
      {
        path: 'compare',
        loadComponent: () => import('./features/comparator/comparator.component').then(m => m.ComparatorComponent),
      },
      {
        path: 'comfort',
        loadComponent: () => import('./features/comfort-grid/comfort-grid.component').then(m => m.ComfortGridComponent),
      },
      {
        path: 'timemachine',
        loadComponent: () => import('./features/time-machine/time-machine.component').then(m => m.TimeMachineComponent),
      },
    ],
  },
];
