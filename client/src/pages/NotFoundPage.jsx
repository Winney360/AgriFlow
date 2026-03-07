import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export const NotFoundPage = () => {
  return (
    <section className="mx-auto max-w-xl space-y-3 rounded-2xl border border-(--outline) bg-(--surface) p-6 text-center">
      <h1 className="text-3xl font-black">Page not found</h1>
      <p className="text-sm text-(--text-muted)">The route you requested does not exist.</p>
      <Link to="/">
        <Button>Return Home</Button>
      </Link>
    </section>
  );
};
