import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-formDesk',
  templateUrl: './formDesk.component.html',
  styleUrls: ['./formDesk.component.css'],
})
export class FormDeskComponent implements AfterViewInit {
ngAfterViewInit() {
  const desk = document.getElementById('desk-container')!;

  desk.addEventListener('dragover', (e) => e.preventDefault());

  desk.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer?.getData('component');
    if (data) {
      const component = JSON.parse(data);
      this.addComponentToDesk(component);
    }
  });
}

addComponentToDesk(component: any) {
  const deskDiv = document.getElementById('desk-container')!;
  const wrapper = document.createElement('div');
  wrapper.className =
    'mb-2 p-2 bg-white border rounded flex items-center gap-2';
  wrapper.style.width = 'fit-content';
  wrapper.style.cursor = 'move';
  wrapper.innerHTML =
    component.view.label || component.name || component.view.view;
  wrapper.setAttribute('draggable', 'true'); // para poder moverlo dentro del desk
  deskDiv.appendChild(wrapper);
}

}
