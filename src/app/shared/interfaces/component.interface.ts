export interface IComponent {
  id: number;
  name: string;
  enable: boolean;
  view: IViewConfig;
}

export interface IViewConfig {
  view: string;
  width?: number;
  height?: number;
  placeholder?: string;
  label?: string;
  _webix_ui?: any; // Instancia real de Webix
}


export interface ComponentConfig {
  label: string;
  required: boolean;
  labelAlign: 'left' | 'right' | 'top';
}


  export const ICON_MAP: Record<string, string> = {
    text: 'text_fields',
    textarea: 'text_fields',
    button: 'smart_button',
    checkbox: 'check_box',
    radio: 'radio_button_checked',
    datepicker: 'calendar_today',
    select: 'arrow_drop_down_circle',
  };