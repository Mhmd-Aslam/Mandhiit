import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant, imageSrc }) => {
  const navigate = useNavigate();
  const avg = restaurant.avg_rating ?? restaurant.rating;
  const count = restaurant.review_count ?? 0;

  const handleClick = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  const DEFAULT_THUMB = 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=640&auto=format&fit=crop&q=60';
  const [imgSrc, setImgSrc] = useState(imageSrc || restaurant.image || DEFAULT_THUMB);
  useEffect(() => {
    setImgSrc(imageSrc || restaurant.image || DEFAULT_THUMB);
  }, [imageSrc, restaurant.image]);

  return (
    <button
      onClick={handleClick}
      className="text-left bg-white dark:bg-[#2f3031] rounded-xl overflow-hidden shadow hover:shadow-md dark:shadow-none ring-1 ring-black/5 dark:ring-[#555] transition-all hover:-translate-y-0.5"
    >
      <div className="relative">
        <img
          src={imgSrc}
          alt={restaurant.name}
          className="w-full h-48 object-cover bg-slate-100 dark:bg-[#262728]"
          loading="lazy"
          onError={() => setImgSrc(DEFAULT_THUMB)}
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded-full">
          ⭐ {avg}{count ? ` (${count})` : ''}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{restaurant.name}</h3>
        <p className="text-amber-600 font-medium mt-0.5">{restaurant.type}</p>
        <p className="text-slate-600 dark:text-gray-300 mt-2">📍 {restaurant.location}</p>
      </div>
    </button>
  );
};

export default RestaurantCard;
