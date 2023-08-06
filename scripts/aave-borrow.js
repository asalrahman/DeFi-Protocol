
const { getNamedAccounts, ethers } = require("hardhat");
const{getWeth,Amount} = require("../scripts/getWeth");


async function main (){

  await getWeth();
  const {deployer} = await getNamedAccounts();
  //lendingpooladdress provider "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5" 
  //lendingpool
  const lendingPool = await getLendingPool(deployer);
  console.log(`lendingpool address ${lendingPool.address}`);

  //approve
  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  await approveErc20(wethTokenAddress,lendingPool.address,Amount);
  //deposit
  console.log("depositing....");
  await lendingPool.deposit(wethTokenAddress,Amount,deployer,0);
  console.log("deposited!");

  //borrow 

let {availableBorrowsETH,totalDebtETH}= await getBorrowUserdata(lendingPool,deployer);
//dai/ETH
  const Daiprice = await getDaiPrice();
const amountDaiToBorrow = (availableBorrowsETH.toString() * 0.95 * (1 / Daiprice))
console.log(`DAI amount ${amountDaiToBorrow}`);
const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString());
daiAddress="0x6B175474E89094C44Da98b954EedeAC495271d0F"
await borrowDai(daiAddress,lendingPool,deployer,amountDaiToBorrowWei);
await getBorrowUserdata(lendingPool,deployer);

}




async function borrowDai(daiAddress,lendingPool,account,amountDaiToBorrowWei){
    const borrowTx = await lendingPool.borrow(daiAddress,amountDaiToBorrowWei,1,0,account);
    await borrowTx.wait(1);
    console.log("you borrowed")

}

async function getDaiPrice() {
    const daiEthPricefeed = await ethers.getContractAt(
      "AggregatorV3Interface",
      "0x773616E4d11A78F511299002da57A0a94577F1f4"
    );
    const price = (await daiEthPricefeed.latestRoundData())[1]
    console.log(`the DAI/ETH price ${price.toString()}`);
    return price;
  }

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
        ,account
    )
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool",
    lendingPoolAddress, 
    account)
    return lendingPool
}

async function approveErc20(erc20Address, spenderAddress, amount, account){

    const Erc20Token = await ethers.getContractAt("IERC20",erc20Address,account);
    const tx = await Erc20Token.approve(spenderAddress,amount);
    await tx.wait(1);
    console.log("approved!!");
}

//how much you can borrow
async function getBorrowUserdata(lendingPool,account){
    const{totalCollateralETH,totalDebtETH,availableBorrowsETH} = await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
     return {availableBorrowsETH,totalDebtETH}
    }

   
    
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })