import { mnemonicToWalletKey } from "@ton/crypto";
import { Address, beginCell, comment, internal, toNano, TonClient, WalletContractV5R1 } from "@ton/ton";
import { SendMode } from "@ton/core";


async function main() {
  const tonClient = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: 'YOUR_API_KEY',  //acquire it from: https://t.me/toncenter
  });

  // Using mnemonic to derive public and private keys
  // Replace with your own 24-word mnemonic from your wallet app
  const mnemonic = "swarm trumpet innocent empty faculty banner picnic unique major taste cigar slogan health neither diary monster jar scale multiply result biology champion genuine outside".split(' ');
  // Remember that it should be mnemonic of the wallet that you have made an owner of NFT

  const { publicKey, secretKey } = await mnemonicToWalletKey(mnemonic);
  const walletContract = WalletContractV5R1.create({ walletId: { networkGlobalId: -3 }, publicKey });
  const wallet = tonClient.open(walletContract);
  const seqno = await wallet.getSeqno();

  const nftTransferBody = beginCell()
    .storeUint(0x5fcc3d14, 32) // opcode for nft transfer
    .storeUint(0, 64) // query id
    .storeAddress(wallet.address) // address to transfer ownership to
    .storeAddress(wallet.address) // response destination
    .storeBit(0) // no custom payload
    .storeCoins(toNano('0.01')) // forward amount - recommended minimum in NFT docs
    .storeMaybeRef(comment('Hello from NFT!'))
    .endCell();

  // Address of the NFT you created at https://ton-collection-edit.vercel.app/deploy-nft-single
  const nftAddress = Address.parse('YOUR_NFT_ADDRESS'); 
  // Sending NFT transfer
  await wallet.sendTransfer({
    seqno,
    secretKey,
    messages: [internal({
      to: nftAddress,
      body: nftTransferBody,
      value: toNano(0.05),
    })],
    sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
  });
}
main();