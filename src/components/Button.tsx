import { forwardRef } from 'react';

import styled, {
  css,
  type FlattenInterpolation,
  type FlattenSimpleInterpolation,
  type ThemeProps,
} from 'styled-components';

import { ButtonAction, ButtonShape, ButtonSize, ButtonState } from '@/constants/buttons';

import { LoadingDots } from '@/components/Loading/LoadingDots';

import { BaseButton, BaseButtonProps } from './BaseButton';

export type ButtonStateConfig = {
  isDisabled?: boolean;
  isLoading?: boolean;
};

type ElementProps = {
  children?: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | React.MouseEventHandler<HTMLAnchorElement>;
  slotLeft?: React.ReactNode;
  slotRight?: React.ReactNode;
  state?: ButtonState | ButtonStateConfig;
};

type StyleProps = {
  action?: ButtonAction;
  state: Record<string, boolean | undefined>;
  className?: string;
};

export type ButtonProps = BaseButtonProps & ElementProps & Omit<StyleProps, keyof ElementProps>;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      action = ButtonAction.Secondary,
      size = ButtonSize.Base,
      shape = ButtonShape.Rectangle,
      state: stateConfig = ButtonState.Default,

      children,
      slotLeft = null,
      slotRight = null,

      ...otherProps
    },
    ref
  ) => {
    const state: Record<string, boolean | undefined> =
      typeof stateConfig === 'string'
        ? { [stateConfig as ButtonState]: true }
        : {
            [ButtonState.Loading]: stateConfig.isLoading,
            [ButtonState.Disabled]: stateConfig.isDisabled,
          };

    return (
      <StyledBaseButton
        disabled={state[ButtonState.Disabled]}
        {...{ ref, action, size, shape, state, ...otherProps }}
      >
        {
          <>
            {state[ButtonState.Loading] ? (
              <LoadingDots size={3} />
            ) : (
              <>
                {slotLeft}
                {children}
                {slotRight}
              </>
            )}
          </>
        }
      </StyledBaseButton>
    );
  }
);

const buttonActionVariants = {
  [ButtonAction.Base]: css`
    --button-textColor: var(--color-text-1);
    --button-backgroundColor: var(--color-layer-5);
    --button-border: solid var(--border-width) var(--color-border);
  `,
  [ButtonAction.Primary]: css`
    --button-textColor: var(--color-text-2);
    --button-backgroundColor: var(--color-accent);
    --button-border: solid var(--border-width) var(--color-border-white);
  `,

  [ButtonAction.Secondary]: css`
    --button-textColor: var(--color-text-1);
    --button-backgroundColor: var(--color-layer-3);
    --button-border: solid var(--border-width) var(--color-border);
  `,

  [ButtonAction.Create]: css`
    --button-textColor: var(--color-text-2);
    --button-backgroundColor: var(--color-positive);
    --button-border: solid var(--border-width) var(--color-border-white);
  `,

  [ButtonAction.Destroy]: css`
    --button-textColor: var(--color-text-2);
    --button-backgroundColor: var(--color-negative);
    --button-border: solid var(--border-width) var(--color-border-white);
  `,

  [ButtonAction.Navigation]: css`
    --button-textColor: var(--color-text-1);
    --button-backgroundColor: transparent;
    --button-border: none;
  `,

  [ButtonAction.Reset]: css`
    --button-textColor: var(--color-negative);
    --button-backgroundColor: var(--color-layer-3);
    --button-border: solid var(--border-width) var(--color-border-red);
  `,
};

const buttonStateVariants: Record<
  ButtonState,
  FlattenSimpleInterpolation | FlattenInterpolation<ThemeProps<any>>
> = {
  [ButtonState.Default]: css``,

  [ButtonState.Disabled]: css`
    --button-textColor: var(--color-text-0);
    --button-backgroundColor: var(--color-layer-2);
    --button-border: solid var(--border-width) var(--color-layer-6);
    --button-hover-filter: none;
    --button-cursor: not-allowed;
  `,

  [ButtonState.Loading]: css`
    ${() => buttonStateVariants[ButtonState.Disabled]}
    min-width: 4em;
  `,
};

const StyledBaseButton = styled(BaseButton)<StyleProps>`
  ${({ action }) => action && buttonActionVariants[action]}

  ${({ state }) =>
    state &&
    css`
      // Ordered from lowest to highest priority (ie. Disabled should overwrite Active and Loading states)
      ${state[ButtonState.Loading] && buttonStateVariants[ButtonState.Loading]}
      ${state[ButtonState.Disabled] && buttonStateVariants[ButtonState.Disabled]}
    `}
`;
