import React, { Component } from "react";
//react-router
import { BrowserRouter, Switch, Route } from "react-router-dom";
//pages
import Detail from "./pages/Detail";
import Error from "./pages/Error";
import Home from "./pages/Home";
import NoWeb3Alt from "./pages/NoWeb3Alt";
import Profile from "./pages/Profile";
import Release from "./pages/Release";
import Transaction from "./pages/Transaction";
import Purchase from "./pages/Purchase";
import Trades from "./pages/Trades";
import ImageView from "./pages/ImageView";
//components
import Header from './components/Header';
//web3
import { web3Context } from "./context/web3Context";
import getWeb3 from "./getWeb3";
//css?
import "./App.css";

class App extends Component {

  state = { 
    web3: null, 
    account: '', 
    balance: '',
    contract: null 
  };

  componentDidMount = async () => {
    try {
      getWeb3().then((web3) => {
        this.setState({web3})
        web3.eth.getAccounts().then((account) => {
          this.setState({account:account[0]})
        })
      })
      window.ethereum.on('accountsChanged', (account) => {
        // Handle the new account, or lack thereof.
        // "account" will always be an array, but it can be empty.
        this.setState({account})
        window.location.reload()
      });
      window.ethereum.on('disconnect', (error)=>{
        console.log(error)
      });
    
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, account, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
  
  render() {
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
                <Route path="/detail/:imageID" component={Detail} />
                <Route path="/profile" component={Profile} />
                <Route path="/purchase/:imageID" component={Purchase} />
                <Route path="/tx/:txID" component={Transaction} />
                <Route path="/trades" component={Trades} />
                <Route path="/image" component={ImageView} />
                <Route path="/error" component={Error}/>
                <Route component={Error} />
              </Switch>
            </web3Context.Provider>  
          </BrowserRouter>
          :
          <NoWeb3Alt/>
        }
      </div>
    );
  }
}

export default App;