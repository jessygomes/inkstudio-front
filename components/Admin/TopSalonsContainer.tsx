import TopSalons from '@/components/Admin/TopSalons';
import { getTopSalons } from '@/lib/queries/admin';


export default async function TopSalonsContainer() {
  try {
    const salons = await getTopSalons(10, 30);
    return <TopSalons initialData={salons} />;
  } catch (error) {
    console.error('Error loading top salons:', error);
    return <TopSalons initialData={[]} />;
  }
}
