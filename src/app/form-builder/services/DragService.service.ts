// src/app/shared/services/drag.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IComponent, IViewConfig } from '../../shared/interfaces/component.interface';

@Injectable({
    providedIn: 'root',
})
export class DragService {
    private dragSubject = new Subject<IComponent & { view: IViewConfig }>();
    drag$ = this.dragSubject.asObservable();

    startDrag(component: IComponent & { view: IViewConfig }) {
        this.dragSubject.next(component);
    }

}
