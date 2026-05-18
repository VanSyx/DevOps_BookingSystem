# DevOps_BookingSystem

Booking system theo mô hình DevOps, có đủ `Frontend + Backend API + Database`, chạy bằng Docker Compose và có CI pipeline.

## 1. Architecture

- Frontend: React/TanStack Start (`frontend`)
- Backend API: Express (`backend`)
- Database:  PostgreSQL 

Core API:
- `GET /api/health`: kiểm tra deploy và tình trạng backend
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/:id`
- `PATCH /api/bookings/:id/status`
- `DELETE /api/bookings/:id`

Dữ liệu thật:
- Booking lưu trong MySQL.
- Có tạo/sửa/xóa.
- Có vòng đời trạng thái: `pending -> confirmed -> completed`, hoặc `pending/confirmed -> cancelled`.
- Có chống đặt trùng slot booking.

## 2. Run With Docker (Recommended)

Yêu cầu: Docker Desktop + Docker Compose.

1. Tạo file env từ mẫu:
   - Copy `.env.example` thành `.env`
2. Chạy hệ thống:
   - `docker compose up -d --build`
3. Kiểm tra nhanh:
   - Health API: `http://localhost:3000/api/health`
   - Frontend: `http://localhost`

Service map:
- Frontend: port `80`
- Backend: port `3000`
- MySQL: host port `3307` -> container `3306`

## 3. Local Dev (Optional)

- Backend:
  - `cd backend`
  - `npm ci`
  - `npm run dev`
- Frontend:
  - `cd frontend`
  - `npm ci`
  - `npm run dev`

Frontend dùng `VITE_API_URL` từ env.

## 4. CI/CD Flow

Workflow: `.github/workflows/ci.yml`

Trigger:
- `push` vào `main`, `dev`, `feature/**`
- `pull_request` vào `main`, `dev`

Jobs:
- Backend: `install -> lint -> test -> build`
- Frontend: `install -> lint -> test -> build`

Pipeline sẽ fail nếu step nào lỗi.

## 5. Checklist Demo

System:
- Frontend load được.
- `GET /api/health` trả `ok: true`.
- API bookings trả dữ liệu thật từ DB.

Docker:
- Có `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`.
- `docker compose up -d` chạy đủ `frontend`, `backend`, `mysql`.
- Xem log bằng `docker compose logs -f backend` (hoặc frontend/mysql).

Environment:
- Có `.env.example`.
- Không commit `.env`.
- Secret/config không hardcode trong `docker-compose.yml`.

## 6. Debug By Layer

- L4 Frontend:
  - Browser DevTools console/network
- L3 Backend:
  - `docker compose logs -f backend`
- L2 External (DB):
  - `docker compose logs -f mysql`
- L1 Infrastructure:
  - `docker compose ps`
  - `docker compose config`

## 7. Incident Samples (QA/SRE)

Incident 1: API `500` khi backend mất kết nối DB  
Hiện tượng: gọi `/api/bookings` lỗi 500  
Layer: L3/L2  
Nguyên nhân: sai DB env hoặc MySQL chưa healthy  
Fix: kiểm tra `.env`, `depends_on` và healthcheck MySQL  
Phòng tránh: chuẩn hóa `.env.example`, thêm verify health trước demo

Incident 2: CORS block trên frontend  
Hiện tượng: browser báo CORS error  
Layer: L4/L3  
Nguyên nhân: `CORS_ORIGIN` sai domain  
Fix: chỉnh `CORS_ORIGIN` đúng URL frontend  
Phòng tránh: tách env theo môi trường deploy

Incident 3: Trùng lịch booking  
Hiện tượng: tạo 2 booking cùng slot thất bại  
Layer: L3/L2  
Nguyên nhân: vi phạm rule unique slot active  
Fix: backend trả `409`, frontend hiển thị lỗi  
Phòng tránh: validate trước submit + giữ unique rule ở DB
