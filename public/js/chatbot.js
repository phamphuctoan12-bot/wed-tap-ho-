// ==========================================
// CHATBOT TRỢ LÝ ẢO - TIỆM TẠP HÓA
// Trả lời tự động các câu hỏi thường gặp
// ==========================================

(function () {
    'use strict';

    // ============ DỮ LIỆU CÂU TRẢ LỜI ============
    const FAQ = [
        {
            keys: ['xin chào', 'hello', 'hi', 'chào', 'hey', 'alo', 'bắt đầu'],
            answer: `👋 Xin chào! Tôi là <b>Trợ Lý Tạp Hóa</b> — sẵn sàng hỗ trợ bạn 24/7!<br><br>Bạn cần giúp gì? Ví dụ:<br>
            • 🛒 <span class="chat-quick" onclick="chatSend('cách đặt hàng')">Cách đặt hàng</span><br>
            • 💰 <span class="chat-quick" onclick="chatSend('mã giảm giá')">Mã giảm giá</span><br>
            • 🚚 <span class="chat-quick" onclick="chatSend('phí giao hàng')">Phí giao hàng</span><br>
            • 📦 <span class="chat-quick" onclick="chatSend('kiểm tra đơn hàng')">Kiểm tra đơn hàng</span>`
        },
        {
            keys: ['đặt hàng', 'mua hàng', 'cách mua', 'cách đặt', 'order', 'thêm vào giỏ'],
            answer: `🛒 <b>Cách đặt hàng tại Tiệm Tạp Hóa:</b><br><br>
            1️⃣ Chọn sản phẩm → bấm <b>"Thêm vào giỏ"</b><br>
            2️⃣ Bấm vào 🛒 <b>Giỏ Hàng</b> trên menu<br>
            3️⃣ Kiểm tra số lượng & nhập mã giảm giá (nếu có)<br>
            4️⃣ Bấm <b>"Tiến hành đặt hàng"</b> → điền thông tin<br>
            5️⃣ Bấm <b>"Xác Nhận Đặt Hàng"</b> ✅<br><br>
            💡 Bạn có thể đặt hàng mà <b>không cần đăng nhập</b> nhé!`
        },
        {
            keys: ['giao hàng', 'ship', 'vận chuyển', 'phí ship', 'phí giao', 'miễn phí giao'],
            answer: `🚚 <b>Chính sách giao hàng:</b><br><br>
            🆓 <b>Miễn phí giao hàng</b> cho đơn từ <b>150.000đ</b> trở lên<br>
            💵 Đơn dưới 150.000đ: phí giao <b>15.000đ – 30.000đ</b> (tùy khu vực)<br>
            ⏱️ Thời gian giao: <b>1–3 tiếng</b> trong nội thành<br>
            📍 Giao tận nơi theo địa chỉ bạn điền khi đặt hàng<br><br>
            💡 Nhập mã <b>FREESHIP</b> để được giảm <b>15.000đ</b> phí giao!`
        },
        {
            keys: ['voucher', 'mã giảm', 'mã khuyến mãi', 'coupon', 'khuyến mãi', 'giảm giá', 'discount'],
            answer: `🎁 <b>Mã giảm giá hiện có:</b><br><br>
            🏷️ <b>TAPHOA10</b> → Giảm <b>10%</b> tổng đơn hàng<br>
            🚚 <b>FREESHIP</b> → Giảm <b>15.000đ</b> phí giao hàng<br>
            💸 <b>GIAM20K</b> → Giảm thẳng <b>20.000đ</b> cho đơn từ 100k<br><br>
            📌 Cách dùng: Vào <b>Giỏ Hàng</b> → ô "Nhập mã giảm giá" → bấm <b>Áp dụng</b>`
        },
        {
            keys: ['đơn hàng', 'kiểm tra đơn', 'trạng thái đơn', 'theo dõi đơn', 'đơn của tôi'],
            answer: `📦 <b>Kiểm tra đơn hàng:</b><br><br>
            Nếu đã <b>đăng nhập</b>: Bấm vào tên tài khoản góc phải → chọn <b>"Đơn hàng của tôi"</b><br><br>
            Các trạng thái đơn hàng:<br>
            🟡 <b>Chờ xử lý</b> – Đơn vừa được đặt<br>
            🔵 <b>Đang xử lý</b> – Tiệm đang chuẩn bị<br>
            🟢 <b>Đã giao</b> – Đã giao thành công<br>
            🔴 <b>Đã hủy</b> – Đơn bị hủy<br><br>
            💡 Nếu cần hỗ trợ gấp hãy liên hệ hotline bên dưới!`
        },
        {
            keys: ['thanh toán', 'payment', 'cod', 'tiền mặt', 'chuyển khoản', 'trả tiền'],
            answer: `💳 <b>Phương thức thanh toán:</b><br><br>
            💵 <b>Tiền mặt khi nhận hàng (COD)</b> – Phổ biến nhất<br>
            🏦 <b>Chuyển khoản ngân hàng</b> – Liên hệ tiệm để lấy số TK<br>
            🏪 <b>Thanh toán trực tiếp tại cửa hàng</b> – Dùng máy POS quét mã vạch<br><br>
            💡 Máy thu ngân POS hỗ trợ quét mã vạch sản phẩm & tính tiền thối tự động!`
        },
        {
            keys: ['đăng nhập', 'tài khoản', 'đăng ký', 'login', 'password', 'mật khẩu', 'quên mật khẩu'],
            answer: `🔐 <b>Thông tin tài khoản:</b><br><br>
            👤 <b>Tài khoản có sẵn để thử:</b><br>
            🔴 Admin: <code>admin</code> / <code>admin123</code><br>
            🟢 Khách hàng: <code>khachhang</code> / <code>123456</code><br><br>
            📝 Hoặc bấm <b>"Đăng Ký"</b> trong cửa sổ Đăng Nhập để tạo tài khoản mới<br><br>
            ⚠️ Nếu quên mật khẩu: hãy liên hệ chủ tiệm qua số điện thoại`
        },
        {
            keys: ['sản phẩm', 'hàng hóa', 'danh mục', 'mặt hàng', 'có bán không', 'còn hàng không'],
            answer: `🏪 <b>Sản phẩm tại Tiệm Tạp Hóa:</b><br><br>
            🍜 <b>Mì gói & Thực phẩm khô</b>: Hảo Hảo, Omachi, Phở Đệ Nhất, Gạo ST25<br>
            🥤 <b>Nước giải khát & Sữa</b>: Coca-Cola, Sting, Vinamilk, Lavie<br>
            🧂 <b>Gia vị & Dầu ăn</b>: Nam Ngư, Knorr, Simply, Tam Thái Tử<br>
            🍪 <b>Bánh kẹo & Snack</b>: ChocoPie, Cosy, OStar<br>
            🧼 <b>Hóa phẩm & Gia dụng</b>: OMO, Sunlight<br><br>
            💡 Dùng ô <b>Tìm kiếm</b> hoặc lọc theo <b>Danh Mục</b> để tìm nhanh hơn!`
        },
        {
            keys: ['trả hàng', 'đổi hàng', 'bảo hành', 'hỏng', 'lỗi', 'sai hàng'],
            answer: `🔄 <b>Chính sách đổi trả:</b><br><br>
            ✅ Đổi/trả trong vòng <b>24 giờ</b> kể từ khi nhận hàng<br>
            ✅ Áp dụng khi: Hàng bị lỗi, sai sản phẩm, hết hạn sử dụng<br>
            📸 Yêu cầu: Chụp ảnh sản phẩm và liên hệ tiệm qua hotline<br><br>
            📞 Hotline: <b>0862.261.874</b><br>
            ⏰ Hỗ trợ: 7:00 – 22:00 mỗi ngày`
        },
        {
            keys: ['liên hệ', 'hotline', 'điện thoại', 'số điện thoại', 'địa chỉ', 'cửa hàng ở đâu', 'contact'],
            answer: `📞 <b>Thông tin liên hệ Tiệm Tạp Hóa:</b><br><br>
            📞 Hotline / Zalo: <b>0862.261.874</b><br>
            🏠 Địa chỉ: <b>Cửa hàng Tạp Hóa</b><br>
            ⏰ Giờ mở cửa: <b>6:00 – 22:00</b> (Thứ 2 – Chủ Nhật)<br>
            🌐 Website: <b>http://taphoa.local:8080</b><br><br>
            💬 Hoặc tiếp tục nhắn tin cho tôi – tôi luôn sẵn sàng hỗ trợ! 😊`
        },
        {
            keys: ['quét mã', 'mã vạch', 'barcode', 'camera', 'scan', 'pos', 'tính tiền'],
            answer: `📷 <b>Quét mã vạch & Máy thu ngân POS:</b><br><br>
            Bấm nút vàng <b>[ 📷 Quét Mã Tính Tiền (POS) ]</b> trên menu<br><br>
            🔴 Nếu bị lỗi camera:<br>
            → Dùng nút <b>[ 📸 Chụp ảnh quét ]</b> (màu xanh dương)<br>
            → Hoặc bấm nút thử nhanh: <b>[ 🍜 Mì Hảo Hảo ]</b><br>
            → Hoặc gõ trực tiếp mã vạch: <b>8934563138164</b><br><br>
            💡 Mã vạch Mì Hảo Hảo: <code>8934563138164</code>`
        },
        {
            keys: ['cảm ơn', 'thanks', 'thank', 'tuyệt', 'ok', 'được rồi', 'xong'],
            answer: `😊 Không có gì! Tiệm Tạp Hóa luôn sẵn sàng phục vụ bạn!<br><br>
            Nếu còn thắc mắc gì hãy nhắn tin tiếp nhé! 💚<br>
            Chúc bạn mua sắm vui vẻ tại <b>Tiệm Tạp Hóa</b>! 🛒🏪`
        },
    ];

    const DEFAULT_REPLY = `🤔 Xin lỗi, tôi chưa hiểu câu hỏi của bạn.<br><br>
    Bạn có thể thử hỏi về:<br>
    • <span class="chat-quick" onclick="chatSend('cách đặt hàng')">Cách đặt hàng</span><br>
    • <span class="chat-quick" onclick="chatSend('mã giảm giá')">Mã giảm giá</span><br>
    • <span class="chat-quick" onclick="chatSend('phí giao hàng')">Phí giao hàng</span><br>
    • <span class="chat-quick" onclick="chatSend('liên hệ')">Liên hệ tiệm</span><br><br>
    Hoặc gọi hotline: <b>📞 0862.261.874</b>`;

    // ============ TẠO GIAO DIỆN CHATBOT ============
    function createChatbotUI() {
        const style = document.createElement('style');
        style.textContent = `
            #chatbot-bubble {
                position: fixed;
                bottom: 28px;
                right: 24px;
                z-index: 9999;
            }
            #chatbot-toggle-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #198754, #20c997);
                border: none;
                box-shadow: 0 4px 20px rgba(25,135,84,0.5);
                color: white;
                font-size: 26px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            #chatbot-toggle-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 24px rgba(25,135,84,0.65);
            }
            #chatbot-badge {
                position: absolute;
                top: -4px;
                right: -4px;
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
                animation: pulse-badge 1.5s infinite;
            }
            @keyframes pulse-badge {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            #chatbot-window {
                position: fixed;
                bottom: 100px;
                right: 24px;
                width: 360px;
                max-width: calc(100vw - 32px);
                height: 480px;
                max-height: calc(100vh - 130px);
                background: white;
                border-radius: 18px;
                box-shadow: 0 8px 40px rgba(0,0,0,0.18);
                display: flex;
                flex-direction: column;
                z-index: 9998;
                overflow: hidden;
                transform: scale(0.8) translateY(40px);
                opacity: 0;
                pointer-events: none;
                transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
            }
            #chatbot-window.open {
                transform: scale(1) translateY(0);
                opacity: 1;
                pointer-events: all;
            }
            #chatbot-header {
                background: linear-gradient(135deg, #198754, #20c997);
                color: white;
                padding: 14px 16px;
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
            #chatbot-header .name { font-weight: bold; font-size: 15px; line-height: 1.2; }
            #chatbot-header .status { font-size: 11px; opacity: 0.85; }
            #chatbot-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0 4px;
                opacity: 0.8;
                line-height: 1;
            }
            #chatbot-close:hover { opacity: 1; }
            #chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px 14px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                background: #f8fdf9;
            }
            .chat-msg {
                display: flex;
                gap: 8px;
                align-items: flex-end;
                max-width: 92%;
            }
            .chat-msg.bot { align-self: flex-start; }
            .chat-msg.user { align-self: flex-end; flex-direction: row-reverse; }
            .chat-msg .bubble {
                padding: 10px 14px;
                border-radius: 16px;
                font-size: 13.5px;
                line-height: 1.55;
                word-break: break-word;
            }
            .chat-msg.bot .bubble {
                background: white;
                color: #212529;
                border-radius: 4px 16px 16px 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
                font-weight: bold;
                cursor: pointer;
                text-decoration: underline dotted;
            }
            .chat-quick:hover { color: #157347; }
            #chatbot-quick-btns {
                padding: 8px 14px 4px;
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                flex-shrink: 0;
                background: #f8fdf9;
                border-top: 1px solid #e9ecef;
            }
            .qbtn {
                background: white;
                border: 1.5px solid #198754;
                color: #198754;
                border-radius: 20px;
                padding: 4px 12px;
                font-size: 12px;
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
                border-top: 1px solid #e9ecef;
                flex-shrink: 0;
            }
            #chatbot-input {
                flex: 1;
                border: 1.5px solid #dee2e6;
                border-radius: 22px;
                padding: 8px 15px;
                font-size: 13px;
                outline: none;
                transition: border-color 0.2s;
            }
            #chatbot-input:focus { border-color: #198754; }
            #chatbot-send {
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: linear-gradient(135deg, #198754, #20c997);
                border: none;
                color: white;
                font-size: 16px;
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
                padding: 10px 14px;
                background: white;
                border-radius: 4px 16px 16px 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                width: fit-content;
            }
            .typing-dot {
                width: 7px;
                height: 7px;
                background: #adb5bd;
                border-radius: 50%;
                animation: typing-bounce 1.2s infinite;
            }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing-bounce {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-6px); }
            }
            @media (max-width: 480px) {
                #chatbot-window { right: 8px; bottom: 90px; width: calc(100vw - 16px); }
                #chatbot-bubble { right: 16px; bottom: 20px; }
            }
        `;
        document.head.appendChild(style);

        const html = `
        <div id="chatbot-bubble">
            <button id="chatbot-toggle-btn" onclick="toggleChatbot()" title="Chat với Trợ Lý Tạp Hóa">
                💬
            </button>
            <div id="chatbot-badge">1</div>
        </div>

        <div id="chatbot-window">
            <div id="chatbot-header">
                <div class="avatar">🤖</div>
                <div class="info">
                    <div class="name">Trợ Lý Tạp Hóa</div>
                    <div class="status">🟢 Trực tuyến • Phản hồi ngay</div>
                </div>
                <button id="chatbot-close" onclick="toggleChatbot()" title="Đóng">✕</button>
            </div>

            <div id="chatbot-messages"></div>

            <div id="chatbot-quick-btns">
                <button class="qbtn" onclick="chatSend('cách đặt hàng')">🛒 Đặt hàng</button>
                <button class="qbtn" onclick="chatSend('mã giảm giá')">🎁 Mã giảm giá</button>
                <button class="qbtn" onclick="chatSend('phí giao hàng')">🚚 Giao hàng</button>
                <button class="qbtn" onclick="chatSend('thanh toán')">💳 Thanh toán</button>
                <button class="qbtn" onclick="chatSend('liên hệ')">📞 Liên hệ</button>
            </div>

            <div id="chatbot-input-row">
                <input type="text" id="chatbot-input" placeholder="Nhắn tin cho tôi..." 
                    onkeydown="if(event.key==='Enter') chatSend()" autocomplete="off">
                <button id="chatbot-send" onclick="chatSend()" title="Gửi">
                    ➤
                </button>
            </div>
        </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
    }

    // ============ LOGIC CHATBOT ============
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
                setTimeout(() => botSay('xin chào'), 300);
            }
            setTimeout(() => document.getElementById('chatbot-input')?.focus(), 400);
        }
    };

    window.chatSend = function (textOverride) {
        const input = document.getElementById('chatbot-input');
        const text = typeof textOverride === 'string' ? textOverride : (input ? input.value.trim() : '');
        if (!text) return;
        if (input && !textOverride) input.value = '';

        appendMsg('user', text);
        const msgArea = document.getElementById('chatbot-messages');
        
        // Hiện typing indicator
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

        setTimeout(() => {
            const typing = document.getElementById('chat-typing');
            if (typing) typing.remove();
            const reply = getBotReply(text);
            appendMsg('bot', reply);
        }, 700 + Math.random() * 400);
    };

    function getBotReply(text) {
        const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (const faq of FAQ) {
            for (const kw of faq.keys) {
                const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (lower.includes(kwNorm)) {
                    return faq.answer;
                }
            }
        }
        return DEFAULT_REPLY;
    }

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

    function botSay(key) {
        const reply = getBotReply(key);
        appendMsg('bot', reply);
    }

    function escapeHtml(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ============ KHỞI TẠO ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatbotUI);
    } else {
        createChatbotUI();
    }

})();
