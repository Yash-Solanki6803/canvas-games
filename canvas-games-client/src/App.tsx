import Home from "./pages/Home";
import BallShooter from "./pages/BallShooter";
import NotFound from "./pages/NotFound";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<Home />} />
        <Route path="ball-shooter-v1" element={<BallShooter />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
