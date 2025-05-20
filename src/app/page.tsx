
import LoginCards from "./components/loginCards";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
       
       
       <img src="https://w7.pngwing.com/pngs/114/613/png-transparent-guntur-vijayawada-bus-nellore-andhra-pradesh-state-road-transport-corporation-bus.png"
        alt="" 
        className="rounded-full w-42 h-42 sm:w-40 sm:h-40 object-cover mt-auto"
        />

      

        <div className="flex  items-center justify-center w-full h-full">
          <LoginCards 
          imageSrc="https://cdn-icons-gif.flaticon.com/17093/17093008.gif"
          label= "Student login"
          redirectTO="/student" 
          />
          <LoginCards 
          imageSrc= "https://cdn-icons-gif.flaticon.com/18863/18863653.gif"
          label = "Admin login"
          redirectTO="/admin"
          />
        </div>
        
        
      
    </div>
  );
}
