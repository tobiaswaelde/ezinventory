import { createTypeScriptConfig } from '@ezinventory/eslint-config/base';

export default createTypeScriptConfig({
  ignores: ['.nuxt/**', '.output/**']
});
