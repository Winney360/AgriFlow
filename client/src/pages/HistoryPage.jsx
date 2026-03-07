import { useEffect, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { productApi } from '../lib/api';

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const response = await productApi.myHistory();
      setHistory(response.data.data || []);
    };

    loadHistory().catch(() => setHistory([]));
  }, []);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-black">Product History</h1>
        <p className="text-sm text-(--text-muted)">Sold and inactive listings.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {history.map((item) => (
          <Card key={item._id} className="space-y-2">
            <img src={item.imageUrl} alt={item.title} className="h-40 w-full rounded-xl object-cover" />
            <h2 className="text-lg font-black">{item.title}</h2>
            <p className="text-sm text-(--text-muted)">{item.quantity}</p>
            <Badge>{item.status}</Badge>
          </Card>
        ))}
      </section>
    </div>
  );
};
