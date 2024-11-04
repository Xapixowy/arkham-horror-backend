import { DTOTypeMapping } from '@custom-types/dto/dto-type-mapping.type';
import { DTOProperties } from '@custom-types/dto/dto-properties.type';

export class DtoHelper {
  static populateDtoWithOptionalProperties<T, Y>(
    dto: T,
    entity: Y,
    typeMapping: DTOTypeMapping,
    properties?: DTOProperties,
  ): T {
    if (!properties) {
      return dto;
    }

    const dtoProperties = Object.keys(dto);
    const propertiesToCopy = Object.keys(properties).filter(
      (property) =>
        dtoProperties.includes(property) &&
        properties[property] &&
        entity[property],
    );

    propertiesToCopy.forEach((property) => {
      dto[property] =
        typeMapping && typeMapping[property]
          ? typeMapping[property](entity[property])
          : entity[property];
    });

    return dto;
  }
}
