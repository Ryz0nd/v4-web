import { useState } from 'react';

import { shallowEqual, useDispatch } from 'react-redux';
import styled from 'styled-components';

import {
  AbacusOrderType,
  TriggerOrdersInputField,
  TriggerOrdersInputFields,
} from '@/constants/abacus';
import { STRING_KEYS } from '@/constants/localization';
import { USD_DECIMALS } from '@/constants/numbers';
import { TriggerFields } from '@/constants/triggers';

import { useStringGetter } from '@/hooks/useStringGetter';

import { layoutMixins } from '@/styles/layoutMixins';

import { Checkbox } from '@/components/Checkbox';
import { Collapsible } from '@/components/Collapsible';
import { FormInput } from '@/components/FormInput';
import { Tag } from '@/components/Tag';
import { WithTooltip } from '@/components/WithTooltip';

import { useAppSelector } from '@/state/appTypes';
import { setTriggerFormInputs } from '@/state/inputs';
import { getTriggerFormInputs } from '@/state/inputsSelectors';

import abacusStateManager from '@/lib/abacus';
import { MustBigNumber } from '@/lib/numbers';

type ElementProps = {
  existsLimitOrder: boolean;
  multipleTakeProfitOrders: boolean;
  multipleStopLossOrders: boolean;
  tickSizeDecimals?: number;
};

type StyleProps = {
  className?: string;
};

export const LimitPriceInputs = ({
  existsLimitOrder,
  multipleTakeProfitOrders,
  multipleStopLossOrders,
  tickSizeDecimals,
  className,
}: ElementProps & StyleProps) => {
  const dispatch = useDispatch();
  const stringGetter = useStringGetter();

  const triggerFormInputValues = useAppSelector(getTriggerFormInputs, shallowEqual);

  const [shouldShowLimitPrice, setShouldShowLimitPrice] = useState(existsLimitOrder);

  const decimals = tickSizeDecimals ?? USD_DECIMALS;

  const onToggleLimit = (isLimitChecked: boolean) => {
    if (!isLimitChecked) {
      abacusStateManager.setTriggerOrdersValue({
        value: AbacusOrderType.TakeProfitMarket.rawValue,
        field: TriggerOrdersInputField.takeProfitOrderType,
      });
      abacusStateManager.setTriggerOrdersValue({
        value: AbacusOrderType.StopMarket.rawValue,
        field: TriggerOrdersInputField.stopLossOrderType,
      });
      abacusStateManager.clearTriggerOrdersInputValues({ field: TriggerFields.Limit });
    }
    setShouldShowLimitPrice(isLimitChecked);
  };

  const onLimitInput =
    (field: TriggerOrdersInputFields) =>
    ({ floatValue, formattedValue }: { floatValue?: number; formattedValue: string }) => {
      dispatch(
        setTriggerFormInputs({
          [field.rawValue]: formattedValue,
        })
      );
      const newLimitPrice = MustBigNumber(floatValue).toFixed(decimals);
      abacusStateManager.setTriggerOrdersValue({
        value: formattedValue === '' || newLimitPrice === 'NaN' ? null : newLimitPrice,
        field,
      });
    };

  return (
    <Collapsible
      className={className}
      slotTrigger={
        <Checkbox id="sltp-limit" checked={shouldShowLimitPrice} onCheckedChange={onToggleLimit} />
      }
      open={shouldShowLimitPrice}
      label={
        <WithTooltip tooltip="limit-price">
          {stringGetter({ key: STRING_KEYS.LIMIT_PRICE })}
        </WithTooltip>
      }
    >
      <$InputsRow>
        {!multipleTakeProfitOrders && (
          <FormInput
            id="TP-limit"
            decimals={decimals}
            value={triggerFormInputValues[TriggerOrdersInputField.takeProfitLimitPrice.rawValue]}
            label={
              <>
                {stringGetter({ key: STRING_KEYS.TP_LIMIT })}
                <Tag>USD</Tag>
              </>
            }
            onInput={onLimitInput(TriggerOrdersInputField.takeProfitLimitPrice)}
          />
        )}
        {!multipleStopLossOrders && (
          <FormInput
            id="SL-limit"
            decimals={decimals}
            value={triggerFormInputValues[TriggerOrdersInputField.stopLossLimitPrice.rawValue]}
            label={
              <>
                {stringGetter({ key: STRING_KEYS.SL_LIMIT })}
                <Tag>USD</Tag>
              </>
            }
            onInput={onLimitInput(TriggerOrdersInputField.stopLossLimitPrice)}
          />
        )}
      </$InputsRow>
    </Collapsible>
  );
};
const $InputsRow = styled.span`
  ${layoutMixins.flexEqualColumns}
  gap: 1ch;
`;
