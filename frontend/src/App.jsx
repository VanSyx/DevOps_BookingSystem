import { useState, useEffect, useCallback } from 'react';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import { getBookings } from './services/bookingService';

export default function App() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);
    } catch {
      setError('Không kết nối được server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Booking System</h1>
        <p className="text-sm text-gray-500">Hệ thống đặt lịch</p>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <BookingForm onSuccess={fetchBookings} />
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Danh sách lịch đặt ({bookings.length})
          </h2>
          {loading && <p className="text-center text-gray-400 py-6">Đang tải...</p>}
          {error && <p className="text-center text-red-500 py-6">{error}</p>}
          {!loading && !error && <BookingList bookings={bookings} onRefresh={fetchBookings} />}
        </section>
      </main>
    </div>
  );
}