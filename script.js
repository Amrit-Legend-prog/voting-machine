const CONTRACT_ADDRESS = "0x8CeACFC362D86730C7fF161033e4ccbBeddF12df"; // Replace with your actual deployed contract address
const ABI = [
  {
    "inputs": [{ "internalType": "string[]", "name": "candidateNames", "type": "string[]" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "endElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinner",
    "outputs": [
      { "internalType": "string", "name": "winnerName", "type": "string" },
      { "internalType": "uint256", "name": "winnerVotes", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "getVotes",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "candidateIndex", "type": "uint256" }],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string[]", "name": "newCandidates", "type": "string[]" }],
    "name": "resetElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "electionEnded",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

let provider, signer, contract;

document.getElementById("connectButton").onclick = connectWallet;
document.getElementById("voteButton").onclick = vote;
document.getElementById("endButton").onclick = endElection;
document.getElementById("winnerButton").onclick = getWinner;
document.getElementById("resetButton").onclick = resetElection;

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask.");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const address = await signer.getAddress();
  document.getElementById("walletAddress").innerText = `Connected: ${address}`;
  loadCandidates();
}

async function loadCandidates() {
  const container = document.getElementById("candidatesList");
  container.innerHTML = "";

  for (let i = 0; i < 20; i++) {
    try {
      const [name, votes] = await contract.getVotes(i);
      const div = document.createElement("div");
      div.className = "candidate";
      div.innerHTML = `<strong>${i}: ${name}</strong><br>Votes: ${votes}`;
      container.appendChild(div);
    } catch {
      break;
    }
  }
}

async function vote() {
  const index = document.getElementById("voteIndex").value;
  if (index === "") return alert("Enter a candidate index.");

  try {
    const tx = await contract.vote(index);
    await tx.wait();
    alert("✅ Vote cast successfully.");
    loadCandidates();
  } catch (err) {
    alert("Voting failed: " + (err.reason || err.message));
  }
}

async function endElection() {
  try {
    const tx = await contract.endElection();
    await tx.wait();
    alert("🛑 Election ended.");
  } catch (err) {
    alert("Failed to end election: " + (err.reason || err.message));
  }
}

async function getWinner() {
  try {
    const [name, votes] = await contract.getWinner();
    document.getElementById("winnerResult").innerText = `🏆 Winner: ${name} with ${votes} votes.`;
  } catch (err) {
    alert("Error getting winner: " + (err.reason || err.message));
  }
}

async function resetElection() {
  try {
    const input = prompt("Enter candidate names (comma-separated):");
    if (!input) return;

    const names = input.split(",").map(name => name.trim()).filter(n => n);
    if (names.length === 0) return alert("Please enter valid candidate names.");

    const tx = await contract.resetElection(names);
    await tx.wait();
    alert("🔄 Election has been reset.");
    loadCandidates();
  } catch (err) {
    alert("Reset failed: " + (err.reason || err.message));
  }
}
