import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class AiService {
  constructor(private http: HttpClient) {}

  generateQuiz(subject: string, level: string, count = 5) {
    return this.http.post(`${environment.apiUrl}/ai/generate-quiz`, {
      subject,
      level,
      count,
    });
  }

  generateRandomQuestions(subject: string, level: string, count = 5) {
    return this.http.post(
      `${environment.apiUrl}/ai/generate-random-questions`,
      {
        subject,
        level,
        count,
      }
    );
  }
}
