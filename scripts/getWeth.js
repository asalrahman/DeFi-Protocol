
const{getNamedAccounts, ethers}=require("hardhat")

const Amount = ethers.utils.parseEther("0.03");

 async function getWeth() {
// need an acc
const {deployer} = await getNamedAccounts();
//need abi ,address
 const iweth = await ethers.getContractAt("IWeth",
 "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",deployer);

 const tx = await iweth.deposit({value:Amount})
  await tx.wait(1);
  const wethBalance = await iweth.balanceOf(deployer)
  console.log(`got ${wethBalance.toString()}  WETH`);

    
}

 module.exports={
    getWeth,Amount
 }