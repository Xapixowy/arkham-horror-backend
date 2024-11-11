import { IsNumber, ValidateIf } from 'class-validator';
import { Attributes } from '@Types/player/attributes.type';
import { ValidatorHelper } from '@Helpers/validator/validator.helper';
import { IsGroupDefined } from '@Decorators/validation/is-group-defined.decorator';

export class UpdatePlayerAttributesRequest implements Partial<Attributes> {
  @ValidateIf((obj) => !ValidatorHelper.isGroupDefined(obj, 'speed', 'sneak'))
  @IsGroupDefined(['speed', 'sneak'])
  @IsNumber()
  speed?: number;

  @ValidateIf((obj) => !ValidatorHelper.isGroupDefined(obj, 'speed', 'sneak'))
  @IsGroupDefined(['speed', 'sneak'])
  @IsNumber()
  sneak?: number;

  @ValidateIf((obj) => !ValidatorHelper.isGroupDefined(obj, 'prowess', 'will'))
  @IsGroupDefined(['prowess', 'will'])
  @IsNumber()
  prowess?: number;

  @ValidateIf((obj) => !ValidatorHelper.isGroupDefined(obj, 'prowess', 'will'))
  @IsGroupDefined(['prowess', 'will'])
  @IsNumber()
  will?: number;

  @ValidateIf(
    (obj) => !ValidatorHelper.isGroupDefined(obj, 'knowledge', 'luck'),
  )
  @IsGroupDefined(['knowledge', 'luck'])
  @IsNumber()
  knowledge?: number;

  @ValidateIf(
    (obj) => !ValidatorHelper.isGroupDefined(obj, 'knowledge', 'luck'),
  )
  @IsGroupDefined(['knowledge', 'luck'])
  @IsNumber()
  luck?: number;
}
