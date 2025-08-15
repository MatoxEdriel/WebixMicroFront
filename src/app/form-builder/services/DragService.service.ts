// src/app/shared/services/drag.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IComponent } from '../../shared/interfaces/component.interface';

@Injectable({
  providedIn: 'root',
})
export class DragService {
  private draggedComponent = new Subject<IComponent>();
  
  drag$ = this.draggedComponent.asObservable();

  startDrag(component: IComponent) {
    this.draggedComponent.next(component);
  }
}
