import { useState, useContext } from 'react';
import { LocationContext } from '@/contexts/LocationContext';

// 위치 관련 훅
export function useLocation() {
  return useContext(LocationContext);
}