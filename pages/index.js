// pages/index.js
import { useEffect, useState } from 'react';

export default function Widget() {
  const [data, setData] = useState({ donations: [], subs: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        const donationItems = data.donations.map(d => ({
          icon: '💰',
          text: `${d.username} - ${d.amount} ${d.currency}`,
        }));

        const giftSubs = data.subs.filter(sub => sub.is_gift).map(s => ({
          icon: '🎁',
          text: `${s.user_name} - подарил ${s.total} подписок`,
        }));

        const selfSubs = data.subs.filter(sub => !sub.is_gift).map(s => ({
          icon: '👤',
          text: `${s.user_name} - подписан ${s.cumulative_months} мес.`,
        }));

        setItems([...donationItems, ...giftSubs, ...selfSubs]);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(i => (i + 1) % items.length);
    }, 5000); // смена каждые 5 сек.

    return () => clearInterval(interval);
  }, [items]);

  if (items.length === 0) return <div>Загрузка...</div>;

  return (
    <div className="h-screen flex items-center justify-center bg-transparent">
      <div className="relative bg-white rounded-2xl px-6 py-3 text-black shadow-lg" style={{ boxShadow: '10px 10px 0 rgba(68,0,102,0.8)' }}>
        <div key={currentIndex} className="animate-fade-in-out">
          <span className="mr-2">{items[currentIndex].icon}</span>
          {items[currentIndex].text}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0%,100% { opacity: 0; }
          10%,90% { opacity: 1; }
        }
        .animate-fade-in-out {
          animation: fadeInOut 5s ease infinite;
        }
      `}</style>
    </div>
  );
}
