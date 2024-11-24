import { CardAttributeAbility } from '@Enums/card/card-attribute-ability.enum';
import { CardAttributeRestriction } from '@Enums/card/card-attribute-restriction.enum';
import { CardAttributeModifier } from '@Enums/card/card-attribute-modifier.enum';

export const CardAttribute = {
  ...CardAttributeAbility,
  ...CardAttributeModifier,
  ...CardAttributeRestriction,
};

export type CardAttribute = CardAttributeAbility | CardAttributeRestriction;
