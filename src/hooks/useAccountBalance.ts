import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useBalance } from 'wagmi';
import { StargateClient } from '@cosmjs/stargate';
import { useQuery } from 'react-query';
import { formatUnits } from 'ethers';

import { CLIENT_NETWORK_CONFIGS } from '@/constants/networks';
import { QUANTUM_MULTIPLIER } from '@/constants/numbers';
import { EthereumAddress } from '@/constants/wallets';

import { convertBech32Address } from '@/lib/addressUtils';
import { MustBigNumber } from '@/lib/numbers';

import { getSelectedNetwork } from '@/state/appSelectors';

import { useAccounts } from './useAccounts';
import { usePollNativeTokenBalance } from './usePollNativeTokenBalance';

type UseAccountBalanceProps = {
  // Token Items
  addressOrDenom?: string;
  assetSymbol?: string;
  decimals?: number;

  // Chain Items
  chainId?: string | number;
  bech32AddrPrefix?: string;
  rpc?: string;

  isCosmosChain?: boolean;
};

/**
 * 0xSquid uses this 0x address as the chain's default token.
 * @todo We will need to add additional logic here if we 'useAccountBalance' on non-Squid related forms.
 */
const CHAIN_DEFAULT_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const useAccountBalance = ({
  addressOrDenom = CHAIN_DEFAULT_TOKEN_ADDRESS,
  assetSymbol,
  bech32AddrPrefix,
  chainId,
  decimals,
  rpc,
  isCosmosChain,
}: UseAccountBalanceProps = {}) => {
  const { evmAddress, dydxAddress } = useAccounts();

  const selectedNetwork = useSelector(getSelectedNetwork);
  const evmChainId = Number(CLIENT_NETWORK_CONFIGS[selectedNetwork].ethereumChainId);

  const evmQuery = useBalance({
    enabled: Boolean(!isCosmosChain && addressOrDenom?.startsWith('0x')),
    address: evmAddress,
    chainId: typeof chainId === 'number' ? chainId : Number(evmChainId),
    token:
      addressOrDenom === CHAIN_DEFAULT_TOKEN_ADDRESS
        ? undefined
        : (addressOrDenom as EthereumAddress),
    watch: true,
  });

  const cosmosQueryFn = useCallback(async () => {
    if (dydxAddress && bech32AddrPrefix && rpc) {
      const address = convertBech32Address({
        address: dydxAddress,
        bech32Prefix: bech32AddrPrefix,
      });

      const client = await StargateClient.connect(rpc);
      const balanceAsCoin = await client.getBalance(address, addressOrDenom);
      await client.disconnect();

      /**
       * Hardcode decimals because most cosmos coins default to 6 decimals.
       * Squids testnet has some coins as having 18 decimals instead of 6.
       * @url https://github1s.com/cosmos/cosmjs/blob/HEAD/packages/amino/src/coins.ts#L8-L16
       *
       * @todo: change '6' to 'decimals' when Squid testnet data is updated.
       * */
      return formatUnits(balanceAsCoin.amount, decimals);
    }
  }, [addressOrDenom, chainId, rpc]);

  const cosmosQuery = useQuery({
    enabled: Boolean(isCosmosChain && dydxAddress && bech32AddrPrefix && rpc && addressOrDenom),
    queryKey: `accountBalances_${chainId}_${addressOrDenom}`,
    queryFn: cosmosQueryFn,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: 10_000,
    staleTime: 10_000,
  });

  const { formatted: evmBalance } = evmQuery.data || {};
  const balance = !assetSymbol ? '0' : isCosmosChain ? cosmosQuery.data : evmBalance;

  const nativeTokenCoinBalance = usePollNativeTokenBalance({ dydxAddress });
  const nativeTokenBalance = MustBigNumber(nativeTokenCoinBalance?.amount)
    .div(QUANTUM_MULTIPLIER)
    .toNumber();

  return {
    balance,
    nativeTokenBalance,
    isBalanceError: isCosmosChain
      ? cosmosQuery.status === 'error' && !cosmosQuery.isFetching
      : evmQuery.status === 'error' && evmQuery.fetchStatus === 'idle',
    isBalanceLoading: isCosmosChain
      ? cosmosQuery.status === 'loading' && cosmosQuery.isFetching
      : evmQuery.status === 'loading' && evmQuery.fetchStatus === 'fetching',
  };
};
