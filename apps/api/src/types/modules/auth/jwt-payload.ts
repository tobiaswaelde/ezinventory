export type JwtPayload = {
  sub: string;
  email: string;
};

export type JwtPayloadMfa = {
  sub: string;
  email: string;
  mfaPending: boolean;
};
