import { useEffect, useState } from 'react';

export default function Widget() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(({ topDonors, giftedSubs, selfSubs }) => {
        const donationItems = topDonors.map(d => ({
          icon: d.icon,
          text: `${d.username} — ${d.total} ${d.currency}`,
        }));
        const giftItems = giftedSubs.map(s => ({
          icon: s.icon,
          text: `${s.user_name} — подарил ${s.count} подписок`,
        }));
        const selfItems = selfSubs.map(s => ({
          icon: s.icon,
          text: `${s.user_name} — подписан ${s.months} мес.`,
        }));
        setItems([...donationItems, ...giftItems, ...selfItems]);
      });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCurrentIndex(i => (i + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items]);

  if (!items.length) return <div>Загрузка...</div>;

  return (
    <div className="h-screen flex items-center justify-center bg-transparent">
      <div className="relative bg-white rounded-2xl px-6 py-3 shadow-lg" style={{ boxShadow: '10px 10px 0 rgba(68,0,102,0.8)' }}>
        <div key={currentIndex} className="animate-fade-in-out">
          <span className="mr-2">{items[currentIndex].icon}</span>
          {items[currentIndex].text}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeInOut {0%,100%{opacity:0}10%,90%{opacity:1}}
        .animate-fade-in-out {animation:fadeInOut 5s ease infinite;}
      `}</style>
    </div>
  );
}
