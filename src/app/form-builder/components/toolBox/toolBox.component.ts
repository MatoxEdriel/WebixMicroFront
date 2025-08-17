import {
  IComponent,
  IViewConfig,
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

declare var webix: any;

@Component({
  selector: 'app-toolBox',
  standalone: true,
  imports: [CommonModule, LottieComponent, FormsModule],
  templateUrl: './toolBox.component.html',
  styleUrls: ['./toolBox.component.css'],
})
export class ToolBoxComponent implements OnInit, AfterViewInit {
  components: IComponent[] = [];
  loading = true;
  selectedComponent: IViewConfig | null = null;
  deskItems: HTMLElement[] = [];

  @ViewChild('trashIcon', { static: false }) trashRef!: ElementRef<HTMLElement>;
  @ViewChild('trashZone', { static: false })
  trashZoneRef!: ElementRef<HTMLElement>;

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
      name: 'Input de texto',
      enable: true,
      view: { view: 'text', width: 150, placeholder: 'Escribe algo...' },
    },
    {
      id: 2,
      name: 'Botón',
      enable: true,
      view: { view: 'button', width: 100, label: 'Enviar' },
    },
    {
      id: 3,
      name: 'Checkbox',
      enable: true,
      view: { view: 'checkbox', label: 'Aceptar términos' },
    },
    {
      id: 4,
      name: 'Textarea',
      enable: true,
      view: {
        view: 'textarea',
        width: 200,
        height: 80,
        placeholder: 'Comentario...',
      },
    },
    { id: 5, name: 'Datepicker', enable: true, view: { view: 'datepicker' } },
  ];

  constructor(private _AnimationService: AnimationService) {}

  ngOnInit() {
    this.components = this.MOCK_COMPONENTS.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    this.loading = false;
  }

  ngAfterViewInit() {
    // Inicializamos referencias a elementos del DOM
    this.trash = this.trashRef?.nativeElement;
    this.trashZone = this.trashZoneRef?.nativeElement;

    this.renderToolbox();
    this.renderDesk();
  }

  onTrashAnimationCreated(animation: AnimationItem) {
    this._AnimationService.register('trash', animation);
    this.trashAnimation = animation;
  }

  renderToolbox() {
    const container = document.getElementById('webix-toolbox');
    if (!container) return;
    container.innerHTML = '';

    this.components.forEach((comp) => {
      const div = document.createElement('div');
      div.id = `toolbox-comp-${comp.id}`;
      div.style.marginBottom = '8px';
      container.appendChild(div);

      webix.ui({ ...comp.view, container: div });

      div.setAttribute('draggable', 'true');
      div.addEventListener('dragstart', (e: DragEvent) => {
        e.dataTransfer?.setData('component-id', comp.id.toString());
      });
    });
  }

  renderDesk() {
    const deskContainer = document.getElementById('webix-desk');
    if (!deskContainer) return;
    deskContainer.innerHTML = '';

    deskContainer.addEventListener('dragover', (e) => e.preventDefault());
    deskContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      const id = e.dataTransfer?.getData('component-id');
      if (!id) return;

      const comp = this.components.find((c) => c.id === +id);
      if (!comp) return;

      const rect = deskContainer.getBoundingClientRect();
      const posX = e.clientX - rect.left;
      const posY = e.clientY - rect.top;

      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = posX + 'px';
      wrapper.style.top = posY + 'px';
      wrapper.style.cursor = 'grab';
      wrapper.style.width = comp.view.width ? comp.view.width + 'px' : '150px';
      wrapper.style.height = comp.view.height
        ? comp.view.height + 'px'
        : '40px';

      deskContainer.appendChild(wrapper);

      setTimeout(() => {
        webix.ui({ ...comp.view, container: wrapper });
      }, 0);

      wrapper.addEventListener('click', () => {
        this.selectedComponent = comp.view;
      });

      this.deskItems.push(wrapper);
      this.makeDraggable(wrapper, deskContainer);
    });
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

      // Mostrar trashZone si existe
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
        if (!dragging) return;
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
