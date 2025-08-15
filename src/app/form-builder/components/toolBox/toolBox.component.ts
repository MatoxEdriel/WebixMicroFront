import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ComponentService } from '../../services/Component.service';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { FormsModule } from '@angular/forms';
import {
  IComponent,
  IViewConfig,
  ICON_MAP,
} from '../../../shared/interfaces/component.interface';
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
  iconsComponents = ICON_MAP;
  loading = true;
  errorMessage = '';
  private deskItems: HTMLElement[] = [];
  private trash!: HTMLElement;
  private trashAnimation!: AnimationItem;
  private multiDragItems: {
    el: HTMLElement;
    startLeft: number;
    startTop: number;
  }[] = [];

  selectedComponent: IViewConfig | null = null;
  trashOptions: AnimationOptions = {
    path: '/assets/lottie/trash.json',
    autoplay: true,
    loop: true,
  };

  constructor(
    private _AnimationService: AnimationService,
    private _componentService: ComponentService
  ) {}

  onTrashAnimationCreated(animation: AnimationItem) {
    this._AnimationService.register('trash', animation);
  }

  ngOnInit() {
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
    this.trash = document.getElementById('trash-icon')!;
    const waitWebix = setInterval(() => {
      if (
        typeof webix !== 'undefined' &&
        !this.loading &&
        this.components.length > 0
      ) {
        clearInterval(waitWebix);
        this.renderWebixToolbox();
        this.renderWebixDesk();
      }
    }, 50);
  }

  getIconForComponent(view?: IViewConfig): string {
    if (!view) return 'help_outline';
    return this.iconsComponents[view.view] ?? 'help_outline';
  }

  renderWebixToolbox() {
    webix.ui({
      container: 'webix-toolbox',
      view: 'list',
      borderless: true,
      select: true,
      scroll: true,
      drag: true,
      data: this.components,
      type: { height: 50 },
      template: (obj: any) => {
        const icon = this.getIconForComponent(obj.view);
        return `
          <div style="display:flex; align-items:center; padding:8px 12px; gap:8px;">
            <div style="width:30px; height:30px;  background-color: #3B82F6;  display:flex; justify-content:center; align-items:center; border-radius:4px;">
              <span class="material-icons" style="font-size:18px; color:white;">${icon}</span>
            </div>
            <div>${this.getHtmlContent(obj)}</div>
          </div>
        `;
      },
    });
  }

  renderWebixDesk() {
    const deskContainer = document.getElementById('webix-desk')!;

    deskContainer.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!this.deskItems.some((item) => item.contains(target))) {
        this.selectedComponent = null;
      }
    });


    



    deskContainer.innerHTML = '';
    this.deskItems = [];
    webix.DragControl.addDrop(deskContainer, {
      $drop: (source: any, e: MouseEvent) => {
        const draggedData = webix
          .$$(source)
          ?.getItem(webix.DragControl._drag_context.start);
        if (!draggedData?.view) return true;

        const rect = deskContainer.getBoundingClientRect();
        const posX = e.clientX - rect.left;
        const posY = e.clientY - rect.top;

        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = posX + 'px';
        wrapper.style.top = posY + 'px';
        wrapper.style.cursor = 'grab';

        deskContainer.appendChild(wrapper);
        const webixComp = webix.ui({ ...draggedData.view, container: wrapper });

        wrapper.addEventListener('click', () => {
          this.selectedComponent = draggedData.view;
        });

        this.deskItems.push(wrapper);
        this.makeDraggable(wrapper, deskContainer);

        return true;
      },
    });
  }

  makeDraggable(el: HTMLElement, container: HTMLElement) {
    let offsetX = 0,
      offsetY = 0,
      dragging = false;

    const trash = this.trash;

    el.addEventListener('mousedown', (e) => {
      dragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      el.style.cursor = 'grabbing';
      if (trash) trash.classList.remove('hidden');

     
      container.classList.add('grid-active');

      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const rect = container.getBoundingClientRect();
      let newLeft = e.clientX - rect.left - offsetX;
      let newTop = e.clientY - rect.top - offsetY;

      newLeft = Math.max(0, Math.min(newLeft, rect.width - el.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, rect.height - el.offsetHeight));

      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;
    });

    document.addEventListener('mouseup', (e) => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = 'grab';

      // Desactivar cuadrícula
      container.classList.remove('grid-active');

      if (trash) {
        const trashRect = trash.getBoundingClientRect();
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
        trash.classList.add('hidden');
      }
    });
  }

  getHtmlContent(obj: { view: IViewConfig }): string {
    const padding = 8;
    switch (obj.view.view) {
      case 'text':
        return `<input type="text" placeholder="${
          obj.view.placeholder || ''
        }" disabled
          style="width:${
            obj.view.width || 150
          }px; text-align:left; padding-left:${padding}px;">`;
      case 'button':
        return `<button disabled style="width:${
          obj.view.width || 100
        }px; text-align:left; padding-left:${padding}px;">${
          obj.view.label || 'Button'
        }</button>`;
      case 'checkbox':
        return `<input type="checkbox" disabled style="margin-left:${padding}px;">`;
      case 'radio':
        return `<span style="padding-left:${padding}px;">Opción</span>`;
      case 'datepicker':
        return `<input type="date" disabled style="text-align:left; padding-left:${padding}px;">`;
      case 'textarea':
        return `<textarea disabled style="width:${
          obj.view.width || 150
        }px; height:${
          obj.view.height || 50
        }px; text-align:left; padding-left:${padding}px;"></textarea>`;
      default:
        return `<span style="padding-left:${padding}px;">${obj.view.view}</span>`;
    }
  }
}
