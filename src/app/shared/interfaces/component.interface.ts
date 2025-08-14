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