import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import dotenv from "dotenv";
import axios from "axios";
const ecc = require("@bitcoinerlab/secp256k1");
bitcoin.initEccLib(ecc);

import { OPENAPI_UNISAT_TOKEN, OPENAPI_UNISAT_URL } from "../config/config";
import { calculateTxFee, createOrderBrc20Deploy, createOrderBrc20Mint, createOrderBrc20Transfer, getBtcUtxoByAddress, pushRawTx } from "../service/service";
import { WIFWallet } from "../service/wallet/WIFWallet";

dotenv.config();

const network: any = bitcoin.networks.testnet;
const privateKey: string = process.env.WIF_KEY as string;
const userWallet = new WIFWallet({ networkType: network, privateKey: privateKey });

export const deployBrc20 = async (receiveAddress: string, feeRate: number, outputValue: number, devAddress: string, devFee: number, brc20Ticker: string, brc20Max: string, brc20Limit: string) => {

	const userBtcUtxos = await getBtcUtxoByAddress(userWallet.address);

	const psbt = new bitcoin.Psbt({ network });

	const orderInscriptionInfo = await createOrderBrc20Deploy(receiveAddress, feeRate, outputValue, devAddress, devFee, brc20Ticker, brc20Max, brc20Limit);

	console.log("orderInscriptionInfo :>> ", orderInscriptionInfo);

	const payAddress = orderInscriptionInfo.payAddress;
	const inscriptionPayAmount = orderInscriptionInfo.amount;

	console.log("inscriptionPayAmount :>> ", inscriptionPayAmount);
	psbt.addOutput({
		address: payAddress,
		value: inscriptionPayAmount,
	});

	psbt.addOutput({
		address: receiveAddress,
		value: outputValue,
	});

	// add btc utxo input
	let totalBtcAmount = 0;

	for (const btcutxo of userBtcUtxos) {
		const fee = calculateTxFee(psbt, feeRate) + inscriptionPayAmount;
		if (totalBtcAmount < fee && btcutxo.value > 10000) {
			totalBtcAmount += btcutxo.value;

			psbt.addInput({
				hash: btcutxo.txid,
				index: btcutxo.vout,
				witnessUtxo: {
					value: btcutxo.value,
					script: Buffer.from(btcutxo.scriptpubkey as string, "hex"),
				},
				tapInternalKey: Buffer.from(userWallet.publicKey, "hex").slice(1, 33),
			});
		}
	}

	const fee = calculateTxFee(psbt, feeRate) + inscriptionPayAmount;

	if (totalBtcAmount < fee) {
		return {
			success: false,
			message: `BTC balance in User of ${userWallet.address} is not enough`,
			payload: undefined,
		};
	}

	psbt.addOutput({
		address: userWallet.address,
		value: totalBtcAmount - fee,
	});

	const signedPsbt: any = userWallet.signPsbt(psbt);

	const tx = signedPsbt.extractTransaction();
	const txHex = tx.toHex();
	const txId = await pushRawTx(txHex);

	console.log('txId :>> ', txId);

	return {
		success: true,
		message: `Brc20 deployed successfully!`,
		payload: {
			txId: txId,
			status: "success",
		},
	};
}

export const mintBrc20 = async (receiveAddress: string, feeRate: number, outputValue: number, devAddress: string, devFee: number, brc20Ticker: string, brc20Amount: string, count: number) => {
	const userBtcUtxos = await getBtcUtxoByAddress(userWallet.address);

	const psbt = new bitcoin.Psbt({ network });

	const orderInscriptionInfo = await createOrderBrc20Mint(receiveAddress, feeRate, outputValue, devAddress, devFee, brc20Ticker, brc20Amount, count);

	console.log("orderInscriptionInfo :>> ", orderInscriptionInfo);

	const payAddress = orderInscriptionInfo.payAddress;
	const inscriptionPayAmount = orderInscriptionInfo.amount;

	console.log("inscriptionPayAmount :>> ", inscriptionPayAmount);
	psbt.addOutput({
		address: payAddress,
		value: inscriptionPayAmount,
	});

	psbt.addOutput({
		address: receiveAddress,
		value: outputValue,
	});

	// add btc utxo input
	let totalBtcAmount = 0;

	for (const btcutxo of userBtcUtxos) {
		const fee = calculateTxFee(psbt, feeRate) + inscriptionPayAmount;
		if (totalBtcAmount < fee && btcutxo.value > 10000) {
			totalBtcAmount += btcutxo.value;

			psbt.addInput({
				hash: btcutxo.txid,
				index: btcutxo.vout,
				witnessUtxo: {
					value: btcutxo.value,
					script: Buffer.from(btcutxo.scriptpubkey as string, "hex"),
				},
				tapInternalKey: Buffer.from(userWallet.publicKey, "hex").slice(1, 33),
			});
		}
	}

	const fee = calculateTxFee(psbt, feeRate) + inscriptionPayAmount;

	if (totalBtcAmount < fee) {
		return {
			success: false,
			message: `BTC balance in User of ${userWallet.address} is not enough`,
			payload: undefined,
		};
	}

	psbt.addOutput({
		address: userWallet.address,
		value: totalBtcAmount - fee,
	});

	const signedPsbt: any = userWallet.signPsbt(psbt);

	const tx = signedPsbt.extractTransaction();
	const txHex = tx.toHex();
	const txId = await pushRawTx(txHex);

	console.log('txId :>> ', txId);

	return {
		success: true,
		message: `Brc20 Mint successfully!`,
		payload: {
			txId: txId,
			status: "success",
		},
	};
};

export const transferBrc20 = async (receiveAddress: string, feeRate: number, outputValue: number, devAddress: string, devFee: number, brc20Ticker: string, brc20Amount: string) => {
	
};
