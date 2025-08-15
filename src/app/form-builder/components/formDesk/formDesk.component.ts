import { Component, AfterViewInit } from '@angular/core';
import { DragService } from '../../services/DragService.service';

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


    const desk = document.getElementById('desk-container')!;

    desk.addEventListener('dragover', (e) => e.preventDefault());


    

  }

  addComponentToDesk(component: any) {
    const deskDiv = document.getElementById('desk-container')!;
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-2 p-2 bg-white border rounded flex items-center gap-2';
    wrapper.style.width = 'fit-content';
    wrapper.style.cursor = 'move';
    wrapper.innerHTML = component.view.label || component.name || component.view.view;
    wrapper.setAttribute('draggable', 'true');

    wrapper.addEventListener('dragstart', (event) => {
      this.dragService.startDrag(component);
    });

    deskDiv.appendChild(wrapper);
  }


}
