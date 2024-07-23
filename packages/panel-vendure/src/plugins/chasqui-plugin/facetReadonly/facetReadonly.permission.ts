// sync-permission.ts
import { PermissionDefinition } from '@vendure/core';

export const permissionEditFacetReadonly = new PermissionDefinition({
  name: 'EditFacetReadonly',
  description: 'Permite editar facetas del tipo solo lectura (compartidas entre todos los canales)',
});
