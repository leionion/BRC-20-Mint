import * as bitcoin from "bitcoinjs-lib";
import { isTaprootInput } from "bitcoinjs-lib/src/psbt/bip371.js";
import ecc from "@bitcoinerlab/secp256k1";
bitcoin.initEccLib(ecc);
import { ECPairFactory, type ECPairInterface } from "ecpair";

const ECPair = ECPairFactory(ecc);

export const toXOnly = (pubKey: string) => (pubKey.length == 32 ? pubKey : pubKey.slice(1, 33));

function tapTweakHash(pubKey: string, h: any) {
	return bitcoin.crypto.taggedHash("TapTweak", Buffer.concat(h ? [pubKey, h] : [pubKey]));
}

export function tweakSigner(signer: any, opts: any) {
	if (opts == null) opts = {};
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	let privateKey = signer.privateKey;
	if (!privateKey) {
		throw new Error("Private key is required for tweaking signer!");
	}
	if (signer.publicKey[0] == 3) {
		privateKey = ecc.privateNegate(privateKey);
	}

	const tweakedPrivateKey = ecc.privateAdd(
		privateKey,
		new Uint8Array(tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash))
	);
	if (!tweakedPrivateKey) {
		throw new Error("Invalid tweaked private key!");
	}

	return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
		network: opts.network,
	});
}

export function toPsbtNetwork(networkType: number) {
	if (networkType == 0) {
		return bitcoin.networks.bitcoin;
	} else {
		return bitcoin.networks.testnet;
	}
}

export function publicKeyToPayment(publicKey: string, type: number, networkType: any) {
	const network = toPsbtNetwork(networkType);
	if (!publicKey) return null;
	const pubkey = Buffer.from(publicKey, "hex");
	if (type == 0) {
		return bitcoin.payments.p2pkh({
			pubkey,
			network,
		});
	} else if (type == 1 || type == 4) {
		return bitcoin.payments.p2wpkh({
			pubkey,
			network,
		});
	} else if (type == 2 || type == 5) {
		return bitcoin.payments.p2tr({
			internalPubkey: pubkey.slice(1, 33),
			network,
		});
	} else if (type == 3) {
		const data = bitcoin.payments.p2wpkh({
			pubkey,
			network,
		});
		return bitcoin.payments.p2sh({
			pubkey,
			network,
			redeem: data,
		});
	}
}

export function publicKeyToAddress(publicKey: string, type: number, networkType: any) {
	const payment = publicKeyToPayment(publicKey, type, networkType);
	if (payment && payment.address) {
		return payment.address;
	} else {
		return "";
	}
}

export function publicKeyToScriptPk(publicKey: string, type: number, networkType: any) {
	const payment = publicKeyToPayment(publicKey, type, networkType);
	return payment?.output?.toString("hex");
}

export function randomWIF(networkType = 1) {
	const network = toPsbtNetwork(networkType);
	const keyPair = ECPair.makeRandom({ network });
	return keyPair.toWIF();
}

export class LocalWallet {
	keyPair;
	address;
	pubkey;
	network;
	constructor(wif: string, networkType = 1, addressType = 2) {
		if (typeof wif !== "string") {
			throw new Error("WIF must be a string");
		}
		const network = toPsbtNetwork(networkType);
		const keyPair = ECPair.fromWIF(wif, network);
		this.keyPair = keyPair;
		this.pubkey = keyPair.publicKey.toString("hex");
		this.address = publicKeyToAddress(this.pubkey, addressType, networkType);
		this.network = network;
	}

	async signPsbt(psbt: bitcoin.Psbt, opts?: any) {
		const _opts = opts || {
			autoFinalized: true,
		};
		const psbtNetwork = this.network;
		const toSignInputs: any = [];

		psbt.data.inputs.forEach((v, index) => {
			let script = null;
			let value = 0;
			if (v.witnessUtxo) {
				script = v.witnessUtxo.script;
				value = v.witnessUtxo.value;
			} else if (v.nonWitnessUtxo) {
				const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo);
				const output = tx.outs[psbt.txInputs[index].index];
				script = output.script;
				value = output.value;
			}
			const isSigned = v.finalScriptSig || v.finalScriptWitness;
			if (script && !isSigned) {
				const address = bitcoin.address.fromOutputScript(script, psbtNetwork);
				if (this.address == address) {
					toSignInputs.push({
						index,
						publicKey: this.pubkey,
						sighashTypes: v.sighashType ? [v.sighashType] : undefined,
					});
				}
			}
		});

		const _inputs = _opts.inputs || toSignInputs;
		if (_inputs.length == 0) {
			throw new Error("no input to sign");
		}
		_inputs.forEach((input: any) => {
			const keyPair = this.keyPair;
			if (isTaprootInput(psbt.data.inputs[input.index])) {
				const signer = tweakSigner(keyPair, opts);
				psbt.signInput(input.index, signer, input.sighashTypes);
			} else {
				const signer = keyPair;
				psbt.signInput(input.index, signer, input.sighashTypes);
			}
			if (_opts.autoFinalized != false) {
				// psbt.validateSignaturesOfInput(input.index, validator);
				psbt.finalizeInput(input.index);
			}
		});
		return psbt;
	}

	getPublicKey() {
		return this.keyPair.publicKey.toString("hex");
	}
}

interface IWIFWallet {
	networkType: string;
	privateKey: string;
}

export class WIFWallet {
	private network: bitcoin.networks.Network;
	public ecPair: ECPairInterface;
	public address: string;
	public output: Buffer;
	public publicKey: string;
	public seckey?: any;
	public secret: any;
	public pubkey: any;

	constructor(walletParam: IWIFWallet) {
		if (walletParam.networkType == "testnet") {
			this.network = bitcoin.networks.testnet;
		} else {
			this.network = bitcoin.networks.bitcoin;
		}

		this.ecPair = ECPair.fromWIF(walletParam.privateKey, this.network);

		this.secret = this.ecPair.privateKey?.toString("hex");
		// Extract the private key in hexadecimal format
		this.secret = this.ecPair.toWIF();

		// Extract the public key in hexadecimal format
		this.pubkey = this.ecPair.publicKey.toString("hex");

		const { address, output } = bitcoin.payments.p2tr({
			internalPubkey: this.ecPair.publicKey.subarray(1, 33),
			network: this.network,
		});
		this.address = address as string;
		this.output = output as Buffer;
		this.publicKey = this.ecPair.publicKey.toString("hex");
	}

	signPsbt(psbt: bitcoin.Psbt, ecPair: ECPairInterface): bitcoin.Psbt {
		const tweakedChildNode = ecPair.tweak(
			bitcoin.crypto.taggedHash("TapTweak", ecPair.publicKey.subarray(1, 33))
		);

		for (let i = 0; i < psbt.inputCount; i++) {
			psbt.signInput(i, tweakedChildNode);
			psbt.validateSignaturesOfInput(i, () => true);
			psbt.finalizeInput(i);
		}
		return psbt;
	}
}
