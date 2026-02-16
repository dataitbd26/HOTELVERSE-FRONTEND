
import { createRoot } from 'react-dom/client'
import './index.css'
import Routers from './Routes/Routers'
import { BrowserRouter } from 'react-router'







createRoot(document.getElementById('root')).render(
   <BrowserRouter>
      <Routers />
    </BrowserRouter>
)
