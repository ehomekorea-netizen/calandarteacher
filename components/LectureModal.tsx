import React, { useState, useEffect, useMemo } from 'react';
import type { Lecture } from '../types';

interface LectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, amount: number, id?: string) => void;
  onDelete: (id: string) => void;
  date: Date;
  lectures: Lecture[];
}

interface LectureFormProps {
    lecture: Lecture | null;
    onSave: (title: string, amount: number) => void;
    onCancel: () => void;
    onDelete?: (id: string) => void;
}

const LectureForm: React.FC<LectureFormProps> = ({ lecture, onSave, onCancel, onDelete }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (lecture) {
            setTitle(lecture.title);
            setAmount(String(lecture.amount));
        } else {
            setTitle('');
            setAmount('');
        }
        setError('');
    }, [lecture]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!title.trim()) {
          setError('제목을 비워둘 수 없습니다.');
          return;
        }
        if (isNaN(parsedAmount) || parsedAmount < 0) {
          setError('유효한 음수가 아닌 금액을 입력하세요.');
          return;
        }
        setError('');
        onSave(title, parsedAmount);
    };

    const handleDelete = () => {
        if (lecture && onDelete && window.confirm('이 강의를 삭제하시겠습니까?')) {
            onDelete(lecture.id);
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900">{lecture ? '강의 수정' : '새 강의 추가'}</h3>
            
            <fieldset className="mt-6 space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        강의 제목
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 sm:text-sm transition-shadow duration-200"
                        placeholder="예: 리액트 입문"
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        금액 (₩)
                    </label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 sm:text-sm transition-shadow duration-200"
                        placeholder="예: 50000"
                        step="1"
                        min="0"
                    />
                </div>
            </fieldset>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
          <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-lg">
            {lecture && (
                <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mr-auto"
                >
                    삭제
                </button>
            )}
            <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                취소
            </button>
            <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 inline-flex justify-center items-center bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {lecture ? '변경 사항 저장' : '강의 저장'}
            </button>
          </div>
        </form>
    );
};


const LectureModal: React.FC<LectureModalProps> = ({ isOpen, onClose, onSave, onDelete, date, lectures }) => {
  type View = 'list' | 'form';
  const [view, setView] = useState<View>('list');
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    if (isOpen) {
        setView('list');
        setSelectedLecture(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddNew = () => {
    setSelectedLecture(null);
    setView('form');
  };

  const handleEdit = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setView('form');
  };

  const handleSaveForm = (title: string, amount: number) => {
    onSave(title, amount, selectedLecture?.id);
    setView('list');
  };
  
  const handleDeleteForm = (id: string) => {
      onDelete(id);
  }

  const dailyTotal = useMemo(() => lectures.reduce((sum, lec) => sum + lec.amount, 0), [lectures]);
  
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {view === 'list' ? (
          <div>
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 id="modal-title" className="text-lg font-semibold text-gray-900">강의 목록</h3>
                        <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600" aria-label="Close modal">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>
            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                {lectures.length > 0 ? (
                    <ul className="space-y-3">
                        {lectures.map(lecture => (
                            <li key={lecture.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">{lecture.title}</p>
                                    <p className="text-sm text-gray-600">{lecture.amount.toLocaleString()}₩</p>
                                </div>
                                <button onClick={() => handleEdit(lecture)} className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600" aria-label={`Edit ${lecture.title}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-8">이 날짜에 강의가 없습니다.</p>
                )}
            </div>
            <div className="bg-gray-50 px-4 sm:px-6 py-4 flex items-center justify-between rounded-b-lg">
                 <div>
                    <span className="text-sm font-medium text-gray-600">일일 합계: </span>
                    <span className="font-bold text-emerald-700">{dailyTotal.toLocaleString()}₩</span>
                 </div>
                 <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    새 강의 추가
                  </button>
            </div>
          </div>
        ) : (
            <LectureForm 
                lecture={selectedLecture}
                onSave={handleSaveForm}
                onCancel={() => setView('list')}
                onDelete={handleDeleteForm}
            />
        )}
      </div>
    </div>
  );
};

export default LectureModal;
