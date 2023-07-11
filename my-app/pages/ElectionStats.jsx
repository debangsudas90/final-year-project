import React, { useEffect, useState } from 'react'
import { collection, doc, getDocs, getFirestore, onSnapshot, query, setDoc } from 'firebase/firestore'

import Sidebar from '../components/Sidebar/Sidebar';
import AdminSidebar from '../components/Sidebar/AdminSidebar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import { db } from '../utils/Firebase';
import { Divider } from '@mui/material';

import abi from "../contract/artifact/contracts/new_vote.sol/new_vote.json";
import { ethers } from "ethers";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

import {Doughnut} from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function ElectionStats() {

  const [show, setShow] = useState({name: null, open: true});
  const [winner, setWinner] = useState("");
  const [candidate, setCandidate] = useState([])
  const [state, setState] = useState({
    provide: null,
    signer: null,
    contract: null,
  });
  const [account, setAccount] = useState("None");
  const [cardDetails, setCardDetails] = useState([]);
  const [elections,setElections]=useState([]); 

  //Modal styles
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    borderRadius: "10px",
    boxShadow: 24,
    p: 4,
  };

  //fetch candidate details

  const electionQuery=collection(db,'Elections');
  useEffect(()=>{
   
    const getElections = async () => {
      const getElections = await getDocs(electionQuery);
      const elections = getElections.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setElections(elections);
      elections.map(async (election) => {
        const getCandidates = await getDocs(
          collection(db, "Elections", election.id, "Candidates")
        );
        // console.log("election", election.id);
        const candidates = getCandidates.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCardDetails((prev) => [...prev, ...candidates]);
        // console.log("candidates", candidates);
      });
    };
    getElections();
  },[])

  // console.log(elections)
  // console.log(cardDetails)

  //contract instance
  useEffect(() => {
    
    const connectWallet = async () => {
      try {
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const contractABI = abi.abi;
        const provide = new ethers.providers.Web3Provider(ethereum);
        const signer = provide.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const account = await ethereum.request({
          method: "eth_requestAccounts"
        })
        setAccount(account);
        setState({ provide, signer, contract });

      } catch (err) {
        console.error(err);
      }
    };

    connectWallet()
    
  }, [])


  // getting count of candidates
  useEffect(() => {

    // const votelist = await state.contract.getCountOfVotes("c1761f5b-f481-4924-b011-08b984c653aa","c1fd886c-a6b0-4fd8-a283-84f3055c99e9");
    // console.log(JSON.parse(votelist))
    
    const candidateList = async () => {

      const candidateData = {};
      
      await Promise.all(
        elections.map(async (doc) => {
          console.log(doc.id);

          const candi = await Promise.all(
            cardDetails.map(async (can) => {
              try {
                if (can.electionId === doc.id) {
                  const votes = await state.contract.getCountOfVotes(can.id, doc.id);
                  return {
                    name: can.Name,
                    votes: votes.toNumber()
                  };
                }
              } catch (error) {
                console.log(error)
              }
            })
          );

          console.log(candi);
          candidateData[doc.id] = candi.filter((c) => c !== undefined);
        })
      );

      // console.log(candidateData);
      setCandidate(candidateData);
    };

    cardDetails && candidateList()

  }, [elections, cardDetails, state.contract])

  console.log(candidate)

  // const votesArray = candidate.map((candidate) => candidate.votes);
  // const candidateArray = candidate.map((candidate) => candidate.name);
  // const maxVotes = Math.max(...votesArray);
//   console.log(maxVotes)

  // Calculate total votes
  const totalVotes = (eid) => {
    return candidate[eid].reduce((acc, curr) => acc + curr.votes, 0)
  }

  //chartjs

  const getRandomVioletColor = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = `hsl(${Math.floor(Math.random() * 361)}, 60%, 50%)`;
      colors.push(color);
    }
    return colors;
  };
  
  const chartData = Object.keys(candidate).map((eid, index) => ({
    labels: candidate[eid].map((candi) => candi.name),
    datasets: [
      {
        data: candidate[eid].map((candi) => candi.votes),
        backgroundColor: getRandomVioletColor(candidate[eid].length),
        borderColor: '#93278F',
      },
    ],
    electionTitle: elections.find((doc) => doc.id === eid).title,
  }));

  const options = {
    responsive: true
  }

  const handleOpen = async(name) => {
    const length = await elections.length
    for (let index = 0; index < length; index++) {
      if(elections[index].title === name){
        setShow({name: name, open: name === show.name ? !show.open : show.open})
      }
      
      
    }
  }

  return (
    <div className="flex w-screen m-0  h-screen">
      <Sidebar/>
      <div className="flex flex-col w-screen ml-[183px] z-50">
        <div
          className="px-8 py-4 shadow-lg max-h-[80px] fixed 
          top-0 z-40  w-full flex  bg-opacity-100"
        >
          <input
            className="w-[40rem] px-6
            h-10 border-[1.7px] border-gray-400 outline-none rounded-xl"
            type="search"
            name="search"
            id="search"
            placeholder="Search"
          />
        </div>
        

        <Card variant="outlined" sx={{overflow: "auto"}}>
      <CardContent className='mt-[7%]' sx={{ml: "20px"}}>
        <Typography variant="h4" component="h2" align = "center" sx={{ color:"#93278F", fontWeight: "bold"}} gutterBottom>
          Election Stats
        </Typography>
        <Divider />
        {/* multiple vote support */}
        {chartData.map((data, index) => (
        <div key={index} className="chart-container" style={{
          width: "30%", 
          height: "30%", 
          margin: "0 auto", 
          paddingLeft: "40px"
          }}
        >
          <Typography variant="h6" component="h2" align = "center" sx={{ 
            color:"#2F0745", 
            fontWeight: "bold", 
            mt:"10px", 
            mb: "20px"
            }}
            gutterBottom
            onClick={() => setShow(() => handleOpen(data.electionTitle))}
          >
            {data.electionTitle}
          </Typography>
          {console.log(show)}
          {show.name === data.electionTitle && show.open &&
          <Doughnut 
            data={data} 
            options={options} 
            className="mb-4"
          />
          }
          
          <Divider />
        </div>
      ))}
      </CardContent>
      

    </Card>
      

        
        
          
        </div>
      </div>
  )
}

export default ElectionStats