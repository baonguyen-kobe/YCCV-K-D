________________________________________
MÔ TẢ YÊU CẦU DỰ ÁN (PRD)
Dự án: Hệ thống quản lý yêu cầu công việc (Khoa Điều dưỡng - EIU)
Phiên bản: 7.0
________________________________________
1. THÔNG TIN TỔNG QUAN & PHẠM VI
•	Tên dự án: Hệ thống gửi yêu cầu công việc.
•	Loại sản phẩm: Web App nội bộ (Responsive Web App).
•	Đối tượng sử dụng: Ban đầu triển khai cho Khoa Điều dưỡng & Y Khoa (~20 user).
•	Mục tiêu:
o	Chuẩn hóa quy trình gửi – nhận – xử lý yêu cầu.
o	Thay thế việc nhắn tin Zalo/Email rời rạc.
o	Có lịch sử lưu vết, báo cáo và trạng thái rõ ràng.
•	Khả năng mở rộng (Scalability):
o	Thiết kế sẵn sàng cho mô hình Đa khoa/Đa phòng ban (Multi-department).
o	Database cần có trường phân định đơn vị (unit_id hoặc department_id).
________________________________________
2. NGƯỜI DÙNG & PHÂN QUYỀN (ROLES)
2.1. Cơ chế Đa vai trò (Multi-role)
•	Mô hình: Một User có thể đảm nhiệm nhiều vai trò cùng lúc (VD: Giảng viên kiêm Quản lý vận hành).
•	Kỹ thuật: Sử dụng bảng user_roles để map 1 User với N Roles.
•	Role Mapping: Dựa hoàn toàn vào DB, không hard-code theo domain email.
2.2. Các nhóm vai trò chính
Vai trò	Quyền hạn chính
1. Admin (Quản trị)	Cấu hình hệ thống. Quản lý User/Role. Reset mật khẩu. Xem toàn bộ Log. Quản lý danh mục. Có quyền can thiệp (Re-open, Edit) mọi phiếu.
2. Quản lý vận hành (Manager)	Tiếp nhận yêu cầu. Phân công (Assign). Duyệt/Hủy phiếu. Xem báo cáo tổng hợp trong đơn vị.
3. Chuyên viên (Staff)	Nhận việc. Cập nhật tiến độ (IN_PROGRESS, NEED_INFO, DONE) cho các phiếu được giao. Trao đổi trong phiếu (Comment).
4. User (Giảng viên)	Tạo phiếu yêu cầu. Sửa phiếu khi còn DRAFT. Gửi phiếu (DRAFT → NEW). Theo dõi trạng thái. Xem lịch sử phiếu của mình. Comment hậu kỳ.
2.3. Ma trận phân quyền (Role–Action Matrix)
Hành động	Admin	Quản lý VH	Chuyên viên	Giảng viên	Ghi chú
Đăng nhập	✅	✅	✅	✅	Hybrid (Google + Local)
Xem danh sách phiếu	✅ Tất cả	✅ Đơn vị mình	✅ Phiếu được giao	✅ Phiếu do mình tạo	Logic filter ở List View
Tạo phiếu mới	✅	✅	❌ (trừ khi có thêm role User)	✅	
Sửa phiếu (DRAFT)	✅	✅	❌	✅	Chỉ khi trạng thái DRAFT
Gửi phiếu (NEW)	✅	✅	❌	✅	Chuyển DRAFT → NEW
Hủy phiếu	✅	✅	❌	✅ (creator, khi chưa xử lý)	Không hủy khi đã DONE/CANCELLED
Phân công (ASSIGN)	✅	✅	❌	❌	Manager/Admin chọn Staff
Cập nhật tiến độ	✅	✅	✅	❌	Theo State Machine
Comment	✅	✅	✅	✅	Mọi trạng thái, kể cả DONE/CANCELLED
In phiếu (PDF)	✅	✅	✅	✅	Xuất PDF từ Google Docs Template
Quản lý Danh mục	✅	✅	❌	❌	Môn, Phòng, Nhóm việc, Đơn vị
Quản lý User	✅	❌	❌	❌	Tạo, Sửa, Gán Role, Reset Pass
________________________________________
3. CHỨC NĂNG CHI TIẾT (FUNCTIONAL SPECS)
3.1. Đăng nhập & Bảo mật
•	Cơ chế: Hybrid Authentication (Google Workspace + Local Account).
•	Logic “Người dùng mới” (First Login qua Google):
o	Cơ chế Whitelist (được chọn):
	Chỉ những email đã được Admin tạo trước trong bảng users và có is_active = true mới được phép login qua Google.
	Nếu email nội bộ @eiu.edu.vn không nằm trong danh sách users active:
	Hệ thống từ chối truy cập, hiển thị thông báo:
“Tài khoản của bạn chưa được cấp quyền sử dụng hệ thống. Vui lòng liên hệ Admin qua email: bao.nguyen@eiu.edu.vn.”
	Không tự động tạo user mới, không gán bất kỳ role nào.
o	Local accounts (Email/Pass) do Admin tạo và cấp riêng (đã đảm bảo whitelist).
•	Quên mật khẩu (Local):
o	Không có flow reset tự động.
o	Hiển thị Popup hướng dẫn liên hệ Admin để reset thủ công.
•	Logging (Quan trọng):
o	Ghi lại lịch sử đăng nhập vào bảng auth_logs.
o	Trường: user_id, ip_address, user_agent, logged_at, success (true/false).
________________________________________
3.2. Tạo phiếu yêu cầu
•	Snapshot Đơn vị:
o	Lưu cứng tên Đơn vị/Khoa của người tạo vào requests.unit_name_snapshot tại thời điểm tạo.
•	Form nhập liệu:
1.	Lý do/Căn cứ:
	Textarea (Bắt buộc), lưu vào requests.reason.
	Giới hạn: tối đa 500 ký tự.
2.	Bảng chi tiết (request_items):
	Môn học (subject/category).
	Tên hàng hóa/CV (item_name).
	ĐVT (unit_count).
	Số lượng (quantity).
	Thời gian cần (required_at – deadline riêng từng dòng).
	Link tham khảo (link_ref).
3.	Mức ưu tiên (priority):
	Enum: Low, Normal, High, Urgent.
•	Đính kèm file (Attachments):
o	File < 5MB:
	Upload lên Supabase Storage.
	Lưu metadata vào bảng attachments.
o	File ≥ 5MB:
	User upload lên Google Drive cá nhân.
	Dán link chia sẻ vào hệ thống.
	Lưu bản ghi trong attachments với:
	file_type = 'external_url'
	file_url = link Google Drive.
o	Giới hạn số file:
	Tối đa 5 file đính kèm/phiếu (bao gồm cả Storage và external URL).
•	Giới hạn nội dung text:
o	reason, completion_note, cancel_reason tối đa 500 ký tự.
o	Nếu vượt, hệ thống báo lỗi và không cho lưu.
•	Rate Limit:
o	Tối đa 5 yêu cầu/phút/user.
o	Bắt buộc kiểm tra tại Server Actions (server-side).
________________________________________
3.3. Quy trình xử lý (Workflow)
3.3.1. Trạng thái & Note
•	Trạng thái (Enum):
DRAFT, NEW, ASSIGNED, IN_PROGRESS, NEED_INFO, DONE, CANCELLED.
•	Ghi chú khi chuyển trạng thái:
o	Khi chuyển sang các trạng thái:
ASSIGNED, IN_PROGRESS, NEED_INFO, DONE, CANCELLED:
	Hệ thống cho phép/khuyến khích nhập Note.
	Note được lưu trong request_logs.meta_data (VD: manager_note, reason, details).
o	Khi chuyển sang:
	DONE → lưu thêm completion_note (max 500 ký tự) trong requests.
	CANCELLED → lưu thêm cancel_reason (max 500 ký tự) trong requests.
•	DONE & xác nhận từ User:
o	Định nghĩa đơn giản:
DONE = Xong, không có bước xác nhận hoàn thành từ User.
o	User vẫn có thể:
	Xem phiếu.
	Gửi comment hậu kỳ (feedback, góp ý…).
3.3.2. Ma trận chuyển trạng thái (State Machine & Permission)
Từ trạng thái	Sang trạng thái	Ai được phép?	Ghi chú
DRAFT	NEW	User (creator), Admin	Gửi phiếu
DRAFT	CANCELLED	User (creator), Admin	Xóa nháp
NEW	ASSIGNED	Manager, Admin	Phân công Staff
NEW	CANCELLED	User (creator), Manager, Admin	Rút yêu cầu / Từ chối
ASSIGNED	IN_PROGRESS	Staff (assignee), Manager, Admin	Bắt đầu xử lý
ASSIGNED	NEED_INFO	Staff (assignee), Manager, Admin	Cần thêm thông tin
ASSIGNED	CANCELLED	Manager, Admin	Hủy phiếu / Hủy phân công
IN_PROGRESS	NEED_INFO	Staff (assignee), Manager, Admin	Gặp vướng mắc
IN_PROGRESS	DONE	Staff (assignee), Manager, Admin	Hoàn thành công việc
IN_PROGRESS	CANCELLED	Manager, Admin	Hủy ngang
NEED_INFO	IN_PROGRESS	Staff (assignee), Manager, Admin	Đã có thông tin, xử lý tiếp
NEED_INFO	CANCELLED	Manager, Admin	Không tiếp tục nữa
DONE / CANCELLED	(Trạng thái khác)	Chỉ Admin	Re-open phiếu (ghi log chi tiết)
3.3.3. Quy tắc khóa (Lock)
•	DONE / CANCELLED:
o	Là trạng thái kết thúc đối với User, Manager, Staff.
o	Không cho phép chỉnh sửa dữ liệu chính của phiếu.
•	Admin:
o	Có quyền:
	Sửa mọi trường trong requests, request_items, attachments…
	Re-open phiếu (đổi từ DONE/CANCELLED sang trạng thái khác).
o	Mọi hành động phải log đầy đủ trong request_logs (old_status, new_status, changes…).
________________________________________
3.4. Danh sách & Chi tiết
3.4.1. Quyền xem danh sách (/requests)
•	Admin: Xem tất cả requests.
•	Manager: Xem requests thuộc các đơn vị mà Manager quản lý (unit_id tương ứng).
•	Staff: Xem:
o	Requests có assignee_id = staff.id.
•	User (Giảng viên): Xem:
o	Requests có created_by = user.id.
3.4.2. List View
•	Pagination: 20 dòng mặc định, cho phép chọn 10/25/50.
•	Filter:
o	Trạng thái, Ưu tiên, Người tạo, Người được giao, Đơn vị, Khoảng ngày tạo.
•	Sort:
o	Mặc định created_at DESC.
3.4.3. Search (Tìm kiếm)
•	Search Box:
o	Một ô nhập từ khóa (text search) ở List View.
•	Phạm vi tìm kiếm:
o	requests.id (theo mã phiếu).
o	requests.reason (lý do).
o	request_items.item_name (tên hàng hóa/công việc).
•	Hành vi:
o	Tìm kiếm full-text đơn giản (ILIKE) theo từ khóa nhập vào.
o	Khuyến nghị thêm index phù hợp (VD: index trên request_items.item_name).
3.4.4. Chi tiết phiếu (/requests/[id])
Hiển thị:
•	Thông tin chung: creator, đơn vị, priority, status, assignee, created_at…
•	Danh sách items.
•	Attachments.
•	Activity log (từ request_logs).
•	Comment thread (request_comments).
________________________________________
3.5. Comment (request_comments)
•	Cho phép comment ở mọi trạng thái, kể cả DONE/CANCELLED.
•	Schema:
o	id, request_id, user_id, content, is_internal, created_at.
•	Quy tắc hiển thị:
o	is_internal = true:
	Comment chỉ hiển thị cho Admin, Manager, Staff (trao đổi nội bộ vận hành).
o	is_internal = false:
	Comment hiển thị cho tất cả user có quyền xem phiếu (bao gồm creator).
________________________________________
3.6. In phiếu (Printing)
•	Sử dụng 01 Google Docs Template chung.
•	Quy trình:
1.	User bấm “In phiếu” tại /requests/[id].
2.	Server gọi Google Docs API:
	Tạo bản sao template.
	Replace placeholder bằng dữ liệu của requests + request_items.
3.	Server chuyển Docs → PDF.
4.	PDF stream về client, có thể tải/lưu/mở tab mới.
5.	Không lưu file PDF trong DB/Storage (chỉ generate on-demand).
________________________________________
3.7. Thông báo & Cron Job
•	Email Trigger (Resend):
o	Khi trạng thái chuyển sang:
	NEW → gửi Manager.
	ASSIGNED → gửi Staff (assignee) (+ optional CC Manager).
	NEED_INFO → gửi Creator (User).
	DONE → gửi Creator + Manager.
	CANCELLED → gửi Creator.
•	Email Trigger bổ sung – Comment khi NEED_INFO:
o	Khi phiếu ở trạng thái NEED_INFO:
	Nếu creator (User) comment mới (không internal):
→ Gửi email thông báo cho Staff assignee (và optional CC Manager) với nội dung kiểu:
“Người tạo phiếu #id vừa phản hồi yêu cầu bổ sung thông tin.”
o	Mục đích: Tránh việc User trả lời nhưng Staff không biết.
•	Cron Job (Nhắc việc):
o	Chạy: 08:00 AM mỗi ngày (Vercel Cron, endpoint /api/cron/reminders).
o	Logic:
	Quét request_items:
	required_at = ngày mai.
	Request tương ứng chưa ở trạng thái DONE/CANCELLED.
	Gửi email nhắc Staff (assignee) + optional Manager.
________________________________________
3.8. Dashboard Specs
Trang /dashboard hiển thị khác nhau tuỳ role, nhưng có các widget cơ bản:
1.	Widget 1 – Tổng quan (Overview)
4 thẻ số liệu (card):
o	Số phiếu NEW (mới).
o	Số phiếu ASSIGNED + IN_PROGRESS (đang xử lý).
o	Số phiếu Quá hạn (có item required_at < hôm nay mà request chưa DONE/CANCELLED).
o	Số phiếu DONE trong tháng này.
2.	Widget 2 – Việc cần làm (Staff/Manager)
o	Đối với Staff:
	List phiếu có assignee_id = staff.id và trạng thái ASSIGNED hoặc IN_PROGRESS.
o	Đối với Manager:
	List phiếu của đơn vị mình ở trạng thái NEW, ASSIGNED, IN_PROGRESS, NEED_INFO (để dễ theo dõi).
3.	Widget 3 – Phiếu của tôi (User/Giảng viên)
o	List các phiếu có created_by = user.id và trạng thái khác DONE/CANCELLED (đang “chạy”).
________________________________________
4. GIAO DIỆN MOBILE RESPONSIVE
•	Navigation: Hamburger Menu hoặc Bottom Navigation Bar.
•	List View: Trên mobile, chuyển sang Card View (hiển thị mã phiếu, trạng thái, ưu tiên, deadline).
•	Form: Input full-width; nút chính (Gửi/Lưu) dùng Sticky Footer để luôn nằm trong tầm nhìn.
________________________________________
5. KIẾN TRÚC KỸ THUẬT & DATABASE SCHEMA
5.1. Tech Stack
•	Frontend: Next.js 14+ (App Router), TypeScript, Tailwind, Shadcn/UI.
•	Backend: Next.js Server Actions.
•	DB & Auth: Supabase PostgreSQL + Supabase Auth.
•	Storage: Supabase Storage (file < 5MB).
•	Email: Resend.
•	In ấn: Google Docs API (Service Account).
•	Cron: Vercel Cron (gọi /api/cron/reminders).
Ghi chú về “file rác” (Cleanup Storage):
•	Khi user upload file lên Supabase Storage trước khi bấm Submit:
o	Có khả năng user hủy phiếu hoặc xóa dòng item → file không còn được gắn với request_id.
•	Đề xuất kỹ thuật:
o	Lưu file tạm vào một “vùng tạm” (folder/bucket path) với temp_token.
o	Khi phiếu được submit thành công:
	Cập nhật attachments.request_id để “gắn” file với phiếu.
o	Thiết lập:
	Bucket Policy hoặc Cronjob dọn dẹp các file trong Storage:
	Không có request_id gắn với chúng.
	Hoặc tạo > 24 giờ.
	Mục tiêu: tránh Storage bị đầy bởi file rác.
5.2. Database Design (Tóm tắt)
Giữ nguyên như bản 6.0 với các bảng:
•	units, users, roles, user_roles, auth_logs, categories, requests, request_items, request_comments, attachments, request_logs.
(Các field chính đã mô tả chi tiết ở bản 6.0, chỉ bổ sung thêm logic/giới hạn ở trên.)
________________________________________
6. SITEMAP & PROJECT STRUCTURE (TÓM TẮT)
•	/login – Đăng nhập (Google + Local, whitelist user).
•	/dashboard – Tổng quan, widget thống kê (Overview + Việc cần làm + Phiếu của tôi).
•	/requests – Danh sách phiếu (Filter + Sort + Search Box).
•	/requests/create – Form tạo phiếu (upload file, rate limit).
•	/requests/[id] – Chi tiết: Activity Log, Comment, In phiếu.
•	/profile – Hồ sơ cá nhân:
o	User chỉnh: full_name, avatar.
o	unit_id & roles chỉ Admin chỉnh trong /admin/users.
•	/admin/users – Quản lý user, gán roles, reset pass.
•	/admin/categories – Quản lý danh mục.
•	/reports – Báo cáo, xuất Excel.
•	/api/cron/reminders – Cho Vercel Cron.
________________________________________
7. EMAIL TEMPLATES (TÓM TẮT)
Giữ như bản 6.0 + thêm template cho comment khi NEED_INFO:
•	Khi có comment mới từ creator trong phiếu NEED_INFO:
o	Subject ví dụ:
[YCCV] Người tạo đã phản hồi phiếu #{{request_id}}
o	Body: thông báo cho Staff + link đến /requests/[id]#comments.
________________________________________
## TÌNH TRẠNG TRIỂN KHAI

### ✅ ĐÃ HOÀN THÀNH (89% - Production Ready)
1. **Core Features**
   - ✅ Authentication: Google OAuth + Whitelist + Multi-role support
   - ✅ Request Management: CRUD với validation, rate limiting, file attachments
   - ✅ Workflow: State machine với 7 trạng thái, permission checks
   - ✅ Comments: Internal/External comments với permission control
   - ✅ Activity Logs: Timeline hiển thị mọi thay đổi
   - ✅ Search: Full-text search across requests và items
   - ✅ Dashboard: Role-based widgets, stats overview
   - ✅ Admin: User management, Category management với hierarchical tree
   - ✅ Profile: Avatar upload, edit personal info
   - ✅ UI/UX: Responsive, mobile-friendly, pagination, filters

2. **Technical Implementation**
   - ✅ Database: PostgreSQL với RLS policies, triggers, functions
   - ✅ Storage: Supabase Storage cho avatars và attachments (<5MB)
   - ✅ API: Server Actions với rate limiting và validation
   - ✅ Security: Row Level Security, role-based access control

### ⏳ ĐANG CHỜ TRIỂN KHAI
1. **Email Notifications** (Resend API)
   - Triggers: NEW, ASSIGNED, NEED_INFO, DONE, CANCELLED
   - Cron job reminders

2. **Print to PDF** (Google Docs API)
   - Template-based PDF generation
   - On-demand export

3. **Reports & Export**
   - Excel export functionality
   - Advanced analytics

### 📧 EMAIL TEMPLATES (Chưa triển khai)

**1. KHI CÓ PHIẾU MỚI (Trigger: Status NEW)**
Subject: [YCCV] Phiếu yêu cầu mới #{{request_id}} - {{creator_name}}
Nội dung: Kính gửi Đội vận hành Khoa Điều dưỡng,
Hệ thống vừa ghi nhận một yêu cầu mới cần xử lý:
•	Người tạo: {{creator_name}} ({{unit_name}})
•	Mức độ ưu tiên: {{priority}}
•	Lý do/Nội dung chính: {{reason_summary}}
•	Thời gian tạo: {{created_at}}
Vui lòng truy cập hệ thống để kiểm tra và phân công xử lý.
[Nút: Xem chi tiết phiếu]
________________________________________
2. KHI ĐƯỢC PHÂN CÔNG (Trigger: Status ASSIGNED)
Subject: [YCCV] Bạn được phân công xử lý phiếu #{{request_id}}
Nội dung: Chào {{staff_name}},
Bạn vừa được phân công chịu trách nhiệm xử lý phiếu yêu cầu #{{request_id}}.
Thông tin tóm tắt:
•	Người yêu cầu: {{creator_name}}
•	Hạn chót (Deadline): {{deadline}} (Lấy ngày sớm nhất trong các hạng mục)
•	Ghi chú phân công: {{manager_note}}
Vui lòng kiểm tra và cập nhật trạng thái khi bắt đầu thực hiện.
[Nút: Tiếp nhận công việc]
________________________________________
3. KHI CẦN THÊM THÔNG TIN (Trigger: Status NEED_INFO)
Subject: [YCCV] Cần bổ sung thông tin cho phiếu #{{request_id}}
Nội dung: Kính gửi Thầy/Cô {{creator_name}},
Bộ phận vận hành đang xử lý yêu cầu #{{request_id}} của Thầy/Cô nhưng cần thêm thông tin để tiếp tục.
Nội dung cần làm rõ: "{{comment_content}}" (Tin nhắn từ chuyên viên {{staff_name}})
Thầy/Cô vui lòng phản hồi trực tiếp trên hệ thống để công việc không bị gián đoạn.
[Nút: Phản hồi ngay]
________________________________________
4. KHI HOÀN THÀNH (Trigger: Status DONE)
Subject: [YCCV] ✅ Phiếu yêu cầu #{{request_id}} đã hoàn tất
Nội dung: Kính gửi Thầy/Cô {{creator_name}},
Yêu cầu công việc #{{request_id}} của Thầy/Cô đã được xử lý hoàn tất.
•	Người thực hiện: {{staff_name}}
•	Thời gian hoàn thành: {{finished_at}}
•	Ghi chú kết quả: {{completion_note}}
Nếu có bất kỳ vấn đề gì phát sinh, Thầy/Cô vui lòng liên hệ lại hoặc tạo phiếu mới.
[Nút: Xem kết quả]
________________________________________
5. KHI HỦY/TỪ CHỐI (Trigger: Status CANCELLED)
Subject: [YCCV] ❌ Phiếu yêu cầu #{{request_id}} đã bị hủy
Nội dung: Kính gửi Thầy/Cô {{creator_name}},
Yêu cầu #{{request_id}} đã chuyển sang trạng thái HỦY.
•	Người hủy: {{actor_name}}
•	Lý do: "{{cancel_reason}}"
Trân trọng. [Nút: Xem lại phiếu]
________________________________________
6. EMAIL NHẮC VIỆC (Trigger: Cron Job)
Subject: [Nhắc nhở] ⏰ Bạn có phiếu yêu cầu sắp đến hạn xử lý
Nội dung: Chào {{staff_name}},
Hệ thống nhắc nhở bạn có các yêu cầu cần hoàn thành trong NGÀY MAI ({{tomorrow_date}}):
1.	#{{request_id_1}} - {{item_name}} (Ưu tiên: {{priority}})
2.	#{{request_id_2}} - {{item_name}} ...
Vui lòng sắp xếp thời gian xử lý kịp thời độ.
[Nút: Vào Dashboard công việc]

