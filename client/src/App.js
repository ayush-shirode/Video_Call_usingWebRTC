import { Routes, Route } from 'react-router-dom';

import './App.css';

import {SocketProvider} from "./providers/socket"
import { PeerProvider } from "./providers/Peer"

import Homepage from './pages/Home';
import RoomPage from './pages/Room';

function App() {
  return (
    <SocketProvider>
      <PeerProvider>
        <div className="App">
          <Routes>
              <Route path='/' element={<Homepage />} />
              <Route path='/room/:roomId' element={<RoomPage />} />
          </Routes>
        </div>
      </PeerProvider>
    </SocketProvider>
  );
}

export default App;
