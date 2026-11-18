// =================================================================
// CHATBOT TƯ VẤN BÁN HÀNG TỰ NHIÊN - TIỆM TẠP HÓA
// Trả lời như nhân viên thật: Ngắn gọn, tự nhiên, đúng trọng tâm câu hỏi!
// =================================================================

(function () {
    'use strict';

    // =============================================================
    // 1. CÁC TÌNH HUỐNG HỎI ĐÁP TỰ NHIÊN (INTENT RESPONSES)
    // =============================================================
    const INTENTS = [
        // --- 1. CHÀO HỎI (Tự nhiên, hỏi bạn muốn mua gì) ---
        {
            id: 'chao_hoi',
            priority: 15,
            phrases: [
                'chao ban', 'chao', 'xin chao', 'hello', 'hi', 'alo', 'shop oi', 
                'ad oi', 'ban oi', 'tiem oi', 'alo shop', 'chao shop', 'e bot', 'hey'
            ],
            reply: () => `Dạ chào bạn! Hôm nay bạn muốn tìm mua món gì ạ? Tiệm em có đầy đủ mì gói, nước ngọt, bia rượu, bánh kẹo và gia vị giao tận nơi nhé! 😊`
        },

        // --- 2. PHÍ GIAO HÀNG (Đi thẳng vào tiền ship) ---
        {
            id: 'phi_ship',
            priority: 12,
            phrases: [
                'phi giao hang', 'phi ship', 'tien ship', 'tien giao', 'ship bao nhieu', 
                'gia ship', 'cuoc ship', 'cuoc giao', 'phi van chuyen', 'ship ton bao nhieu',
                'ship dat khong', 'ship het bao nhieu', 'tien van chuyen'
            ],
            reply: () => `Dạ phí ship bên em từ <b>15.000đ – 30.000đ</b> tùy khu vực, nhưng <b>đơn từ 150.000đ trở lên là được MIỄN PHÍ SHIP 100%</b> luôn bạn nhé!<br><br>💡 Bạn có thể nhập thêm mã <code>FREESHIP</code> ở giỏ hàng để được giảm 15k tiền ship nha.`
        },

        // --- 3. FREESHIP / MIỄN PHÍ SHIP ---
        {
            id: 'freeship',
            priority: 11,
            phrases: [
                'freeship', 'co freeship khong', 'mien phi ship', 'mien phi giao hang', 
                'duoc freeship', 'don bao nhieu thi freeship', 'bao nhieu duoc freeship',
                'co mien phi ship khong', 'khi nao freeship'
            ],
            reply: () => `Dạ có bạn nha! Đơn hàng chỉ cần đạt từ <b>150.000đ</b> là tiệm <b>miễn phí giao hàng hoàn toàn (0đ)</b> tận nhà cho bạn rồi ạ! Nếu đơn dưới 150k bạn nhập mã <code>FREESHIP</code> để được giảm 15k phí giao nhé.`
        },

        // --- 4. THỜI GIAN GIAO HÀNG (Đi thẳng vào mấy tiếng) ---
        {
            id: 'thoi_gian_giao',
            priority: 11,
            phrases: [
                'bao lau thi den', 'bao lau nhan duoc', 'thoi gian giao', 'may tieng', 
                'khi nao giao', 'khi nao nhan duoc', 'giao nhanh khong', 'giao trong ngay khong',
                'co giao lien khong', 'may phut', 'ship lau khong', 'giao mat bao lau'
            ],
            reply: () => `Dạ tiệm giao nhanh trong vòng <b>1 – 3 tiếng</b> là tới tận nơi bạn nhé! Trước khi giao shipper sẽ gọi điện thoại báo bạn trước ạ. 🛵`
        },

        // --- 5. KHU VỰC GIAO HÀNG ---
        {
            id: 'khu_vuc_giao',
            priority: 9,
            phrases: [
                'giao o dau', 'giao khu vuc nao', 'co giao tan noi khong', 'ship tan nha khong',
                'giao quan nao', 'co ship tinh khong', 'pham vi giao'
            ],
            reply: () => `Dạ bên em nhận giao hàng tận nơi đến tận cửa nhà bạn trong toàn khu vực nội thành nhé! Bạn chỉ cần điền địa chỉ lúc đặt là shipper giao tới tận tay ạ.`
        },

        // --- 6. MÃ GIẢM GIÁ / VOUCHER ---
        {
            id: 'voucher',
            priority: 11,
            phrases: [
                'ma giam gia', 'voucher', 'coupon', 'ma khuyen mai', 'khuyen mai', 
                'co giam gia khong', 'ma freeship', 'xin ma giam', 'ma taphoa10', 'giam20k',
                'giam gia', 'uu dai', 'co ma giam khong', 'ma giam', 'duoc giam gia'
            ],
            reply: () => `Dạ tiệm đang có 3 mã giảm giá này bạn dùng ngay nhé:<br>
            • <code>TAPHOA10</code> : Giảm 10% tổng đơn<br>
            • <code>FREESHIP</code> : Giảm 15.000đ phí giao hàng<br>
            • <code>GIAM20K</code> : Giảm 20.000đ cho đơn từ 100k<br>
            Bạn vào Giỏ Hàng nhập mã là được trừ tiền ngay nha!`
        },

        // --- 7. CÓ BIA HOẶC RƯỢU KHÔNG ---
        {
            id: 'bia_ruou',
            priority: 11,
            phrases: [
                'co bia khong', 'co ruou khong', 'bia gi', 'ruou gi', 'bia tiger', 
                'bia heineken', 'bia larue', 'bia sai gon', 'vang da lat', 'vodka', 'soju', 'co bia gi'
            ],
            reply: () => `Dạ tiệm có đầy đủ bia và rượu bạn nhé!<br>
            🍺 <b>Bia:</b> Tiger Crystal lon cao (19.5k), Heineken Silver (21.5k), Bia Larue (12.5k), Sài Gòn Special (16.5k).<br>
            🍷 <b>Rượu:</b> Vang Đà Lạt Classic (95k), Vodka Hà Nội 39.5° (85k), Soju Jinro Chamisul (65k).<br>
            Bạn muốn lấy loại nào em lấy cho bạn nha?`
        },

        // --- 8. CÁCH ĐẶT HÀNG ---
        {
            id: 'cach_dat_hang',
            priority: 10,
            phrases: [
                'cach dat hang', 'cach mua hang', 'lam sao de mua', 'huong dan dat hang', 
                'dat hang the nao', 'mua the nao', 'cach order', 'muon mua hang'
            ],
            reply: () => `Dạ đặt dễ lắm bạn ơi! Bạn chỉ cần bấm <b>"Chọn mua"</b> sản phẩm trên web, rồi bấm vào 🛒 <b>Giỏ Hàng</b> điền tên, địa chỉ, số điện thoại rồi bấm <b>"Xác nhận đặt hàng"</b> là xong ạ! Không cần đăng nhập tài khoản cũng mua được nhé.`
        },

        // --- 9. PHƯƠNG THỨC THANH TOÁN / MOMO ---
        {
            id: 'thanh_toan',
            priority: 10,
            phrases: [
                'thanh toan', 'phuong thuc thanh toan', 'co tra tien mat khong', 'cod', 
                'tra tien khi nhan hang', 'chuyen khoan', 'momo', 'quet ma momo', 'quet ma pos'
            ],
            reply: () => `Dạ bên em nhận <b>tiền mặt khi nhận hàng (COD)</b> hoặc <b>quét mã MoMo</b> (chủ tiệm: Phạm Phúc Toàn) đều được bạn nhé! Bạn nhận hàng kiểm tra thoải mái rồi mới thanh toán ạ.`
        },

        // --- 10. GIỜ MỞ CỬA ---
        {
            id: 'gio_mo_cua',
            priority: 10,
            phrases: [
                'gio mo cua', 'mo cua', 'may gio mo', 'may gio dong', 'mo cua luc nao', 
                'dong cua chua', 'may gio ban', 'thoi gian lam viec', 'chu nhat co mo khong',
                'mo cua may gio', 'may gio mo cua', 'khi nao mo cua', 'dong cua'
            ],
            reply: () => `Dạ tiệm mở cửa từ <b>6:00 sáng đến 22:00 đêm</b> tất cả các ngày trong tuần (mở cả Thứ 7 và Chủ Nhật luôn bạn nhé)! Đặt trên web lúc nào bên em cũng tiếp nhận đơn ạ.`
        },

        // --- 11. SỐ ĐIỆN THOẠI / HOTLINE / ZALO ---
        {
            id: 'lien_he',
            priority: 10,
            phrases: [
                'so dien thoai', 'sdt', 'hotline', 'so hotline', 'zalo', 
                'lien he ai', 'goi cho ai', 'so chu tiem', 'lien lac', 'dien thoai', 'lien he'
            ],
            reply: () => `Dạ số điện thoại và Zalo của chủ tiệm là <b>0862.261.874</b> (Phạm Phúc Toàn). Bạn cần hỗ trợ gì cứ gọi hoặc nhắn tin Zalo bất cứ lúc nào nha!`
        },

        // --- 12. ĐỊA CHỈ TIỆM ---
        {
            id: 'dia_chi',
            priority: 9,
            phrases: [
                'dia chi', 'tiem o dau', 'cua hang o dau', 'o dau', 'shop o dau',
                'dia chi o dau', 'cho nao', 'vi tri cua hang', 'dia chi cua hang'
            ],
            reply: () => `Dạ tiệm bán online giao hàng tận nơi trong 1–3 tiếng bạn nhé! Bạn ở địa chỉ nào cứ đặt trên web là bên em giao tới tận cửa ạ.`
        },

        // --- 13. TÀI KHOẢN & ĐĂNG NHẬP ---
        {
            id: 'tai_khoan',
            priority: 9,
            phrases: [
                'tai khoan', 'dang nhap', 'dang ky', 'mat khau', 'login', 
                'tai khoan admin', 'mk admin', 'admin pass', 'tao tai khoan'
            ],
            reply: () => `Dạ bạn có thể bấm vào nút <b>"Đăng Nhập / Đăng Ký"</b> ở góc phải để tạo tài khoản mới bằng Gmail nha. Mật khẩu cần có cả chữ, số và ký tự đặc biệt để bảo mật ạ. Mà bạn không cần đăng nhập vẫn đặt hàng được bình thường nhé!`
        },

        // --- 14. QUÊN MẬT KHẨU ---
        {
            id: 'quen_mat_khau',
            priority: 11,
            phrases: [
                'quen mat khau', 'quen pass', 'lay lai mat khau', 'mat mat khau', 
                'doi mat khau', 'reset mat khau', 'quen mk'
            ],
            reply: () => `Dạ bạn bấm vào cửa sổ Đăng Nhập rồi chọn <b>"Quên mật khẩu?"</b> để nhập Gmail nhận hướng dẫn lấy lại, hoặc gọi trực tiếp Zalo <b>0862.261.874</b> để chủ tiệm cấp lại mật khẩu cho bạn ngay nhé!`
        },

        // --- 15. ĐỔI TRẢ HÀNG ---
        {
            id: 'doi_tra',
            priority: 9,
            phrases: [
                'doi tra', 'tra hang', 'hang loi', 'hang hong', 'het han', 
                'can date', 'doi hang', 'chinh sach doi tra'
            ],
            reply: () => `Dạ bạn yên tâm nhé, nếu hàng có vấn đề gì tiệm hỗ trợ <b>đổi trả miễn phí trong vòng 24 giờ</b> ạ! Bạn chụp hình rồi nhắn qua Zalo <b>0862.261.874</b> là bên em đổi mới ngay lập tức cho bạn.`
        },

        // --- 16. MÁY QUÉT POS MÃ VẠCH ---
        {
            id: 'quet_ma_pos',
            priority: 9,
            phrases: [
                'quet ma', 'ma vach', 'barcode', 'may pos', 'camera', 
                'quet barcode', 'tinh tien pos', 'may thu ngan'
            ],
            reply: () => `Dạ bạn bấm vào nút vàng <b>[ 📷 Quét Mã Tính Tiền (POS) ]</b> trên menu là có thể dùng camera điện thoại hoặc webcam để quét mã vạch sản phẩm tính tiền tự động cực nhanh nhé!`
        },

        // --- 17. CẢM ƠN ---
        {
            id: 'cam_on',
            priority: 8,
            phrases: [
                'cam on', 'thanks', 'thank you', 'ok cam on', 'tuyet voi', 'da cam on', 'duoc roi', 'ok shop'
            ],
            reply: () => `Dạ không có gì ạ! Bạn cần thêm món gì cứ nhắn em nhé, chúc bạn mua sắm thật vui vẻ tại Tiệm Tạp Hóa! 😊💚`
        }
    ];

    // =============================================================
    // 2. TÌM KIẾM SẢN PHẨM TRỰC TIẾP THEO TÊN (DYNAMIC LOOKUP)
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
    // 3. THUẬT TOÁN XỬ LÝ CÂU TRẢ LỜI ĐÚNG TRỌNG TÂM
    // =============================================================
    function getBotReply(userText) {
        const textNorm = removeAccents(userText);
        if (!textNorm) return 'Dạ bạn cần em hỗ trợ thông tin gì ạ?';

        // 1. Kiểm tra nếu khách hỏi tên một sản phẩm cụ thể
        const specificProducts = [
            'tiger', 'larue', 'heineken', 'sai gon', 'vodka', 'soju', 'vang da lat',
            'hao hao', 'omachi', 'de nhat', 'gao st25', 'coca', 'sting', 'vinamilk',
            'lavie', 'simply', 'nam ngu', 'knorr', 'tam thai tu', 'chocopie', 'cosy',
            'ostar', 'omo', 'sunlight'
        ];

        for (const kw of specificProducts) {
            if (textNorm.includes(kw)) {
                const found = searchProductsDynamically(kw);
                if (found && found.length > 0) {
                    let res = `Dạ tiệm có sẵn mặt hàng này bạn nhé:<br><br>`;
                    found.forEach(p => {
                        const priceStr = Number(p.price).toLocaleString('vi-VN');
                        res += `• <b>${escapeHtml(p.name)}</b>: <b>${priceStr} ₫</b> / ${escapeHtml(p.unit || 'món')} (Còn ${p.stock} ${escapeHtml(p.unit || '')})<br>`;
                    });
                    res += `<br>👉 Bạn có thể tìm tên trên trang chủ để bấm <b>"Chọn mua"</b> ngay nha! 🛒`;
                    return res;
                }
            }
        }

        // 2. Tìm Intent phù hợp nhất theo độ khớp cao nhất
        let bestIntent = null;
        let maxScore = 0;

        for (const intent of INTENTS) {
            for (const phrase of intent.phrases) {
                const phraseNorm = removeAccents(phrase);
                if (textNorm.includes(phraseNorm)) {
                    // Cụm từ càng dài và khớp chuẩn thì điểm càng cao
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

        // 3. Phản hồi tự nhiên khi chưa hiểu (không ra vẻ máy móc)
        return `Dạ em chưa nghe rõ câu hỏi của bạn lắm ạ. Bạn cần hỏi về món nào, hay cần hỏi phí ship, thời gian giao hàng ạ? Bạn nhắn lại để em hỗ trợ nhé! Hoặc gọi trực tiếp chủ tiệm: <b>📞 0862.261.874</b> nha.`;
    }

    window.getBotReply = getBotReply;

    // =============================================================
    // 4. GIAO DIỆN CHATBOT (UI)
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
                <button class="qbtn" onclick="chatSend('chào bạn')">👋 Chào bạn</button>
                <button class="qbtn" onclick="chatSend('phí giao hàng bao nhiêu')">🚚 Phí ship</button>
                <button class="qbtn" onclick="chatSend('giao mất bao lâu')">⏱️ Giao bao lâu?</button>
                <button class="qbtn" onclick="chatSend('có bia rượu gì')">🍺 Bia & Rượu</button>
                <button class="qbtn" onclick="chatSend('mã giảm giá')">🎁 Mã giảm giá</button>
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
                    appendMsg('bot', `Dạ chào bạn! Hôm nay bạn muốn mua gì ạ? Cần hỏi giá hay phí ship bạn cứ nhắn em nhé! 😊`);
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

        // Trả lời sau 350 - 550ms rất nhanh và tự nhiên
        setTimeout(() => {
            const typing = document.getElementById('chat-typing');
            if (typing) typing.remove();
            const reply = getBotReply(text);
            appendMsg('bot', reply);
        }, 350 + Math.random() * 200);
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
