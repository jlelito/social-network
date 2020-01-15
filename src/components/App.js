import React, { useEffect, useState } from 'react';
import './App.css';
import Navbar from './Navbar';
import { getWeb3 } from './../utils.js';
import SocialNetwork from '../abis/SocialNetwork.json';
import Identicon from 'identicon.js';



function App(){


  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [posts, setPosts] = useState([]);
  

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SocialNetwork.networks[networkId];
      const contract = new web3.eth.Contract(
        SocialNetwork.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      
      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
     
      
    }
    init();
    window.ethereum.on('accountsChanged', accounts => {
      setAccounts(accounts);
      window.location.reload();
    });
  }, []);

  const isReady = () => {
    return (
      typeof contract !== 'undefined' 
      && typeof web3 !== 'undefined'
      && typeof accounts !== 'undefined'
    );
  }

  useEffect(() => {
    if(isReady()) {
      
      updatePosts();
    }
  }, [accounts, contract, web3]);

  async function updatePosts() {
    const postCount = parseInt(await contract.methods.postCount().call());

    const posts = [];
    for(let i = 0; i < postCount; i++) { 
      posts.push(await contract.methods.posts(i).call());
    }
    
    setPosts(await Promise.all(posts));
    
  }


  async function createPost(e) {
      e.preventDefault();
      
      const content = e.target.elements[0].value;
      await contract.methods.createPost(content).send({ from: accounts[0] })
      .once('receipt', (receipt) => {
        window.location.reload();
      })
    }
    
  async function tipPost(id){
        
      const tipAmount = web3.utils.toWei('1','Ether');
      await contract.methods.tipPost(id).send({ from: accounts[0], value: tipAmount })
      .once('receipt', (receipt) => {
        window.location.reload();
      })
      
      
    }


  

  if (!isReady()) {
    return <div id="loader" className = "text-center mt-5"><p>Loading...</p></div>
  }

    return (
      <div>
        <Navbar account={accounts[0]}/>
        
          <div className="container-fluid mt-5">
                <div className="row">
                    <main role="main" className="col-lg-12 ml-auto mr-auto" style={{maxWidth:'500px'}}>
                    <div className="content mr-auto ml-auto">
                        <form onSubmit={e =>  createPost(e) }>
                            <div className="form-group mr-sm-2">
                                <input
                                    id="content"
                                    type="text"
                                    className="form-control"
                                    placeholder="What's on your Mind?"
                                    required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block">Share</button>
                        </form>
                        <br/>
                        { posts.map((post,key) => {
                        return(
                            <div className="card mb-4" key={key} >
                            <div className="card-header">
                                <img className="mr-2" 
                                width='30' 
                                height="30" 
                                src={`data:image/png;base64,${new Identicon(post.author, 30).toString()}`}
                                />
                            <small className="text-muted">{post.author}</small>
                            </div>
                            <ul id="postList" className="list-group list-group-flush">
                            <li className="list-group-item">
                                <p>{post.content}</p>
                            </li>
                                <li key={key} className="list-group-item py-2">
                                <small className="float-left mt-1 text-muted">TIPS: {web3.utils.fromWei(post.tipAmount.toString(),'Ether')} ETH
                                </small>

                                <button className="btn btn-primary btn-sm float-right pt-0 mr-1" onClick ={(event) => tipPost(post.id)}>
                                
                                  <span>
                                      TIP 1 ETH
                                  </span>
                                  
                                </button>
                                
                                
                            </li>
                            </ul>
                        </div>


                            )
                        })}
                    </div>
                    </main>
                </div>
            </div>
           
           
           
           
        
      </div>
    );
}   
  


export default App;
