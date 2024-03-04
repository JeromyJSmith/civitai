import {
  Button,
  Center,
  Checkbox,
  Container,
  Group,
  Loader,
  LoadingOverlay,
  Pagination,
  Progress,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconCloudOff, IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useQueryVault } from '~/components/Vault/vault.util';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { createServerSideProps } from '~/server/utils/server-side-helpers';
import { getLoginLink } from '~/utils/login-helpers';
import { formatKBytes } from '~/utils/number-helpers';
import { trpc } from '~/utils/trpc';
import { useQueryVaultItems } from '../../components/Vault/vault.util';
import { GetPaginatedVaultItemsSchema } from '~/server/schema/vault.schema';
import { formatDate } from '~/utils/date-helpers';
import { getDisplayName } from '~/utils/string-helpers';
import { isEqual, uniqBy } from 'lodash-es';
import { useDebouncedValue } from '@mantine/hooks';
import { VaultItemsFiltersDropdown } from '~/components/Vault/VaultItemsFiltersDropdown';

export const getServerSideProps = createServerSideProps({
  useSession: true,
  resolver: async ({ session, ctx, features }) => {
    if (!session)
      return {
        redirect: {
          destination: getLoginLink({ returnUrl: ctx.resolvedUrl, reason: 'civitai-vault' }),
          permanent: false,
        },
      };

    if (!session.user?.subscriptionId) {
      return {
        redirect: {
          destination: '/pricing',
          permanent: false,
        },
      };
    }
  },
});

export default function CivitaiVault() {
  const currentUser = useCurrentUser();
  const { vault, isLoading: isLoadingVault } = useQueryVault();
  const [filters, setFilters] = useState<Omit<GetPaginatedVaultItemsSchema, 'limit'>>({
    page: 1,
  });
  const [debouncedFilters, cancel] = useDebouncedValue(filters, 500);

  const {
    items,
    isLoading: isLoadingVaultItems,
    isRefetching,
    pagination,
  } = useQueryVaultItems(debouncedFilters, { keepPreviousData: true });
  const [selectedItems, setSelectedItems] = useState<(typeof items)[number][]>([]);

  const progress = vault ? (vault.usedStorageKb / vault.storageKb) * 100 : 0;

  const allSelectedInPage = useMemo(() => {
    return items.every((item) => selectedItems.find((i) => i.id === item.id));
  }, [items, selectedItems]);

  //#region [useEffect] cancel debounced filters
  useEffect(() => {
    if (isEqual(filters, debouncedFilters)) cancel();
  }, [cancel, debouncedFilters, filters]);
  //#endregion

  return (
    <Container size="xl">
      <Group position="apart" align="flex-end" mb="xl">
        <Title order={1}>Civitai Vaut</Title>
        {vault && (
          <Stack spacing={0}>
            <Progress
              style={{ width: '100%' }}
              size="xl"
              value={progress}
              color={progress >= 100 ? 'red' : 'blue'}
              striped
              animate
            />
            <Text>
              {formatKBytes(vault.usedStorageKb)} of {formatKBytes(vault.storageKb)} Used
            </Text>
          </Stack>
        )}
      </Group>

      {isLoadingVault ? (
        <Center p="xl">
          <Loader />
        </Center>
      ) : (
        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={(isLoadingVaultItems || isRefetching) ?? false} zIndex={9} />

          <Stack>
            <Group>
              <TextInput
                radius="xl"
                variant="filled"
                icon={<IconSearch size={20} />}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                value={filters.query}
                placeholder="Models or creators..."
              />
              <VaultItemsFiltersDropdown
                filters={debouncedFilters}
                setFilters={(f) => setFilters((c) => ({ ...c, ...f }))}
              />
            </Group>

            <Table>
              <thead>
                <tr>
                  <th>
                    <Checkbox
                      checked={allSelectedInPage}
                      onChange={() => {
                        if (allSelectedInPage) {
                          setSelectedItems((c) =>
                            c.filter((i) => !items.find((item) => item.id === i.id))
                          );
                        } else {
                          setSelectedItems((c) => uniqBy([...c, ...items], 'id'));
                        }
                      }}
                      aria-label="Select all items in page"
                      size="sm"
                    />
                  </th>
                  <th>Models</th>
                  <th>Creator</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Date Created</th>
                  <th>Date Added</th>
                  <th>Last Refreshed</th>
                  <th>Notes</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <th colSpan={9}>
                      <Stack align="center" my="xl">
                        <ThemeIcon size={62} radius={100}>
                          <IconCloudOff />
                        </ThemeIcon>
                        <Text align="center">No items found.</Text>
                      </Stack>
                    </th>
                  </tr>
                )}
                {items.map((item) => {
                  const isSelected = !!selectedItems.find((i) => i.id === item.id);

                  return (
                    <tr key={item.id}>
                      <th>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedItems((c) => c.filter((i) => i.id !== item.id));
                            } else {
                              setSelectedItems((c) => [...c, item]);
                            }
                          }}
                          aria-label="Select item"
                          size="sm"
                        />
                      </th>
                      <th>
                        <Stack spacing={0}>
                          <Text>{item.modelName}</Text>
                          <Text color="dimmde" size="sm">
                            {item.versionName}
                          </Text>
                        </Stack>
                      </th>
                      <th>{item.creatorName}</th>
                      <th>{getDisplayName(item.type)}</th>
                      <th>{getDisplayName(item.category)}</th>
                      <th>{formatDate(item.createdAt)}</th>
                      <th>{formatDate(item.addedAt)}</th>
                      <th>{item.refreshedAt ? formatDate(item.refreshedAt) : '-'}</th>
                      <th>{item.notes ?? '-'}</th>
                      <th>&nbsp;</th>
                    </tr>
                  );
                })}
              </tbody>
              {pagination && pagination.totalPages > 1 && (
                <Group position="apart">
                  <Text>Total {pagination.totalItems.toLocaleString()} items</Text>
                  <Pagination
                    page={filters.page}
                    onChange={(page) => setFilters((curr) => ({ ...curr, page }))}
                    total={pagination.totalPages}
                  />
                </Group>
              )}
            </Table>
          </Stack>
        </div>
      )}
    </Container>
  );
}
