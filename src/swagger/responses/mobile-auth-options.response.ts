import { ApiProperty } from '@nestjs/swagger';
import {
  Gender,
  Interest,
} from '../../modules/mobile-auth/enums/mobile-auth.enum';

export class EnumOption {
  @ApiProperty({
    example: 'male',
    description: 'The enum value',
  })
  value: string;

  @ApiProperty({
    example: 'male',
    description: 'Human-readable label for the enum value',
  })
  label: string;
}

export class MobileAuthOptionsResponse {
  @ApiProperty({
    description: 'Available gender options',
    type: [EnumOption],
    example: [
      { value: 'male', label: 'male' },
      { value: 'female', label: 'female' },
      { value: 'prefer_not_to_say', label: 'prefer not to say' },
    ],
  })
  genders: EnumOption[];
}
