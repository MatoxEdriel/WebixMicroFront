import { Component, AfterViewInit } from '@angular/core';
import { DragService } from '../../services/DragService.service';
import { IComponent, IViewConfig } from '../../../shared/interfaces/component.interface';

@Component({
  selector: 'app-formDesk',
  templateUrl: './formDesk.component.html',
  styleUrls: ['./formDesk.component.css'],
})
export class FormDeskComponent implements AfterViewInit {

  constructor(private dragService: DragService) { }

  ngAfterViewInit() {
    this.dragService.drag$.subscribe(component => {
      this.addComponentToDesk(component);
    });

    const desk = document.getElementById('desk-container');
    if (!desk) return;

    desk.addEventListener('dragover', (e) => e.preventDefault());

    desk.addEventListener('drop', (e) => {
      e.preventDefault();
      const data = e.dataTransfer?.getData('component');
      if (data) {
        const component: IComponent & { view: IViewConfig } = JSON.parse(data);
        this.addComponentToDesk(component);
      }
    });
  }

  addComponentToDesk(component: IComponent & { view: IViewConfig }) {
    const deskDiv = document.getElementById('desk-container');
    if (!deskDiv) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'mb-2 p-2 bg-white border rounded flex items-center gap-2';
    wrapper.style.width = 'fit-content';
    wrapper.style.cursor = 'move';

    // Usamos label si existe, sino name, sino el tipo de view
    const label =
      (component.view && component.view.label) ||
      component.name ||
      (component.view && component.view.view) ||
      'Componente';

    wrapper.innerHTML = label;

    wrapper.setAttribute('draggable', 'true');

    // Para poder arrastrar componentes dentro del desk
    wrapper.addEventListener('dragstart', (event) => {
      this.dragService.startDrag(component);
    });

    deskDiv.appendChild(wrapper);
  }
}
