import React, { useState, useEffect } from 'react';
import { FiSearch, FiStar, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [page, filter, searchTerm]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `/api/admin/reviews?page=${page}&filter=${filter}&search=${searchTerm}`
      );
      const data = await response.json();
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await fetch(`/api/admin/reviews/${reviewId}`, {
          method: 'DELETE',
        });
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <FiStar
            key={index}
            className={`w-4 h-4 ${
              index < rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Product Reviews</h1>
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {review.product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    by {review.user.name} • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4">
                <StarRating rating={review.rating} />
                <p className="mt-2 text-gray-600">{review.comment}</p>
              </div>

              {review.product.images && review.product.images[0] && (
                <div className="mt-4">
                  <img
                    src={review.product.images[0].url}
                    alt={review.product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Product Rating</span>
                  <span className="font-medium">
                    {review.product.ratings.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Total Reviews</span>
                  <span className="font-medium">{review.product.numReviews}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index + 1)}
              className={`px-4 py-2 rounded-lg ${
                page === index + 1
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Review Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
            <p className="mt-2 text-3xl font-semibold">
              {reviews.length.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
            <div className="mt-2 flex items-center">
              <span className="text-3xl font-semibold mr-2">4.5</span>
              <StarRating rating={4.5} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Reviews This Month
            </h3>
            <p className="mt-2 text-3xl font-semibold">142</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Response Rate
            </h3>
            <p className="mt-2 text-3xl font-semibold">98%</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reviews;
