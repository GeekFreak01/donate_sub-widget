import axios from 'axios';

let twitch_token = null;

async function getTwitchToken() {
  if (twitch_token) return twitch_token;

  const { data } = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`
  );
  twitch_token = data.access_token;
  return twitch_token;
}

export default async function handler(req, res) {
  try {
    // Получаем токен DonationAlerts из переменной окружения (его вы получили вручную)
    const daToken = process.env.DA_ACCESS_TOKEN;
    
    // Запрашиваем донаты от DonationAlerts
    const { data: donationsResponse } = await axios.get(
      'https://www.donationalerts.com/api/v1/alerts/donations',
      { headers: { Authorization: `Bearer ${daToken}` } }
    );

    // Фильтруем донаты за последнюю неделю
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentDonations = donationsResponse.data.filter(donation => {
      const donationDate = new Date(donation.created_at);
      return donationDate >= oneWeekAgo;
    });

    // Агрегируем донаты по username и добавляем иконку "💰"
    const aggregatedDonations = recentDonations.reduce((acc, { username, amount, currency }) => {
      if (!acc[username]) {
        acc[username] = { username, total: 0, currency, icon: '💰' };
      }
      acc[username].total += amount;
      return acc;
    }, {});

    const topDonors = Object.values(aggregatedDonations).sort((a, b) => b.total - a.total);

    // Получаем Twitch-токен и подписки
    const twitchToken = await getTwitchToken();
    // В переменной окружения TWITCH_USER_ID (не забудьте добавить её на Vercel)
    const twitchUserId = process.env.TWITCH_USER_ID;
    const { data: subsResponse } = await axios.get(
      `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${twitchUserId}`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${twitchToken}`
        }
      }
    );

    // Предполагаем, что Twitch API возвращает массив подписок в subsResponse.data
    const subsData = subsResponse.data;

    // Разделяем подписки на подарочные и обычные (если поле is_gift присутствует)
    const giftedSubs = subsData
      .filter(sub => sub.is_gift)
      .map(sub => ({
        icon: '🎁',
        user_name: sub.user_name,
        total: sub.total, // количество подарочных подписок, если доступно
        type: 'gift'
      }));

    const selfSubs = subsData
      .filter(sub => !sub.is_gift)
      .map(sub => ({
        icon: '👤',
        user_name: sub.user_name,
        cumulative_months: sub.cumulative_months, // сколько месяцев подписан
        type: 'self'
      }));

    // Возвращаем объединённые данные
    return res.status(200).json({
      topDonors,    // массив донатёров (с иконкой 💰)
      giftedSubs,   // массив подарочных подписок (с иконкой 🎁)
      selfSubs      // массив обычных подписок (с иконкой 👤)
    });
  } catch (error) {
    console.error('Error in /api/data:', error.response?.data || error.message);
    return res.status(500).json({ error: error.message });
  }
}
