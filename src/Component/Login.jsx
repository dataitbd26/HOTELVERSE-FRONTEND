import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
 




const [email, setEmail] = useState(null);
const [password, setPassword] = useState(null);


 


 

//   HandleloginHere
  const handleLogin = (e) => {
    e.preventDefault();
    

    const loginInfo = {email, password};
    console.log(loginInfo)

   
  };





  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">

      {/* Glass Card */}
      <div className="backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl shadow-2xl w-full max-w-md p-8 transition-all duration-500 hover:scale-105">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
         <div>
  <label className="text-white font-medium">Email</label>
  <input
    name="email"
    value={email}
    onChange={(e)=> setEmail(e.target.value)}
    type="email"
    placeholder="Enter your email"
    required
    className="input input-bordered w-full mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300"
  />
</div>


          {/* Password */}
          <div className="relative">
            <label className="text-white font-medium">Password</label>
            
            <input
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              className="input input-bordered w-full mt-1 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300"
            />

            {/* Eye Icon */}
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 cursor-pointer text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <a className="text-white text-sm hover:underline cursor-pointer">
              Forgot password?
            </a>
          </div>
            
          {/* Login Button */}
         <button
  type="submit"
  className="btn w-full bg-pink-500 hover:bg-pink-600 text-white transition-all duration-300"
>
  Login
</button>


          {/* Divider */}
          <div className="divider text-white">OR</div>

          {/* Social Login */}
          <button
            type="button"
            className="btn w-full bg-white text-black hover:bg-gray-200 transition-all duration-300"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
