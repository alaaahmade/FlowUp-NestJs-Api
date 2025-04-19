export interface SocialUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture: string;
  fullName?: string;
}

export interface GooglePayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

export interface ApplePayload {
  sub: string;
  email?: string;
}
