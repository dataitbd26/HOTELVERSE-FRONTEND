import { Routes, Route } from "react-router-dom";




import Login from "../Component/Login";

export default function Routers() {

  return (

    <Routes>
      
        {/* Index Route */}
        <Route index element={<Login/>} />

     
    </Routes>
  );
}
