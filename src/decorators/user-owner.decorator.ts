import { SetMetadata } from '@nestjs/common';

export const USER_OWNER_KEY = 'userOwner';
export const UserOwner = () => SetMetadata(USER_OWNER_KEY, true);
