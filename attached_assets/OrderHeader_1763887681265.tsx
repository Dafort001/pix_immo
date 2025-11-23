import React from 'react';
import { OrderData } from './UploadWorkflow';
import { Menu } from 'lucide-react';
import logo from 'figma:asset/0f4ee23ef64509513e119078ccb05a99d85b28d8.png';

interface OrderHeaderProps {
  orderData: OrderData;
}

export function OrderHeader({ orderData }: OrderHeaderProps) {
  return (
    <div className="bg-white border-b border-[#C7C7C7]">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <img 
            src={logo} 
            alt="PIX.IMMO" 
            className="h-6"
            style={{ width: 'auto' }}
          />
          <button className="p-2 hover:bg-[#F7F7F7] rounded transition-colors">
            <Menu className="size-6 text-black" />
          </button>
        </div>
        
        <h1 className="mb-4 text-black">Upload & Auftragsdetails</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-[#6F6F6F] mb-1">Adresse</div>
            <div className="text-black">{orderData.address}</div>
          </div>
          
          <div>
            <div className="text-[#6F6F6F] mb-1">Datum</div>
            <div className="text-black">{orderData.date}</div>
          </div>
          
          <div>
            <div className="text-[#6F6F6F] mb-1">Job-ID</div>
            <div className="text-black">{orderData.jobId}</div>
          </div>
          
          <div>
            <div className="text-[#6F6F6F] mb-1">Kunde</div>
            <div className="text-black">{orderData.customer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}