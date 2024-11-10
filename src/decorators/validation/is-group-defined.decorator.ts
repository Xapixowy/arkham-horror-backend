import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { ValidatorHelper } from '@Helpers/validator/validator.helper';

export function IsGroupDefined(
  keys: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isGroupDefined',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedKeys] = args.constraints;
          return (
            value !== undefined &&
            !ValidatorHelper.isGroupDefined(args.object, ...relatedKeys)
          );
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedKeys] = args.constraints;
          const relatedKeysWithoutDefined = relatedKeys.filter(
            (key: string) => key !== propertyName,
          );
          return `${args.property} must be specified along with ${relatedKeysWithoutDefined.join(', ')}`;
        },
      },
      constraints: [keys],
    });
  };
}
