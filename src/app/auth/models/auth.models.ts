export type SubjectName = 'HTML' | 'CSS' | 'JavaScript' | 'Angular' | 'React' | 'NextJS' | 'NestJS' | 'NodeJS';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string | null;
  role: "student" | "admin";
  avatarUrl?: string | null;
  totalPoints: number;
  selectedSubjects?: SubjectName[];
}

export interface AuthMeResponse extends User {}
