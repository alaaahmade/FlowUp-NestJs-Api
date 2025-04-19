export interface SmsTemplate<T = Record<string, unknown>> {
  generateContent: (data: T) => string;
}
