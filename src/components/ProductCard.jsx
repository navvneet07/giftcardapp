import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const {
    id,
    name,
    price,
    image,
    description,
    category,
    discount = 0,
  } = product;

  const discountedPrice = price - (price * discount) / 100;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <Link to={`/${id}`} className="block relative">
        <div className="relative aspect-w-1 aspect-h-1">
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-48"
          />
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
              {discount}% OFF
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-1">{category}</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{name}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-purple-600">
                ₹{discountedPrice.toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div className="p-4 pt-0 flex justify-between items-center">
        <button
          className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
          onClick={(e) => {
            e.preventDefault();
            // Add to wishlist functionality
          }}
        >
          <FiHeart className="w-5 h-5" />
        </button>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
          onClick={(e) => {
            e.preventDefault();
            // Add to cart functionality
          }}
        >
          <FiShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
