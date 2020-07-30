# Blockchain CowCow
This is the smart contract part of the prototype for the course on Subjects in Blockchain Technology at the Blockchain Summer School in 2018.

![Blockchain CowCow smart contracts](https://raw.githubusercontent.com/vladcmanea/bss-cowcow/master/Tokens.png)

The contracts are contained in `/contracts`. The automated tests are contained in `/test`.

## Getting started

### Prerequisites
For this you need to have [Node.js](https://nodejs.org/en/) and [Truffle](https://truffleframework.com/truffle) installed. You also need a local Ethereum network running. This can be [Ganache](https://truffleframework.com/ganache), which is the easiest way to get started.

### Configuration

You can configure the development network settings in the `truffle.js` file.

### Installing
Run `npm install` in the root folder to install all dependencies.

### Running
To compile the contracts, run `truffle compile`. To run the test automation for the contracts, run `truffle test`. To deploy the contracts, run `truffle migrate`.

## Permissions

Code for showcase purposes only. No guarantees upon the use of this code for any purpose, including, but not limited to, reuse with or without modifications in academic or industrial projects. :) The project intentionally does not have a LICENSE file. Please read: https://choosealicense.com/no-permission/

## Contributors

Business: Emil von Buchwald, Martin Juel Nielsen.
Engineering: Vlad Manea (back-end), Christian Keilstrup Ingwersen (cryptography), Christian Kjær Larsen (front-end and tokens prototypes).
