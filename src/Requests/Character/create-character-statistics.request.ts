import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class CreateCharacterStatisticsRequest {
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsInt({ each: true })
  speed: number[];

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsInt({ each: true })
  sneak: number[];

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsInt({ each: true })
  prowess: number[];

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsInt({ each: true })
  will: number[];

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsInt({ each: true })
  knowledge: number[];

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsInt({ each: true })
  luck: number[];
}
