import * as hbs from 'handlebars';

hbs.registerHelper('eq', (arg1, args2) => {
  return arg1 === args2;
});

export { hbs };
