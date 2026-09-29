import { AppUser } from '../types';

export const SAMPLE_USERS: Record<string, AppUser> = {
  farmer: {
    id: 'usr-farmer-01',
    name: 'Ramesh Patil',
    role: 'farmer',
    phone: '+91 98221 44510',
    organization: 'Patil Agri Farms · Nashik Cooperative',
    location: 'Dindori, Nashik District, Maharashtra',
    avatarInitials: 'RP',
  },
  buyer: {
    id: 'usr-buyer-01',
    name: 'Sunita Mehta',
    role: 'buyer',
    phone: '+91 98902 33114',
    organization: 'Apex Agrotech Exports & Mandi Procurement Hub',
    location: 'Vashi Wholesale Market, Navi Mumbai',
    avatarInitials: 'SM',
  },
  inspector: {
    id: 'usr-inspector-01',
    name: 'Sanjay Deshmukh',
    role: 'inspector',
    phone: '+91 94220 88209',
    organization: 'Lasalgaon APMC Quality Verification Directorate',
    location: 'Lasalgaon APMC Hub #12, Nashik',
    avatarInitials: 'SD',
  },
};
