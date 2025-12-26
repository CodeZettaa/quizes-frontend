import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubjectsService } from '../../services/subjects.service';
import { QuizzesService } from '../../services/quizzes.service';
import { Subject } from '../../types';

interface QuestionDraft {
  text: string;
  options: { text: string; isCorrect: boolean }[];
}

@Component({
  standalone: true,
  selector: 'app-admin-quizzes',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h2>Create Quiz</h2>
        <form (ngSubmit)="create()">
          <label>Subject</label>
          <select class="input" [(ngModel)]="subjectId" name="subjectId" required>
            <option *ngFor="let s of subjects()" [value]="s.id">{{ s.name }}</option>
          </select>
          <label>Level</label>
          <select class="input" [(ngModel)]="level" name="level" required>
            <option value="beginner">Beginner</option>
            <option value="middle">Middle</option>
            <option value="intermediate">Intermediate</option>
          </select>
          <input
            class="input"
            [(ngModel)]="title"
            name="title"
            placeholder="Quiz title"
            required
          />

          <div class="card" style="background: #f9fafb;">
            <h4>Questions</h4>
            @for (question of questions(); track question.text; let qi = $index) {
              <div>
                <input
                  class="input"
                  [(ngModel)]="question.text"
                  name="qtext{{ qi }}"
                  placeholder="Question text"
                  required
                />
                @for (option of question.options; track option.text; let oi = $index) {
                  <div>
                    <input
                      class="input"
                      [(ngModel)]="option.text"
                      name="opt{{ qi }}{{ oi }}"
                      placeholder="Option text"
                      required
                    />
                    <label>
                      <input
                        type="radio"
                        [name]="'correct' + qi"
                        [checked]="option.isCorrect"
                        (change)="setCorrect(qi, oi)"
                      />
                      Correct
                    </label>
                  </div>
                }
              </div>
            }
            <button class="btn secondary" type="button" (click)="addQuestion()">
              Add question
            </button>
          </div>

          <button class="btn" type="submit">Save Quiz</button>
        </form>
        <p *ngIf="message()">{{ message() }}</p>
      </div>
    </div>
  `,
})
export class AdminQuizzesComponent implements OnInit {
  private subjectsService = inject(SubjectsService);
  private quizzesService = inject(QuizzesService);

  subjects = signal<Subject[]>([]);
  questions = signal<QuestionDraft[]>([
    {
      text: 'Sample question',
      options: [
        { text: 'Option A', isCorrect: true },
        { text: 'Option B', isCorrect: false },
        { text: 'Option C', isCorrect: false },
        { text: 'Option D', isCorrect: false },
      ],
    },
  ]);

  subjectId = '';
  level = 'beginner';
  title = '';
  message = signal('');

  ngOnInit() {
    this.subjectsService.list().subscribe((data) => {
      this.subjects.set(data);
      if (data[0]) this.subjectId = data[0].id;
    });
  }

  addQuestion() {
    this.questions.update((current) => [
      ...current,
      {
        text: `Question ${current.length + 1}`,
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
          { text: 'Option C', isCorrect: false },
          { text: 'Option D', isCorrect: false },
        ],
      },
    ]);
  }

  setCorrect(questionIndex: number, optionIndex: number) {
    const next = this.questions().map((q, idx) => {
      if (idx !== questionIndex) return q;
      return {
        ...q,
        options: q.options.map((o, oi) => ({
          ...o,
          isCorrect: oi === optionIndex,
        })),
      };
    });
    this.questions.set(next);
  }

  create() {
    const payload = {
      subjectId: this.subjectId,
      level: this.level,
      title: this.title,
      questions: this.questions(),
    };
    this.quizzesService.create(payload).subscribe(() => {
      this.message.set('Quiz created');
      this.title = '';
    });
  }
}
