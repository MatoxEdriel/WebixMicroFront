export interface IComponent{
    id:number;
    name:string;
    enable:boolean;
}

export interface IViewConfig{
  view: 'text' | 'textarea' | 'button' | 'checkbox' | 'radio' | 'datepicker' | 'select' | string;
  width?: number;
  height?: number;
  label?: string;
  placeholder?: string;
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