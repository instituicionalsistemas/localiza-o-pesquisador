// components/AllResearchersMapModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { Researcher, LocationPoint } from '../types';
import { getAllResearchersLastLocations, mapLocationPointFromDb } from '../services/api';
import { supabase } from '../services/supabase';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

declare const L: any;

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';

const AllResearchersMapModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    researchers: Researcher[];
}> = ({ isOpen, onClose, researchers }) => {
    const [locations, setLocations] = useState<Map<string, LocationPoint>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<Map<string, any>>(new Map());
    const realtimeChannelRef = useRef<any>(null);

    const updateMarker = (researcher: Researcher, point: LocationPoint) => {
        if (!mapRef.current) return;

        const latLng = [point.latitude, point.longitude];
        const existingMarker = markersRef.current.get(researcher.id);

        const textColor = '#FFFFFF';
        const icon = L.divIcon({
            html: `<div style="background-color: ${researcher.color || '#3B82F6'}; color: ${textColor};" class="researcher-marker">${getInitials(researcher.name)}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });

        const popupContent = `
            <b>${researcher.name}</b><br>
            Última atualização: ${new Date(point.timestamp).toLocaleString('pt-BR')}
        `;

        if (existingMarker) {
            existingMarker.setLatLng(latLng).setPopupContent(popupContent);
        } else {
            const newMarker = L.marker(latLng, { icon }).bindPopup(popupContent).addTo(mapRef.current);
            markersRef.current.set(researcher.id, newMarker);
        }
    };

    const fitBounds = () => {
        if (!mapRef.current || markersRef.current.size === 0) return;
        const group = L.featureGroup(Array.from(markersRef.current.values()));
        mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 16 });
    };

    // Initialize map
    useEffect(() => {
        if (isOpen && mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([-15.78, -47.92], 4); // Brazil center
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapRef.current);
        }
    }, [isOpen]);
    
    // Fetch initial data and set up realtime
    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        
        const setup = async () => {
            setIsLoading(true);
            const researcherIds = researchers.map(r => r.id);
            const initialPoints = await getAllResearchersLastLocations(researcherIds);
            
            if (!isMounted) return;

            const initialLocations = new Map<string, LocationPoint>();
            initialPoints.forEach(point => initialLocations.set(point.researcherId, point));
            setLocations(initialLocations);
            setIsLoading(false);

            // Realtime subscription
            realtimeChannelRef.current = supabase
                .channel('all-researchers-location')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'pesquisador_localizacao',
                }, (payload) => {
                    const newPoint = mapLocationPointFromDb(payload.new);
                    if (isMounted && researcherIds.includes(newPoint.researcherId)) {
                        setLocations(prev => new Map(prev).set(newPoint.researcherId, newPoint));
                    }
                })
                .subscribe();
        };

        setup();

        return () => {
            isMounted = false;
            if (realtimeChannelRef.current) {
                supabase.removeChannel(realtimeChannelRef.current);
            }
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current.clear();
        };

    }, [isOpen, researchers]);

    // Update markers on map when locations change
    useEffect(() => {
        if (!isOpen || !mapRef.current) return;
        
        researchers.forEach(researcher => {
            const point = locations.get(researcher.id);
            if (point) {
                updateMarker(researcher, point);
            }
        });

        fitBounds();

    }, [isOpen, locations, researchers]);

    // Invalidate map size after modal opens
    useEffect(() => {
        if (isOpen && mapRef.current) {
            setTimeout(() => mapRef.current.invalidateSize(), 100);
        }
    }, [isOpen]);

    const handleResearcherClick = (researcherId: string) => {
        const marker = markersRef.current.get(researcherId);
        if (marker && mapRef.current) {
            mapRef.current.setView(marker.getLatLng(), 16);
            marker.openPopup();
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Mapa Geral de Pesquisadores">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ height: '70vh' }}>
                <div className="md:col-span-2 relative w-full h-full bg-gray-200 dark:bg-dark-background rounded-md overflow-hidden">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
                           <LoadingSpinner text="Buscando localizações" />
                        </div>
                    )}
                    <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }}/>
                </div>

                <div className="md:col-span-1 max-h-full overflow-y-auto pr-2 space-y-2">
                    <h3 className="font-bold text-lg border-b border-light-border dark:border-dark-border pb-2 mb-2">Pesquisadores Ativos</h3>
                    {researchers.length > 0 ? researchers.map(researcher => {
                        const location = locations.get(researcher.id);
                        return (
                             <div 
                                key={researcher.id} 
                                className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-background"
                                onClick={() => handleResearcherClick(researcher.id)}
                            >
                                <img src={researcher.photoUrl} alt={researcher.name} className="h-10 w-10 rounded-full object-cover"/>
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold truncate">{researcher.name}</p>
                                    <p className={`text-xs ${location ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                        {location ? `Online - ${new Date(location.timestamp).toLocaleTimeString()}` : 'Offline'}
                                    </p>
                                </div>
                                <div 
                                    className="h-3 w-3 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: location ? researcher.color || '#3B82F6' : '#9CA3AF' }}
                                ></div>
                            </div>
                        )
                    }) : <p className="text-sm text-gray-500">Nenhum pesquisador ativo.</p>}
                </div>
            </div>
        </Modal>
    );
};

export default AllResearchersMapModal;
