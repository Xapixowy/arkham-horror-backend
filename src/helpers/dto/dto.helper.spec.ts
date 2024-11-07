import { DtoHelper } from '@Helpers/dto/dto.helper';
import { UserDto } from '@Dtos/user.dto';
import { User } from '@Entities/user.entity';
import { Player } from '@Entities/player.entity';
import { PlayerDto } from '@Dtos/player.dto';
import { UserRole } from '@Enums/user/user-role.enum';

jest.mock('@Dtos/player.dto');

describe('DtoHelper', () => {
  let user: User;
  let userDto: UserDto;
  let properties: { players?: boolean };

  beforeEach(() => {
    user = new User();
    user.id = 1;
    user.name = 'John Doe';
    user.email = 'john@example.com';
    user.role = UserRole.USER;
    user.verified_at = null;
    user.created_at = new Date('2023-01-01');
    user.updated_at = new Date('2023-01-02');

    userDto = new UserDto(
      user.id,
      user.name,
      user.email,
      user.role,
      user.verified_at,
      user.created_at,
      user.updated_at,
    );

    properties = {};
  });

  describe('populateDtoWithOptionalProperties', () => {
    it('should populate UserDto with basic properties from User entity', () => {
      const result = DtoHelper.populateDtoWithOptionalProperties(
        userDto,
        user,
        UserDto['typeMapping'],
      );

      expect(result).toEqual(userDto);
    });

    it('should populate UserDto with players using type mapping', () => {
      user.players = [new Player(), new Player()];

      (PlayerDto.fromEntity as jest.Mock).mockImplementation(
        (player: Player) => ({
          id: player.id,
          name: 'PlayerMock',
        }),
      );

      properties = { players: true };

      const result = DtoHelper.populateDtoWithOptionalProperties(
        userDto,
        user,
        UserDto['typeMapping'],
        properties,
      );

      expect(PlayerDto.fromEntity).toHaveBeenCalledTimes(user.players.length);
      expect(result.players).toEqual([
        { id: user.players[0].id, name: 'PlayerMock' },
        { id: user.players[1].id, name: 'PlayerMock' },
      ]);
    });

    it('should skip optional properties if they are not in the properties argument', () => {
      user.players = [new Player(), new Player()];

      const result = DtoHelper.populateDtoWithOptionalProperties(
        userDto,
        user,
        UserDto['typeMapping'],
        properties,
      );

      expect(result.players).toBeUndefined();
    });

    it('should skip properties that are undefined in the entity', () => {
      user.players = undefined;

      properties = { players: true };

      const result = DtoHelper.populateDtoWithOptionalProperties(
        userDto,
        user,
        UserDto['typeMapping'],
        properties,
      );

      expect(result.players).toBeUndefined();
    });
  });
});
