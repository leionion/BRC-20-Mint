import dotenv from "dotenv";
dotenv.config();

// user info
export const testVersion = true;
export const testFeeRate = 4000;
// export const brc20LockTime = 30;
// export const runeLockTime = 15;
export const lockTime = 15;
export const userSendBrc20Fee = testVersion ? 400000 : 30000; // fee when user inscribe and send brc20 token to pool

// .env info
export const OPENAPI_UNISAT_TOKEN: string = process.env.OPENAPI_UNISAT_TOKEN as string;
export const privateKey: string = process.env.WIF_KEY as string;
export const MongoDBUrl: string = process.env.MONGDB_URL as string;

// const info
export const STANDARD_RUNE_UTXO_VALUE = 546;
export const SEND_UTXO_FEE_LIMIT = 10000;
export const networkType = testVersion ? "testnet" : "mainnet";
export const SIGNATURE_SIZE = 126;

// Api info
export const OPENAPI_UNISAT_URL = testVersion
	? "https://open-api-testnet.unisat.io"
	: "https://open-api.unisat.io";
