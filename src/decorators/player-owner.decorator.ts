import { SetMetadata } from '@nestjs/common';

export const PLAYER_OWNER_KEY = 'playerOwner';
export const PlayerOwner = () => SetMetadata(PLAYER_OWNER_KEY, true);
