import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";

function Card({ state, walletConnected, Name, role, indx, eid, title, Email }) {
  const [voted, setVoted] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const { user } = useAuth();
  const { contract } = state ?? {};
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");  

  useEffect(() => {
    const storage = getStorage();
    try {
      const storageRef = ref(storage, `${Name}.jpg`);
        let url = getDownloadURL(storageRef);
        url.then((result) => {
            setImageUrl(result);
        }).catch(err => {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  
    //check if user has voted
    const checkVoted = async () => {
      try {
        const wallAdd = await ethereum.request({
          method: "eth_requestAccounts"
        })
        const voteCheckList = await contract.getVoteCheck(eid);
        const check = await contract.voterExists(voteCheckList, wallAdd);
        if (check) {
          setVoted(1);
          setIsButtonDisabled(true);
        }
      } catch (error) {
        console.log(error)
      }
    };
    checkVoted();
  }, []);

  const renderButton = () => {
    if (walletConnected) {
      return (
        <button
          className={`bg-[#93278F] text-white px-8 py-2
        hover:bg-[#5c0f59] ${voted ? "opacity-50 cursor-not-allowed" : ""}
        text-sm rounded-2xl`}
          onClick={vot}
          disabled={isButtonDisabled}
        >
          Vote
        </button>
      );
    }
  };
  const vot = async () => {
    alert("Voting for " + Name);
    try {
      
      //console.log(Name, role, contract);
      // const amount = { value: ethers.utils.parseEther("0.000001") };
      //contract
      //indx is the candidate id created by firebase
      const transaction = await contract.giveVote(indx, eid);
      await transaction.wait();
      const noOfVotes = await contract.getCountOfVotes(indx,eid);
      console.log(eid,":","no of votes",indx,":", noOfVotes.toString());
      alert("Successfully Voted for " + Name);
      
    } catch (err) {
      alert("You have already voted!")
    }

    setIsButtonDisabled(true);
  };

  return (
    <div className="flex flex-col shadow-lg max-h-[420px]">
      <div className="flex flex-col items-center ">
        <div className="h-[58px] w-[58px] rounded-full">
        <img src={imageUrl} className="rounded-full h-[60px] w-[60px]  mt-[10]"
        alt=""  referrerPolicy="no-referrer"/>
        </div>
        <h3>{Name}</h3>
        <h2 className="font-bold text-md mb-2">{role}</h2>

        <div className="flex mx-1 mb-4">
          {renderButton()}
          <button
            className="bg-white border-[1px] border-[#93278F] ml-2
                  text-sm rounded-2xl text-[#93278F] px-4 py-2"
            onClick={() =>
              router.push({
                pathname: "/CandidateDetails",
                query: {
                  name: Name,
                  role: role,
                  title: title,
                  image: imageUrl,
                  email: Email
                },
              })
            }
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Card;
