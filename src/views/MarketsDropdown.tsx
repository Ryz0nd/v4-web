import { Key, memo, useEffect, useMemo, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';

import { Nullable } from '@/constants/abacus';
import { ButtonSize, ButtonStyle } from '@/constants/buttons';
import { LocalStorageKey } from '@/constants/localStorage';
import { STRING_KEYS } from '@/constants/localization';
import { MarketFilters, PREDICTION_MARKET, type MarketData } from '@/constants/markets';
import { AppRoute, MarketsRoute } from '@/constants/routes';
import { StatsigFlags } from '@/constants/statsig';

import { useMetadataServiceAssetFromId } from '@/hooks/useLaunchableMarkets';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMarketsData } from '@/hooks/useMarketsData';
import { useParameterizedSelector } from '@/hooks/useParameterizedSelector';
import { usePotentialMarkets } from '@/hooks/usePotentialMarkets';
import { useAllStatsigGateValues } from '@/hooks/useStatsig';
import { useStringGetter } from '@/hooks/useStringGetter';

import { layoutMixins } from '@/styles/layoutMixins';
import { popoverMixins } from '@/styles/popoverMixins';

import { AssetIcon } from '@/components/AssetIcon';
import { Button } from '@/components/Button';
import { DropdownIcon } from '@/components/DropdownIcon';
import { Icon, IconName } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Output, OutputType } from '@/components/Output';
import { Popover, TriggerType } from '@/components/Popover';
import { ColumnDef, Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { Toolbar } from '@/components/Toolbar';

import { useAppDispatch, useAppSelector } from '@/state/appTypes';
import { getIsMarketFavorited } from '@/state/appUiConfigsSelectors';
import { setMarketFilter } from '@/state/perpetuals';
import { getMarketFilter, getMarketMaxLeverage } from '@/state/perpetualsSelectors';

import { elementIsTextInput } from '@/lib/domUtils';
import { isTruthy } from '@/lib/isTruthy';
import { calculateMarketMaxLeverage } from '@/lib/marketsHelpers';
import { MustBigNumber } from '@/lib/numbers';
import { testFlags } from '@/lib/testFlags';

import { MarketFilter } from './MarketFilter';
import { FavoriteButton } from './tables/MarketsTable/FavoriteButton';

const MarketsDropdownContent = ({
  closeDropdown,
  onRowAction,
}: {
  closeDropdown: () => void;
  onRowAction?: (market: Key) => void;
}) => {
  const dispatch = useAppDispatch();
  const filter: MarketFilters = useAppSelector(getMarketFilter);
  const stringGetter = useStringGetter();
  const [searchFilter, setSearchFilter] = useState<string>();
  const navigate = useNavigate();
  const featureFlags = useAllStatsigGateValues();
  const { hasPotentialMarketsData } = usePotentialMarkets();
  const { uiRefresh } = testFlags;

  const setFilter = (newFilter: MarketFilters) => {
    dispatch(setMarketFilter(newFilter));
  };

  const { filteredMarkets, marketFilters } = useMarketsData({
    filter,
    searchFilter,
  });

  const columns = useMemo(
    () =>
      [
        {
          columnKey: 'market',
          getCellValue: (row: MarketData) => row.displayId,
          label: stringGetter({ key: STRING_KEYS.MARKET }),
          renderCell: ({
            id,
            assetId,
            displayId,
            imageUrl,
            isNew,
            isUnlaunched,
            effectiveInitialMarginFraction,
            initialMarginFraction,
          }: MarketData) => (
            <div tw="flex items-center gap-0.25">
              <FavoriteButton marketId={id} />
              <$AssetIcon $uiRefreshEnabled={uiRefresh} logoUrl={imageUrl} symbol={assetId} />
              <h2>{displayId}</h2>
              <Tag>
                {isUnlaunched ? (
                  stringGetter({ key: STRING_KEYS.LAUNCHABLE })
                ) : (
                  <Output
                    type={OutputType.Multiple}
                    value={calculateMarketMaxLeverage({
                      effectiveInitialMarginFraction,
                      initialMarginFraction,
                    })}
                    fractionDigits={0}
                  />
                )}
              </Tag>
              {isNew && <Tag isHighlighted>{stringGetter({ key: STRING_KEYS.NEW })}</Tag>}
            </div>
          ),
        },
        {
          columnKey: 'oraclePrice',
          getCellValue: (row: MarketData) => row.oraclePrice,
          label: stringGetter({ key: STRING_KEYS.PRICE }),
          renderCell: ({ oraclePrice, tickSizeDecimals }: MarketData) => (
            <$Output
              withSubscript
              type={OutputType.Fiat}
              value={oraclePrice}
              fractionDigits={tickSizeDecimals}
            />
          ),
        },
        {
          columnKey: 'priceChange24HPercent',
          getCellValue: (row: MarketData) => row.priceChange24HPercent,
          label: stringGetter({ key: STRING_KEYS._24H }),
          renderCell: ({ priceChange24HPercent }: MarketData) => (
            <div tw="inlineRow">
              {!priceChange24HPercent ? (
                <$Output type={OutputType.Text} value={null} />
              ) : (
                <$PriceChangeOutput
                  type={OutputType.Percent}
                  value={priceChange24HPercent}
                  isNegative={MustBigNumber(priceChange24HPercent).isNegative()}
                />
              )}
            </div>
          ),
        },
        {
          columnKey: 'volume24H',
          getCellValue: (row: MarketData) => row.volume24H,
          label: stringGetter({ key: STRING_KEYS.VOLUME }),
          renderCell: (row: MarketData) => (
            <$Output type={OutputType.CompactFiat} value={row.volume24H} />
          ),
        },
        !uiRefresh && {
          columnKey: 'openInterest',
          getCellValue: (row: MarketData) => row.openInterestUSDC,
          label: stringGetter({ key: STRING_KEYS.OPEN_INTEREST }),
          renderCell: (row: MarketData) => (
            <$Output type={OutputType.CompactFiat} value={row.openInterestUSDC} />
          ),
        },
      ].filter(isTruthy) satisfies ColumnDef<MarketData>[],
    [stringGetter, uiRefresh]
  );

  const slotBottom = useMemo(() => {
    if (filter === MarketFilters.PREDICTION_MARKET) {
      return (
        <div tw="p-1 text-color-text-0 font-small-medium">
          {stringGetter({ key: STRING_KEYS.PREDICTION_MARKET_DESC })}
        </div>
      );
    }

    return null;
  }, [filter, stringGetter]);

  const [hasSeenElectionBannerTrumpWin, setHasSeenElectionBannerTrupmWin] = useLocalStorage({
    key: LocalStorageKey.HasSeenElectionBannerTRUMPWIN,
    defaultValue: false,
  });

  const slotTop = useMemo(() => {
    const currentDate = new Date();

    if (
      !hasSeenElectionBannerTrumpWin &&
      featureFlags[StatsigFlags.ffShowPredictionMarketsUi] &&
      currentDate < new Date('2024-11-06T23:59:59')
    ) {
      return (
        <$MarketDropdownBanner>
          <$FlagGradient />
          <Link
            to={`${AppRoute.Trade}/${PREDICTION_MARKET.TRUMPWIN}`}
            onClick={() => {
              closeDropdown();
            }}
          >
            🇺🇸 {stringGetter({ key: STRING_KEYS.TRADE_US_PRESIDENTIAL_ELECTION })} →
          </Link>
          <IconButton
            tw="[--button-icon-size:0.8em]"
            onClick={() => setHasSeenElectionBannerTrupmWin(true)}
            iconName={IconName.Close}
            buttonStyle={ButtonStyle.WithoutBackground}
          />
        </$MarketDropdownBanner>
      );
    }

    return null;
  }, [
    setHasSeenElectionBannerTrupmWin,
    hasSeenElectionBannerTrumpWin,
    stringGetter,
    closeDropdown,
    featureFlags,
  ]);

  return (
    <>
      <$Toolbar>
        <MarketFilter
          selectedFilter={filter}
          filters={marketFilters}
          onChangeFilter={setFilter}
          onSearchTextChange={setSearchFilter}
        />
      </$Toolbar>
      {slotTop}
      <$ScrollArea>
        <$Table
          withInnerBorders
          data={filteredMarkets}
          getRowKey={(row: MarketData) => row.id}
          getIsRowPinned={(row: MarketData) => row.isFavorite}
          onRowAction={onRowAction}
          defaultSortDescriptor={{
            column: 'volume24H',
            direction: 'descending',
          }}
          label={stringGetter({ key: STRING_KEYS.MARKETS })}
          columns={columns}
          initialPageSize={50}
          paginationBehavior={testFlags.pml ? 'paginate' : 'showAll'}
          shouldResetOnTotalRowsChange
          slotEmpty={
            <$MarketNotFound>
              {filter === MarketFilters.NEW && !searchFilter ? (
                <>
                  <h2>
                    {stringGetter({
                      key: STRING_KEYS.QUERY_NOT_FOUND,
                      params: { QUERY: stringGetter({ key: STRING_KEYS.NEW }) },
                    })}
                  </h2>
                  {hasPotentialMarketsData && (
                    <p>{stringGetter({ key: STRING_KEYS.ADD_DETAILS_TO_LAUNCH_MARKET })}</p>
                  )}
                </>
              ) : (
                <>
                  <h2>
                    {stringGetter({
                      key: STRING_KEYS.QUERY_NOT_FOUND,
                      params: { QUERY: searchFilter ?? '' },
                    })}
                  </h2>
                  <p>{stringGetter({ key: STRING_KEYS.MARKET_SEARCH_DOES_NOT_EXIST_YET })}</p>
                </>
              )}

              {hasPotentialMarketsData && (
                <div>
                  <Button
                    onClick={() => navigate(`${AppRoute.Markets}/${MarketsRoute.New}`)}
                    size={ButtonSize.Small}
                  >
                    {stringGetter({ key: STRING_KEYS.PROPOSE_NEW_MARKET })}
                  </Button>
                </div>
              )}
            </$MarketNotFound>
          }
        />
        {slotBottom}
      </$ScrollArea>
    </>
  );
};

export const MarketsDropdown = memo(
  ({
    currentMarketId,
    launchableMarketId,
    logoUrl = '',
  }: {
    currentMarketId?: string;
    launchableMarketId?: string;
    logoUrl: Nullable<string>;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const stringGetter = useStringGetter();
    const navigate = useNavigate();
    const marketMaxLeverage = useParameterizedSelector(getMarketMaxLeverage, currentMarketId);
    const launchableAsset = useMetadataServiceAssetFromId(launchableMarketId);
    const isViewingUnlaunchedMarket = !!launchableAsset;

    const { uiRefresh: uiRefreshEnabled } = testFlags;

    const leverageTag =
      !uiRefreshEnabled && !isViewingUnlaunchedMarket && currentMarketId != null ? (
        <Tag>
          <Output type={OutputType.Multiple} value={marketMaxLeverage} fractionDigits={0} />
        </Tag>
      ) : undefined;

    const triggerBackground = currentMarketId === PREDICTION_MARKET.TRUMPWIN && <$TriggerFlag />;

    useEffect(() => {
      // listen for '/' key to open the dropdown
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== '/' || !event.target) return;

        const isTextInput = elementIsTextInput(event.target as HTMLElement);

        if (!isTextInput) {
          event.preventDefault();
          setIsOpen(true);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, []);

    const isFavoritedMarket = useParameterizedSelector(getIsMarketFavorited, currentMarketId ?? '');

    return (
      <$Popover
        $uiRefreshEnabled={uiRefreshEnabled}
        open={isOpen}
        onOpenChange={setIsOpen}
        sideOffset={1}
        slotTrigger={
          <>
            {triggerBackground}
            <$TriggerContainer $isOpen={isOpen} $uiRefreshEnabled={uiRefreshEnabled}>
              {!uiRefreshEnabled && isOpen ? (
                <h2 tw="text-color-text-2 font-medium-medium">
                  {stringGetter({ key: STRING_KEYS.SELECT_MARKET })}
                </h2>
              ) : (
                <div tw="spacedRow gap-0.625">
                  {launchableAsset ? (
                    <>
                      <img
                        src={launchableAsset.logo}
                        alt={launchableAsset.name}
                        tw="h-[1em] w-auto rounded-[50%]"
                      />

                      <div tw="flex flex-col text-start">
                        <span tw="font-mini-book">
                          {stringGetter({ key: STRING_KEYS.NOT_LAUNCHED })}
                        </span>
                        <h2 tw="mt-[-0.25rem] text-color-text-2 font-medium-medium">
                          {currentMarketId}
                        </h2>
                      </div>
                    </>
                  ) : (
                    <div tw="flex items-center gap-0.25">
                      <$AssetIconWithStar>
                        {isFavoritedMarket && <$FavoriteStatus iconName={IconName.Star} />}
                        <$AssetIcon
                          logoUrl={logoUrl}
                          $uiRefreshEnabled={uiRefreshEnabled}
                          tw="mr-0.25"
                        />
                      </$AssetIconWithStar>
                      <h2 tw="text-color-text-2 font-medium-medium">{currentMarketId}</h2>
                    </div>
                  )}
                  {leverageTag}
                </div>
              )}
              <p tw="row gap-0.5 text-color-text-0 font-small-book">
                {!uiRefreshEnabled && isOpen && stringGetter({ key: STRING_KEYS.TAP_TO_CLOSE })}
                <DropdownIcon isOpen={isOpen} />
              </p>
            </$TriggerContainer>
          </>
        }
        triggerType={TriggerType.MarketDropdown}
      >
        <MarketsDropdownContent
          closeDropdown={() => setIsOpen(false)}
          onRowAction={(market: Key) => {
            navigate(`${AppRoute.Trade}/${market}`);
            setIsOpen(false);
          }}
        />
      </$Popover>
    );
  }
);

const $TriggerContainer = styled.div<{ $isOpen: boolean; $uiRefreshEnabled: boolean }>`
  position: relative;

  ${layoutMixins.spacedRow}
  padding: 0 1.25rem;

  transition: width 0.1s;

  ${({ $uiRefreshEnabled }) => css`
    ${$uiRefreshEnabled
      ? css`
          gap: 1rem;
        `
      : css`
          width: var(--sidebar-width);
        `}
  `}
`;

const $Popover = styled(Popover)<{ $uiRefreshEnabled: boolean }>`
  ${popoverMixins.popover}
  --popover-item-height: ${({ $uiRefreshEnabled }) =>
    $uiRefreshEnabled ? css`2.75rem` : css`3.375rem`};

  --popover-backgroundColor: var(--color-layer-2);
  display: flex;
  flex-direction: column;

  height: calc(
    100vh - var(--page-header-height) - var(--market-info-row-height) - var(--page-footer-height)
  );

  ${({ $uiRefreshEnabled }) => css`
    ${$uiRefreshEnabled
      ? css`
          width: var(--marketsDropdown-openWidth);
        `
      : css`
          width: var(--marketsDropdown-openWidth-deprecated);
        `}
  `}
  max-width: 100vw;

  box-shadow: 0 0 0 1px var(--color-border);
  border-radius: 0;

  &[data-state='open'] {
    animation: ${keyframes`
      from {
        opacity: 0;
        scale: 0.9;
        max-height: 0;
      }
    `} 0.2s var(--ease-out-expo);
  }

  &[data-state='closed'] {
    animation: ${keyframes`
      to {
        opacity: 0;
        scale: 0.95;
        max-height: 0;
      }
    `} 0.2s;
  }
  &:focus-visible {
    outline: none;
  }
`;

const $Toolbar = styled(Toolbar)`
  gap: 0.5rem;
  border-bottom: solid var(--border-width) var(--color-border);
  padding: 1rem 1rem 0.5rem;
`;

const $MarketDropdownBanner = styled.div`
  ${layoutMixins.row}
  background-color: var(--color-layer-1);
  padding: 0.9063rem 1rem;
  font: var(--font-base-medium);
  color: var(--color-text-1);
  border-bottom: solid var(--border-width) var(--color-border);
  justify-content: space-between;
  position: relative;

  & > * {
    z-index: 1;
  }
`;

const $AssetIcon = styled(AssetIcon)<{ $uiRefreshEnabled: boolean }>`
  ${({ $uiRefreshEnabled }) => css`
    ${$uiRefreshEnabled &&
    css`
      --asset-icon-size: 1.5em;
    `}
  `}
`;

const $FlagGradient = styled.div`
  width: 573px;
  height: 100%;
  background-image: ${({ theme }) => `
    linear-gradient(90deg, ${theme.layer1} 0%, ${theme.tooltipBackground} 53%, ${theme.layer1} 99%),
    url('/AmericanFlag.png')
  `};
  background-repeat: no-repeat;
  position: absolute;
  z-index: 0;
  right: 0;
`;

const $TriggerFlag = styled.div`
  background: url('/AmericanFlag2.png') no-repeat;
  mix-blend-mode: luminosity;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const $ScrollArea = styled.div`
  overflow: scroll;
  position: relative;
  height: 100%;
`;

const $Table = styled(Table)`
  --tableCell-padding: 0.5rem 1rem;
  --table-header-height: 2.25rem;

  thead {
    --stickyArea-totalInsetTop: 0px;
    --stickyArea-totalInsetBottom: 0px;
    tr {
      height: var(--stickyArea-topHeight);
    }
  }

  tfoot {
    --stickyArea-totalInsetTop: 0px;
    --stickyArea-totalInsetBottom: 3px;

    tr {
      height: var(--stickyArea-bottomHeight);
    }
  }

  tr {
    height: var(--popover-item-height);
  }
` as typeof Table;

const $Output = styled(Output)<{ isNegative?: boolean }>`
  color: ${({ isNegative }) => (isNegative ? `var(--color-negative)` : `var(--color-positive)`)};
  color: var(--color-text-2);
`;

const $PriceChangeOutput = styled(Output)<{ isNegative?: boolean }>`
  color: ${({ isNegative }) => (isNegative ? `var(--color-negative)` : `var(--color-positive)`)};
`;

const $MarketNotFound = styled.div`
  ${layoutMixins.column}
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 2rem 1.5rem;

  h2 {
    font: var(--font-medium-book);
    font-weight: 500;
  }
`;

const $FavoriteStatus = styled(Icon)`
  --icon-size: 0.75em;
  --icon-color: ${({ theme }) => theme.profileYellow};
  place-self: start;

  color: var(--icon-color);
  fill: var(--icon-color);
  z-index: 1;
`;

const $AssetIconWithStar = styled.div`
  ${layoutMixins.stack}

  ${$AssetIcon} {
    margin: 0.2rem;
  }
`;
