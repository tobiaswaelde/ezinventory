import { getCountryForTimezone } from 'countries-and-timezones';

export const getIconForTimezone = (timezone: string) => {
  const country = getCountryForTimezone(timezone);
  return country ? `i-flag-${country.id.toLowerCase()}-4x3` : 'i-hero-globe-alt';
};
