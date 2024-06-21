import { MouseEvent, useCallback, useState } from 'react';

import styled, { css } from 'styled-components';

import { AlertType } from '@/constants/alerts';
import { ButtonAction, ButtonSize, ButtonType } from '@/constants/buttons';
import { DialogTypes } from '@/constants/dialogs';
import { STRING_KEYS } from '@/constants/localization';
import { TransferNotifcation, TransferNotificationTypes } from '@/constants/notifications';

import { useInterval } from '@/hooks/useInterval';
import { useStringGetter } from '@/hooks/useStringGetter';

import { layoutMixins } from '@/styles/layoutMixins';

import { AlertMessage } from '@/components/AlertMessage';
import { Button } from '@/components/Button';
import { Collapsible } from '@/components/Collapsible';
import { Details } from '@/components/Details';
import { Icon, IconName } from '@/components/Icon';
import { LoadingDots } from '@/components/Loading/LoadingDots';
// eslint-disable-next-line import/no-cycle
import { Notification, NotificationProps } from '@/components/Notification';
import { Output, OutputType } from '@/components/Output';
import { WithReceipt } from '@/components/WithReceipt';

import { useAppDispatch } from '@/state/appTypes';
import { openDialog } from '@/state/dialogs';

import { formatSeconds } from '@/lib/timeUtils';

import { TransferStatusSteps } from './TransferStatusSteps';

type ElementProps = {
  type: TransferNotificationTypes;
  transfer: TransferNotifcation;
  triggeredAt?: number;
};

export const TransferStatusNotification = ({
  isToast,
  notification,
  slotIcon,
  slotTitle,
  transfer,
  type,
  triggeredAt = Date.now(),
}: ElementProps & NotificationProps) => {
  const stringGetter = useStringGetter();
  const [open, setOpen] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const dispatch = useAppDispatch();
  const {
    status,
    toAmount,
    isExchange,
    isCosmosTransfer,
    cosmosTransferStatus,
    toChainId,
    fromChainId,
    txHash,
  } = transfer;

  // @ts-ignore status.errors is not in the type definition but can be returned
  const error = status?.errors?.length ? status?.errors[0] : status?.error;
  const hasError = error && Object.keys(error).length !== 0;

  const updateSecondsLeft = useCallback(() => {
    const fromEstimatedRouteDuration = status?.fromChain?.chainData?.estimatedRouteDuration;
    const toEstimatedRouteDuration = status?.toChain?.chainData?.estimatedRouteDuration;
    // TODO: remove typeguards once skip implements estimatedrouteduration
    // https://linear.app/dydx/issue/OTE-475/[web]-migration-followup-estimatedrouteduration
    if (
      typeof fromEstimatedRouteDuration === 'string' ||
      typeof toEstimatedRouteDuration === 'string'
    ) {
      return;
    }
    const fromChainEta = (fromEstimatedRouteDuration ?? 0) * 1000;
    const toChainEta = (toEstimatedRouteDuration ?? 0) * 1000;
    setSecondsLeft(Math.floor((triggeredAt + fromChainEta + toChainEta - Date.now()) / 1000));
  }, [status]);

  useInterval({ callback: updateSecondsLeft });

  const isComplete = isCosmosTransfer
    ? cosmosTransferStatus?.step === 'depositToSubaccount' &&
      cosmosTransferStatus.status === 'success'
    : status?.squidTransactionStatus === 'success' || isExchange;

  const inProgressStatusString =
    type === TransferNotificationTypes.Deposit
      ? secondsLeft > 0
        ? STRING_KEYS.DEPOSIT_STATUS
        : STRING_KEYS.DEPOSIT_STATUS_SHORTLY
      : secondsLeft > 0
        ? STRING_KEYS.WITHDRAW_STATUS
        : STRING_KEYS.WITHDRAW_STATUS_SHORTLY;

  const statusString =
    type === TransferNotificationTypes.Deposit
      ? isComplete
        ? STRING_KEYS.DEPOSIT_COMPLETE
        : inProgressStatusString
      : isComplete
        ? STRING_KEYS.WITHDRAW_COMPLETE
        : inProgressStatusString;

  const customContent =
    !status && !isExchange && !isCosmosTransfer ? (
      <LoadingDots size={3} />
    ) : (
      <$BridgingStatus>
        {isCosmosTransfer ? (
          <>
            <$Details
              items={[
                {
                  key: 'amount',
                  label: 'Amount',
                  value: <$InlineOutput type={OutputType.Fiat} value={toAmount} />,
                },
                {
                  key: 'status',
                  label: 'Status',
                  // TODO: Need to add localization
                  value: isComplete ? 'Complete' : 'Awaiting Confirmation',
                },
              ]}
            />
            {!isToast && !isComplete && (
              <Button
                action={ButtonAction.Primary}
                type={ButtonType.Button}
                size={ButtonSize.Small}
                onClick={() => {
                  dispatch(
                    openDialog({
                      type: DialogTypes.NobleDepositDialog,
                      dialogProps: {
                        toChainId,
                        fromChainId,
                        toAmount,
                        txHash,
                      },
                    })
                  );
                }}
              >
                {/* TODO: Need to add localization */}
                Confirm Deposit
              </Button>
            )}
          </>
        ) : (
          <>
            <$Status>
              {stringGetter({
                key: statusString,
                params: {
                  AMOUNT_USD: <$InlineOutput type={OutputType.Fiat} value={toAmount} />,
                  ESTIMATED_DURATION: (
                    <$InlineOutput
                      type={OutputType.Text}
                      value={formatSeconds(Math.max(secondsLeft || 0, 0))}
                    />
                  ),
                },
              })}
            </$Status>
            {hasError && (
              <AlertMessage type={AlertType.Error}>
                {stringGetter({
                  key: STRING_KEYS.SOMETHING_WENT_WRONG_WITH_MESSAGE,
                  params: {
                    ERROR_MESSAGE:
                      error.message || stringGetter({ key: STRING_KEYS.UNKNOWN_ERROR }),
                  },
                })}
              </AlertMessage>
            )}
          </>
        )}
        {!isToast && !isComplete && !hasError && !isCosmosTransfer && (
          <$TransferStatusSteps status={status} type={type} />
        )}
      </$BridgingStatus>
    );

  const transferIcon = isCosmosTransfer ? slotIcon : isToast && slotIcon;

  const transferNotif = (
    <Notification
      isToast={isToast}
      notification={notification}
      slotIcon={transferIcon}
      slotTitle={slotTitle}
      slotCustomContent={
        <$BridgingStatus>
          {!status && !isExchange ? (
            <>
              {!isComplete && <div>{stringGetter({ key: STRING_KEYS.KEEP_WINDOW_OPEN })}</div>}
              <div>
                <LoadingDots size={3} />
              </div>
            </>
          ) : (
            <>
              {content}
              {!isComplete && <div>{stringGetter({ key: STRING_KEYS.KEEP_WINDOW_OPEN })}</div>}
              {!isToast && !isComplete && !hasError && (
                <$TransferStatusSteps status={status} type={type} />
              )}
            </>
          )}
        </$BridgingStatus>
      }
      slotAction={
        isToast &&
        status && (
          <$Trigger
            isOpen={open}
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            <Icon iconName={IconName.Caret} />{' '}
            {stringGetter({
              key: open ? STRING_KEYS.HIDE_DETAILS : STRING_KEYS.VIEW_DETAILS,
            })}
          </$Trigger>
        )
      }
      withClose={false}
    />
  );

  return isToast && !isCosmosTransfer ? (
    <WithReceipt
      hideReceipt={!open}
      side="bottom"
      slotReceipt={
        <Collapsible open={open} onOpenChange={setOpen} label="" withTrigger={false}>
          <$Receipt>
            <TransferStatusSteps status={status} type={type} />
          </$Receipt>
        </Collapsible>
      }
    >
      {transferNotif}
    </WithReceipt>
  ) : (
    transferNotif
  );
};
const $BridgingStatus = styled.div`
  ${layoutMixins.flexColumn};
  gap: 0.5rem;
`;

const $Status = styled.div<{ withMarginBottom?: boolean }>`
  color: var(--color-text-0);
  font-size: 0.875rem;

  ${({ withMarginBottom }) =>
    withMarginBottom &&
    css`
      margin-bottom: 0.5rem;
    `}
`;

const $InlineOutput = styled(Output)`
  display: inline-block;

  color: var(--color-text-1);
`;

const $TransferStatusSteps = styled(TransferStatusSteps)`
  padding: 0.5rem 0 0;
`;

const $Trigger = styled.button<{ isOpen?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5em;

  color: var(--color-accent);
  user-select: none;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    text-decoration: underline;
  }

  svg {
    transition: rotate 0.3s var(--ease-out-expo);
  }

  ${({ isOpen }) =>
    isOpen &&
    css`
      & > svg {
        rotate: -0.5turn;
      }
    `}
`;

const $Receipt = styled.div`
  padding: 0 1rem;
`;

const $Details = styled(Details)`
  --details-item-vertical-padding: 0.2rem;

  dd {
    color: var(--color-text-2);
  }
`;
