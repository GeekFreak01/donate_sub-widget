// pages/index.js
import { useEffect, useState } from 'react';
import { FaGift, FaUser, FaMoneyBillWave } from 'react-icons/fa';

export default function Widget() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(({ items }) => setItems(items))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentIndex(i => (i + 1) % items.length), 4000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items.length) return <div className="loading">Загрузка...</div>;

  const { icon, text } = items[currentIndex];
  const IconComponent =
    icon === '🎁' ? FaGift :
    icon === '👤' ? FaUser :
    FaMoneyBillWave;

  return (
    <div className="widget-container">
      <div className="item animate-fade-in-out">
        <IconComponent className="icon" />
        <span className="text">{text}</span>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap');

        .widget-container {
          width: 320px;
          height: 50px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 4px 4px 0 rgba(68, 0, 102, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          font-weight: 900;
        }
        .item {
          display: flex;
          align-items: center;
          font-size: 14px;
          white-space: nowrap;
        }
        .icon {
          margin-right: 8px;
          font-size: 20px;
          color: #440066;
        }
        .text {
          color: #000;
        }
        .loading {
          width: 320px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-weight: 900;
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 1; }
        }
        .animate-fade-in-out {
          animation: fadeInOut 4s ease infinite;
        }
      `}</style>
    </div>
  );
}
