import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaBackspace } from 'react-icons/fa';

const Calculator = ({ onClose }) => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 100 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    const calculatorRef = useRef(null);

    // Draggable logic
    const handleMouseDown = (e) => {
        if (e.target.closest('.calculator-header')) {
            setIsDragging(true);
            const rect = calculatorRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                
                // Boundary checks
                const maxX = window.innerWidth - (calculatorRef.current?.offsetWidth || 300);
                const maxY = window.innerHeight - (calculatorRef.current?.offsetHeight || 400);
                
                setPosition({
                    x: Math.min(Math.max(0, newX), maxX),
                    y: Math.min(Math.max(0, newY), maxY)
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    const handleNumber = (num) => {
        setDisplay(prev => prev === '0' ? String(num) : prev + num);
    };

    const handleOperator = (op) => {
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const calculate = () => {
        try {
            // Safe evaluation of the equation
            const fullEquation = equation + display;
            // Replace visual operators with JS operators if needed (though +, -, *, / are standard)
            // eslint-disable-next-line no-new-func
            const result = new Function('return ' + fullEquation)();
            
            // Format result to avoid long decimals
            const formattedResult = String(Math.round(result * 100000000) / 100000000);
            
            setDisplay(formattedResult);
            setEquation('');
        } catch (error) {
            setDisplay('Error');
            setEquation('');
        }
    };

    const clear = () => {
        setDisplay('0');
        setEquation('');
    };

    const backspace = () => {
        setDisplay(prev => {
            if (prev.length === 1 || prev === 'Error') return '0';
            return prev.slice(0, -1);
        });
    };

    const handleDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(prev => prev + '.');
        }
    };

    const btnClass = "h-12 text-lg font-medium rounded-lg hover:bg-opacity-80 transition-colors active:scale-95 flex items-center justify-center";
    const numBtnClass = `${btnClass} bg-gray-100 text-gray-800 hover:bg-gray-200`;
    const opBtnClass = `${btnClass} bg-blue-100 text-blue-700 hover:bg-blue-200`;
    const actionBtnClass = `${btnClass} bg-red-100 text-red-600 hover:bg-red-200`;

    return (
        <div 
            ref={calculatorRef}
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                position: 'fixed',
                zIndex: 1000
            }}
            className="w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        >
            {/* Header / Drag Handle */}
            <div 
                className="calculator-header bg-gray-800 p-3 flex justify-between items-center cursor-move select-none"
                onMouseDown={handleMouseDown}
            >
                <span className="text-white font-medium text-sm">Calculator</span>
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <FaTimes />
                </button>
            </div>

            {/* Display */}
            <div className="bg-gray-50 p-4 text-right border-b border-gray-200">
                <div className="text-xs text-gray-500 h-4 overflow-hidden">{equation}</div>
                <div className="text-3xl font-bold text-gray-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {display}
                </div>
            </div>

            {/* Keypad */}
            <div className="p-4 grid grid-cols-4 gap-2 bg-white">
                <button onClick={clear} className={`${actionBtnClass} col-span-2`}>AC</button>
                <button onClick={backspace} className={actionBtnClass}><FaBackspace /></button>
                <button onClick={() => handleOperator('/')} className={opBtnClass}>÷</button>

                <button onClick={() => handleNumber(7)} className={numBtnClass}>7</button>
                <button onClick={() => handleNumber(8)} className={numBtnClass}>8</button>
                <button onClick={() => handleNumber(9)} className={numBtnClass}>9</button>
                <button onClick={() => handleOperator('*')} className={opBtnClass}>×</button>

                <button onClick={() => handleNumber(4)} className={numBtnClass}>4</button>
                <button onClick={() => handleNumber(5)} className={numBtnClass}>5</button>
                <button onClick={() => handleNumber(6)} className={numBtnClass}>6</button>
                <button onClick={() => handleOperator('-')} className={opBtnClass}>−</button>

                <button onClick={() => handleNumber(1)} className={numBtnClass}>1</button>
                <button onClick={() => handleNumber(2)} className={numBtnClass}>2</button>
                <button onClick={() => handleNumber(3)} className={numBtnClass}>3</button>
                <button onClick={() => handleOperator('+')} className={opBtnClass}>+</button>

                <button onClick={() => handleNumber(0)} className={`${numBtnClass} col-span-2`}>0</button>
                <button onClick={handleDecimal} className={numBtnClass}>.</button>
                <button onClick={calculate} className={`${btnClass} bg-blue-600 text-white hover:bg-blue-700`}>=</button>
            </div>
        </div>
    );
};

export default Calculator;