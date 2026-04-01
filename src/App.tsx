import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import PlantBankPage from './pages/PlantBankPage';
import MyGardenPage from './pages/MyGardenPage';
import GardenBedsPage from './pages/GardenBedsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Header />
        <main className="md:pt-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/plants" element={<PlantBankPage />} />
            <Route path="/my-garden" element={<MyGardenPage />} />
            <Route path="/beds" element={<GardenBedsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
