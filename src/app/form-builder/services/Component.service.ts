import { Injectable } from '@angular/core';
import { IComponent } from '../../shared/interfaces/component.interface';
import {Response}  from '../../shared/interfaces/http-response.interface';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {

 private url: string = environment.apiUrl
  

constructor(private readonly _http: HttpClient) { }


  getComponents(): Observable<Response<IComponent[]>> {
    return this._http
      .get<Response<IComponent[]>>(this.url + 'api/v1/view/component')
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }



  



}
