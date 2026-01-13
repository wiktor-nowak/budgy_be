import { ROLES } from "../constants";

export interface AccessTokenPayload {
  sub: string;
  roles?: ROLES[];
}
