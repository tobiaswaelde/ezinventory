type JwtPayload = {
  sub: string;
  email: string;
};

type JwtPayloadMfa = {
  sub: string;
  email: string;
  mfaPending: boolean;
};
