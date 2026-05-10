import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import Holidays from 'date-holidays';

const hd = new Holidays();

@ValidatorConstraint({ async: false })
export class IsGeoCodeConstraint implements ValidatorConstraintInterface {
  /**
   * Performs the validation check.
   * The value passed here is the property being decorated (stateCode or regionCode).
   */
  validate(value: any, args: ValidationArguments) {
    // Get the whole object (the DTO instance) to access countryCode and stateCode
    const object = args.object as any;
    const countryCode = object.countryCode;
    const stateCode = object.stateCode;

    // Determine which level is being validated
    const validationTarget = args.property; // 'stateCode' or 'regionCode'

    if (!countryCode) {
      // If countryCode is not present (which is allowed by @IsOptional on countryCode),
      // the subordinate codes should also be considered valid if they are absent.
      // If a subordinate code IS present without the parent, it fails the structural check,
      // but that is handled by the @ValidateIf logic in the DTO.
      return true;
    }

    if (validationTarget === 'stateCode') {
      if (!value) return true; // stateCode is optional, skip if absent

      // Check if the stateCode is supported for the given countryCode
      const supportedStates = hd.getStates(countryCode);
      return !!supportedStates[value]; // Returns true if the state code key exists
    }

    if (validationTarget === 'regionCode') {
      if (!value) return true; // regionCode is optional, skip if absent
      if (!stateCode) return false; // Must have stateCode to check regionCode (structural integrity check)

      // Check if the regionCode is supported for the given countryCode and stateCode
      const supportedRegions = hd.getRegions(countryCode, stateCode);
      if (!supportedRegions && value) return false;
      return !!supportedRegions[value]; // Returns true if the region code key exists
    }

    return false; // Should not happen
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as any;
    const countryCode = object.countryCode;
    const stateCode = object.stateCode;
    const validationTarget = args.property;

    if (validationTarget === 'stateCode') {
      return `State code '${args.value}' is not supported for country '${countryCode}' or is invalid.`;
    }
    if (validationTarget === 'regionCode') {
      return `Region code '${args.value}' is not supported for state '${stateCode}' (country '${countryCode}') or is invalid.`;
    }
    return `Invalid geographic code for ${validationTarget}.`;
  }
}

/**
 * Custom decorator function to apply the IsHolidayGeoCodeConstraint.
 */
export function IsGeoCode(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsGeoCodeConstraint,
    });
  };
}
