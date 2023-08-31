import { JwtPayload as JwtPayloadBase } from 'jsonwebtoken';

export interface JwtPayload extends JwtPayloadBase {
  email: string;
  id: number;
}
