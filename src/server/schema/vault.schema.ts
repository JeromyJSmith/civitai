import _ from 'lodash';
import { z } from 'zod';
import { paginationSchema } from '~/server/schema/base.schema';

export type GetPaginatedVaultItemsSchema = z.infer<typeof getPaginatedVaultItemsSchema>;
export const getPaginatedVaultItemsSchema = paginationSchema.merge(
  z.object({
    limit: z.coerce.number().min(1).max(200).default(60),
  })
);

export type VaultItemsAddModelVersionSchema = z.infer<typeof vaultItemsAddModelVersionSchema>;
export const vaultItemsAddModelVersionSchema = z.object({
  modelVersionId: z.number(),
});

export type VaultItemsRefreshSchema = z.infer<typeof vaultItemsRefreshSchema>;
export const vaultItemsRefreshSchema = z.object({
  modelVersionIds: z.array(z.number()),
});

export type VaultItemsUpdateNotesSchema = z.infer<typeof vaultItemsUpdateNotesSchema>;
export const vaultItemsUpdateNotesSchema = z.object({
  modelVersionIds: z.array(z.number()),
  notes: z.string().optional(),
});

export type VaultItemsRemoveModelVersionsSchema = z.infer<
  typeof vaultItemsRemoveModelVersionsSchema
>;
export const vaultItemsRemoveModelVersionsSchema = z.object({
  modelVersionIds: z.array(z.number()),
});
