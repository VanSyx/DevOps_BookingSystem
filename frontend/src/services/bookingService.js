const BASE = import.meta.env.VITE_API_URL;

export const getBookings = async () => {
    const res = await fetch(`${BASE}/bookings`);
    if (!res.ok) throw new Error('Không lấy được danh sách lịch');
    return res.json();
};

export const createBooking = async (data) => {
    const res = await fetch(`${BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Đặt lịch thất bại');
    }
    return res.json();
};

export const cancelBooking = async (id) => {
    const res = await fetch(`${BASE}/bookings/${id}/cancel`, {
        method: 'PATCH',
    });
    if (!res.ok) throw new Error('Huỷ lịch thất bại');
    return res.json();
};