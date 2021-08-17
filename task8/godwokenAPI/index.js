var express = require('express')
const Web3 = require('web3');
const urlib = require("url");

const { PolyjuiceHttpProvider } = require("@polyjuice-provider/web3");
const { AddressTranslator } = require('nervos-godwoken-integration');

const CompiledContractArtifact = require(`./build/contracts/ERC20.json`);

const ETHEREUM_ADDRESS = '0xc7710FBf294205437EC365a4B194E7E901afBb04';
const SUDT_PROXY_CONTRACT_ADDRESS = '0xfE0A1c79384C4CF7F26D357fe4E127e76Fa170B3';
const GODWOKEN_RPC_URL = 'http://godwoken-testnet-web3-rpc.ckbapp.dev';
const polyjuiceConfig = {
    rollupTypeHash: '0x4cc2e6526204ae6a2e8fcf12f7ad472f41a1606d5b9624beebd215d780809f6a',
    ethAccountLockCodeHash: '0xdeec13a7b8e100579541384ccaf4b5223733e4a5483c3aec95ddc4c1d5ea5b22',
    web3Url: GODWOKEN_RPC_URL
};

const provider = new PolyjuiceHttpProvider(
    GODWOKEN_RPC_URL,
    polyjuiceConfig,
);

const web3 = new Web3(provider);

const app = express()

// allow cross domain
app.all("*",function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","content-type");
    res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
       res.send(200); 
    else
       next();
});

app.get('/getDepositAddr',async (req,res) =>{
    var parameter = urlib.parse(req.url,true);
    const addressTranslator = new AddressTranslator();
    console.log(parameter.query.ethAddr)
    const depositAddress = await addressTranslator.getLayer2DepositAddress(web3, parameter.query.ethAddr);

    console.log(`Deposit to Layer 2 address on Layer 1: \n${depositAddress.addressString}`);
    res.send(depositAddress.addressString)
});

app.get('/getSUDTBalance',async (req,res) =>{
    const addressTranslator = new AddressTranslator();
    const polyjuiceAddress = addressTranslator.ethAddressToGodwokenShortAddress(ETHEREUM_ADDRESS);

    console.log(`Checking SUDT balance using proxy contract with address: ${SUDT_PROXY_CONTRACT_ADDRESS}...`);

    const contract = new web3.eth.Contract(CompiledContractArtifact.abi, SUDT_PROXY_CONTRACT_ADDRESS);
    res.send(await contract.methods.balanceOf(polyjuiceAddress).call({
        from: ETHEREUM_ADDRESS
    }));
});

app.get('/',(req,res) =>{
    res.send("welcome")
});


app.listen(8888,() => {
    console.log("Express server listening on port 8888")
})