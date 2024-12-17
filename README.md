# Rune swap Project

Welcome to the Rune swap Project, a decentralized application (dApp) built in the Bitcoin Rune space. This project leverages React and the Bitcoin CLI to facilitate the swaping of runes. Explore the repository to learn more about how it works and how you can contribute!

## Introduction

The Rune swap Project is designed to provide a seamless and secure way to swap runes within the Bitcoin ecosystem. By using this dApp, users can ensure their runes are permanently removed from circulation, enhancing the value and scarcity of remaining runes.

## Features

- **Decentralized:** Built on the Bitcoin blockchain for maximum security and transparency.
- **User-Friendly:** Easy-to-use interface developed with React.
- **Efficient:** Utilizes the Bitcoin CLI for efficient and reliable operations.
- **Open Source:** Fully open-source and available for community contributions.

1. Transfer claim amount of rune token from User wallet to Receiver wallet.

   - Get rune utxos and btc utxos in user wallet.

   - Build PSBT with user rune token and utxo balance as input and OP_RETURN value and claim amount of rune token, return rune token, change utxo as output using user wallet publickey, address, and receiver wallet address.

   - Send and Sign PSBT with user wallet.

2. After confirmed transaction, Transfer and swap rune token from Receiver wallet to swaping wallet.

   - Get rune utxos and btc utxos in receiver wallet.

   - Build PSBT with receiver rune token and utxo balance as input and OP_RETURN value and claim amount of rune token, return rune token, change utxo as output using reciver wallet WIF privatekey, address, and swaping wallet address.
     (At that time, set OP_RETURN as invalid)

   - Sign PSBT with receiver wallet.

P.S. All necessary values are in network.config.ts.

3. **Set up the Bitcoin CLI:**

   - Ensure you have the Bitcoin CLI installed and configured on your machine.
   - Update the `.env` file with your Bitcoin CLI configuration.

4. **Start the application:**
   ```bash
   npm start
   ```

## Usage

1. **Access the Application:**
   - Open your browser and navigate to `https://stonefaceords.com/`.
2. **swap Runes:**
   - Follow the on-screen instructions to swap your runes securely.
   - Confirm the transaction through the Bitcoin CLI.

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository.
2. Create a new branch with your feature or bugfix.
3. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
