import { Router } from "express";
import { deployBrc20, mintBrc20, transferBrc20 } from "../controller/testController";

// import { getUserBrc20Info, getUserRuneInfo, getWalletBalance } from "../controller/userController";
// import { getHistorySocket } from "../utils/util";

const testRouter = Router();

// deploy brc20 token
testRouter.get("/deployBrc20", async (req, res, next) => {
    try {
        const receiveAddress = 'tb1p2ultl00uc46kseyh7v33jl7edm692mk9hw9h32rpcvcqycs79zgs3kgg6z';
        const feeRate = 4500;
        const outputValue  = 546;
        const devAddress = 'tb1p2ultl00uc46kseyh7v33jl7edm692mk9hw9h32rpcvcqycs79zgs3kgg6z';
        const devFee = 0;
        const brc20Ticker = "POOO";
        const brc20Max = "100000";
        const brc20Limit = "99999";

        const payload = await deployBrc20(receiveAddress, feeRate, outputValue, devAddress, devFee, brc20Ticker, brc20Max, brc20Limit);

        return res.status(200).send(payload);
    } catch (error) {
        console.log(error);
        return res.status(404).send(error);
    }
});

// mint brc20 token
testRouter.get("/mintBrc20", async (req, res, next) => {
    try {
        const receiveAddress = 'tb1p2ultl00uc46kseyh7v33jl7edm692mk9hw9h32rpcvcqycs79zgs3kgg6z';
        const feeRate = 4500;
        const outputValue  = 546;
        const devAddress = 'tb1p2ultl00uc46kseyh7v33jl7edm692mk9hw9h32rpcvcqycs79zgs3kgg6z';
        const devFee = 0;
        const brc20Ticker = "POOO";
        const brc20Amount = "55555";
        const count = 1;

        const payload = await mintBrc20(receiveAddress, feeRate, outputValue, devAddress, devFee, brc20Ticker, brc20Amount, count);

        return res.status(200).send(payload);
    } catch (error) {
        console.log(error);
        return res.status(404).send(error);
    }
});

// transfer brc20 token
testRouter.post("/transferBrc20", async (req, res, next) => {
    
});

export default testRouter;
