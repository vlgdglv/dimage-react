// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract Verification{
    
    string public contractName;
    
    constructor()  {
        contractName = "Verification";
    }
    
    //recover signer's address
    function verify(bytes32 hash, bytes memory signature)public pure returns(address){
        
        //see https://github.com/protofire/zeppelin-solidity/blob/master/contracts/ECRecovery.sol
        bytes32 r;
        bytes32 s;
        uint8 v;

        //Check the signature length
        if( signature.length != 65){
            return (address(0x0));
        }

        // Divide the signature in r, s and v variables
        assembly{
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature,0x60)))
        }

         // Version of signature should be 27 or 28, but 0 and 1 are also possible versions 
        if (v < 27){
            v+=27;
        }

        // If the version is correct return the signer address
        if(v != 27 && v != 28){
            return (address(0x0));
        }else{
            return ecrecover(hash, v, r, s);
        }

    }
}