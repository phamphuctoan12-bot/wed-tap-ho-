// =================================================================
// CHATBOT TRỢ LÝ ẢO THÔNG MINH - TIỆM TẠP HÓA
// Trả lời đúng trọng tâm câu hỏi của khách hàng, văn phong tự nhiên
// =================================================================

(function () {
    'use strict';

    // =============================================================
    // 1. CƠ SỞ TRI THỨC ĐƯỢC TRAIN ĐÚNG TRỌNG TÂM (INTENT KNOWLEDGE)
    // =============================================================
    const INTENTS = [
        // --- 1. PHÍ GIAO HÀNG (Đi thẳng vào tiền ship) ---
        {
            id: 'phi_ship',
            priority: 10,
            phrases: [
                'phi giao hang', 'phi ship', 'tien ship', 'tien giao', 'ship bao nhieu', 
                'gia ship', 'cuoc ship', 'cuoc giao', 'phi van chuyen', 'ship ton bao nhieu',
                'ship dat khong', 'ship het bao nhieu', 'tien van chuyen'
            ],
            reply: () => `🚚 <b>Phí giao hàng tại Tiệm Tạp Hóa:</b><br><br>
            🎉 <b>MIỄN PHÍ SHIP 100%</b> cho mọi đơn hàng từ <b>150.000đ</b> trở lên!<br>
            💵 Đơn dưới 150.000đ: phí giao từ <b>15.000đ – 30.000đ</b> (tùy khoảng cách giao).<br><br>
            🎁 <b>Mẹo nhỏ:</b> Bạn có thể nhập mã <code>FREESHIP</code> ở Giỏ hàng để được <b>trừ ngay 15.000đ</b> tiền ship nhé!`
        },

        // --- 2. FREESHIP / MIỄN PHÍ VẬN CHUYỂN ---
        {
            id: 'freeship',
            priority: 9,
            phrases: [
                'freeship', 'co freeship khong', 'mien phi ship', 'mien phi giao hang', 
                'duoc freeship', 'don bao nhieu thi freeship', 'bao nhieu duoc freeship',
                'co mien phi ship khong', 'khi nao freeship'
            ],
            reply: () => `🆓 <b>Dạ có Freeship bạn nhé!</b><br><br>
            Chỉ cần đơn hàng của bạn đạt từ <b>150.000đ</b> là tiệm sẽ <b>miễn phí giao hàng hoàn toàn (0đ)</b> tận nhà ạ!<br><br>
            💡 Ngoài ra, tiệm đang có mã <code>FREESHIP</code> giảm ngay 15.000đ phí giao khi áp dụng tại giỏ hàng!`
        },

        // --- 3. THỜI GIAN GIAO HÀNG ---
        {
            id: 'thoi_gian_giao',
            priority: 9,
            phrases: [
                'bao lau thi den', 'bao lau nhan duoc', 'thoi gian giao', 'may tieng', 
                'khi nao giao', 'khi nao nhan duoc', 'giao nhanh khong', 'giao trong ngay khong',
                'co giao lien khong', 'may phut', 'ship lau khong'
            ],
            reply: () => `⏱️ <b>Thời gian giao hàng:</b><br><br>
            Tiệm giao hàng <b>siêu tốc chỉ trong vòng 1 – 3 tiếng</b> trong nội thành ngay sau khi bạn đặt đơn thành công!<br><br>
            🛵 Shipper sẽ gọi điện thoại cho bạn trước khi giao tận cửa nhé!`
        },

        // --- 4. KHU VỰC / PHẠM VI GIAO HÀNG ---
        {
            id: 'khu_vuc_giao',
            priority: 8,
            phrases: [
                'giao o dau', 'giao khu vuc nao', 'co giao tan noi khong', 'ship tan nha khong',
                'giao quan nao', 'co ship tinh khong', 'pham vi giao'
            ],
            reply: () => `📍 <b>Phạm vi giao hàng:</b><br><br>
            Tiệm giao hàng <b>tận nơi, tận cửa</b> theo đúng địa chỉ bạn nhập khi đặt hàng trong toàn khu vực nội thành.<br>
            Đơn hàng được đóng gói cẩn thận và giao tận tay bạn ạ!`
        },

        // --- 5. MÃ GIẢM GIÁ / VOUCHER ---
        {
            id: 'voucher',
            priority: 9,
            phrases: [
                'ma giam gia', 'voucher', 'coupon', 'ma khuyen mai', 'khuyen mai', 
                'co giam gia khong', 'ma freeship', 'xin ma giam', 'ma taphoa10', 'giam20k'
            ],
            reply: () => `🎁 <b>Các mã giảm giá hiện có tại tiệm:</b><br><br>
            🏷️ <code>TAPHOA10</code> → Giảm ngay <b>10%</b> tổng giá trị đơn hàng<br>
            🚚 <code>FREESHIP</code> → Giảm <b>15.000đ</b> phí vận chuyển<br>
            💸 <code>GIAM20K</code> → Giảm thẳng <b>20.000đ</b> cho đơn từ 100k<br><br>
            👉 <b>Cách dùng:</b> Vào 🛒 <b>Giỏ Hàng</b> → nhập mã vào ô "Nhập mã giảm giá" → bấm <b>Áp dụng</b> là được trừ tiền ngay!`
        },

        // --- 6. CÁCH ĐẶT HÀNG ---
        {
            id: 'cach_dat_hang',
            priority: 8,
            phrases: [
                'cach dat hang', 'cach mua hang', 'lam sao de mua', 'huong dan dat hang', 
                'dat hang the nao', 'mua the nao', 'cach order', 'muon mua hang'
            ],
            reply: () => `🛒 <b>Cách đặt hàng siêu nhanh qua 3 bước:</b><br><br>
            1️⃣ Bấm nút <b>"Chọn mua"</b> tại sản phẩm bạn thích trên web.<br>
            2️⃣ Bấm vào 🛒 <b>Giỏ Hàng</b> góc trên bên phải để kiểm tra.<br>
            3️⃣ Nhập tên, địa chỉ, số điện thoại rồi bấm <b>"Xác Nhận Đặt Hàng"</b> ✅<br><br>
            💡 Bạn có thể đặt mua ngay mà <b>không bắt buộc phải đăng nhập</b> tài khoản nhé!`
        },

        // --- 7. PHƯƠNG THỨC THANH TOÁN / MOMO ---
        {
            id: 'thanh_toan',
            priority: 8,
            phrases: [
                'thanh toan', 'phuong thuc thanh toan', 'co tra tien mat khong', 'cod', 
                'tra tien khi nhan hang', 'chuyen khoan', 'momo', 'quet ma momo', 'quet ma pos'
            ],
            reply: () => `💳 <b>Phương thức thanh toán linh hoạt:</b><br><br>
            💵 <b>1. Tiền mặt khi nhận hàng (COD):</b> Phổ biến nhất, nhận hàng kiểm tra rồi mới trả tiền cho shipper.<br>
            📱 <b>2. Quét mã MoMo / Chuyển khoản:</b> Quét mã QR MoMo của chủ tiệm (<b>PHẠM PHÚC TOÁN</b>) ngay khi đặt hàng.<br>
            🏪 <b>3. Thanh toán tại quầy POS:</b> Khách ghé trực tiếp tiệm quét mã vạch và thanh toán tiện lợi!`
        },

        // --- 8. GIỜ MỞ CỬA / THỜI GIAN HOẠT ĐỘNG ---
        {
            id: 'gio_mo_cua',
            priority: 9,
            phrases: [
                'gio mo cua', 'may gio mo', 'may gio dong', 'mo cua luc nao', 
                'dong cua chua', 'may gio ban', 'thoi gian lam viec', 'chu nhat co mo khong'
            ],
            reply: () => `⏰ <b>Giờ mở cửa hoạt động:</b><br><br>
            Tiệm mở cửa từ <b>6:00 sáng đến 22:00 đêm</b> tất cả các ngày trong tuần (từ Thứ 2 đến Chủ Nhật, kể cả ngày lễ).<br>
            Website luôn tiếp nhận đơn hàng online <b>24/7</b> bạn nhé!`
        },

        // --- 9. LIÊN HỆ / SỐ ĐIỆN THOẠI / HOTLINE / ZALO ---
        {
            id: 'lien_he',
            priority: 9,
            phrases: [
                'so dien thoai', 'sdt', 'hotline', 'so hotline', 'zalo', 
                'lien he ai', 'goi cho ai', 'so chu tiem', 'lien lac', 'dien thoai'
            ],
            reply: () => `📞 <b>Thông tin liên hệ chủ tiệm:</b><br><br>
            📱 Hotline / Zalo: <b>0862.261.874</b> (Chủ tiệm: <b>Phạm Phúc Toàn</b>)<br>
            💬 Nhắn Zalo: <a href="https://zalo.me/0862261874" target="_blank" style="color:#198754;font-weight:bold;">zalo.me/0862261874</a><br>
            ⏰ Hỗ trợ tư vấn và giải đáp: <b>6:00 – 22:00</b> mỗi ngày!`
        },

        // --- 10. ĐỊA CHỈ CỬA HÀNG ---
        {
            id: 'dia_chi',
            priority: 8,
            phrases: [
                'dia chi', 'tiem o dau', 'cua hang o dau', 'o dau', 
                'dia chi o dau', 'cho nao', 'vi tri cua hang'
            ],
            reply: () => `🏠 <b>Địa chỉ Tiệm Tạp Hóa:</b><br><br>
            Cửa hàng Tạp Hóa phục vụ tại địa bàn nội thành và toàn bộ đơn online qua website: <b>http://taphoa.local:8080/</b>.<br>
            Bạn chỉ cần bấm đặt hàng trên web, tiệm sẽ giao tận nơi đến tận nhà bạn trong 1–3 tiếng ạ!`
        },

        // --- 11. BIA VÀ RƯỢU (Sản phẩm mới cập nhật) ---
        {
            id: 'bia_ruou',
            priority: 9,
            phrases: [
                'co bia khong', 'co ruou khong', 'bia gi', 'ruou gi', 'bia tiger', 
                'bia heineken', 'bia larue', 'bia sai gon', 'vang da lat', 'vodka', 'soju'
            ],
            reply: () => `🍺 <b>Góc Bia & Rượu tại Tiệm Tạp Hóa:</b><br><br>
            🐯 <b>Bia Larue</b> lon 330ml: <b>12.500đ</b><br>
            🐅 <b>Bia Tiger Crystal</b> lon cao 330ml: <b>19.500đ</b><br>
            ⭐ <b>Bia Heineken Silver</b> lon cao 330ml: <b>21.500đ</b><br>
            🐉 <b>Bia Sài Gòn Special</b> lon 330ml: <b>16.500đ</b><br>
            🍷 <b>Rượu Vang Đà Lạt Classic</b> đỏ 750ml: <b>95.000đ</b><br>
            🍶 <b>Rượu Vodka Hà Nội</b> 700ml 39.5°: <b>85.000đ</b><br>
            🍾 <b>Rượu Soju Jinro Chamisul</b> chai 360ml: <b>65.000đ</b><br><br>
            👉 Bấm vào mục <b>"🍺 Góc Bia & Nước"</b> trên trang chủ để chọn mua ngay nhé!`
        },

        // --- 12. TÀI KHOẢN / ĐĂNG NHẬP / MẬT KHẨU ---
        {
            id: 'tai_khoan',
            priority: 8,
            phrases: [
                'tai khoan', 'dang nhap', 'dang ky', 'mat khau', 'login', 
                'tai khoan admin', 'mk admin', 'admin pass', 'tao tai khoan'
            ],
            reply: () => `🔐 <b>Thông tin Đăng Nhập & Tài Khoản:</b><br><br>
            👤 <b>Khách hàng:</b> Có thể tạo tài khoản mới bằng Gmail, mật khẩu yêu cầu có cả chữ, số và ký tự đặc biệt.<br>
            🔑 <b>Chủ tiệm (Admin):</b> Quản lý đơn hàng, nhập xuất kho tại trang <code>/admin.html</code>.<br><br>
            💡 Bạn có thể mua hàng trực tiếp mà không cần đăng nhập tài khoản nhé!`
        },

        // --- 13. QUÊN MẬT KHẨU ---
        {
            id: 'quen_mat_khau',
            priority: 9,
            phrases: [
                'quen mat khau', 'quen pass', 'lay lai mat khau', 'mat mat khau', 
                'doi mat khau', 'reset mat khau', 'quen mk'
            ],
            reply: () => `🔑 <b>Cách lấy lại mật khẩu:</b><br><br>
            1️⃣ Mở cửa sổ <b>Đăng Nhập</b> ➔ Bấm vào dòng <b>"Quên mật khẩu?"</b>.<br>
            2️⃣ Nhập địa chỉ <b>Gmail</b> bạn đã đăng ký để hệ thống gửi liên kết đặt lại mật khẩu mới.<br>
            3️⃣ Hoặc liên hệ trực tiếp hotline / Zalo: <b>0862.261.874</b> để được chủ tiệm hỗ trợ cấp lại ngay nhé!`
        },

        // --- 14. ĐỔI TRẢ HÀNG / BẢO HÀNH ---
        {
            id: 'doi_tra',
            priority: 8,
            phrases: [
                'doi tra', 'tra hang', 'hang loi', 'hang hong', 'het han', 
                'can date', 'doi hang', 'chinh sach doi tra'
            ],
            reply: () => `🔄 <b>Chính sách đổi trả bảo đảm 100%:</b><br><br>
            ✅ Tiệm hỗ trợ <b>đổi trả miễn phí trong vòng 24 giờ</b> kể từ khi nhận hàng.<br>
            ✅ Áp dụng khi: Hàng bị dập vỡ khi vận chuyển, giao sai mẫu, hoặc lỗi từ nhà sản xuất.<br>
            📸 Bạn chỉ cần chụp ảnh sản phẩm và nhắn qua Zalo <b>0862.261.874</b> là tiệm giải quyết ngay lập tức ạ!`
        },

        // --- 15. MÁY QUÉT MÃ VẠCH POS ---
        {
            id: 'quet_ma_pos',
            priority: 8,
            phrases: [
                'quet ma', 'ma vach', 'barcode', 'may pos', 'camera', 
                'quet barcode', 'tinh tien pos', 'may thu ngan'
            ],
            reply: () => `📷 <b>Máy quét mã vạch POS:</b><br><br>
            Bấm vào nút màu vàng <b>[ 📷 Quét Mã Tính Tiền (POS) ]</b> trên thanh menu.<br>
            Hệ thống hỗ trợ quét mã vạch qua Webcam máy tính, camera điện thoại hoặc tải ảnh chụp barcode để tự động thêm vào đơn và tính tiền thối cực nhanh!`
        },

        // --- 16. CHÀO HỎI NGẮN GỌN ---
        {
            id: 'chao_hoi',
            priority: 5,
            phrases: [
                'xin chao', 'hello', 'hi', 'chao', 'hey', 'alo', 'shop oi', 'ad oi', 'bat dau'
            ],
            reply: () => `👋 <b>Xin chào bạn!</b> Tôi là Trợ Lý Tạp Hóa.<br><br>
            Tôi có thể giúp bạn giải đáp nhanh về:<br>
            • 🚚 <span class="chat-quick" onclick="chatSend('phí giao hàng')">Phí giao hàng & Freeship</span><br>
            • ⏱️ <span class="chat-quick" onclick="chatSend('thời gian giao hàng')">Thời gian giao hàng</span><br>
            • 🎁 <span class="chat-quick" onclick="chatSend('mã giảm giá')">Mã giảm giá hot</span><br>
            • 🍺 <span class="chat-quick" onclick="chatSend('có bia rượu không')">Bia, Rượu & Đồ uống</span><br>
            • 🛒 <span class="chat-quick" onclick="chatSend('cách đặt hàng')">Cách thức đặt hàng</span>`
        },

        // --- 17. CẢM ƠN ---
        {
            id: 'cam_on',
            priority: 5,
            phrases: [
                'cam on', 'thanks', 'thank you', 'ok cam on', 'tuyet voi', 'da cam on', 'duoc roi'
            ],
            reply: () => `😊 Dạ không có gì ạ! Rất vui được hỗ trợ bạn.<br><br>
            Nếu cần thêm bất kỳ thông tin nào, bạn cứ nhắn tin tiếp nhé. Chúc bạn một ngày mua sắm thật vui vẻ tại <b>Tiệm Tạp Hóa</b>! 🏪💚`
        }
    ];

    // =============================================================
    // 2. TÌM KIẾM SẢN PHẨM TRỰC TIẾP TRONG KHO (DYNAMIC PRODUCT MATCH)
    // =============================================================
    function searchProductsDynamically(keywordNorm) {
        if (typeof window !== 'undefined' && Array.isArray(window.allProducts) && window.allProducts.length > 0) {
            const matches = window.allProducts.filter(p => {
                const nameNorm = removeAccents(p.name || '');
                const descNorm = removeAccents(p.description || '');
                return nameNorm.includes(keywordNorm) || descNorm.includes(keywordNorm);
            });
            if (matches.length > 0) {
                return matches.slice(0, 3);
            }
        }
        return null;
    }

    // =============================================================
    // 3. THUẬT TOÁN ĐỐI SOÁT TRỌNG TÂM CÂU HỎI (SCORE-BASED MATCHER)
    // =============================================================
    function removeAccents(str) {
        return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getBotReply(userText) {
        const textNorm = removeAccents(userText);
        if (!textNorm) return 'Dạ bạn cần em hỗ trợ thông tin gì ạ?';

        // 1. Kiểm tra xem khách có đang hỏi giá hoặc hỏi còn sản phẩm cụ thể nào không
        // Ví dụ: "có bia tiger không", "giá mì hảo hảo", "còn sting không", "coca bao nhiêu"
        const productKeywords = [
            'tiger', 'larue', 'heineken', 'sai gon', 'vodka', 'soju', 'vang da lat',
            'hao hao', 'omachi', 'de nhat', 'gao st25', 'coca', 'sting', 'vinamilk',
            'lavie', 'simply', 'nam ngu', 'knorr', 'tam thai tu', 'chocopie', 'cosy',
            'ostar', 'omo', 'sunlight'
        ];

        for (const kw of productKeywords) {
            if (textNorm.includes(kw)) {
                const found = searchProductsDynamically(kw);
                if (found && found.length > 0) {
                    let res = `🏪 <b>Dạ tiệm có sẵn mặt hàng này bạn nhé:</b><br><br>`;
                    found.forEach(p => {
                        const priceStr = Number(p.price).toLocaleString('vi-VN');
                        res += `• <b>${escapeHtml(p.name)}</b><br>`;
                        res += `  💰 Giá: <b>${priceStr} ₫</b> / ${escapeHtml(p.unit || 'món')}<br>`;
                        res += `  📦 Tồn kho: còn <b>${p.stock}</b> ${escapeHtml(p.unit || '')} (HSD: ${escapeHtml(p.expiryDate || 'Mới')})<br><br>`;
                    });
                    res += `👉 Bạn có thể tìm tên sản phẩm trên thanh tìm kiếm để bấm <b>"Chọn mua"</b> ngay nhé! 🛒`;
                    return res;
                }
            }
        }

        // 2. Tìm Intent có điểm số cao nhất (khớp cụm từ dài nhất và ưu tiên cao nhất)
        let bestIntent = null;
        let maxScore = 0;

        for (const intent of INTENTS) {
            for (const phrase of intent.phrases) {
                const phraseNorm = removeAccents(phrase);
                if (textNorm.includes(phraseNorm)) {
                    // Điểm = (độ dài cụm từ) * 2 + độ ưu tiên
                    const score = phraseNorm.length * 2 + (intent.priority || 1);
                    if (score > maxScore) {
                        maxScore = score;
                        bestIntent = intent;
                    }
                }
            }
        }

        if (bestIntent && maxScore > 0) {
            return bestIntent.reply();
        }

        // 3. Phản hồi mặc định nếu chưa hiểu rõ (ngắn gọn, lịch sự, đúng trọng tâm)
        return `Dạ em chưa hiểu rõ ý của bạn lắm ạ. Bạn có thể hỏi cụ thể hơn như:<br><br>
        • <span class="chat-quick" onclick="chatSend('phí giao hàng')">Phí ship bao nhiêu?</span><br>
        • <span class="chat-quick" onclick="chatSend('thời gian giao hàng')">Giao trong bao lâu?</span><br>
        • <span class="chat-quick" onclick="chatSend('mã giảm giá')">Có mã giảm giá nào không?</span><br>
        • <span class="chat-quick" onclick="chatSend('có bia rượu không')">Xem danh sách bia & rượu</span><br><br>
        Hoặc gọi trực tiếp chủ tiệm: <b>📞 0862.261.874</b> để được hỗ trợ ngay nhé!`;
    }

    // =============================================================
    // 4. GIAO DIỆN CHATBOT (UI & STYLES)
    // =============================================================
    function createChatbotUI() {
        if (document.getElementById('chatbot-bubble')) return;

        const style = document.createElement('style');
        style.textContent = `
            #chatbot-bubble {
                position: fixed;
                bottom: 28px;
                right: 24px;
                z-index: 9999;
            }
            #chatbot-toggle-btn {
                width: 58px;
                height: 58px;
                border-radius: 50%;
                background: linear-gradient(135deg, #198754, #20c997);
                border: none;
                box-shadow: 0 4px 18px rgba(25,135,84,0.45);
                color: white;
                font-size: 26px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            #chatbot-toggle-btn:hover {
                transform: scale(1.08);
                box-shadow: 0 6px 24px rgba(25,135,84,0.6);
            }
            #chatbot-badge {
                position: absolute;
                top: -3px;
                right: -3px;
                background: #dc3545;
                color: white;
                font-size: 11px;
                font-weight: bold;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            #chatbot-window {
                position: fixed;
                bottom: 96px;
                right: 24px;
                width: 370px;
                max-width: calc(100vw - 32px);
                height: 500px;
                max-height: calc(100vh - 120px);
                background: #ffffff;
                border-radius: 18px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.18);
                display: flex;
                flex-direction: column;
                z-index: 9998;
                overflow: hidden;
                transform: scale(0.85) translateY(30px);
                opacity: 0;
                pointer-events: none;
                transition: all 0.25s cubic-bezier(0.34,1.4,0.64,1);
            }
            #chatbot-window.open {
                transform: scale(1) translateY(0);
                opacity: 1;
                pointer-events: all;
            }
            #chatbot-header {
                background: linear-gradient(135deg, #198754, #20c997);
                color: white;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                flex-shrink: 0;
            }
            #chatbot-header .avatar {
                width: 38px;
                height: 38px;
                background: rgba(255,255,255,0.25);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }
            #chatbot-header .info { flex: 1; }
            #chatbot-header .name { font-weight: bold; font-size: 14.5px; line-height: 1.2; }
            #chatbot-header .status { font-size: 11.5px; opacity: 0.9; }
            #chatbot-close {
                background: none;
                border: none;
                color: white;
                font-size: 22px;
                cursor: pointer;
                padding: 0 4px;
                opacity: 0.85;
                line-height: 1;
            }
            #chatbot-close:hover { opacity: 1; }
            #chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 14px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                background: #f8faf9;
            }
            .chat-msg {
                display: flex;
                gap: 8px;
                align-items: flex-end;
                max-width: 90%;
            }
            .chat-msg.bot { align-self: flex-start; }
            .chat-msg.user { align-self: flex-end; flex-direction: row-reverse; }
            .chat-msg .bubble {
                padding: 10px 14px;
                border-radius: 16px;
                font-size: 13.5px;
                line-height: 1.5;
                word-break: break-word;
            }
            .chat-msg.bot .bubble {
                background: white;
                color: #212529;
                border-radius: 4px 16px 16px 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                border: 1px solid #eef2f0;
            }
            .chat-msg.user .bubble {
                background: linear-gradient(135deg, #198754, #20c997);
                color: white;
                border-radius: 16px 4px 16px 16px;
            }
            .chat-msg .avatar-sm {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #198754;
                color: white;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .chat-quick {
                color: #198754;
                font-weight: 600;
                cursor: pointer;
                text-decoration: underline dotted;
            }
            .chat-quick:hover { color: #146c43; }
            #chatbot-quick-btns {
                padding: 8px 12px 6px;
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                flex-shrink: 0;
                background: #f8faf9;
                border-top: 1px solid #edf2ef;
            }
            .qbtn {
                background: white;
                border: 1px solid #198754;
                color: #198754;
                border-radius: 18px;
                padding: 4px 10px;
                font-size: 11.5px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.15s;
            }
            .qbtn:hover {
                background: #198754;
                color: white;
            }
            #chatbot-input-row {
                padding: 10px 12px;
                display: flex;
                gap: 8px;
                background: white;
                border-top: 1px solid #edf2ef;
                flex-shrink: 0;
            }
            #chatbot-input {
                flex: 1;
                border: 1.5px solid #dee2e6;
                border-radius: 20px;
                padding: 8px 14px;
                font-size: 13px;
                outline: none;
                transition: border-color 0.2s;
            }
            #chatbot-input:focus { border-color: #198754; }
            #chatbot-send {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, #198754, #20c997);
                border: none;
                color: white;
                font-size: 15px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.15s;
                flex-shrink: 0;
            }
            #chatbot-send:hover { transform: scale(1.1); }
            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 8px 12px;
                background: white;
                border-radius: 4px 14px 14px 14px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.06);
                width: fit-content;
            }
            .typing-dot {
                width: 6px;
                height: 6px;
                background: #adb5bd;
                border-radius: 50%;
                animation: typing-bounce 1.2s infinite;
            }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing-bounce {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-5px); }
            }
            @media (max-width: 480px) {
                #chatbot-window { right: 8px; bottom: 84px; width: calc(100vw - 16px); }
                #chatbot-bubble { right: 16px; bottom: 18px; }
            }
        `;
        document.head.appendChild(style);

        const html = `
        <div id="chatbot-bubble">
            <button id="chatbot-toggle-btn" onclick="toggleChatbot()" title="Chat tư vấn Tiệm Tạp Hóa">
                💬
            </button>
            <div id="chatbot-badge">1</div>
        </div>

        <div id="chatbot-window">
            <div id="chatbot-header">
                <div class="avatar">🤖</div>
                <div class="info">
                    <div class="name">Trợ Lý Tiệm Tạp Hóa</div>
                    <div class="status">🟢 Trực tuyến • Phản hồi đúng trọng tâm</div>
                </div>
                <button id="chatbot-close" onclick="toggleChatbot()" title="Đóng">✕</button>
            </div>

            <div id="chatbot-messages"></div>

            <div id="chatbot-quick-btns">
                <button class="qbtn" onclick="chatSend('phí giao hàng')">🚚 Phí ship</button>
                <button class="qbtn" onclick="chatSend('thời gian giao hàng')">⏱️ Giao bao lâu?</button>
                <button class="qbtn" onclick="chatSend('mã giảm giá')">🎁 Mã giảm giá</button>
                <button class="qbtn" onclick="chatSend('có bia rượu không')">🍺 Bia & Rượu</button>
                <button class="qbtn" onclick="chatSend('thanh toán momo')">📱 MoMo</button>
                <button class="qbtn" onclick="chatSend('số điện thoại')">📞 Hotline</button>
            </div>

            <div id="chatbot-input-row">
                <input type="text" id="chatbot-input" placeholder="Hỏi phí ship, bia rượu, hàng hóa..." 
                    onkeydown="if(event.key==='Enter') chatSend()" autocomplete="off">
                <button id="chatbot-send" onclick="chatSend()" title="Gửi câu hỏi">
                    ➤
                </button>
            </div>
        </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
    }

    // =============================================================
    // 5. ĐIỀU KHIỂN & GỬI TIN NHẮN
    // =============================================================
    let chatOpened = false;

    window.toggleChatbot = function () {
        const win = document.getElementById('chatbot-window');
        const badge = document.getElementById('chatbot-badge');
        chatOpened = !chatOpened;
        win.classList.toggle('open', chatOpened);
        document.getElementById('chatbot-toggle-btn').textContent = chatOpened ? '✕' : '💬';
        if (badge) badge.style.display = 'none';

        if (chatOpened) {
            const msgArea = document.getElementById('chatbot-messages');
            if (!msgArea.hasChildNodes()) {
                setTimeout(() => {
                    appendMsg('bot', `👋 <b>Chào bạn! Em là Trợ lý Tiệm Tạp Hóa.</b><br><br>
                    Em có thể hỗ trợ nhanh cho bạn về:<br>
                    • 🚚 <span class="chat-quick" onclick="chatSend('phí giao hàng')">Phí ship & Mẹo freeship</span><br>
                    • ⏱️ <span class="chat-quick" onclick="chatSend('thời gian giao hàng')">Thời gian giao hàng</span><br>
                    • 🎁 <span class="chat-quick" onclick="chatSend('mã giảm giá')">Mã giảm giá hôm nay</span><br>
                    • 🍺 <span class="chat-quick" onclick="chatSend('có bia rượu không')">Các loại Bia & Rượu</span><br><br>
                    Bạn cần hỏi gì cứ gõ vào đây nhé, em sẽ trả lời ngay ạ! 😊`);
                }, 200);
            }
            setTimeout(() => document.getElementById('chatbot-input')?.focus(), 350);
        }
    };

    window.chatSend = function (textOverride) {
        const input = document.getElementById('chatbot-input');
        const text = typeof textOverride === 'string' ? textOverride : (input ? input.value.trim() : '');
        if (!text) return;
        if (input && !textOverride) input.value = '';

        appendMsg('user', text);
        const msgArea = document.getElementById('chatbot-messages');

        // Hiệu ứng "Đang gõ tin nhắn..."
        const typingEl = document.createElement('div');
        typingEl.className = 'chat-msg bot';
        typingEl.id = 'chat-typing';
        typingEl.innerHTML = `
            <div class="avatar-sm">🤖</div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>`;
        msgArea.appendChild(typingEl);
        msgArea.scrollTop = msgArea.scrollHeight;

        // Trả lời sau 400 - 700ms tạo cảm giác tự nhiên
        setTimeout(() => {
            const typing = document.getElementById('chat-typing');
            if (typing) typing.remove();
            const reply = getBotReply(text);
            appendMsg('bot', reply);
        }, 450 + Math.random() * 250);
    };

    function appendMsg(type, html) {
        const msgArea = document.getElementById('chatbot-messages');
        if (!msgArea) return;
        const div = document.createElement('div');
        div.className = `chat-msg ${type}`;
        if (type === 'bot') {
            div.innerHTML = `<div class="avatar-sm">🤖</div><div class="bubble">${html}</div>`;
        } else {
            div.innerHTML = `<div class="bubble">${escapeHtml(html)}</div>`;
        }
        msgArea.appendChild(div);
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    function escapeHtml(text) {
        return (text || '').toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // =============================================================
    // 6. KHỞI CHẠY KHI TẢI TRANG
    // =============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatbotUI);
    } else {
        createChatbotUI();
    }

})();
