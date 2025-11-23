import { Menu } from 'lucide-react';

interface OrderData {
  address: string;
  date: string;
  jobId: string;
  customer: string;
}

interface OrderHeaderProps {
  orderData: OrderData;
}

export function OrderHeader({ orderData }: OrderHeaderProps) {
  return (
    <div className="bg-white border-b border-[#C7C7C7]">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-base font-semibold tracking-wide text-black">
            PIX.IMMO
          </div>
          <button className="p-2 hover:bg-[#F7F7F7] rounded transition-colors">
            <Menu className="size-6 text-black" />
          </button>
        </div>
        
        <h1 className="mb-4 text-black text-2xl font-semibold">Upload & Auftragsdetails</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">Adresse</div>
            <div className="text-black">{orderData.address}</div>
          </div>
          
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">Datum</div>
            <div className="text-black">{orderData.date}</div>
          </div>
          
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">Job-ID</div>
            <div className="text-black">{orderData.jobId}</div>
          </div>
          
          <div>
            <div className="text-[#6F6F6F] mb-1 text-sm">Kunde</div>
            <div className="text-black">{orderData.customer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
