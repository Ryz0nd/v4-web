import { type FormEvent, useState, Ref, useCallback, Dispatch, SetStateAction } from 'react';

import { OrderSide } from '@dydxprotocol/v4-client-js';
import type { NumberFormatValues, SourceInfo } from 'react-number-format';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { AnyStyledComponent, css } from 'styled-components';

import {
  ErrorType,
  type HumanReadablePlaceOrderPayload,
  type Nullable,
  TradeInputErrorAction,
  ValidationError,
  TradeInputField,
  SubaccountOrder,
  AbacusPositionSide,
  AbacusOrderSide,
} from '@/constants/abacus';
import { AlertType } from '@/constants/alerts';
import { ButtonAction, ButtonShape, ButtonSize, ButtonType } from '@/constants/buttons';
import { DialogTypes, TradeBoxDialogTypes } from '@/constants/dialogs';
import { PanelView, InfoSection } from '@/constants/horizontalPanel';
import { STRING_KEYS, StringKey } from '@/constants/localization';
import { USD_DECIMALS } from '@/constants/numbers';
import { AppRoute } from '@/constants/routes';
import {
  InputErrorData,
  TradeBoxKeys,
  MobilePlaceOrderSteps,
  ORDER_TYPE_STRINGS,
  TradeTypes,
} from '@/constants/trade';

import { useBreakpoints, useStringGetter, useSubaccount } from '@/hooks';
import { useOnLastOrderIndexed } from '@/hooks/useOnLastOrderIndexed';

import { breakpoints } from '@/styles';
import { formMixins } from '@/styles/formMixins';
import { layoutMixins } from '@/styles/layoutMixins';

import { AlertMessage } from '@/components/AlertMessage';
import { AssetIcon } from '@/components/AssetIcon';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Icon, IconName } from '@/components/Icon';
import { InputType } from '@/components/Input';
import { Tag } from '@/components/Tag';
import { ToggleButton } from '@/components/ToggleButton';
import { ToggleGroup } from '@/components/ToggleGroup';
import { WithTooltip } from '@/components/WithTooltip';
import { Orderbook } from '@/views/tables/Orderbook';

import {
  getCurrentMarketPositionData,
  getSubaccountConditionalOrdersForMarket,
} from '@/state/accountSelectors';
import { openDialog, openDialogInTradeBox } from '@/state/dialogs';
import { setTradeFormInputs } from '@/state/inputs';
import {
  getCurrentInput,
  getInputTradeData,
  getInputTradeOptions,
  getTradeFormInputs,
  useTradeFormData,
} from '@/state/inputsSelectors';
import {
  getCurrentMarketAssetId,
  getCurrentMarketConfig,
  getCurrentMarketId,
} from '@/state/perpetualsSelectors';

import abacusStateManager from '@/lib/abacus';
import { testFlags } from '@/lib/testFlags';
import { getSelectedOrderSide, getSelectedTradeType, getTradeInputAlert } from '@/lib/tradeData';

import { AdvancedTradeOptions } from './TradeForm/AdvancedTradeOptions';
import { PlaceOrderButtonAndReceipt } from './TradeForm/PlaceOrderButtonAndReceipt';
import { PositionPreview } from './TradeForm/PositionPreview';
import { TradeSideToggle } from './TradeForm/TradeSideToggle';
import { TradeSizeInputs } from './TradeForm/TradeSizeInputs';

type TradeBoxInputConfig = {
  key: TradeBoxKeys;
  inputType: InputType;
  label: React.ReactNode;
  onChange: (values: NumberFormatValues, e: SourceInfo) => void;
  ref?: Ref<HTMLInputElement>;
  validationConfig?: InputErrorData;
  value: string | number;
  decimals?: number;
};

type ElementProps = {
  currentStep?: MobilePlaceOrderSteps;
  setCurrentStep?: (step: MobilePlaceOrderSteps) => void;
  onConfirm?: () => void;
  setTab: Dispatch<SetStateAction<InfoSection>>;
  setView: Dispatch<SetStateAction<PanelView>>;
};

type StyleProps = {
  className?: string;
};

export const TradeForm = ({
  currentStep,
  setCurrentStep,
  onConfirm,
  setTab,
  setView,
  className,
}: ElementProps & StyleProps) => {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState<string>();
  const [showOrderbook, setShowOrderbook] = useState(false);

  const dispatch = useDispatch();
  const stringGetter = useStringGetter();
  const navigate = useNavigate();
  const { placeOrder } = useSubaccount();
  const { isTablet } = useBreakpoints();

  const {
    price,
    size,
    summary,
    needsLimitPrice,
    needsTrailingPercent,
    needsTriggerPrice,
    executionOptions,
    needsGoodUntil,
    needsPostOnly,
    needsReduceOnly,
    postOnlyTooltip,
    reduceOnlyTooltip,
    timeInForceOptions,
    tradeErrors,
  } = useTradeFormData();

  const currentInput = useSelector(getCurrentInput);
  const currentAssetId = useSelector(getCurrentMarketAssetId);
  const currentMarketId = useSelector(getCurrentMarketId);
  const currentMarketPosition = useSelector(getCurrentMarketPositionData, shallowEqual) || {};
  const { tickSizeDecimals, stepSizeDecimals } =
    useSelector(getCurrentMarketConfig, shallowEqual) || {};

  const tradeFormInputValues = useSelector(getTradeFormInputs, shallowEqual);
  const { limitPriceInput, triggerPriceInput, trailingPercentInput } = tradeFormInputValues;

  const currentTradeData = useSelector(getInputTradeData, shallowEqual);

  const { side, type } = currentTradeData || {};

  const selectedTradeType = getSelectedTradeType(type);
  const selectedOrderSide = getSelectedOrderSide(side);

  const { typeOptions } = useSelector(getInputTradeOptions, shallowEqual) ?? {};

  const { stopLossOrders, takeProfitOrders } = useSelector(
    getSubaccountConditionalOrdersForMarket(currentMarketId),
    shallowEqual
  );

  const allTradeTypeItems = (typeOptions?.toArray() ?? []).map(({ type, stringKey }) => ({
    value: type,
    label: stringGetter({
      key: stringKey as StringKey,
    }),
    slotBefore: <AssetIcon symbol={currentAssetId} />,
  }));

  const onTradeTypeChange = (tradeType: TradeTypes) => {
    abacusStateManager.clearTradeInputValues();
    abacusStateManager.setTradeValue({ value: tradeType, field: TradeInputField.type });
  };

  const needsAdvancedOptions =
    needsGoodUntil ||
    timeInForceOptions ||
    executionOptions ||
    needsPostOnly ||
    postOnlyTooltip ||
    needsReduceOnly ||
    reduceOnlyTooltip;

  const tradeFormInputs: TradeBoxInputConfig[] = [];

  const isInputFilled =
    Object.values(tradeFormInputValues).some((val) => val !== '') ||
    Object.values(price || {}).some((val) => !!val) ||
    [size?.size, size?.usdcSize, size?.leverage].some((val) => val != null);

  const hasInputErrors =
    tradeErrors?.some((error: ValidationError) => error.type !== ErrorType.warning) ||
    currentInput !== 'trade';

  let alertContent;
  let alertType = AlertType.Error;

  const inputAlert = getTradeInputAlert({
    abacusInputErrors: tradeErrors ?? [],
    stringGetter,
    stepSizeDecimals,
    tickSizeDecimals,
  });

  if (placeOrderError) {
    alertContent = placeOrderError;
  } else if (inputAlert) {
    alertContent = inputAlert?.alertString;
    alertType = inputAlert?.type;
  }

  const orderSideAction = {
    [OrderSide.BUY]: ButtonAction.Create,
    [OrderSide.SELL]: ButtonAction.Destroy,
  }[selectedOrderSide];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    switch (currentStep) {
      case MobilePlaceOrderSteps.EditOrder: {
        setCurrentStep?.(MobilePlaceOrderSteps.PreviewOrder);
        break;
      }
      case MobilePlaceOrderSteps.PlacingOrder:
      case MobilePlaceOrderSteps.Confirmation: {
        onConfirm?.();
        break;
      }
      case MobilePlaceOrderSteps.PreviewOrder:
      default: {
        onPlaceOrder();
        setCurrentStep?.(MobilePlaceOrderSteps.PlacingOrder);
        break;
      }
    }
  };

  const onLastOrderIndexed = useCallback(() => {
    if (!currentStep || currentStep === MobilePlaceOrderSteps.PlacingOrder) {
      setIsPlacingOrder(false);
      abacusStateManager.clearTradeInputValues({ shouldResetSize: true });
      setCurrentStep?.(MobilePlaceOrderSteps.Confirmation);
    }
  }, [currentStep]);

  const { setUnIndexedClientId } = useOnLastOrderIndexed({
    callback: onLastOrderIndexed,
  });

  const onPlaceOrder = async () => {
    setPlaceOrderError(undefined);
    setIsPlacingOrder(true);

    await placeOrder({
      onError: (errorParams?: { errorStringKey?: Nullable<string> }) => {
        setPlaceOrderError(
          stringGetter({ key: errorParams?.errorStringKey || STRING_KEYS.SOMETHING_WENT_WRONG })
        );

        setIsPlacingOrder(false);
      },
      onSuccess: (placeOrderPayload?: Nullable<HumanReadablePlaceOrderPayload>) => {
        setUnIndexedClientId(placeOrderPayload?.clientId);
      },
    });
  };

  if (needsTriggerPrice) {
    tradeFormInputs.push({
      key: TradeBoxKeys.TriggerPrice,
      inputType: InputType.Currency,
      label: (
        <>
          <WithTooltip tooltip="trigger-price" side="right">
            {stringGetter({ key: STRING_KEYS.TRIGGER_PRICE })}
          </WithTooltip>
          <Tag>USD</Tag>
        </>
      ),
      onChange: ({ value }: NumberFormatValues) => {
        dispatch(setTradeFormInputs({ triggerPriceInput: value }));
      },
      value: triggerPriceInput ?? '',
      decimals: tickSizeDecimals ?? USD_DECIMALS,
    });
  }

  if (needsLimitPrice) {
    tradeFormInputs.push({
      key: TradeBoxKeys.LimitPrice,
      inputType: InputType.Currency,
      label: (
        <>
          <WithTooltip tooltip="limit-price" side="right">
            {stringGetter({ key: STRING_KEYS.LIMIT_PRICE })}
          </WithTooltip>
          <Tag>USD</Tag>
        </>
      ),
      onChange: ({ value }: NumberFormatValues) => {
        dispatch(setTradeFormInputs({ limitPriceInput: value }));
      },
      value: limitPriceInput,
      decimals: tickSizeDecimals ?? USD_DECIMALS,
    });
  }

  if (needsTrailingPercent) {
    tradeFormInputs.push({
      key: TradeBoxKeys.TrailingPercent,
      inputType: InputType.Percent,
      label: (
        <WithTooltip tooltip="trailing-percent" side="right">
          {stringGetter({ key: STRING_KEYS.TRAILING_PERCENT })}
        </WithTooltip>
      ),
      onChange: ({ value }: NumberFormatValues) => {
        dispatch(setTradeFormInputs({ trailingPercentInput: value }));
      },
      value: trailingPercentInput ?? '',
    });
  }

  const showAddTriggersButton = testFlags.configureSlTpFromPositionsTable && currentMarketPosition;
  const showClearButton =
    isInputFilled && (!currentStep || currentStep === MobilePlaceOrderSteps.EditOrder);

  return (
    <Styled.TradeForm onSubmit={onSubmit} className={className}>
      {currentStep && currentStep !== MobilePlaceOrderSteps.EditOrder ? (
        <>
          <PositionPreview />
          {alertContent && <AlertMessage type={alertType}>{alertContent}</AlertMessage>}
        </>
      ) : (
        <>
          <Styled.TopActionsRow>
            {isTablet && (
              <>
                <Styled.OrderbookButtons>
                  <Styled.OrderbookButton
                    slotRight={<Icon iconName={IconName.Caret} />}
                    onPressedChange={setShowOrderbook}
                    isPressed={showOrderbook}
                    hidePressedStyle
                  >
                    {!showOrderbook && stringGetter({ key: STRING_KEYS.ORDERBOOK })}
                  </Styled.OrderbookButton>
                  {/* TODO[TRCL-1411]: add orderbook scale functionality */}
                </Styled.OrderbookButtons>

                <Styled.ToggleGroup
                  items={allTradeTypeItems}
                  value={selectedTradeType}
                  onValueChange={onTradeTypeChange}
                />
              </>
            )}

            {!isTablet && (
              <>
                {testFlags.isolatedMargin && (
                  <Styled.MarginAndLeverageButtons>
                    <Button
                      onClick={() => {
                        if (isTablet) {
                          dispatch(openDialog({ type: DialogTypes.SelectMarginMode }));
                        } else {
                          dispatch(
                            openDialogInTradeBox({ type: TradeBoxDialogTypes.SelectMarginMode })
                          );
                        }
                      }}
                    >
                      {stringGetter({ key: STRING_KEYS.CROSS })}
                    </Button>

                    <Button
                      onClick={() => {
                        dispatch(openDialog({ type: DialogTypes.AdjustTargetLeverage }));
                      }}
                    >
                      5x
                    </Button>
                  </Styled.MarginAndLeverageButtons>
                )}
                <TradeSideToggle />
              </>
            )}
          </Styled.TopActionsRow>

          <Styled.OrderbookAndInputs showOrderbook={showOrderbook}>
            {isTablet && showOrderbook && (
              <Styled.Orderbook maxRowsPerSide={5} selectionBehavior="replace" />
            )}

            <Styled.InputsColumn>
              {tradeFormInputs.map(
                ({ key, inputType, label, onChange, validationConfig, value, decimals }) => (
                  <FormInput
                    key={key}
                    id={key}
                    type={inputType}
                    label={label}
                    onChange={onChange}
                    validationConfig={validationConfig}
                    value={value}
                    decimals={decimals}
                  />
                )
              )}

              <TradeSizeInputs />

              {needsAdvancedOptions && <AdvancedTradeOptions />}

              {alertContent && <AlertMessage type={alertType}>{alertContent}</AlertMessage>}
            </Styled.InputsColumn>
          </Styled.OrderbookAndInputs>
        </>
      )}

      <Styled.Footer>
        {(showAddTriggersButton || showClearButton) && (
          <Styled.ButtonRow>
            {showAddTriggersButton && (
              <Styled.TriggersButton
                type={ButtonType.Button}
                action={ButtonAction.Secondary}
                shape={ButtonShape.Pill}
                size={ButtonSize.XSmall}
                slotLeft={<Styled.PlusIcon iconName={IconName.Plus} />}
                onClick={() =>
                  dispatch(
                    openDialog({
                      type: DialogTypes.Triggers,
                      dialogProps: {
                        marketId: currentMarketId,
                        assetId: currentAssetId,
                        stopLossOrders,
                        takeProfitOrders,
                        navigateToMarketOrders: (market: string) => {
                          navigate(`${AppRoute.Trade}/${market}`, {
                            state: {
                              from: AppRoute.Trade,
                            },
                          });
                          setView(PanelView.CurrentMarket);
                          setTab(InfoSection.Orders);
                        },
                      },
                    })
                  )
                }
              >
                {stringGetter({ key: STRING_KEYS.ADD_TP_OR_SL })}
              </Styled.TriggersButton>
            )}
            {showClearButton && (
              <Styled.ClearButton
                type={ButtonType.Reset}
                action={ButtonAction.Reset}
                shape={ButtonShape.Pill}
                size={ButtonSize.XSmall}
                onClick={() => abacusStateManager.clearTradeInputValues({ shouldResetSize: true })}
              >
                {stringGetter({ key: STRING_KEYS.CLEAR })}
              </Styled.ClearButton>
            )}
          </Styled.ButtonRow>
        )}
        <PlaceOrderButtonAndReceipt
          isLoading={isPlacingOrder}
          hasValidationErrors={hasInputErrors}
          actionStringKey={inputAlert?.actionStringKey}
          validationErrorString={alertContent}
          summary={summary ?? undefined}
          currentStep={currentStep}
          showDeposit={inputAlert?.errorAction === TradeInputErrorAction.DEPOSIT}
          confirmButtonConfig={{
            stringKey: ORDER_TYPE_STRINGS[selectedTradeType].orderTypeKey,
            buttonTextStringKey: STRING_KEYS.PLACE_ORDER,
            buttonAction: orderSideAction,
          }}
        />
      </Styled.Footer>
    </Styled.TradeForm>
  );
};

const Styled: Record<string, AnyStyledComponent> = {};

Styled.TradeForm = styled.form`
  /* Params */
  --tradeBox-content-paddingTop: ;
  --tradeBox-content-paddingRight: ;
  --tradeBox-content-paddingBottom: ;
  --tradeBox-content-paddingLeft: ;

  /* Rules */
  --orderbox-column-width: 140px;
  --orderbook-width: calc(var(--orderbox-column-width) + var(--tradeBox-content-paddingLeft));

  min-height: 100%;
  isolation: isolate;

  ${layoutMixins.flexColumn}
  gap: 0.75rem;

  ${layoutMixins.stickyArea1}
  --stickyArea1-background: var(--color-layer-2);
  --stickyArea1-paddingBottom: var(--tradeBox-content-paddingBottom);

  padding: var(--tradeBox-content-paddingTop) var(--tradeBox-content-paddingRight)
    var(--tradeBox-content-paddingBottom) var(--tradeBox-content-paddingLeft);

  @media ${breakpoints.tablet} {
    padding-left: 0;
    padding-right: 0;
    margin-left: var(--tradeBox-content-paddingLeft);
    margin-right: var(--tradeBox-content-paddingRight);

    && * {
      outline: none !important;
    }
  }
`;

Styled.MarginAndLeverageButtons = styled.div`
  ${layoutMixins.inlineRow}
  gap: 0.5rem;
  margin-right: 0.5rem;

  button {
    width: 100%;
  }
`;

Styled.TopActionsRow = styled.div`
  display: grid;
  grid-auto-flow: column;

  @media ${breakpoints.tablet} {
    grid-auto-columns: var(--orderbox-column-width) 1fr;
    gap: var(--form-input-gap);
  }
`;

Styled.OrderbookButtons = styled.div`
  ${layoutMixins.inlineRow}
  justify-content: space-between;
  gap: 0.25rem;

  @media ${breakpoints.notTablet} {
    display: none;
  }
`;

Styled.OrderbookButton = styled(ToggleButton)`
  --button-toggle-off-textColor: var(--color-text-1);
  --button-toggle-off-backgroundColor: transparent;

  > svg {
    color: var(--color-text-0);
    height: 0.875em;
    width: 0.875em;

    transition: 0.2s;
  }

  &[data-state='on'] {
    svg {
      rotate: 0.25turn;
    }
  }

  &[data-state='off'] {
    svg {
      rotate: -0.25turn;
    }
  }
`;

Styled.OrderbookAndInputs = styled.div<{ showOrderbook: boolean }>`
  @media ${breakpoints.tablet} {
    display: grid;
    align-items: flex-start;
    grid-auto-flow: column;

    ${({ showOrderbook }) =>
      showOrderbook
        ? css`
            grid-auto-columns: var(--orderbook-width) 1fr;
            gap: var(--form-input-gap);
            margin-left: calc(-1 * var(--tradeBox-content-paddingLeft));
          `
        : css`
            grid-auto-columns: 1fr;
            gap: 0;
          `}
  }
`;

Styled.Orderbook = styled(Orderbook)`
  width: 100%;

  @media ${breakpoints.notTablet} {
    display: none;
  }

  > table {
    --tableCell-padding: 0.5em 1em;

    scroll-snap-type: none;

    thead {
      display: none;
    }
  }
`;

Styled.ToggleGroup = styled(ToggleGroup)`
  overflow-x: auto;

  button[data-state='off'] {
    gap: 0;

    img {
      height: 0;
    }
  }
`;

Styled.InputsColumn = styled.div`
  ${formMixins.inputsColumn}
`;

Styled.ButtonRow = styled.div`
  ${layoutMixins.row}
  justify-self: end;
  padding: 0.5rem 0 0.5rem 0;
  width: 100%;
`;

Styled.TriggersButton = styled(Button)`
  margin-right: auto;
`;

Styled.PlusIcon = styled(Icon)`
  width: 0.75em;
  height: 0.75em;
`;

Styled.ClearButton = styled(Button)`
  margin-left: auto;
`;

Styled.Footer = styled.footer`
  ${formMixins.footer}
  --stickyFooterBackdrop-outsetY: var(--tradeBox-content-paddingBottom);
  backdrop-filter: none;

  ${layoutMixins.column}
  ${layoutMixins.noPointerEvents}
`;
