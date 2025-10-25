
import React from 'react';
import Calendar from './components/Calendar';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent text-gray-800 font-sans py-4 sm:py-8">
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Lecture Calendar</h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600">Schedule lectures and track your earnings.</p>
        </header>
        <main>
          <Calendar />
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Data is stored locally in your browser.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;