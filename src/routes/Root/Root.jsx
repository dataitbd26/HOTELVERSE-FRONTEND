import React from 'react';
import { Outlet } from "react-router-dom";

const Root = () => {
    return (
        <div>
           
        {/* Dynamic section */}
        <main>
            <Outlet />
        </main>

      
    </div>
    );
};

export default Root;