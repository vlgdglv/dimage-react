//reacts
import React, { Component } from "react";
//react-router
import { BrowserRouter, Switch, Route } from "react-router-dom";
//pages
import Detail from "./pages/Detail";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Release from "./pages/Release";
import Error from "./pages/Error";
//components
import Header from './components/Header';
//context
import { web3Context } from "./context/web3Context";
//web3
import getWeb3 from "./getWeb3";
import Web3 from "web3";

import "./App.css";
import Purchase from "./pages/Purchase";
import Trades from "./pages/Trades";



class App extends Component {
  state = { 
    web3: null, 
    account: '', 
    balance: '',
    contract: null };

  componentDidMount = async () => {
    try {
      
      getWeb3().then((web3) => {
        this.setState({web3})
        web3.eth.getAccounts().then((account) => {
          console.log(account[0])
          this.setState({account:account[0]})
        })
      })

      // window.ethereum.on('connect', (connectInfo) => {
      //   console.log("connect info" + connectInfo)
      // })      

      window.ethereum.on('accountsChanged', (account) => {
        // Handle the new account, or lack thereof.
        // "account" will always be an array, but it can be empty.
        console.log("[home]change account:"+account)
        this.setState({account})
      });

      window.ethereum.on('disconnect', (error)=>{
        console.log(error)
      });
    
      // Use web3 to get the user's account.
      // const account = await web3.eth.getAccounts();
      // console.log(account)
      // this.setState({web3});
      
      // window.ethereum.on('disconnect',() => {
      //   this.setState({web3: null})
      // }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, account, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  componentWillUnmount() {

  }
  
  render() {
    // if (!this.state.web3) {
    //   return <div>Loading Web3, account, and contract...</div>;
    // }
    
    return (
      <div className="App">
        <Header />
        {
        this.state.web3 && this.state.account ?
          <BrowserRouter>
            <web3Context.Provider value={{"web3":this.state.web3, "account":this.state.account}}>
              <Switch>  
                <Route path="/" exact component={Home}/>
                <Route path="/release" component={Release} />
                <Route path="/detail" component={Detail} />
                <Route path="/profile" component={Profile} />
                <Route path={["/purchase","/purchase/:imgID"]} component={Purchase} />
                <Route path="/trades" component={Trades} />
                <Route path="/error" component={Error}/>
                <Route component={Error} />
              </Switch>
            </web3Context.Provider>  
          </BrowserRouter>
        : <h2 style={{ paddingTop:"150px", textAlign:"center" }} > Loading Web3, account, and contract... </h2>
        }
      </div>
    );
  }
}

export default App;

  // runExample = async () => {
  //   const { account, contract } = this.state;

  //   // Stores a given value, 5 by default.
  //   await contract.methods.set(5).send({ from: account[0] });

  //   // Get the value from the contract to prove it worked.
  //   const response = await contract.methods.get().call();

  //   // Update state with the result.
  //   this.setState({ storageValue: response });
  // };