import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubjectsService } from '../../services/subjects.service';
import { Subject } from '../../types';

@Component({
  standalone: true,
  selector: 'app-admin-subjects',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h2>Manage Subjects</h2>
        <form (ngSubmit)="create()">
          <input class="input" [(ngModel)]="name" name="name" placeholder="Name" required />
          <input
            class="input"
            [(ngModel)]="description"
            name="description"
            placeholder="Description"
          />
          <button class="btn" type="submit">Create</button>
        </form>
      </div>

      <div class="card">
        <h3>Existing</h3>
        <ul>
          @for (subject of subjects(); track subject.id) {
            <li>{{ subject.name }} - {{ subject.description }}</li>
          }
        </ul>
      </div>
    </div>
  `,
})
export class AdminSubjectsComponent implements OnInit {
  private subjectsService = inject(SubjectsService);
  subjects = signal<Subject[]>([]);
  name = '';
  description = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.subjectsService.list().subscribe((data) => this.subjects.set(data));
  }

  create() {
    this.subjectsService
      .create({ name: this.name, description: this.description })
      .subscribe(() => {
        this.name = '';
        this.description = '';
        this.load();
      });
  }
}
