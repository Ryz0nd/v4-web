export const ERROR_STRING_KEYS = {
  // General errors
  SOMETHING_WENT_WRONG_WITH_MESSAGE: 'ERRORS.GENERAL.SOMETHING_WENT_WRONG_WITH_MESSAGE',
  SOMETHING_WENT_WRONG: 'ERRORS.GENERAL.SOMETHING_WENT_WRONG',
  TIMESTAMP_DISCREPANCY: 'ERRORS.GENERAL.TIMESTAMP_DISCREPANCY',

  // Trade box errors
  AMOUNT_INPUT_STEP_SIZE: 'ERRORS.TRADE_BOX.AMOUNT_INPUT_STEP_SIZE',
  BRACKET_ORDER_FAILED_TO_PLACE: 'ERRORS.TRADE_BOX.BRACKET_ORDER_FAILED_TO_PLACE',
  BRACKET_ORDER_STOP_LOSS_ABOVE_EXPECTED_PRICE:
    'ERRORS.TRADE_BOX.BRACKET_ORDER_STOP_LOSS_ABOVE_EXPECTED_PRICE',
  BRACKET_ORDER_STOP_LOSS_ABOVE_LIQUIDATION_PRICE:
    'ERRORS.TRADE_BOX.BRACKET_ORDER_STOP_LOSS_ABOVE_LIQUIDATION_PRICE',
  BRACKET_ORDER_STOP_LOSS_BELOW_EXPECTED_PRICE:
    'ERRORS.TRADE_BOX.BRACKET_ORDER_STOP_LOSS_BELOW_EXPECTED_PRICE',
  BRACKET_ORDER_STOP_LOSS_BELOW_LIQUIDATION_PRICE:
    'ERRORS.TRADE_BOX.BRACKET_ORDER_STOP_LOSS_BELOW_LIQUIDATION_PRICE',
  BRACKET_ORDER_TAKE_PROFIT_ABOVE_EXPECTED_PRICE:
    'ERRORS.TRADE_BOX.BRACKET_ORDER_TAKE_PROFIT_ABOVE_EXPECTED_PRICE',
  BRACKET_ORDER_TAKE_PROFIT_ABOVE_LIQUIDATION_PRICE:
    'ERRORS.TRADE_BOX.BRACKET_ORDER_TAKE_PROFIT_ABOVE_LIQUIDATION_PRICE',
  BRACKET_ORDER_TAKE_PROFIT_BELOW_EXPECTED_PRICE:
    'ERRORS.TRADE_BOX.BRACKET_ORDER_TAKE_PROFIT_BELOW_EXPECTED_PRICE',
  BRACKET_ORDER_TAKE_PROFIT_BELOW_LIQUIDATION_PRICE:
    'ERRORS.TRADE_BOX.BRACKET_ORDER_TAKE_PROFIT_BELOW_LIQUIDATION_PRICE',
  BUY_TRIGGER_TOO_CLOSE_TO_LIQUIDATION_PRICE:
    'ERRORS.TRADE_BOX.BUY_TRIGGER_TOO_CLOSE_TO_LIQUIDATION_PRICE',
  INVALID_LARGE_POSITION_LEVERAGE: 'ERRORS.TRADE_BOX.INVALID_LARGE_POSITION_LEVERAGE',
  INVALID_NEW_ACCOUNT_MARGIN_USAGE: 'ERRORS.TRADE_BOX.INVALID_NEW_ACCOUNT_MARGIN_USAGE',
  INVALID_NEW_POSITION_LEVERAGE: 'ERRORS.TRADE_BOX.INVALID_NEW_POSITION_LEVERAGE',
  LIMIT_MUST_ABOVE_TRIGGER_PRICE: 'ERRORS.TRADE_BOX.LIMIT_MUST_ABOVE_TRIGGER_PRICE',
  LIMIT_MUST_BELOW_TRIGGER_PRICE: 'ERRORS.TRADE_BOX.LIMIT_MUST_BELOW_TRIGGER_PRICE',
  LIMITED_ORDERS_FOR_PAIR: 'ERRORS.TRADE_BOX.LIMITED_ORDERS_FOR_PAIR',
  MARKET_ORDER_ERROR_INDEX_PRICE_SLIPPAGE:
    'ERRORS.TRADE_BOX.MARKET_ORDER_ERROR_INDEX_PRICE_SLIPPAGE',
  MARKET_ORDER_ERROR_ORDERBOOK_SLIPPAGE: 'ERRORS.TRADE_BOX.MARKET_ORDER_ERROR_ORDERBOOK_SLIPPAGE',
  MARKET_ORDER_NOT_ENOUGH_LIQUIDITY: 'ERRORS.TRADE_BOX.MARKET_ORDER_NOT_ENOUGH_LIQUIDITY',
  MARKET_ORDER_PRICE_IMPACT_AT_MAX_LEVERAGE:
    'ERRORS.TRADE_BOX.MARKET_ORDER_PRICE_IMPACT_AT_MAX_LEVERAGE',
  NEW_POSITION_SIZE_OVER_MAX: 'ERRORS.TRADE_BOX.NEW_POSITION_SIZE_OVER_MAX',
  NO_EQUITY_DEPOSIT_FIRST: 'ERRORS.TRADE_BOX.NO_EQUITY_DEPOSIT_FIRST',
  ORDER_BELOW_COLLATERALIZATION: 'ERRORS.TRADE_BOX.ORDER_BELOW_COLLATERALIZATION',
  ORDER_CROSSES_OWN_ORDER: 'ERRORS.TRADE_BOX.ORDER_CROSSES_OWN_ORDER',
  ORDER_SIZE_BELOW_MIN_SIZE: 'ERRORS.TRADE_BOX.ORDER_SIZE_BELOW_MIN_SIZE',
  ORDER_WITH_CURRENT_ORDERS_INVALID: 'ERRORS.TRADE_BOX.ORDER_WITH_CURRENT_ORDERS_INVALID',
  ORDER_WOULD_FLIP_POSITION: 'ERRORS.TRADE_BOX.ORDER_WOULD_FLIP_POSITION',
  SELL_TRIGGER_TOO_CLOSE_TO_LIQUIDATION_PRICE:
    'ERRORS.TRADE_BOX.SELL_TRIGGER_TOO_CLOSE_TO_LIQUIDATION_PRICE',
  TAKER_FEE_INVALID: 'ERRORS.TRADE_BOX.TAKER_FEE_INVALID',
  TRIGGER_MUST_ABOVE_INDEX_PRICE: 'ERRORS.TRADE_BOX.TRIGGER_MUST_ABOVE_INDEX_PRICE',
  TRIGGER_MUST_BELOW_INDEX_PRICE: 'ERRORS.TRADE_BOX.TRIGGER_MUST_BELOW_INDEX_PRICE',
  TRIGGER_TOO_CLOSE_TO_LIQUIDATION_PRICE: 'ERRORS.TRADE_BOX.TRIGGER_TOO_CLOSE_TO_LIQUIDATION_PRICE',
  USER_MAX_ORDERS: 'ERRORS.TRADE_BOX.USER_MAX_ORDERS',
  WOULD_NOT_REDUCE: 'ERRORS.TRADE_BOX.WOULD_NOT_REDUCE',
  WOULD_NOT_REDUCE_UNCHECK: 'ERRORS.TRADE_BOX.WOULD_NOT_REDUCE_UNCHECK',

  // Onboarding errors
  BANNED_USER: 'ERRORS.ONBOARDING.BANNED_USER',
  INVALID_EMAIL: 'ERRORS.ONBOARDING.INVALID_EMAIL',
  INVALID_USERNAME: 'ERRORS.ONBOARDING.INVALID_USERNAME',
  KEY_RECOVERY_FAILED: 'ERRORS.ONBOARDING.KEY_RECOVERY_FAILED',
  LEDGER_U2F_REQUIRED: 'ERRORS.ONBOARDING.LEDGER_U2F_REQUIRED',
  USERNAME_TAKEN: 'ERRORS.ONBOARDING.USERNAME_TAKEN',
  WALLET_NO_TRANSACTIONS: 'ERRORS.ONBOARDING.WALLET_NO_TRANSACTIONS',

  // Deposit modal errors
  DEPOSIT_ACCOUNT_OUT_OF_SYNC: 'ERRORS.DEPOSIT_MODAL.DEPOSIT_ACCOUNT_OUT_OF_SYNC',
  DEPOSIT_MORE_THAN_BALANCE: 'ERRORS.DEPOSIT_MODAL.DEPOSIT_MORE_THAN_BALANCE',
  DEPOSIT_WRONG_NETWORK_PRODUCTION: 'ERRORS.DEPOSIT_MODAL.DEPOSIT_WRONG_NETWORK_PRODUCTION',
  DEPOSIT_WRONG_NETWORK_STAGING: 'ERRORS.DEPOSIT_MODAL.DEPOSIT_WRONG_NETWORK_STAGING',
  MUST_SPECIFY_ASSET: 'ERRORS.DEPOSIT_MODAL.MUST_SPECIFY_ASSET',
  MUST_SPECIFY_CHAIN: 'ERRORS.DEPOSIT_MODAL.MUST_SPECIFY_CHAIN',

  // Withdraw modal errors
  FAST_WITHDRAW_NOT_ENOUGH_LIQUIDITY: 'ERRORS.WITHDRAW_MODAL.FAST_WITHDRAW_NOT_ENOUGH_LIQUIDITY',
  MAX_FAST_WITHDRAW_AMOUNT: 'ERRORS.WITHDRAW_MODAL.MAX_FAST_WITHDRAW_AMOUNT',
  MIN_SLOW_WITHDRAW_AMOUNT: 'ERRORS.WITHDRAW_MODAL.MIN_SLOW_WITHDRAW_AMOUNT',
  RESTRICTED_OPEN_POSITIONS_WITHDRAW: 'ERRORS.WITHDRAW_MODAL.RESTRICTED_OPEN_POSITIONS_WITHDRAW',
  WITHDRAW_MORE_THAN_FREE_DUE_TO_FEE: 'ERRORS.WITHDRAW_MODAL.WITHDRAW_MORE_THAN_FREE_DUE_TO_FEE',
  WITHDRAW_MORE_THAN_FREE: 'ERRORS.WITHDRAW_MODAL.WITHDRAW_MORE_THAN_FREE',

  // Transfer modal errors
  TRANSFER_INVALID_ETH_ADDRESS: 'ERRORS.TRANSFER_MODAL.TRANSFER_INVALID_ETH_ADDRESS',
  TRANSFER_MORE_THAN_FREE: 'ERRORS.TRANSFER_MODAL.TRANSFER_MORE_THAN_FREE',
  TRANSFER_TO_YOURSELF: 'ERRORS.TRANSFER_MODAL.TRANSFER_TO_YOURSELF',
  TRANSFER_INVALID_DYDX_ADDRESS: 'ERRORS.TRANSFER_MODAL.TRANSFER_INVALID_DYDX_ADDRESS',

  // Order errors
  '2000_FILL_OR_KILL_ORDER_COULD_NOT_BE_FULLY_FILLED':
    'ERRORS.ORDER.2000_FILL_OR_KILL_ORDER_COULD_NOT_BE_FULLY_FILLED',
  '2001_REDUCE_ONLY_WOULD_INCREASE_POSITION_SIZE':
    'ERRORS.ORDER.2001_REDUCE_ONLY_WOULD_INCREASE_POSITION_SIZE',
  '2002_REDUCE_ONLY_WOULD_CHANGE_POSITION_SIDE':
    'ERRORS.ORDER.2002_REDUCE_ONLY_WOULD_CHANGE_POSITION_SIDE',
  '2003_POST_ONLY_WOULD_CROSS_MAKER_ORDER': 'ERRORS.ORDER.2003_POST_ONLY_WOULD_CROSS_MAKER_ORDER',
  '3000_INVALID_ORDER_FLAGS': 'ERRORS.ORDER.3000_INVALID_ORDER_FLAGS',
  '3001_INVALID_STATEFUL_ORDER_GOOD_TIL_BLOCK_TIME':
    'ERRORS.ORDER.3001_INVALID_STATEFUL_ORDER_GOOD_TIL_BLOCK_TIME',
  '3002_STATEFUL_ORDERS_CANNOT_REQUIRE_IMMEDIATE_EXECUTION':
    'ERRORS.ORDER.3002_STATEFUL_ORDERS_CANNOT_REQUIRE_IMMEDIATE_EXECUTION',
  '3003_TIME_EXCEEDS_GOOD_TIL_BLOCK_TIME': 'ERRORS.ORDER.3003_TIME_EXCEEDS_GOOD_TIL_BLOCK_TIME',
  '3004_GOOD_TIL_BLOCK_TIME_EXCEEDS_STATEFUL_ORDER_TIME_WINDOW':
    'ERRORS.ORDER.3004_GOOD_TIL_BLOCK_TIME_EXCEEDS_STATEFUL_ORDER_TIME_WINDOW',
  '3005_STATEFUL_ORDER_ALREADY_EXISTS': 'ERRORS.ORDER.3005_STATEFUL_ORDER_ALREADY_EXISTS',
  '3006_STATEFUL_ORDER_DOES_NOT_EXIST': 'ERRORS.ORDER.3006_STATEFUL_ORDER_DOES_NOT_EXIST',
  '3007_STATEFUL_ORDER_COLLATERALIZATION_CHECK_FAILED':
    'ERRORS.ORDER.3007_STATEFUL_ORDER_COLLATERALIZATION_CHECK_FAILED',
  '3008_STATEFUL_ORDER_PREVIOUSLY_CANCELLED':
    'ERRORS.ORDER.3008_STATEFUL_ORDER_PREVIOUSLY_CANCELLED',
};

export const ORDER_ERROR_CODE_MAP: { [key: number]: string } = {
  2000: ERROR_STRING_KEYS['2000_FILL_OR_KILL_ORDER_COULD_NOT_BE_FULLY_FILLED'],
  2001: ERROR_STRING_KEYS['2001_REDUCE_ONLY_WOULD_INCREASE_POSITION_SIZE'],
  2002: ERROR_STRING_KEYS['2002_REDUCE_ONLY_WOULD_CHANGE_POSITION_SIDE'],
  2003: ERROR_STRING_KEYS['2003_POST_ONLY_WOULD_CROSS_MAKER_ORDER'],
  3000: ERROR_STRING_KEYS['3000_INVALID_ORDER_FLAGS'],
  3001: ERROR_STRING_KEYS['3001_INVALID_STATEFUL_ORDER_GOOD_TIL_BLOCK_TIME'],
  3002: ERROR_STRING_KEYS['3002_STATEFUL_ORDERS_CANNOT_REQUIRE_IMMEDIATE_EXECUTION'],
  3003: ERROR_STRING_KEYS['3003_TIME_EXCEEDS_GOOD_TIL_BLOCK_TIME'],
  3004: ERROR_STRING_KEYS['3004_GOOD_TIL_BLOCK_TIME_EXCEEDS_STATEFUL_ORDER_TIME_WINDOW'],
  3005: ERROR_STRING_KEYS['3005_STATEFUL_ORDER_ALREADY_EXISTS'],
  3006: ERROR_STRING_KEYS['3006_STATEFUL_ORDER_DOES_NOT_EXIST'],
  3007: ERROR_STRING_KEYS['3007_STATEFUL_ORDER_COLLATERALIZATION_CHECK_FAILED'],
  3008: ERROR_STRING_KEYS['3008_STATEFUL_ORDER_PREVIOUSLY_CANCELLED'],
};
