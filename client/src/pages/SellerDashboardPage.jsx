import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenSquare, Trash2, CheckCircle2 } from 'lucide-react';
import { productApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatCurrency } from '../lib/utils';

export const SellerDashboardPage = () => {
  const [products, setProducts] = useState([]);

  const loadMine = async () => {
    const response = await productApi.myActive();
    setProducts(response.data.data || []);
  };

  useEffect(() => {
    loadMine().catch(() => setProducts([]));
  }, []);

  const markSold = async (id) => {
    await productApi.markSold(id);
    await loadMine();
  };

  const remove = async (id) => {
    await productApi.remove(id);
    await loadMine();
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-black">Seller Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage active listings.</p>
        </div>
        <Link to="/create-listing">
          <Button>Create Listing</Button>
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {products.map((item) => (
          <Card key={item._id} className="space-y-3">
            <img src={item.imageUrl} alt={item.title} className="h-44 w-full rounded-xl object-cover" />
            <h2 className="text-xl font-black">{item.title}</h2>
            <p className="text-lg font-bold text-[var(--primary)]">{formatCurrency(item.price)}</p>
            <div className="grid grid-cols-3 gap-2">
              <Link to={`/create-listing?edit=${item._id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  <PenSquare size={14} /> Edit
                </Button>
              </Link>
              <Button variant="cta" size="sm" onClick={() => markSold(item._id)} className="w-full">
                <CheckCircle2 size={14} /> Sold
              </Button>
              <Button variant="ghost" size="sm" onClick={() => remove(item._id)} className="w-full">
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};
