import { Profile } from 'passport';

declare global {
  namespace Express {
    interface User {
      profile: Profile;
      accessToken: string;
    }
  }
}
