import React, { useState, useMemo } from 'react';
import type { Lecture } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import LectureModal from './LectureModal';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarHeader: React.FC<{
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}> = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between mb-4 px-1 sm:px-2 gap-3 sm:gap-0">
    <div className="flex items-center gap-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 w-48 text-left">
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      <button
        onClick={onToday}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        Today
      </button>
    </div>
    <div className="flex items-center">
      <button onClick={onPrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Previous month">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Next month">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
      </button>
    </div>
  </div>
);

const CalendarGrid: React.FC<{
  days: Date[];
  currentDate: Date;
  lecturesByDate: Map<string, Lecture[]>;
  onDayClick: (day: Date) => void;
}> = ({ days, currentDate, lecturesByDate, onDayClick }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="grid grid-cols-7 border-l border-t border-gray-200">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="py-2 text-center text-xs sm:text-sm font-semibold text-gray-500 border-r border-b bg-gray-50 border-gray-200">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
          {days.map((day, index) => {
            const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
            const lectures = lecturesByDate.get(dateStr) || [];
            const dayTotal = lectures.reduce((sum, lecture) => sum + lecture.amount, 0);
            
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.getTime() === today.getTime();

            return (
              <div
                key={index}
                className={`relative flex flex-col h-24 sm:h-36 p-1 sm:p-2 border-r border-b border-gray-200 cursor-pointer transition-colors ${
                  isCurrentMonth ? 'bg-white hover:bg-sky-50' : 'bg-gray-100 text-gray-400'
                }`}
                onClick={() => onDayClick(day)}
                aria-label={`Date ${day.getDate()}, ${lectures.length} lectures`}
              >
                <span className={`self-start text-xs sm:text-sm font-medium ${isToday ? 'bg-indigo-600 text-white rounded-full h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center font-bold' : 'w-6 sm:w-7 flex justify-center'}`}>
                  {day.getDate()}
                </span>
                <div className="flex-grow overflow-y-auto mt-1 space-y-1 pr-0.5 sm:pr-1" role="list">
                  {lectures.map(lecture => (
                    <div 
                        key={lecture.id} 
                        className="bg-indigo-100 text-indigo-800 text-[10px] sm:text-xs p-1 rounded-md truncate" 
                        title={lecture.title}
                        role="listitem"
                    >
                      {lecture.title}
                    </div>
                  ))}
                </div>
                {dayTotal > 0 && (
                  <div className="text-right text-[11px] sm:text-xs font-bold text-emerald-700 mt-1">
                    {dayTotal.toLocaleString()}₩
                  </div>
                )}
              </div>
            );
          })}
        </div>
    )
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lectures, setLectures] = useLocalStorage<Lecture[]>('lectures', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };
  
  const handleSaveLecture = (title: string, amount: number, id?: string) => {
    if (id) {
        setLectures(lectures.map(l => l.id === id ? { ...l, title, amount } : l));
    } else {
        if (!selectedDate) return;

        const newLecture: Lecture = {
          id: new Date().toISOString(),
          date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
          title,
          amount,
        };
        setLectures([...lectures, newLecture]);
    }
  };
  
  const handleDeleteLecture = (id: string) => {
    setLectures(lectures.filter(l => l.id !== id));
    handleModalClose();
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const { days, lecturesByDate, monthlyTotal } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const daysArray: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      day.setHours(0,0,0,0);
      daysArray.push(day);
    }

    const lecturesByDate = new Map<string, Lecture[]>();
    let currentMonthTotal = 0;
    lectures.forEach(lecture => {
      const lectureDate = new Date(lecture.date + 'T00:00:00'); // To handle timezone issues
      if(lectureDate.getFullYear() === year && lectureDate.getMonth() === month) {
        currentMonthTotal += lecture.amount;
      }
      
      const lecturesOnDate = lecturesByDate.get(lecture.date) || [];
      lecturesOnDate.push(lecture);
      lecturesByDate.set(lecture.date, lecturesOnDate);
    });

    return { days: daysArray, lecturesByDate, monthlyTotal: currentMonthTotal };
  }, [currentDate, lectures]);

  const goToPrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const selectedDateString = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '';
  const lecturesForSelectedDate = lecturesByDate.get(selectedDateString) || [];

  return (
    <div>
      <CalendarHeader currentDate={currentDate} onPrevMonth={goToPrevMonth} onNextMonth={goToNextMonth} onToday={goToToday} />
      <CalendarGrid days={days} currentDate={currentDate} lecturesByDate={lecturesByDate} onDayClick={handleDayClick} />
      {monthlyTotal > 0 && (
        <div className="mt-4 text-right pr-1 sm:pr-2">
            <p className="text-base sm:text-lg font-bold text-gray-700">
                Total for {currentDate.toLocaleString('default', { month: 'long' })}: 
                <span className="text-emerald-800 ml-2">{monthlyTotal.toLocaleString()}₩</span>
            </p>
        </div>
      )}
      {isModalOpen && selectedDate && (
        <LectureModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSaveLecture}
          onDelete={handleDeleteLecture}
          date={selectedDate}
          lectures={lecturesForSelectedDate}
        />
      )}
    </div>
  );
};

export default Calendar;
