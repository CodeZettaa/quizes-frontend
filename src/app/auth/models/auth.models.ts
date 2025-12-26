export interface User {
  id: string;
  name: string;
  email: string | null;
  role: "student" | "admin";
  avatarUrl?: string | null;
  totalPoints: number;
}

export interface AuthMeResponse extends User {}
