import { type ReactNode } from 'react';

import { Content, List, Root, Trigger } from '@radix-ui/react-tabs';
import styled, { css, keyframes } from 'styled-components';

import { type MenuItem } from '@/constants/menus';

import breakpoints from '@/styles/breakpoints';
import { layoutMixins } from '@/styles/layoutMixins';

import { DropdownSelectMenu } from '@/components/DropdownSelectMenu';
import { Tag } from '@/components/Tag';
import { Toolbar } from '@/components/Toolbar';

import { getSimpleStyledOutputType } from '@/lib/genericFunctionalComponentUtils';

export type TabItem<TabItemsValue> = {
  value: TabItemsValue;
  label: React.ReactNode;
  forceMount?: boolean;
  tag?: React.ReactNode;
  slotRight?: React.ReactNode;
  slotToolbar?: React.ReactNode;
  content?: React.ReactNode;
  subitems?: TabItem<TabItemsValue>[];
  customTrigger?: ReactNode;
  asChild?: boolean;
};

type ElementProps<TabItemsValue> = {
  defaultValue?: TabItemsValue;
  value?: TabItemsValue;
  items: TabItem<TabItemsValue>[];
  slotToolbar?: ReactNode;
  sharedContent?: ReactNode;
  disabled?: boolean;
  onValueChange?: (value: TabItemsValue) => void;
  onWheel?: (event: React.WheelEvent) => void;
};

type StyleProps = {
  fullWidthTabs?: boolean;
  side?: 'top' | 'bottom';
  withBorders?: boolean;
  withTransitions?: boolean;
  withUnderline?: boolean;
  className?: string;
};

export type TabsProps<TabItemsValue> = ElementProps<TabItemsValue> & StyleProps;

export const Tabs = <TabItemsValue extends string>({
  defaultValue,
  value,
  items,
  slotToolbar,
  sharedContent,
  onValueChange,
  onWheel,
  fullWidthTabs,
  side = 'top',
  withBorders = true,
  withUnderline = false,
  withTransitions = true,
  disabled = false,
  className,
}: ElementProps<TabItemsValue> & StyleProps) => {
  const currentItem = items.find((item) => item.value === value);

  const triggers = (
    <>
      <$List $fullWidthTabs={fullWidthTabs} $withBorders={withBorders}>
        {items.map((item) =>
          !item.subitems ? (
            item.customTrigger ?? (
              <$Trigger
                key={item.value}
                value={item.value}
                $withBorders={withBorders}
                $withUnderline={withUnderline}
                disabled={disabled}
              >
                {item.label}
                {item.tag && <Tag>{item.tag}</Tag>}
                {item.slotRight}
              </$Trigger>
            )
          ) : (
            <$DropdownSelectMenu
              key={item.value ?? item.label}
              items={item.subitems as unknown as MenuItem<TabItemsValue>[]}
              value={value}
              onValueChange={onValueChange}
              align="end"
              $isActive={item.subitems.some((subitem) => subitem.value === value)}
              slotTrigger={
                <$DropdownTabTrigger value={value ?? ''} $withUnderline={withUnderline} />
              }
              disabled={disabled}
            >
              {item.label}
            </$DropdownSelectMenu>
          )
        )}
      </$List>

      {(currentItem?.slotToolbar ?? slotToolbar) && (
        <Toolbar>{currentItem?.slotToolbar ?? slotToolbar}</Toolbar>
      )}
    </>
  );

  return (
    <$Root
      className={className}
      defaultValue={defaultValue}
      value={value}
      onValueChange={
        onValueChange != null ? (val) => onValueChange(val as TabItemsValue) : undefined
      }
      onWheel={onWheel}
      $side={side}
      $withInnerBorder={withBorders}
    >
      <$Header $side={side}>{triggers}</$Header>

      {sharedContent ?? (
        <$Stack>
          {items.map(({ asChild, value: childValue, content, forceMount }) => (
            <$Content
              key={childValue}
              asChild={asChild}
              value={childValue}
              forceMount={forceMount ? true : undefined}
              $hide={forceMount && currentItem?.value !== childValue}
              $withTransitions={withTransitions}
            >
              {content}
            </$Content>
          ))}
        </$Stack>
      )}
    </$Root>
  );
};
const tabTriggerStyle = css`
  ${layoutMixins.row}
  justify-content: center;
  gap: 0.5ch;

  align-self: stretch;
  padding: 0 1.5rem;

  font: var(--trigger-font, var(--font-base-book));
  color: var(--trigger-textColor);
  background-color: var(--trigger-backgroundColor);

  &[data-state='active'] {
    color: var(--trigger-active-textColor);
    background-color: var(--trigger-active-backgroundColor);
  }
`;

const tabTriggerUnderlineStyle = css`
  box-shadow: inset 0 calc(var(--trigger-underline-size) * -1) 0 var(--trigger-active-textColor);
  &[data-state='active'] {
    box-shadow: inset 0 calc(var(--trigger-active-underline-size) * -1) 0
      var(--trigger-active-textColor);
  }
`;

const $Root = styled(Root)<{ $side: 'top' | 'bottom'; $withInnerBorder?: boolean }>`
  /* Overrides */
  --trigger-backgroundColor: var(--color-layer-2);
  --trigger-textColor: var(--color-text-0);

  --trigger-active-backgroundColor: var(--color-layer-1);
  --trigger-active-textColor: var(--color-text-2);

  --trigger-active-underline-size: 0px;
  --trigger-underline-size: 0px;

  /* Variants */
  --tabs-currentHeight: var(--tabs-height);

  @media ${breakpoints.tablet} {
    --tabs-currentHeight: var(--tabs-height-mobile);
  }

  /* Rules */
  ${layoutMixins.scrollArea}
  overscroll-behavior: contain;

  ${layoutMixins.stickyArea0}
  --stickyArea0-background: var(--color-layer-2);
  --stickyArea0-topGap: var(--border-width);

  --activeTab-zIndex: 1;
  --stickyHeader-zIndex: calc(var(--activeTab-zIndex) + 1);

  ${layoutMixins.contentContainer}

  ${({ $side }) =>
    ({
      top: css`
        --stickyArea0-topHeight: var(--tabs-currentHeight);
        ${layoutMixins.expandingColumnWithHeader}
      `,
      bottom: css`
        --stickyArea0-bottomHeight: var(--tabs-currentHeight);
        ${layoutMixins.expandingColumnWithFooter}
      `,
    })[$side]}

  ${({ $withInnerBorder }) =>
    $withInnerBorder &&
    css`
      ${layoutMixins.withInnerHorizontalBorders}
    `}

  @media ${breakpoints.tablet} {
    overscroll-behavior: contain auto;
  }
`;

const $Header = styled.header<{ $side: 'top' | 'bottom' }>`
  ${layoutMixins.contentSectionDetachedScrollable}

  ${({ $side }) =>
    ({
      top: css`
        ${layoutMixins.stickyHeader}
      `,
      bottom: css`
        ${layoutMixins.stickyFooter}
        grid-row: 2;
      `,
    })[$side]}

  ${layoutMixins.row}
  justify-content: space-between;
  z-index: var(--stickyHeader-zIndex);
`;

const $List = styled(List)<{ $fullWidthTabs?: boolean; $withBorders?: boolean }>`
  align-self: stretch;

  ${({ $withBorders }) =>
    $withBorders &&
    css`
      ${layoutMixins.withOuterAndInnerBorders}
    `}

  ${({ $fullWidthTabs }) =>
    $fullWidthTabs
      ? css`
          flex: 1;
          ${layoutMixins.gridEqualColumns}
        `
      : css`
          ${layoutMixins.row}
        `}
`;

const $Trigger = styled(Trigger)<{ $withBorders?: boolean; $withUnderline?: boolean }>`
  ${tabTriggerStyle}

  ${({ $withBorders }) =>
    $withBorders &&
    css`
      ${layoutMixins.withOuterBorder}
    `}

  ${({ $withUnderline }) =>
    $withUnderline &&
    css`
      ${tabTriggerUnderlineStyle}
    `}
`;

const $Stack = styled.div`
  ${layoutMixins.stack}

  box-shadow: none;
`;

const $Content = styled(Content)<{ $hide?: boolean; $withTransitions: boolean }>`
  ${layoutMixins.flexColumn}
  outline: none;
  box-shadow: none;

  &[data-state='inactive'] {
    pointer-events: none;
  }

  &[data-state='active'] {
    z-index: var(--activeTab-zIndex);
  }

  ${({ $hide }) =>
    $hide &&
    css`
      display: none;
    `}

  @media (prefers-reduced-motion: no-preference) {
    ${({ $withTransitions }) =>
      $withTransitions &&
      css`
        &[data-state='active'] {
          animation: ${keyframes`
            from {
              translate: 0 -0.25rem -1.5rem;
              opacity: 0;
              /* filter: blur(3px); */
            }
          `} 0.2s var(--ease-out-expo);
        }

        &[data-state='inactive'] {
          min-height: 0;

          animation: ${keyframes`
            to {
              translate: 0 -0.25rem -1.5rem;
              opacity: 0;
              /* filter: blur(3px); */
            }
          `} 0.2s var(--ease-out-expo);
        }
      `}
  }
`;

const $DropdownTabTrigger = styled(Trigger)<{ $withUnderline?: boolean }>`
  ${tabTriggerStyle}
  gap: 1ch;

  height: 100%;
  width: 100%;

  ${({ $withUnderline }) =>
    $withUnderline &&
    css`
      ${tabTriggerUnderlineStyle}
    `}
`;

const dropdownSelectMenuType = getSimpleStyledOutputType(
  DropdownSelectMenu,
  {} as { $isActive?: boolean }
);
const $DropdownSelectMenu = styled(DropdownSelectMenu)<{ $isActive?: boolean }>`
  --trigger-radius: 0;
  --dropdownSelectMenu-item-font-size: var(--fontSize-base);

  ${({ $isActive }) =>
    $isActive &&
    css`
      --trigger-textColor: var(--trigger-active-textColor);
      --trigger-backgroundColor: var(--trigger-active-backgroundColor);
      --trigger-underline-size: var(--trigger-active-underline-size);
    `}
` as typeof dropdownSelectMenuType;

export const MobileTabs = styled(Tabs)`
  --trigger-backgroundColor: transparent;
  --trigger-active-backgroundColor: transparent;
  --tableStickyRow-backgroundColor: var(--color-layer-2);
  --trigger-font: var(--font-extra-book);

  padding-bottom: 1rem;
  gap: var(--border-width);

  > header {
    padding: 0 1rem;

    button {
      padding: 0 0.5rem;
    }
  }
`;
