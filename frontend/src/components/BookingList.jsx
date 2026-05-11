import { cancelBooking } from '../services/bookingService';

const STATUS = {
    pending: { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Đã xác nhận', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Đã huỷ', cls: 'bg-red-100 text-red-600' },
};

export default function BookingList({ bookings, onRefresh }) {
    const handleCancel = async (id) => {
        if (!confirm('Huỷ lịch này?')) return;
        await cancelBooking(id);
        onRefresh();
    };

    if (!bookings.length)
        return <p className="text-center text-gray-400 py-10">Chưa có lịch nào.</p>;

    return (
        <div className="space-y-3">
            {bookings.map(b => (
                <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start">
                    <div>
                        <p className="font-medium text-gray-800">{b.name} — {b.phone}</p>
                        <p className="text-sm text-gray-500">{b.service} · {b.book_date} {b.book_time}</p>
                        {b.note && <p className="text-xs text-gray-400 mt-1">{b.note}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS[b.status]?.cls}`}>
                            {STATUS[b.status]?.label}
                        </span>
                        {b.status !== 'cancelled' && (
                            <button onClick={() => handleCancel(b.id)}
                                className="text-xs text-red-500 hover:underline">Huỷ lịch</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}