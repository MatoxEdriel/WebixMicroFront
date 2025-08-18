import {
  IComponent,
  IViewConfig,
  ComponentConfig,
} from './../../../shared/interfaces/component.interface';
import {
  AfterViewInit,
  Component,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../services/AnimationService.service';
import { AnimationItem } from 'lottie-web';
import lottie from 'lottie-web';

import { MatIconModule } from '@angular/material/icon';

declare var webix: any;

@Component({
  selector: 'app-toolBox',
  standalone: true,
  imports: [CommonModule, LottieComponent, FormsModule, MatIconModule],
  templateUrl: './toolBox.component.html',
  styleUrls: ['./toolBox.component.css'],
})
export class ToolBoxComponent implements OnInit, AfterViewInit {
  components: IComponent[] = [];
  componentConfigs: Record<number, ComponentConfig> = {};
  loading = true;
  selectedComponent: IViewConfig | null = null;
  selectedId: number | null = null;
  deskItems: HTMLElement[] = [];
  activeTab: string = 'basics';

  @ViewChild('trashIcon', { static: false }) trashRef!: ElementRef<HTMLElement>;
  @ViewChild('trashZone', { static: false })
  trashZoneRef!: ElementRef<HTMLElement>;
  @ViewChild('basicsContainer', { static: true })
  basicsContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('extrasContainer', { static: true })
  extrasContainer!: ElementRef<HTMLDivElement>;

  trash!: HTMLElement;
  trashZone!: HTMLElement;
  trashAnimation!: AnimationItem;

  trashOptions: AnimationOptions = {
    path: '/assets/lottie/trash.json',
    autoplay: true,
    loop: true,
  };

  MOCK_COMPONENTS: IComponent[] = [
    {
      id: 1,
      name: 'Text Input',
      enable: true,
      view: { view: 'text', width: 150, placeholder: 'Type here...' },
    },
    {
      id: 2,
      name: 'Button',
      enable: true,
      view: { view: 'button', width: 100, label: 'Submit' },
    },
    {
      id: 3,
      name: 'Checkbox',
      enable: true,
      view: { view: 'checkbox', label: 'Accept terms' },
    },
    {
      id: 4,
      name: 'Textarea',
      enable: true,
      view: {
        view: 'textarea',
        width: 200,
        height: 80,
        placeholder: 'Comment...',
      },
    },
    { id: 5, name: 'Datepicker', enable: true, view: { view: 'datepicker' } },
  ];

  constructor(private animationService: AnimationService) {}

  ngOnInit() {
    this.components = this.MOCK_COMPONENTS.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    this.loading = false;

    this.components.forEach((c) => {
      this.componentConfigs[c.id] = {
        label: c.view.label || '',
        required: false,
        labelAlign: 'top',
      };
    });
  }

  ngAfterViewInit() {
    this.trash = this.trashRef.nativeElement;
    this.trashZone = this.trashZoneRef.nativeElement;

    const deskContainer = document.getElementById('webix-desk');
    if (!deskContainer) return;

    this.initializeTab(this.basicsContainer.nativeElement, this.components);
    this.initializeAdvanced();

    this.renderDesk(deskContainer);
  }

  private initializeTab(container: HTMLElement, components: IComponent[]) {
    if (container.children.length > 0) return;

    components.forEach((comp) => {
      const div = document.createElement('div');
      div.style.marginBottom = '8px';
      container.appendChild(div);
      webix.ui({ ...comp.view, container: div });
      div.setAttribute('draggable', 'true');
      div.addEventListener('dragstart', (e: DragEvent) =>
        e.dataTransfer?.setData('component-id', comp.id.toString())
      );
    });
  }

  private initializeAdvanced() {
    const container = document.getElementById('webix-segments');
    if (!container || container.children.length > 0) return;

    const segments = [
      {
        id: 101,
        name: 'Full Name',
        view: {
          view: 'text',
          label: 'Full Name',
          placeholder: 'Escribe tu nombre',
        },
      },
      {
        id: 102,
        name: 'Email',
        view: {
          view: 'text',
          label: 'Correo',
          placeholder: 'ejemplo@correo.com',
        },
      },
      {
        id: 103,
        name: 'Birthdate',
        view: { view: 'datepicker', label: 'Fecha de nacimiento' },
      },
      {
        id: 104,
        name: 'Gender',
        view: { view: 'radio', label: 'Género', options: ['Male', 'Female'] },
      },
    ];

    segments.forEach((seg) => {
      const div = document.createElement('div');
      div.id = `segment-${seg.id}`;
      div.style.marginBottom = '8px';
      container.appendChild(div);
      webix.ui({ ...seg.view, container: div });

      this.components.push({
        id: seg.id,
        name: seg.name,
        enable: true,
        view: seg.view,
      });
      this.componentConfigs[seg.id] = {
        label: seg.view.label || '',
        required: false,
        labelAlign: 'top',
      };

      div.setAttribute('draggable', 'true');
      div.addEventListener('dragstart', (e) =>
        e.dataTransfer?.setData('component-id', seg.id.toString())
      );
    });
  }

  onTrashAnimationCreated(animation: AnimationItem) {
    this.animationService.register('trash', animation);
    this.trashAnimation = animation;
  }

  getComponentFromEvent(e: DragEvent): IComponent | null {
    const id = e.dataTransfer?.getData('component-id');
    if (!id) return null;

    return this.components.find((c) => c.id === +id) || null;
  }

  renderDesk(container: HTMLElement) {
    container.addEventListener('dragover', (e) => e.preventDefault());
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const comp = this.getComponentFromEvent(e);
      if (!comp) return;
      const wrapper = this.createWrapper(comp, e, container);
      this.attachConfigButton(wrapper, comp);
      container.appendChild(wrapper);
      webix.ui({
        ...comp.view,
        container: wrapper,
      });
      this.makeDraggable(wrapper, container);
      this.deskItems.push(wrapper);
    });
    this.setupGlobalClickListener();
  }

  private setupGlobalClickListener() {
    document.addEventListener('click', (ev) => {
      const panel = document.getElementById('property-panel');
      if (!panel) return;

      // Si el clic está dentro del panel, no hacemos nada
      if (panel.contains(ev.target as Node)) return;

      // Si el clic está sobre algún botón de configuración, no hacemos nada
      const anyConfigDiv = this.deskItems
        .map((item) => item.querySelector('div'))
        .find((d) => d?.contains(ev.target as Node));
      if (anyConfigDiv) return;

      // Cerrar panel
      panel.classList.remove('active');
      this.selectedComponent = null;
      this.selectedId = null;

      // Ocultar todos los botones de configuración
      this.deskItems.forEach((item) => {
        const btn = item.querySelector('div');
        if (btn) {
          (btn as HTMLElement).style.opacity = '0';
          (btn as HTMLElement).style.pointerEvents = 'none';
        }
      });
    });
  }

  attachConfigButton(wrapper: HTMLElement, comp: IComponent) {
    const configDiv = document.createElement('div');
    configDiv.style.position = 'absolute';
    configDiv.style.top = '-10px';
    configDiv.style.right = '-10px';
    configDiv.style.width = '30px';
    configDiv.style.height = '30px';
    configDiv.style.cursor = 'pointer';
    configDiv.style.opacity = '0';
    configDiv.style.pointerEvents = 'none';
    configDiv.style.transition = 'opacity 0.3s ease';
    configDiv.style.zIndex = '9999';
    wrapper.appendChild(configDiv);

    const animation = lottie.loadAnimation({
      container: configDiv,
      path: '/assets/lottie/setting.json',
      loop: true,
      autoplay: true,
    });
    animation.setSpeed(0.2);

    wrapper.addEventListener('click', (ev) =>
      this.showConfigButton(configDiv, ev)
    );
    configDiv.addEventListener('click', (ev) =>
      this.openPropertyPanel(comp, ev)
    );
  }

  private showConfigButton(configDiv: HTMLElement, ev?: Event) {
    if (ev) ev.stopPropagation();

    this.deskItems.forEach((item) => {
      const btn = item.querySelector('div');
      if (btn) {
        (btn as HTMLElement).style.opacity = '0';
        (btn as HTMLElement).style.pointerEvents = 'none';
      }
    });

    configDiv.style.opacity = '1';
    configDiv.style.pointerEvents = 'auto';
  }

  openPropertyPanel(comp: IComponent, ev?: Event) {
    if (ev) ev.stopPropagation();
    this.selectedComponent = comp.view;
    this.selectedId = comp.id;
    const panel = document.getElementById('property-panel');
    if (panel) panel.classList.add('active');
  }

  createWrapper(comp: IComponent, e: DragEvent, container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = e.clientX - rect.left + 'px';
    wrapper.style.top = e.clientY - rect.top + 'px';
    wrapper.style.width = (comp.view.width ?? 150) + 'px';
    wrapper.style.height = (comp.view.height ?? 40) + 'px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.cursor = 'grab';
    wrapper.setAttribute('data-component-id', comp.id.toString());
    return wrapper;
  }

  updateLabel() {
    if (this.selectedId == null) return;
    const cfg = this.componentConfigs[this.selectedId];
    const comp = this.components.find((c) => c.id === this.selectedId);
    if (comp) {
      comp.view.label = cfg.label;
      const ui = comp.view._webix_ui;
      if (ui) {
        ui.define('label', cfg.label);
        ui.refresh();
      }
    }
  }

  closePropertyPanel() {
    const panel = document.getElementById('property-panel');
    if (panel) panel.classList.remove('active');
    this.selectedComponent = null;
    this.selectedId = null;
    this.deskItems.forEach((item) => {
      const btn = item.querySelector('div');
      if (btn) {
        (btn as HTMLElement).style.opacity = '0';
        (btn as HTMLElement).style.pointerEvents = 'none';
      }
    });
  }

  updateLabelAlign() {
    if (this.selectedId == null) return;
    const cfg = this.componentConfigs[this.selectedId];
    const comp = this.components.find((c) => c.id === this.selectedId);
    if (comp) {
      const ui = comp.view._webix_ui;
      if (ui) {
        ui.define('labelPosition', cfg.labelAlign);
        ui.refresh();
      }
    }
  }

  updateRequired() {
    if (this.selectedId == null) return;
    const cfg = this.componentConfigs[this.selectedId];
    const comp = this.components.find((c) => c.id === this.selectedId);
    if (comp) {
      const ui = comp.view._webix_ui;
      if (ui) {
        ui.define('required', cfg.required);
        ui.refresh();
      }
    }
  }

  makeDraggable(el: HTMLElement, container: HTMLElement) {
    let offsetX = 0,
      offsetY = 0,
      dragging = false;
    const deskContainer = document.getElementById('webix-desk');

    el.addEventListener('mousedown', (e) => {
      dragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      el.style.cursor = 'grabbing';
      if (this.trashZone) {
        this.trashZone.style.bottom = '4rem';
        this.trashZone.classList.add('bubble-show');
      }
      deskContainer?.classList.add('grid-active');

      const onMouseMove = (event: MouseEvent) => {
        if (!dragging) return;
        const rect = container.getBoundingClientRect();
        el.style.left =
          Math.max(
            0,
            Math.min(
              event.clientX - rect.left - offsetX,
              rect.width - el.offsetWidth
            )
          ) + 'px';
        el.style.top =
          Math.max(
            0,
            Math.min(
              event.clientY - rect.top - offsetY,
              rect.height - el.offsetHeight
            )
          ) + 'px';
        if (this.trashZone && this.trashRef?.nativeElement) {
          const trashRect = this.trashZone.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const overlap = !(
            elRect.right < trashRect.left ||
            elRect.left > trashRect.right ||
            elRect.bottom < trashRect.top ||
            elRect.top > trashRect.bottom
          );
          this.trashRef.nativeElement.style.opacity = overlap ? '1' : '0.5';
        }
      };

      const onMouseUp = () => {
        dragging = false;
        el.style.cursor = 'grab';
        if (this.trashZone && this.trashRef) {
          const trashRect = this.trashZone.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const overlap = !(
            elRect.right < trashRect.left ||
            elRect.left > trashRect.right ||
            elRect.bottom < trashRect.top ||
            elRect.top > trashRect.bottom
          );
          if (overlap) {
            el.remove();
            this.deskItems = this.deskItems.filter((item) => item !== el);

            const compId = Number(el.getAttribute('data-component-id'));
            if (this.selectedId === compId) {
              this.closePropertyPanel();
            }

            if (this.trashAnimation) {
              this.trashAnimation.stop();
              this.trashAnimation.goToAndPlay(0, true);
            }
          }
          this.trashZone.classList.remove('bubble-show');
          this.trashZone.style.bottom = '-100px';
        }
        deskContainer?.classList.remove('grid-active');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    });
  }
}
