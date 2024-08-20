const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Unstoppable', function () {
    let deployer, player, someUser;
    let token, vault, receiverContract;

    const TOKENS_IN_VAULT = 1000000n * 10n ** 18n;
    const INITIAL_PLAYER_TOKEN_BALANCE = 10n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */

        [deployer, player, someUser] = await ethers.getSigners();

        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();
        vault = await (await ethers.getContractFactory('UnstoppableVault', deployer)).deploy(
            token.address,
            deployer.address, // owner
            deployer.address // fee recipient
        );
        expect(await vault.asset()).to.eq(token.address);

        await token.approve(vault.address, TOKENS_IN_VAULT);
        await vault.deposit(TOKENS_IN_VAULT, deployer.address);

        expect(await token.balanceOf(vault.address)).to.eq(TOKENS_IN_VAULT);
        expect(await vault.totalAssets()).to.eq(TOKENS_IN_VAULT);
        expect(await vault.totalSupply()).to.eq(TOKENS_IN_VAULT);
        expect(await vault.maxFlashLoan(token.address)).to.eq(TOKENS_IN_VAULT);
        expect(await vault.flashFee(token.address, TOKENS_IN_VAULT - 1n)).to.eq(0);
        expect(
            await vault.flashFee(token.address, TOKENS_IN_VAULT)
        ).to.eq(50000n * 10n ** 18n);

        await token.transfer(player.address, INITIAL_PLAYER_TOKEN_BALANCE);
        expect(await token.balanceOf(player.address)).to.eq(INITIAL_PLAYER_TOKEN_BALANCE);

        // Show it's possible for someUser to take out a flash loan
        receiverContract = await (await ethers.getContractFactory('ReceiverUnstoppable', someUser)).deploy(
            vault.address
        );
        await receiverContract.executeFlashLoan(100n * 10n ** 18n);
    });




    it('Flash loan for the maximum amount', async function () {
        // Attempt to execute a flash loan for the maximum possible amount
        await expect(receiverContract.executeFlashLoan(TOKENS_IN_VAULT)).to.not.be.reverted;
    });
   // await expect(receiverContract.executeFlashLoan(TOKENS_IN_VAULT).to.be.revertedWith('Flash loan too high'));
   it('Flash loan for an amount greater than total assets', async function () {
    // Attempt to execute a flash loan for an amount greater than total assets in the vault
    const greaterThanTotalAssets = TOKENS_IN_VAULT + 1n;
    await expect(receiverContract.executeFlashLoan(greaterThanTotalAssets)).to.be.reverted;
});
it('Flash loan for an amount less than the minimum', async function () {
    // Attempt to execute a flash loan for an amount less than the minimum required
    const lessThanMinimumAmount = TOKENS_IN_VAULT - 1n;
    await expect(receiverContract.executeFlashLoan(lessThanMinimumAmount)).to.be.reverted;
});

it('Flash loan for zero amount should revert', async function () {
    await expect(receiverContract.executeFlashLoan(0)).to.be.reverted;
});


    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        await token.connect(player).transfer(vault.address,1n * 10n ** 18n);
        
      
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // It is no longer possible to execute flash loans
        // await expect(
        //     receiverContract.executeFlashLoan(100n * 10n ** 18n)
        // ).to.be.reverted;
    });
});
