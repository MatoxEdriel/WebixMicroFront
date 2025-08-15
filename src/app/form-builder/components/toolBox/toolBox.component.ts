import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ComponentService } from '../../services/Component.service';
import {
  IComponent,
  IViewConfig,
} from '../../../shared/interfaces/component.interface';
import { CommonModule } from '@angular/common';
import { ICON_MAP } from '../../../shared/interfaces/component.interface';

declare var webix: any;

@Component({
  selector: 'app-toolBox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolBox.component.html',
  styleUrls: ['./toolBox.component.css'],
})
export class ToolBoxComponent implements OnInit, AfterViewInit {
  components: IComponent[] = [];
  iconsComponents = ICON_MAP;
  loading = true;
  errorMessage = '';



  constructor(private _componentService: ComponentService) {}

  ngOnInit() {


      this.components = [
    {
      id: 1,
      name: 'Texto',
      enable: true,
      view: { view: 'text', placeholder: 'Escribe aquí', width: 150 }
    },
    {
      id: 2,
      name: 'Botón',
      enable: true,
      view: { view: 'button', label: 'Enviar', width: 100 }
    },
    {
      id: 3,
      name: 'Checkbox',
      enable: true,
      view: { view: 'checkbox' }
    },
    {
      id: 4,
      name: 'Radio',
      enable: true,
      view: { view: 'radio' }
    },
    {
      id: 5,
      name: 'Fecha',
      enable: true,
      view: { view: 'datepicker' }
    },
    {
      id: 6,
      name: 'Área de texto',
      enable: true,
      view: { view: 'textarea', placeholder: 'Tu mensaje...', width: 150, height: 50 }
    },
    {
      id: 7,
      name: 'Select',
      enable: true,
      view: { view: 'select' }
    }
  ] as (IComponent & { view: IViewConfig })[];

  this.loading = false;





    this._componentService.getComponents().subscribe({
      next: (res) => {
        this.components = (res.data ?? []).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error cargando componentes';
        this.loading = false;
      },
    });
  }

  ngAfterViewInit() {
    const waitWebix = setInterval(() => {
      if (
        typeof webix !== 'undefined' &&
        !this.loading &&
        this.components.length > 0
      ) {
        clearInterval(waitWebix);
        this.renderWebixToolbox();
      }
    }, 50);
  }

  getIconForComponent(view?: IViewConfig): string {
    if (!view) return 'help_outline';
    return this.iconsComponents[view.view] ?? 'help_outline';
  }

  renderWebixToolbox() {
  if (!this.components || this.components.length === 0) return;

  const toolbox = webix.ui({
    container: 'webix-toolbox',
    view: 'list',
    borderless: true,
    select: true,
    scroll:false,
    drag: true,
    data: this.components,
    type: { height: 50 },
    template: (obj: any) => {
      const icon = this.getIconForComponent(obj.view);
      return `
        <div style="display:flex; align-items:center; padding:8px 12px; gap:8px;">
          <div style="width:30px; height:30px; background-color:#e0e0e0; display:flex; justify-content:center; align-items:center; border-radius:4px;">
            <span class="material-icons" style="font-size:18px;">${icon}</span>
          </div>
          <div>${this.getHtmlContent(obj)}</div>
        </div>
      `;
    },
    on: {
      onBeforeDrag: function (context: any, e: any) {

        if (e && e.dataTransfer) {
          e.dataTransfer.setData('component', JSON.stringify(context.start));
        }
        return true; 
      }
    }
  });
}

  getHtmlContent(obj: { view: IViewConfig }): string {
    const padding = 8;
    switch (obj.view.view) {
      case 'text':
        return `<input type="text" placeholder="${
          obj.view.placeholder || ''
        }" disabled style="
        width:${obj.view.width || 150}px;
        text-align:left;
        padding-left:${padding}px;
      ">`;

      case 'button':
        return `<button disabled style="
        width:${obj.view.width || 100}px;
        text-align:left;
        padding-left:${padding}px;
      ">${obj.view.label || 'Button'}</button>`;

      case 'checkbox':
        return `<input type="checkbox" disabled style="margin-left:${padding}px;">`;

      case 'radio':
        return `<span style="padding-left:${padding}px;">Opción</span>`;

      case 'datepicker':
        return `<input type="date" disabled style="
        text-align:left;
        padding-left:${padding}px;
      ">`;

      case 'textarea':
        return `<textarea disabled style="
        width:${obj.view.width || 150}px;
        height:${obj.view.height || 50}px;
        text-align:left;
        padding-left:${padding}px;
      "></textarea>`;

      default:
        return `<span style="padding-left:${padding}px;">${obj.view.view}</span>`;
    }
  }
}
