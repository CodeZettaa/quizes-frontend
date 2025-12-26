import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Subject } from '../types';

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<any[]>(`${environment.apiUrl}/subjects`).pipe(
      map((subjects) =>
        subjects.map((subject) => ({
          ...subject,
          id: subject.id || subject._id || '',
        }))
      )
    );
  }

  create(subject: Partial<Subject>) {
    return this.http.post<Subject>(`${environment.apiUrl}/subjects`, subject);
  }
}
