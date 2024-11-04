export enum CardStatisticModifierEnum {
  // Test Modifiers
  COMBAT_TEST = 'combat_test',
  SPELL_TEST = 'spell_test',
  EVADE_TEST = 'evade_test',
  LUCK_TEST = 'luck_test',
  HORROR_TEST = 'horror_test',

  // Base Modifiers
  MOVEMENT_POINT = 'movement_point',
  MAX_SANITY = 'max_sanity',
  MAX_ENDURANCE = 'max_endurance',
  KNOWLEDGE = 'knowledge',
  SPEED = 'speed',
  EVADE = 'evade',
  LUCK = 'luck',
  CONCENTRATION = 'concentration',
  WILL = 'will',
  COMBAT_PROWESS = 'combat_prowess',

  // Abilities & Restrictions
  MAX_CLUE_TOKENS = 'max_clue_tokens',
  MAX_SKILLS_SPELLS = 'max_skills_spells',
  MAX_COMMON_UNIQUE_ITEMS = 'max_common_unique_items',
  CANNOT_GATHER_CLUES_FROM_BOARD = 'cannot_gather_clues_from_board',
  ONE_HAND_LESS = 'one_hand_less',
  IMMUNE_TO_NIGHTMARE_ABILITY = 'immune_to_nightmare_ability',
  MONSTER_NO_MAGIC_RESISTANCE = 'monster_no_magic_resistance',
  MONSTER_NO_PHYSICAL_RESISTANCE = 'monster_no_physical_resistance',
  IMMUNE_TO_OVERWHELM_ABILITY = 'immune_to_overwhelm_ability',
  COLLECT_TROPHIES_FROM_ETERNAL = 'collect_trophies_from_eternal',

  // Bonuses
  ADD_PLUS_ONE_TO_COMBAT_DICE_RESULT = 'add_plus_one_to_combat_dice_result',
  ADD_PLUS_ONE_TO_KNOWLEDGE_DICE_RESULT = 'add_plus_one_to_knowledge_dice_result',
  ADD_PLUS_ONE_TO_WILL_DICE_RESULT = 'add_plus_one_to_will_dice_result',
  ADD_PLUS_ONE_TO_LUCK_DICE_RESULT = 'add_plus_one_to_luck_dice_result',
  ADD_PLUS_ONE_TO_EVADE_DICE_RESULT = 'add_plus_one_to_evade_dice_result',
  ADD_PLUS_ONE_TO_SPEED_DICE_RESULT = 'add_plus_one_to_speed_dice_result',
  BONUS_COMBAT_DICE_WHEN_SPENDING_CLUE = 'bonus_combat_dice_when_spending_clue',
  BONUS_KNOWLEDGE_DICE_WHEN_SPENDING_CLUE = 'bonus_knowledge_dice_when_spending_clue',
  BONUS_WILL_DICE_WHEN_SPENDING_CLUE = 'bonus_will_dice_when_spending_clue',
  BONUS_LUCK_DICE_WHEN_SPENDING_CLUE = 'bonus_luck_dice_when_spending_clue',
  BONUS_EVADE_DICE_WHEN_SPENDING_CLUE = 'bonus_evade_dice_when_spending_clue',
  BONUS_SPEED_DICE_WHEN_SPENDING_CLUE = 'bonus_speed_dice_when_spending_clue',
}
