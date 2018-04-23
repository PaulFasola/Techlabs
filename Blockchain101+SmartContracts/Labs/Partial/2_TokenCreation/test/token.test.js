
// TODO : Replace the values below with yours ;)
const tokenName = "";
const initialSupply = 0;

const token = artifacts.require("./" + tokenName + ".sol");

contract(tokenName, async (accounts) => {

  it(`should have put ${initialSupply} ${tokenName} in the first account`, async () => {
    /*
      TODO : we need this test!
    */
  })

  it("should send 10 coins correctly from owner account (0) to another one.", async () => {
    /*
      TODO : we need this test!
    */
  });
});