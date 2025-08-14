import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {


private readonly loadingComponent = [
  'componente/json'
];



constructor() { }

loading = new EventEmitter<Boolean>();







}
