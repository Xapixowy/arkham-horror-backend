import { StatisticsService } from './statistics.service';
import { Player } from '@Entities/player.entity';
import { UpdatePlayerRequest } from '@Requests/player/update-player.request';
import { Statistics as PlayerStatistics } from '@Types/player/statistics.type';
import { Statistics as UserStatistics } from '@Types/user/statistics.type';
import { PlayerRole } from '@Enums/player/player-role.enum';

describe('StatisticsService', () => {
  describe('generateUserStatistics', () => {
    it('should calculate aggregated statistics for multiple players', () => {
      const players: Player[] = [
        {
          statistics: {
            money_acquired: 10,
            money_lost: 5,
            clues_acquired: 8,
            clues_lost: 3,
            endurance_acquired: 4,
            endurance_lost: 2,
            sanity_acquired: 6,
            sanity_lost: 1,
            cards_acquired: 2,
            cards_lost: 1,
            phases_played: 5,
            characters_played: 3,
          },
          role: PlayerRole.HOST,
        } as Player,
        {
          statistics: {
            money_acquired: 15,
            money_lost: 10,
            clues_acquired: 5,
            clues_lost: 2,
            endurance_acquired: 3,
            endurance_lost: 1,
            sanity_acquired: 7,
            sanity_lost: 2,
            cards_acquired: 1,
            cards_lost: 1,
            phases_played: 4,
            characters_played: 2,
          },
          role: PlayerRole.PLAYER,
        } as Player,
      ];

      const result = StatisticsService.generateUserStatistics(players);

      const expectedStatistics: UserStatistics = {
        money_acquired: 25,
        money_lost: 15,
        clues_acquired: 13,
        clues_lost: 5,
        endurance_acquired: 7,
        endurance_lost: 3,
        sanity_acquired: 13,
        sanity_lost: 3,
        cards_acquired: 3,
        cards_lost: 2,
        phases_played: 9,
        characters_played: 5,
        game_session_played: 2,
        game_session_created: 1,
      };

      expect(result).toEqual(expectedStatistics);
    });

    it('should return initial statistics for an empty player array', () => {
      const players: Player[] = [];
      const result = StatisticsService.generateUserStatistics(players);

      const initialStatistics: UserStatistics = {
        money_acquired: 0,
        money_lost: 0,
        clues_acquired: 0,
        clues_lost: 0,
        endurance_acquired: 0,
        endurance_lost: 0,
        sanity_acquired: 0,
        sanity_lost: 0,
        cards_acquired: 0,
        cards_lost: 0,
        phases_played: 0,
        characters_played: 0,
        game_session_played: 0,
        game_session_created: 0,
      };

      expect(result).toEqual(initialStatistics);
    });
  });

  describe('generateUpdatedPlayerStatistics', () => {
    it('should calculate updated statistics based on player changes', () => {
      const player: Player = {
        statistics: {
          money_acquired: 50,
          money_lost: 20,
          clues_acquired: 15,
          clues_lost: 5,
          endurance_acquired: 10,
          endurance_lost: 3,
          sanity_acquired: 8,
          sanity_lost: 2,
        } as PlayerStatistics,
        status: {
          sanity: 10,
          endurance: 5,
        },
        equipment: {
          money: 100,
          clues: 20,
        },
      } as Player;

      const updatePlayerRequest: UpdatePlayerRequest = {
        status: { sanity: 12, endurance: 3 },
        equipment: { money: 80, clues: 25 },
      };

      const result = StatisticsService.generateUpdatedPlayerStatistics(
        player,
        updatePlayerRequest,
      );

      const expectedStatistics: PlayerStatistics = {
        money_acquired: 50,
        money_lost: 40,
        clues_acquired: 20,
        clues_lost: 5,
        endurance_acquired: 10,
        endurance_lost: 5,
        sanity_acquired: 10,
        sanity_lost: 2,
      } as unknown as PlayerStatistics;

      expect(result).toEqual(expectedStatistics);
    });

    it('should not change statistics if update values are undefined', () => {
      const player: Player = {
        statistics: {
          money_acquired: 30,
          money_lost: 10,
          clues_acquired: 10,
          clues_lost: 2,
          endurance_acquired: 5,
          endurance_lost: 2,
          sanity_acquired: 7,
          sanity_lost: 1,
        } as PlayerStatistics,
        status: {
          sanity: 15,
          endurance: 10,
        },
        equipment: {
          money: 50,
          clues: 5,
        },
      } as Player;

      const updatePlayerRequest: UpdatePlayerRequest = {
        status: {},
        equipment: {},
      } as unknown as UpdatePlayerRequest;

      const result = StatisticsService.generateUpdatedPlayerStatistics(
        player,
        updatePlayerRequest,
      );

      expect(result).toEqual(player.statistics);
    });
  });

  describe('updatePlayerStatistic', () => {
    it('should correctly add acquired statistic when new value is greater', () => {
      const statistics: PlayerStatistics = {
        money_acquired: 10,
        money_lost: 5,
      } as PlayerStatistics;

      StatisticsService['updatePlayerStatistic'](
        20,
        30,
        'money_acquired',
        'money_lost',
        statistics,
      );

      expect(statistics.money_acquired).toBe(20);
      expect(statistics.money_lost).toBe(5);
    });

    it('should correctly add lost statistic when new value is less', () => {
      const statistics: PlayerStatistics = {
        clues_acquired: 5,
        clues_lost: 3,
      } as PlayerStatistics;

      StatisticsService['updatePlayerStatistic'](
        15,
        10,
        'clues_acquired',
        'clues_lost',
        statistics,
      );

      expect(statistics.clues_acquired).toBe(5);
      expect(statistics.clues_lost).toBe(8);
    });

    it('should not change statistics when new value is undefined', () => {
      const statistics: PlayerStatistics = {
        endurance_acquired: 4,
        endurance_lost: 2,
      } as PlayerStatistics;

      StatisticsService['updatePlayerStatistic'](
        5,
        undefined,
        'endurance_acquired',
        'endurance_lost',
        statistics,
      );

      expect(statistics.endurance_acquired).toBe(4);
      expect(statistics.endurance_lost).toBe(2);
    });
  });
});
