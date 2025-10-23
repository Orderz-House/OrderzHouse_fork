import React, { useState } from 'react';
import { Rating } from './Rating';
import axios from 'axios';

export const ReviewModal = ({ projectId, freelancerId, onClose, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ratings',
        {
          projectId,
          freelancerId,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
       );
      
      onReviewSubmit(response.data);
      onClose(); 

    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="font-medium mb-2">Your Rating</p>
            <Rating value={rating} onChange={setRating}>
              {[...Array(5)].map((_, i) => (
                <Rating.Star key={i} index={i + 1} />
              ))}
            </Rating>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block font-medium mb-2">
              Your Feedback (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe your experience with the freelancer..."
            ></textarea>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 rounded-md">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md disabled:bg-blue-300"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
