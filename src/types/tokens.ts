import { ROLES } from "../constants";

export interface AccessTokenPayload {
  id: string;
  roles?: ROLES[];
}
