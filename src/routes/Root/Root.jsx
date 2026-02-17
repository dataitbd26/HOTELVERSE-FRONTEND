import React from 'react';
import { Outlet } from "react-router-dom";
const Root = () => {
    return (
        <div>
        {/* Dynamic section */}
        <div>
            <Outlet />
        </div>
    </div>
    );
};

export default Root;