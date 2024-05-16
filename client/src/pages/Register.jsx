
import '../index.css';
import {useState,useEffect} from "react";
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';

function App() {

  const navigate = useNavigate()

  const [currentTime, setCurrentTime] = useState('');
  const [currentDayDate, setCurrentDayDate] = useState('');

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
      const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][now.getMonth()];
      const date = now.getDate();
      const hours = String(now.getHours()).padStart(2, '0'); // Ensure double digits for hours
      const minutes = String(now.getMinutes()).padStart(2, '0'); // Ensure double digits for minutes
      const seconds = String(now.getSeconds()).padStart(2, '0'); // Ensure double digits for seconds
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      setCurrentDayDate(`${dayOfWeek}, ${month} ${date}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function registerUser(e){
    e.preventDefault();
    const response = await fetch('https://dobbyserver.onrender.com/api/register',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password
      }),
    })

    const data= await response.json();
    
    if(data.status==='ok'){
      navigate('/login')
    }

  }

  const Redirect = () => {
    navigate('/login')
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
        <div className="absolute top-0 left-0 mt-4 ml-4" style={{marginLeft:'550px',marginTop:'130px'}}>
          <div className="text-white font-mono font-bold text-7xl">{currentTime}</div>
          <div className="text-white font-mono font-bold text-2xl" style={{marginLeft:'40px'}}>{currentDayDate}</div>
        </div>
        <Draggable
                onStart={() => {
                    document.body.style.overflow = 'hidden';
                  }}
                  onStop={() => {
                    document.body.style.overflow = 'visible';
                  }}
        >
        <div className="bg-black font-mono p-8 shadow-md w-96 z-10 rounded-sm" style={{marginTop:'130px'}}>
            
            <form className="space-y-4" onSubmit={registerUser}>
                <div>
                    
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}              
                        className="px-3 py-2 bg-gray-700 rounded-md w-full text-white focus:ring-2 focus:ring-yellow-500"
                    />
                </div>
                <div>
                    
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        className="px-3 py-2 bg-gray-700 rounded-md w-full text-white focus:ring-yellow-500"
                        
                    />
                </div>
                <div>
                    
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        className="px-3 py-2 bg-gray-700 rounded-md w-full text-white focus:ring-yellow-500"
                    />
                </div>
                <div className='flex flex-row'>
                  <button
                      type="submit"
                      className="bg-yellow-800  hover:bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none "
                  >
                      Register
                  </button>
                  <div onClick={Redirect} className='text-white pl-20 pt-2 cursor-pointer'>
                      <p>Or Login.</p>
                  </div>
                </div>
            </form>
        </div>
        </Draggable>
    </main>
);
}

export default App;
