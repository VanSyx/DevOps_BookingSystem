import { useState } from 'react';
import { createBooking } from '../services/bookingService';

export default function BookingForm({ onSuccess }) {
    const [form, setForm] = useState({
        name: '', phone: '', service: '',
        book_date: '', book_time: '', note: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const SERVICES = ['Cắt tóc', 'Gội đầu', 'Nhuộm tóc', 'Uốn tóc', 'Phục hồi tóc'];

    const handleChange = (e) =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await createBooking(form);
            setForm({ name: '', phone: '', service: '', book_date: '', book_time: '', note: '' });
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Đặt lịch mới</h2>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded p-3">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="name" value={form.name} onChange={handleChange}
                    placeholder="Họ tên *" className="input" />
                <input required name="phone" value={form.phone} onChange={handleChange}
                    placeholder="Số điện thoại *" className="input" />
                <select required name="service" value={form.service} onChange={handleChange} className="input">
                    <option value="">Chọn dịch vụ *</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input required type="date" name="book_date" value={form.book_date}
                    onChange={handleChange} className="input" />
                <input required type="time" name="book_time" value={form.book_time}
                    onChange={handleChange} className="input" />
                <input name="note" value={form.note} onChange={handleChange}
                    placeholder="Ghi chú" className="input" />
            </div>
            <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Đang đặt...' : 'Đặt lịch'}
            </button>
        </form>
    );
}