export interface EmailTemplate<T = Record<string, unknown>> {
  subject: string;
  generateContent: (data: T) => string;
}
