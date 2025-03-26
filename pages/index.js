import { FaGift, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function Widget() {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch('/api/data').then(r=>r.json()).then(({ items })=> setItems(items));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % items.length), 4000);
    return ()=>clearInterval(id);
  }, [items]);

  if (!items.length) return <div className="loading">Загрузка...</div>;

  const Icon = items[idx].icon === '🎁'
    ? FaGift
    : items[idx].icon === '👤'
    ? FaUser
    : FaMoneyBillWave;

  return (
    <div className="widget">
      <Icon className="icon" />
      <span>{items[idx].text}</span>
      <style jsx>{`
        .widget {
          width: 320px; height: 50px;
          background: #fff; border-radius: 16px;
          box-shadow: 4px 4px 0 rgba(68,0,102,0.8);
          display:flex; align-items:center; padding:0 12px;
          font-family:'Comic Sans MS',cursive; font-size:14px;
        }
        .icon { margin-right:8px; font-size:20px; color:#440066; }
      `}</style>
    </div>
  );
}
