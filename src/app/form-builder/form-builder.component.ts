import { Component, OnInit } from '@angular/core';
import { FormDeskComponent } from './components/formDesk/formDesk.component';
import { InfoComponentComponent } from './components/infoComponent/infoComponent.component';
import { ToolBoxComponent } from './components/toolBox/toolBox.component';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    FormDeskComponent,
    InfoComponentComponent,
    ToolBoxComponent
  ],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css'],
})
export class FormBuilderComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
