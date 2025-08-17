import { Component, OnInit, AfterViewInit } from '@angular/core';
declare var webix: any;

@Component({
  selector: 'app-segments',
  standalone: true,
  templateUrl: './segments.component.html',
  styleUrls: ['./segments.component.css']
})
export class SegmentsComponent implements OnInit, AfterViewInit {

  segments = [
    { id: 1, name: 'Full Name', view: { view: 'text', label: 'Full Name', placeholder: 'Escribe tu nombre' } },
    { id: 2, name: 'Email', view: { view: 'text', label: 'Correo', placeholder: 'ejemplo@correo.com' } },
    { id: 3, name: 'Birthdate', view: { view: 'datepicker', label: 'Fecha de nacimiento' } },
    { id: 4, name: 'Gender', view: { view: 'radio', label: 'Género', options: ['Male','Female'] } }
  ];

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    const container = document.getElementById('webix-segments');
    if (!container) return;

    container.innerHTML = '';
    this.segments.forEach(seg => {
      const div = document.createElement('div');
      div.id = `segment-${seg.id}`;
      div.style.marginBottom = '8px';
      container.appendChild(div);

      webix.ui({ ...seg.view, container: div });

   
      div.setAttribute('draggable', 'true');
      div.addEventListener('dragstart', (e: DragEvent) => {
        e.dataTransfer?.setData('segment-id', seg.id.toString());
      });
    });
  }

}
