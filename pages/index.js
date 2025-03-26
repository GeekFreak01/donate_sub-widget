// pages/index.js
import { useEffect, useState } from 'react';

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

  return (
    <div className="widget-container">
      <div key={currentIndex} className="item animate-fade-in-out">
        <span className="icon">{items[currentIndex].icon}</span>
        <span className="text">{items[currentIndex].text}</span>
      </div>

      <style jsx>{`
        .widget-container {
          width: 320px;
          height: 50px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 4px 4px 0px rgba(68, 0, 102, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: 'Comic Sans MS', Comic Sans, cursive;
        }
        .item {
          display: flex;
          align-items: center;
          font-size: 14px;
          white-space: nowrap;
        }
        .icon {
          margin-right: 8px;
          font-size: 18px;
        }
        .loading {
          width: 320px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Comic Sans MS', Comic Sans, cursive;
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
