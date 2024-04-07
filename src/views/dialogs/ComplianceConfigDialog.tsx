import { useMemo } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled, { AnyStyledComponent } from 'styled-components';

import type { Compliance } from '@/constants/abacus';
import { ComplianceStatus } from '@/constants/abacus';
import { ButtonAction } from '@/constants/buttons';
import { BLOCKED_COUNTRIES, CountryCodes, OFAC_SANCTIONED_COUNTRIES } from '@/constants/geo';

import { useAccounts, useDydxClient } from '@/hooks';

import { Button } from '@/components/Button';
import { ComboboxDialogMenu } from '@/components/ComboboxDialogMenu';
import { Switch } from '@/components/Switch';

import { setCompliance } from '@/state/account';
import { getComplianceStatus, getGeo } from '@/state/accountSelectors';

const complianceStatusOptions = [
  { status: ComplianceStatus.COMPLIANT, label: 'Compliant' },
  { status: ComplianceStatus.BLOCKED, label: 'Blocked' },
  { status: ComplianceStatus.CLOSE_ONLY, label: 'Close Only' },
  { status: ComplianceStatus.FIRST_STRIKE, label: 'First Strike' },
];

export const usePreferenceMenu = () => {
  const dispatch = useDispatch();

  const complianceStatus = useSelector(getComplianceStatus, shallowEqual);
  const geo = useSelector(getGeo, shallowEqual);
  const geoRestricted = Boolean(
    geo && [...BLOCKED_COUNTRIES, ...OFAC_SANCTIONED_COUNTRIES].includes(geo as CountryCodes)
  );

  const notificationSection = useMemo(
    () => ({
      group: 'status',
      groupLabel: 'Simulate Compliance Status',
      items: complianceStatusOptions.map(({ status, label }) => ({
        value: status,
        label: label,
        onSelect: () => dispatch(setCompliance({ geo, status } as Compliance)),
        slotAfter: (
          <Switch
            name="CompliaceStatus"
            checked={complianceStatus === status}
            onCheckedChange={() => null} // Assuming the onChange logic is to be defined or is unnecessary
          />
        ),
      })),
    }),
    [complianceStatus, setCompliance]
  );

  const otherSection = useMemo(
    () => ({
      group: 'Geo',
      items: [
        {
          value: 'RestrictGeo',
          label: 'Simulate Restricted Geo',
          slotAfter: (
            <Switch name="RestrictGeo" checked={geoRestricted} onCheckedChange={() => null} />
          ),
          onSelect: () => {
            dispatch(
              geoRestricted
                ? setCompliance({ geo: '', status: complianceStatus } as Compliance)
                : setCompliance({ geo: 'US', status: complianceStatus } as Compliance)
            );
          },
        },
      ],
    }),
    [geoRestricted]
  );

  return [otherSection, notificationSection];
};

type ElementProps = {
  setIsOpen: (open: boolean) => void;
};

export const ComplianceConfigDialog = ({ setIsOpen }: ElementProps) => {
  const preferenceItems = usePreferenceMenu();
  const complianceStatus = useSelector(getComplianceStatus, shallowEqual);

  const { dydxAddress } = useAccounts();
  const { compositeClient } = useDydxClient();

  const submit = async () => {
    const endpoint = `${compositeClient?.indexerClient.config.restEndpoint}/v4/compliance/setStatus`;
    if (dydxAddress) {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: dydxAddress, status: complianceStatus?.rawValue }),
      });
    }
  };

  return (
    <Styled.ComboboxDialogMenu
      isOpen
      title="Compliance Settings (Dev Only)"
      items={preferenceItems}
      setIsOpen={setIsOpen}
    >
      <Button action={ButtonAction.Primary} onClick={() => submit()}>
        Submit
      </Button>
    </Styled.ComboboxDialogMenu>
  );
};

const Styled: Record<string, AnyStyledComponent> = {};

Styled.ComboboxDialogMenu = styled(ComboboxDialogMenu)`
  --dialog-content-paddingBottom: 0.5rem;
`;
