
import { useState, useEffect } from "react";
import Web3 from "web3";

const CONTRACT_ADDRESS = "0xe0711cc6FbF29F01581EB00149532E767EcAd741";
const ABI = [
  {
    inputs: [],
    name: "stake",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "stakes",
    outputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

export default function App() {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(null);
  const [stakeData, setStakeData] = useState({ amount: 0, timestamp: 0 });

  const web3 = typeof window !== "undefined" && new Web3(window.ethereum);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
      alert("Wallet connected");
    } else {
      alert("MetaMask not detected");
    }
  };

  const fetchStake = async () => {
    if (!wallet) return;
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    const stake = await contract.methods.stakes(wallet).call();
    setStakeData({
      amount: web3.utils.fromWei(stake.amount, "ether"),
      timestamp: stake.timestamp
    });
  };

  useEffect(() => {
    if (wallet) fetchStake();
  }, [wallet]);

  const stakeBNB = async () => {
    if (!wallet) return alert("Connect your wallet first");
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    try {
      await contract.methods.stake().send({
        from: wallet,
        value: web3.utils.toWei(amount, "ether")
      });
      alert("Staked successfully");
      fetchStake();
    } catch (err) {
      alert("Staking failed");
      console.error(err);
    }
  };

  const withdrawBNB = async () => {
    if (!wallet) return alert("Connect your wallet first");
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    try {
      await contract.methods.withdraw().send({ from: wallet });
      alert("Withdraw successful");
      fetchStake();
    } catch (err) {
      alert("Withdraw failed");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: "24px", marginBottom: 20 }}>QARI Staking Dashboard</h1>
      <div style={{ marginBottom: 20 }}>
        <label>Amount to Stake (BNB)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.01"
          style={{ display: "block", width: "100%", padding: 10, marginTop: 8 }}
        />
      </div>
      <button onClick={stakeBNB} style={{ marginRight: 10 }}>Stake Now</button>
      <button onClick={withdrawBNB} style={{ marginRight: 10 }}>Withdraw</button>
      <button onClick={connectWallet}>
        {wallet ? wallet.slice(0, 6) + "..." + wallet.slice(-4) : "Connect Wallet"}
      </button>
      <div style={{ marginTop: 20 }}>
        <p><strong>Your Stake:</strong> {stakeData.amount} BNB</p>
        <p><strong>Staked Since:</strong> {stakeData.timestamp !== "0" ? new Date(stakeData.timestamp * 1000).toLocaleString() : "-"}</p>
      </div>
    </div>
  );
}
